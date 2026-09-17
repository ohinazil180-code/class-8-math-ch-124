import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomData, PeerUser, RoomMessage, RoomPoll, LaserPointer, WhiteboardStroke } from '../types';

export function usePeerStudy(
  currentSlideId: number,
  onSlideChangeFromPeer: (newSlideId: number) => void
) {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [currentUser, setCurrentUser] = useState<PeerUser | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [followSync, setFollowSync] = useState<boolean>(true);
  const [remotePointer, setRemotePointer] = useState<LaserPointer | null>(null);
  const [peerNotification, setPeerNotification] = useState<string | null>(null);
  const [activeWhiteboardDrawer, setActiveWhiteboardDrawer] = useState<{ name: string; color: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const followSyncRef = useRef<boolean>(followSync);
  followSyncRef.current = followSync;

  const currentSlideIdRef = useRef<number>(currentSlideId);
  currentSlideIdRef.current = currentSlideId;

  // Clear pointer after 3 seconds of inactivity
  useEffect(() => {
    if (!remotePointer) return;
    const timer = setTimeout(() => {
      setRemotePointer(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [remotePointer]);

  // Clear notification banner after 4 seconds
  useEffect(() => {
    if (!peerNotification) return;
    const timer = setTimeout(() => {
      setPeerNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [peerNotification]);

  // Connect WebSocket
  const getWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        resolve(socketRef.current);
        return;
      }

      setIsConnecting(true);
      setError(null);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        socketRef.current = ws;
        setIsConnected(true);
        setIsConnecting(false);
        resolve(ws);
      };

      ws.onerror = (e) => {
        setIsConnecting(false);
        setIsConnected(false);
        setError('রিয়েলটাইম সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি।');
        reject(e);
      };

      ws.onclose = () => {
        socketRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;

          if (type === 'room:joined') {
            setRoom(payload.room);
            setCurrentUser(payload.yourUser);
            setError(null);
            // If room slide is different and followSync is on, jump to room slide
            if (payload.room.currentSlideId && payload.room.currentSlideId !== currentSlideIdRef.current) {
              onSlideChangeFromPeer(payload.room.currentSlideId);
            }
          } else if (type === 'room:sync') {
            setRoom(payload.room);
          } else if (type === 'user:joined') {
            setRoom((prev) => {
              if (!prev) return prev;
              const exists = prev.users.some((u) => u.id === payload.user.id);
              return {
                ...prev,
                users: exists ? prev.users : [...prev.users, payload.user],
                messages: [...prev.messages, payload.message],
              };
            });
            setPeerNotification(`"${payload.user.name}" স্টাডি রুমে যুক্ত হয়েছেন`);
          } else if (type === 'user:left') {
            setRoom((prev) => {
              if (!prev) return prev;
              if (payload.room) return payload.room;
              return {
                ...prev,
                users: prev.users.filter((u) => u.id !== payload.userId),
                hostId: payload.newHostId || prev.hostId,
              };
            });
            if (payload.userName) {
              setPeerNotification(`"${payload.userName}" রুম ত্যাগ করেছেন`);
            }
          } else if (type === 'slide:updated') {
            setRoom((prev) => {
              if (!prev) return prev;
              return { ...prev, currentSlideId: payload.slideId };
            });

            if (followSyncRef.current) {
              onSlideChangeFromPeer(payload.slideId);
              setPeerNotification(`${payload.changedBy} স্লাইড ${payload.slideId}-এ নিয়ে গেছেন`);
            } else {
              setPeerNotification(`সহপাঠীরা স্লাইড ${payload.slideId}-এ রয়েছেন`);
            }
          } else if (type === 'room:message') {
            setRoom((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                messages: [...prev.messages, payload.message],
              };
            });
          } else if (type === 'room:pointer') {
            setRemotePointer(payload.pointer);
          } else if (type === 'poll:updated') {
            setRoom((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                activePoll: payload.poll,
              };
            });
          } else if (type === 'whiteboard:stroke') {
            setRoom((prev) => {
              if (!prev) return prev;
              const strokes = prev.whiteboardStrokes || [];
              return {
                ...prev,
                whiteboardStrokes: [...strokes, payload.stroke],
              };
            });
            if (payload.stroke && payload.stroke.userName) {
              setActiveWhiteboardDrawer({
                name: payload.stroke.userName,
                color: payload.stroke.userColor || '#6366f1',
              });
              setTimeout(() => {
                setActiveWhiteboardDrawer(null);
              }, 1800);
            }
          } else if (type === 'whiteboard:cleared') {
            setRoom((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                whiteboardStrokes: [],
              };
            });
            setPeerNotification(`${payload.clearedBy} হোয়াইটবোর্ড পরিষ্কার করেছেন`);
          } else if (type === 'whiteboard:synced') {
            setRoom((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                whiteboardStrokes: payload.strokes || [],
              };
            });
          } else if (type === 'room:error') {
            setError(payload.message);
          }
        } catch (err) {
          console.error('Error handling ws message:', err);
        }
      };
    });
  }, [onSlideChangeFromPeer]);

  // Create virtual study room
  const createRoom = useCallback(
    async (
      roomName: string,
      userName: string,
      avatarColor: string,
      initialSlideId: number,
      allowAnyPresenter: boolean
    ) => {
      try {
        const ws = await getWebSocket();
        ws.send(
          JSON.stringify({
            type: 'room:create',
            payload: {
              roomName,
              userName,
              avatarColor,
              initialSlideId,
              allowAnyPresenter,
            },
          })
        );
      } catch (err) {
        setError('রুম তৈরি করতে সমস্যা হয়েছে।');
      }
    },
    [getWebSocket]
  );

  // Join existing room by code
  const joinRoom = useCallback(
    async (roomCode: string, userName: string, avatarColor: string) => {
      try {
        const ws = await getWebSocket();
        ws.send(
          JSON.stringify({
            type: 'room:join',
            payload: {
              roomCode: roomCode.trim().toUpperCase(),
              userName,
              avatarColor,
            },
          })
        );
      } catch (err) {
        setError('রুমে যুক্ত হতে সমস্যা হয়েছে।');
      }
    },
    [getWebSocket]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'room:leave',
          payload: {},
        })
      );
    }
    setRoom(null);
    setCurrentUser(null);
    setRemotePointer(null);
  }, []);

  // Broadcast slide change to peers
  const syncSlideChange = useCallback(
    (slideId: number) => {
      if (!room || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      // Only broadcast if allowAnyPresenter is true or user is host
      const isHost = currentUser?.role === 'host';
      if (!room.allowAnyPresenter && !isHost) return;

      socketRef.current.send(
        JSON.stringify({
          type: 'slide:change',
          payload: { slideId },
        })
      );
    },
    [room, currentUser]
  );

  // Send chat message or quick reaction
  const sendChat = useCallback(
    (text: string, reactionType: 'text' | 'reaction' = 'text') => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'room:chat',
          payload: { text, reactionType },
        })
      );
    },
    []
  );

  // Send laser pointer coordinates
  const sendPointer = useCallback(
    (x: number, y: number, slideId: number) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'room:pointer',
          payload: { x, y, slideId },
        })
      );
    },
    []
  );

  // Comprehension poll: Start
  const startPoll = useCallback(
    (question: string, options: string[]) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'poll:start',
          payload: { question, options },
        })
      );
    },
    []
  );

  // Comprehension poll: Vote
  const votePoll = useCallback(
    (optionIndex: number) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'poll:vote',
          payload: { optionIndex },
        })
      );
    },
    []
  );

  // Comprehension poll: Close
  const closePoll = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'poll:close',
        payload: {},
      })
    );
  }, []);

  // Update room settings (Host only)
  const toggleAllowAnyPresenter = useCallback(
    (allow: boolean) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: 'room:settings',
          payload: { allowAnyPresenter: allow },
        })
      );
    },
    []
  );

  // Send Whiteboard stroke
  const sendWhiteboardStroke = useCallback(
    (stroke: WhiteboardStroke) => {
      // Optimistic local update
      setRoom((prev) => {
        if (!prev) return prev;
        const strokes = prev.whiteboardStrokes || [];
        return {
          ...prev,
          whiteboardStrokes: [...strokes, stroke],
        };
      });

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'whiteboard:stroke',
            payload: { stroke },
          })
        );
      }
    },
    []
  );

  // Clear Whiteboard
  const clearWhiteboard = useCallback(() => {
    setRoom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        whiteboardStrokes: [],
      };
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'whiteboard:clear',
          payload: {},
        })
      );
    }
  }, []);

  // Undo last stroke
  const undoWhiteboardStroke = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'whiteboard:undo',
          payload: {},
        })
      );
    }
  }, []);

  return {
    room,
    currentUser,
    isConnected,
    isConnecting,
    error,
    setError,
    followSync,
    setFollowSync,
    remotePointer,
    peerNotification,
    activeWhiteboardDrawer,
    createRoom,
    joinRoom,
    leaveRoom,
    syncSlideChange,
    sendChat,
    sendPointer,
    startPoll,
    votePoll,
    closePoll,
    toggleAllowAnyPresenter,
    sendWhiteboardStroke,
    clearWhiteboard,
    undoWhiteboardStroke,
  };
}
