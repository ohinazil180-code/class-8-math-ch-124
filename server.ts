import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const PORT = 3000;
const HOST = '0.0.0.0';

export interface PeerUser {
  id: string;
  name: string;
  avatarColor: string;
  role: 'host' | 'participant';
  joinedAt: number;
}

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  type: 'text' | 'reaction' | 'system';
  timestamp: number;
}

export interface RoomPoll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // userId -> optionIndex
  isActive: boolean;
  createdAt: number;
}

export interface LaserPointer {
  userId: string;
  userName: string;
  userColor: string;
  x: number; // percentage
  y: number; // percentage
  slideId: number;
  timestamp: number;
}

export interface WhiteboardPoint {
  x: number; // normalized 0 to 1000
  y: number; // normalized 0 to 1000
}

export interface WhiteboardStroke {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  tool: 'pen' | 'highlighter' | 'eraser' | 'math';
  color: string;
  size: number;
  points: WhiteboardPoint[];
  text?: string;
  timestamp: number;
}

export interface Room {
  roomCode: string;
  roomName: string;
  hostId: string;
  hostName: string;
  currentSlideId: number;
  allowAnyPresenter: boolean;
  createdAt: number;
  users: Map<string, { ws: WebSocket; user: PeerUser }>;
  messages: RoomMessage[];
  activePoll: RoomPoll | null;
  lastPointer: LaserPointer | null;
  whiteboardStrokes: WhiteboardStroke[];
}

// In-memory room store
const rooms = new Map<string, Room>();

function serializeRoom(room: Room) {
  const usersList: PeerUser[] = [];
  room.users.forEach(({ user }) => {
    usersList.push(user);
  });

  return {
    roomCode: room.roomCode,
    roomName: room.roomName,
    hostId: room.hostId,
    hostName: room.hostName,
    currentSlideId: room.currentSlideId,
    allowAnyPresenter: room.allowAnyPresenter,
    createdAt: room.createdAt,
    users: usersList,
    messages: room.messages.slice(-50), // last 50 messages
    activePoll: room.activePoll,
    lastPointer: room.lastPointer,
    whiteboardStrokes: room.whiteboardStrokes ? room.whiteboardStrokes.slice(-500) : [],
  };
}

function broadcastToRoom(room: Room, data: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(data);
  room.users.forEach(({ ws }) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size });
  });

  // Get active public rooms list
  app.get('/api/rooms', (_req, res) => {
    const list = Array.from(rooms.values()).map(r => ({
      roomCode: r.roomCode,
      roomName: r.roomName,
      hostName: r.hostName,
      userCount: r.users.size,
      currentSlideId: r.currentSlideId,
      createdAt: r.createdAt,
    }));
    res.json({ rooms: list });
  });

  // Get single room details
  app.get('/api/rooms/:code', (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) {
      return res.status(404).json({ error: 'রুম পাওয়া যায়নি' });
    }
    res.json(serializeRoom(room));
  });

  // Step-by-Step Algebraic Equation Solver with Gemini AI
  app.post('/api/solve-equation', async (req, res) => {
    const { equation } = req.body;
    if (!equation || typeof equation !== 'string') {
      return res.status(400).json({ error: 'সমীকরণ বা রাশিটি প্রদান করুন।' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI সেবা বর্তমানে কনফিগার করা নেই। অনুগ্রহ করে বিল্ট-ইন অ্যালজেব্রা সলভার ব্যবহার করুন।',
        hasAI: false,
      });
    }

    try {
      const prompt = `তুমি বাংলাদেশ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) ২০২৬-এর অষ্টম শ্রেণির গণিত বিষয়ের একজন সিনিয়র শিক্ষক।
শিক্ষার্থী এই বীজগণিতীয় রাশি বা সমীকরণটি সমাধান করতে চায়:
"${equation}"

অনুগ্রহ করে ধাপে ধাপে বিস্তারিত সমাধান প্রস্তুত করো।
আউটপুটটি অবশ্যই সম্পূর্ণ ভ্যালিড JSON ফরম্যাটে প্রদান করবে:
{
  "title": "সমীকরণের ধরন (যেমন: একঘাত সমীকরণ / দ্বিঘাত সমীকরণ / বর্গ বিস্তার / উৎপাদকে বিশ্লেষণ)",
  "formulaUsed": "ব্যবহৃত মূল সূত্র বা নিয়ম (যদি প্রযোজ্য হয়)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "ধাপের শিরোনাম (যেমন: বন্ধনী অপসারণ / পক্ষান্তর বিধি)",
      "explanation": "সহজ প্রাঞ্জল বাংলায় স্পষ্ট ব্যাখ্যা",
      "math": "গাণিতিক লাইন (যেমন: 2x = 10 - 4)"
    }
  ],
  "finalAnswer": "চূড়ান্ত ফলাফল (যেমন: x = 3)",
  "verification": "শুদ্ধি পরীক্ষা বা বিকল্প যাচাইকরণ",
  "tip": "অষ্টম শ্রেণির পরীক্ষার জন্য প্রয়োজনীয় টিপস"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json({ success: true, solution: parsed, hasAI: true });
    } catch (err: any) {
      console.error('Gemini Math Solver error:', err);
      res.status(500).json({
        error: 'AI সমাধান জেনারেট করতে সাময়িক সমস্যা হয়েছে।',
        details: err?.message || String(err),
      });
    }
  });

  // WebSocket Server Setup
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let currentUserId: string | null = null;

    ws.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());
        const { type, payload } = msg;

        // CREATE ROOM
        if (type === 'room:create') {
          const { roomName, userName, avatarColor, initialSlideId, allowAnyPresenter } = payload;
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          const userId = 'user_' + Math.random().toString(36).substring(2, 9);

          const hostUser: PeerUser = {
            id: userId,
            name: (userName || 'হোস্ট').trim(),
            avatarColor: avatarColor || '#6366f1',
            role: 'host',
            joinedAt: Date.now(),
          };

          const newRoom: Room = {
            roomCode: code,
            roomName: (roomName || 'গণিত সহপাঠী স্টাডি গ্রুপ').trim(),
            hostId: userId,
            hostName: hostUser.name,
            currentSlideId: initialSlideId && initialSlideId >= 1 ? initialSlideId : 1,
            allowAnyPresenter: allowAnyPresenter ?? true,
            createdAt: Date.now(),
            users: new Map([[userId, { ws, user: hostUser }]]),
            messages: [
              {
                id: 'sys_' + Date.now(),
                senderId: 'system',
                senderName: 'সিস্টেম',
                senderColor: '#64748b',
                text: `"${hostUser.name}" রুম তৈরি করেছেন। সহপাঠীদের আমন্ত্রণ জানাতে রুম কোড: ${code}`,
                type: 'system',
                timestamp: Date.now(),
              },
            ],
            activePoll: null,
            lastPointer: null,
            whiteboardStrokes: [],
          };

          rooms.set(code, newRoom);
          currentRoomCode = code;
          currentUserId = userId;

          ws.send(
            JSON.stringify({
              type: 'room:joined',
              payload: {
                room: serializeRoom(newRoom),
                yourUser: hostUser,
              },
            })
          );
        }

        // JOIN ROOM
        else if (type === 'room:join') {
          const { roomCode, userName, avatarColor } = payload;
          const code = (roomCode || '').trim().toUpperCase();
          const room = rooms.get(code);

          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: `রুম কোড "${code}" খুঁজে পাওয়া যায়নি। কোডটি সঠিক কিনা যাচাই করুন।` },
              })
            );
            return;
          }

          const userId = 'user_' + Math.random().toString(36).substring(2, 9);
          const newUser: PeerUser = {
            id: userId,
            name: (userName || 'সহপাঠী').trim(),
            avatarColor: avatarColor || '#10b981',
            role: 'participant',
            joinedAt: Date.now(),
          };

          room.users.set(userId, { ws, user: newUser });
          currentRoomCode = code;
          currentUserId = userId;

          const joinNotice: RoomMessage = {
            id: 'sys_' + Date.now(),
            senderId: 'system',
            senderName: 'সিস্টেম',
            senderColor: '#64748b',
            text: `"${newUser.name}" রুমে যুক্ত হয়েছেন।`,
            type: 'system',
            timestamp: Date.now(),
          };
          room.messages.push(joinNotice);

          // Reply to joined user
          ws.send(
            JSON.stringify({
              type: 'room:joined',
              payload: {
                room: serializeRoom(room),
                yourUser: newUser,
              },
            })
          );

          // Broadcast to everyone else
          broadcastToRoom(
            room,
            {
              type: 'user:joined',
              payload: {
                user: newUser,
                message: joinNotice,
              },
            },
            ws
          );
        }

        // SLIDE CHANGE
        else if (type === 'slide:change') {
          const { slideId } = payload;
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const sender = room.users.get(currentUserId || '');
          const canPresent = room.allowAnyPresenter || (sender && sender.user.role === 'host');

          if (!canPresent) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'শুধুমাত্র রুম হোস্ট স্লাইড পরিবর্তন করতে পারেন।' },
              })
            );
            return;
          }

          room.currentSlideId = slideId;
          broadcastToRoom(room, {
            type: 'slide:updated',
            payload: {
              slideId,
              changedBy: sender ? sender.user.name : 'সহপাঠী',
            },
          });
        }

        // CHAT MESSAGE / REACTION
        else if (type === 'room:chat') {
          const { text, reactionType } = payload;
          if (!currentRoomCode || !text) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const sender = room.users.get(currentUserId || '');
          if (!sender) return;

          const newMsg: RoomMessage = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            senderId: sender.user.id,
            senderName: sender.user.name,
            senderColor: sender.user.avatarColor,
            text: text.trim(),
            type: reactionType || 'text',
            timestamp: Date.now(),
          };

          room.messages.push(newMsg);
          if (room.messages.length > 100) room.messages.shift();

          broadcastToRoom(room, {
            type: 'room:message',
            payload: { message: newMsg },
          });
        }

        // LASER POINTER / HIGHLIGHT
        else if (type === 'room:pointer') {
          const { x, y, slideId } = payload;
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const sender = room.users.get(currentUserId || '');
          if (!sender) return;

          const pointer: LaserPointer = {
            userId: sender.user.id,
            userName: sender.user.name,
            userColor: sender.user.avatarColor,
            x,
            y,
            slideId,
            timestamp: Date.now(),
          };
          room.lastPointer = pointer;

          broadcastToRoom(
            room,
            {
              type: 'room:pointer',
              payload: { pointer },
            },
            ws
          );
        }

        // COMPREHENSION POLL: START
        else if (type === 'poll:start') {
          const { question, options } = payload;
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const sender = room.users.get(currentUserId || '');
          if (!sender || sender.user.role !== 'host') return;

          const newPoll: RoomPoll = {
            id: 'poll_' + Date.now(),
            question: question || 'এই স্লাইডের গাণিতিক ধারণা কি পরিষ্কার বুঝতে পেরেছো?',
            options: options || ['সম্পূর্ণ বুঝেছি 👍', 'কিছুটা বুঝেছি 🤔', 'আবার বুঝান ❓'],
            votes: {},
            isActive: true,
            createdAt: Date.now(),
          };

          room.activePoll = newPoll;
          broadcastToRoom(room, {
            type: 'poll:updated',
            payload: { poll: newPoll },
          });
        }

        // COMPREHENSION POLL: VOTE
        else if (type === 'poll:vote') {
          const { optionIndex } = payload;
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room || !room.activePoll || !room.activePoll.isActive) return;

          if (currentUserId) {
            room.activePoll.votes[currentUserId] = optionIndex;
            broadcastToRoom(room, {
              type: 'poll:updated',
              payload: { poll: room.activePoll },
            });
          }
        }

        // COMPREHENSION POLL: CLOSE
        else if (type === 'poll:close') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room || !room.activePoll) return;

          const sender = room.users.get(currentUserId || '');
          if (!sender || sender.user.role !== 'host') return;

          room.activePoll.isActive = false;
          broadcastToRoom(room, {
            type: 'poll:updated',
            payload: { poll: room.activePoll },
          });
        }

        // ROOM SETTINGS (Host only)
        else if (type === 'room:settings') {
          const { allowAnyPresenter } = payload;
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const sender = room.users.get(currentUserId || '');
          if (!sender || sender.user.role !== 'host') return;

          room.allowAnyPresenter = Boolean(allowAnyPresenter);
          broadcastToRoom(room, {
            type: 'room:sync',
            payload: { room: serializeRoom(room) },
          });
        }

        // WHITEBOARD: STROKE
        else if (type === 'whiteboard:stroke') {
          const { stroke } = payload;
          if (!currentRoomCode || !stroke) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          if (!room.whiteboardStrokes) {
            room.whiteboardStrokes = [];
          }
          room.whiteboardStrokes.push(stroke);
          // Keep maximum 500 strokes in memory
          if (room.whiteboardStrokes.length > 500) {
            room.whiteboardStrokes.shift();
          }

          // Broadcast to other peers in room (exclude sender)
          broadcastToRoom(
            room,
            {
              type: 'whiteboard:stroke',
              payload: { stroke },
            },
            ws
          );
        }

        // WHITEBOARD: CLEAR
        else if (type === 'whiteboard:clear') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;
          const sender = room.users.get(currentUserId || '');

          room.whiteboardStrokes = [];
          broadcastToRoom(room, {
            type: 'whiteboard:cleared',
            payload: {
              clearedBy: sender ? sender.user.name : 'সহপাঠী',
            },
          });
        }

        // WHITEBOARD: UNDO
        else if (type === 'whiteboard:undo') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room || !room.whiteboardStrokes || room.whiteboardStrokes.length === 0) return;

          // Remove the last stroke made by this user (or last stroke if not found)
          let removeIdx = -1;
          for (let i = room.whiteboardStrokes.length - 1; i >= 0; i--) {
            if (room.whiteboardStrokes[i].userId === currentUserId) {
              removeIdx = i;
              break;
            }
          }
          if (removeIdx === -1) {
            removeIdx = room.whiteboardStrokes.length - 1;
          }

          room.whiteboardStrokes.splice(removeIdx, 1);
          broadcastToRoom(room, {
            type: 'whiteboard:synced',
            payload: {
              strokes: room.whiteboardStrokes,
            },
          });
        }

        // LEAVE ROOM EXPLICITLY
        else if (type === 'room:leave') {
          handleUserLeave();
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    const handleUserLeave = () => {
      if (!currentRoomCode || !currentUserId) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const leavingUser = room.users.get(currentUserId);
      room.users.delete(currentUserId);

      // If room is empty, remove room after 5 minutes
      if (room.users.size === 0) {
        setTimeout(() => {
          const current = rooms.get(currentRoomCode || '');
          if (current && current.users.size === 0) {
            rooms.delete(currentRoomCode || '');
          }
        }, 5 * 60 * 1000);
      } else {
        // If host left, assign new host
        let newHostId: string | undefined;
        if (room.hostId === currentUserId) {
          const nextEntry = room.users.entries().next().value;
          if (nextEntry) {
            const [nextUserId, nextUserEntry] = nextEntry;
            nextUserEntry.user.role = 'host';
            room.hostId = nextUserId;
            room.hostName = nextUserEntry.user.name;
            newHostId = nextUserId;
          }
        }

        const leaveNotice: RoomMessage = {
          id: 'sys_' + Date.now(),
          senderId: 'system',
          senderName: 'সিস্টেম',
          senderColor: '#64748b',
          text: leavingUser
            ? `"${leavingUser.user.name}" রুম ত্যাগ করেছেন।`
            : 'একজন সহপাঠী রুম ত্যাগ করেছেন।',
          type: 'system',
          timestamp: Date.now(),
        };
        room.messages.push(leaveNotice);

        broadcastToRoom(room, {
          type: 'user:left',
          payload: {
            userId: currentUserId,
            userName: leavingUser ? leavingUser.user.name : '',
            newHostId,
            room: serializeRoom(room),
          },
        });
      }

      currentRoomCode = null;
      currentUserId = null;
    };

    ws.on('close', () => {
      handleUserLeave();
    });

    ws.on('error', () => {
      handleUserLeave();
    });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
