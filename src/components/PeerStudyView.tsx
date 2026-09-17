import React, { useState, useEffect } from 'react';
import { RoomData, PeerUser, SlideData, WhiteboardStroke } from '../types';
import {
  Users, UserPlus, LogIn, Copy, Check, Sparkles, MessageSquare,
  Send, HelpCircle, Eye, Radio, Shield, UserCheck, RefreshCw,
  LogOut, Play, Compass, ChevronRight, CheckCircle2, AlertCircle,
  PenTool, BookOpen
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { VirtualWhiteboard } from './VirtualWhiteboard';

interface Props {
  room: RoomData | null;
  currentUser: PeerUser | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  followSync: boolean;
  setFollowSync: (follow: boolean) => void;
  createRoom: (
    roomName: string,
    userName: string,
    avatarColor: string,
    initialSlideId: number,
    allowAnyPresenter: boolean
  ) => void;
  joinRoom: (roomCode: string, userName: string, avatarColor: string) => void;
  leaveRoom: () => void;
  syncSlideChange: (slideId: number) => void;
  sendChat: (text: string, reactionType?: 'text' | 'reaction') => void;
  startPoll: (question: string, options: string[]) => void;
  votePoll: (optionIndex: number) => void;
  closePoll: () => void;
  toggleAllowAnyPresenter: (allow: boolean) => void;
  currentSlideId: number;
  currentSlide: SlideData;
  onJumpToSlide: (slideId: number) => void;
  onSwitchToSlidesTab: () => void;
  soundEnabled: boolean;
  onSendWhiteboardStroke?: (stroke: WhiteboardStroke) => void;
  onClearWhiteboard?: () => void;
  onUndoWhiteboard?: () => void;
  activeWhiteboardDrawer?: { name: string; color: string } | null;
  initialRoomSection?: 'slides' | 'whiteboard';
}

const AVATAR_COLORS = [
  { label: 'ইন্ডিগো', hex: '#6366f1', bg: 'bg-indigo-500' },
  { label: 'পান্না সবুজ', hex: '#10b981', bg: 'bg-emerald-500' },
  { label: 'আকাশি', hex: '#0284c7', bg: 'bg-sky-500' },
  { label: 'গোলাপী', hex: '#f43f5e', bg: 'bg-rose-500' },
  { label: 'বেগুনি', hex: '#8b5cf6', bg: 'bg-purple-500' },
  { label: 'কমলা', hex: '#f97316', bg: 'bg-orange-500' },
];

const QUICK_REACTIONS = [
  '👍 বুঝেছি',
  '🙋‍♂️ আরেকবার বুঝান',
  '💡 দারুণ নিয়ম!',
  '❓ এই ধাপে প্রশ্ন আছে',
  '👏 চমৎকার সমাধান!',
  '✍️ খাতায় লিখে নিয়েছি',
];

export const PeerStudyView: React.FC<Props> = ({
  room,
  currentUser,
  isConnected,
  isConnecting,
  error,
  followSync,
  setFollowSync,
  createRoom,
  joinRoom,
  leaveRoom,
  syncSlideChange,
  sendChat,
  startPoll,
  votePoll,
  closePoll,
  toggleAllowAnyPresenter,
  currentSlideId,
  currentSlide,
  onJumpToSlide,
  onSwitchToSlidesTab,
  soundEnabled,
  onSendWhiteboardStroke,
  onClearWhiteboard,
  onUndoWhiteboard,
  activeWhiteboardDrawer,
  initialRoomSection,
}) => {
  // Sub-navigation: slides vs whiteboard
  const [activeRoomSection, setActiveRoomSection] = useState<'slides' | 'whiteboard'>(
    initialRoomSection || 'slides'
  );

  useEffect(() => {
    if (initialRoomSection) {
      setActiveRoomSection(initialRoomSection);
    }
  }, [initialRoomSection]);

  // Forms state
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('class8_peer_username') || 'শিক্ষার্থী ' + Math.floor(Math.random() * 90 + 10);
  });
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1');

  // Create room state
  const [createRoomName, setCreateRoomName] = useState<string>('৮ম শ্রেণি গণিত যৌথ স্টাডি');
  const [allowAnyPresenter, setAllowAnyPresenter] = useState<boolean>(true);

  // Join room state
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');

  // Chat message input
  const [chatInput, setChatInput] = useState<string>('');

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Poll creation modal / inputs
  const [showPollModal, setShowPollModal] = useState<boolean>(false);
  const [pollQuestion, setPollQuestion] = useState<string>('এই স্লাইডের গাণিতিক ধাপ কি সবার কাছে পরিষ্কার?');

  // Active public rooms list
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);

  // Save username on change
  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem('class8_peer_username', userName.trim());
    }
  }, [userName]);

  // Fetch active rooms from server
  const fetchPublicRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setPublicRooms(data.rooms || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!room) {
      fetchPublicRooms();
      const interval = setInterval(fetchPublicRooms, 8000);
      return () => clearInterval(interval);
    }
  }, [room]);

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    if (soundEnabled) playSound('click');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    if (soundEnabled) playSound('click');
    createRoom(
      createRoomName.trim() || '৮ম শ্রেণি গণিত যৌথ স্টাডি',
      userName.trim(),
      selectedColor,
      currentSlideId,
      allowAnyPresenter
    );
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !userName.trim()) return;
    if (soundEnabled) playSound('click');
    joinRoom(joinCodeInput.trim(), userName.trim(), selectedColor);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim(), 'text');
    setChatInput('');
  };

  const handleReactionClick = (reaction: string) => {
    if (soundEnabled) playSound('click');
    sendChat(reaction, 'reaction');
  };

  const isHost = currentUser?.role === 'host';
  const canControlSlide = isHost || (room?.allowAnyPresenter ?? true);

  // -------------------------------------------------------------
  // VIEW 1: NOT IN ROOM (Create or Join)
  // -------------------------------------------------------------
  if (!room) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/60 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                <span>লাইভ মাল্টি-ইউজার কোলাবোরেশন</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                সহপাঠী অধ্যয়ন মোড (Peer Study Mode)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                ভার্চুয়াল স্টাডি রুম তৈরি করুন অথবা সহপাঠীর দেওয়া কোড দিয়ে সরাসরি যোগ দিন। 
                একসাথে একই স্লাইড দেখা, লাইভ গণিত আলোচনা, বোধগম্যতা পোল এবং লেজার পয়েন্টার দিয়ে সম্মিলিত প্রস্তুতি নিন।
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-3 rounded-2xl border border-white/10 shrink-0">
              <Users className="w-6 h-6 text-indigo-300" />
              <div>
                <p className="text-xs text-slate-300">বর্তমান অবস্থান</p>
                <p className="text-sm font-black text-white font-mono">স্লাইড #{currentSlideId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Profile / Avatar Settings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>আপনার স্টাডি পরিচয় ও প্রোফাইল</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                আপনার নাম (সহপাঠীরা দেখতে পাবে)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="যেমন: তানভীর, সাদিয়া, রাইয়ান..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                অ্যাভাটার রঙ নির্বাচন করুন
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col.hex)}
                    className={`w-8 h-8 rounded-full transition-transform ${col.bg} flex items-center justify-center text-white ${
                      selectedColor === col.hex ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={col.label}
                  >
                    {selectedColor === col.hex && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Columns: Create Room vs Join Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Create Virtual Room */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    নতুন স্টাডি রুম তৈরি করুন
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    আপনি হোস্ট হিসেবে রুম তৈরি করবেন ও স্লাইড পরিচালনা করবেন
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} id="create-room-form" className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    রুমের শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={createRoomName}
                    onChange={(e) => setCreateRoomName(e.target.value)}
                    placeholder="যেমন: অধ্যায় ২ মুনাফা গ্রুপ ডিসকাশন"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={allowAnyPresenter}
                        onChange={(e) => setAllowAnyPresenter(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>সকল সহপাঠী স্লাইড পরিবর্তন করতে পারবে</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      টিক না দিলে কেবল হোস্ট হিসেবে আপনিই পুরো রুমের স্লাইড পরিবর্তন করতে পারবেন।
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  শুরুর স্লাইড:{' '}
                  <strong className="text-slate-700 dark:text-slate-300 font-mono">
                    #{currentSlideId} - {currentSlide.title}
                  </strong>
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="create-room-form"
              disabled={isConnecting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>রুম তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ভার্চুয়াল স্টাডি রুম চালু করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Card B: Join Virtual Room */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    সহপাঠীর রুমে যোগ দিন
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    সহপাঠী বা শিক্ষকের শেয়ার করা ৬-অক্ষরের রুম কোড প্রবেশ করান
                  </p>
                </div>
              </div>

              <form onSubmit={handleJoinSubmit} id="join-room-form" className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    রুম কোড (Room Code)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="যেমন: A8K9X2"
                    className="w-full px-4 py-3 rounded-xl text-center text-lg font-mono font-black tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                  💡 রুমে যোগ দিলে আপনার স্লাইড স্বয়ংক্রিয়ভাবে রুম হোস্টের বর্তমান স্লাইডের সাথে সিঙ্ক হবে।
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="join-room-form"
              disabled={isConnecting || !joinCodeInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>রুমে যুক্ত হচ্ছে...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>রুমে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section: Active Public Rooms */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                সক্রিয় উন্মুক্ত স্টাডি সেশন ({publicRooms.length})
              </h3>
            </div>
            <button
              onClick={fetchPublicRooms}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRooms ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          </div>

          {publicRooms.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              বর্তমানে কোনো উন্মুক্ত স্টাডি রুম খোলা নেই। নতুন একটি রুম তৈরি করে সহপাঠীদের আমন্ত্রণ জানান!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {publicRooms.map((r) => (
                <div
                  key={r.roomCode}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-xs mb-1">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {r.roomCode}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{r.userCount} জন</span>
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {r.roomName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      হোস্ট: {r.hostName} • স্লাইড #{r.currentSlideId}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (soundEnabled) playSound('click');
                      joinRoom(r.roomCode, userName.trim(), selectedColor);
                    }}
                    className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>যোগ দিন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800">
            <Radio className="w-5 h-5 text-indigo-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">রিয়েলটাইম স্লাইড সিঙ্ক</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              হোস্ট স্লাইড পাল্টালে রুমের সবার স্ক্রিন মুহূর্তের মধ্যে একই স্লাইডে চলে যায়।
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800">
            <MessageSquare className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">লাইভ চ্যাট ও প্রতিক্রিয়া</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              পাঠ চলাকালে ১-ক্লিকে রিঅ্যাকশন দিন এবং প্রশ্নের তাৎক্ষণিক উত্তর খুঁজুন।
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-900 border border-sky-100 dark:border-slate-800">
            <HelpCircle className="w-5 h-5 text-sky-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">বোধগম্যতা কুইজ পোল</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              কোনো জটিল উপপাদ্য বা সূত্র বুঝতে পেরেছে কি না তা পোল ভোটের মাধ্যমে যাচাই করুন।
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-slate-900 border border-purple-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">লেজার পয়েন্টার</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              স্লাইডের নির্দিষ্ট কোনো লাইনে ক্লিক করে সহপাঠীদের দৃষ্টি আকর্ষণ করুন।
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: CONNECTED IN ROOM
  // -------------------------------------------------------------
  const renderPeersAndChat = () => (
    <div className="space-y-6">
      {/* Connected Peers List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>সংযুক্ত সহপাঠীগণ ({room.users.length})</span>
          </h3>

          {isHost && (
            <button
              onClick={() => toggleAllowAnyPresenter(!room.allowAnyPresenter)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                room.allowAnyPresenter
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200'
              }`}
              title="উপস্থাপনা নিয়ন্ত্রণ পারমিশন পরিবর্তন করুন"
            >
              {room.allowAnyPresenter ? '🔓 সবার কন্ট্রোল' : '🔒 হোস্ট লকড'}
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {room.users.map((peer) => {
            const isMe = peer.id === currentUser?.id;
            const isPeerHost = peer.role === 'host';

            return (
              <div
                key={peer.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] shadow-xs shrink-0"
                    style={{ backgroundColor: peer.avatarColor }}
                  >
                    {peer.name.charAt(0)}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{peer.name}</span>
                      {isMe && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          আপনি
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {isPeerHost ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      হোস্ট
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">সহপাঠী</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Chat & Quick Reactions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[420px]">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            রুম ডিসকাশন ও লাইভ চ্যাট
          </h3>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 scrollbar-thin">
          {room.messages.map((m) => {
            if (m.type === 'system') {
              return (
                <div
                  key={m.id}
                  className="text-center my-1 text-[11px] text-slate-400 italic bg-slate-100/60 dark:bg-slate-800/40 py-1 px-2 rounded-lg"
                >
                  {m.text}
                </div>
              );
            }

            const isMe = m.senderId === currentUser?.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} text-xs`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="font-bold text-[11px]"
                    style={{ color: m.senderColor }}
                  >
                    {m.senderName}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : m.type === 'reaction'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-bl-xs font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reactions Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_REACTIONS.map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => handleReactionClick(rec)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors"
              >
                {rec}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="বার্তা বা গণিত প্রশ্ন লিখুন..."
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Active Room Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-indigo-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
              লাইভ স্টাডি রুম সক্রিয়
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300">
              হোস্ট: <strong>{room.hostName}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {room.roomName}
          </h2>
        </div>

        {/* Room Code + Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Room Code Badge */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs text-slate-300 font-medium">রুম কোড:</span>
            <span className="font-mono font-black text-amber-300 text-base tracking-wider">
              {room.roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 rounded-lg hover:bg-white/20 text-slate-200 transition-colors"
              title="রুম কোড কপি করুন"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Jump to Slides Viewer */}
          <button
            onClick={onSwitchToSlidesTab}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>স্লাইড ভিউয়ারে যান</span>
          </button>

          {/* Leave Room Button */}
          <button
            onClick={() => {
              if (window.confirm('আপনি কি স্টাডি রুম থেকে বের হতে চান?')) {
                leaveRoom();
              }
            }}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1"
            title="রুম ত্যাগ করুন"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">বের হন</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs: স্লাইড ও আলোচনা vs যৌথ ভার্চুয়াল হোয়াইটবোর্ড */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveRoomSection('slides');
              if (soundEnabled) playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeRoomSection === 'slides'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>স্লাইড ও আলোচনা</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              #{room.currentSlideId}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveRoomSection('whiteboard');
              if (soundEnabled) playSound('click');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
              activeRoomSection === 'whiteboard'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>যৌথ ভার্চুয়াল হোয়াইটবোর্ড</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>লাইভ সিঙ্ক</span>
            </span>
            {room.whiteboardStrokes && room.whiteboardStrokes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                {room.whiteboardStrokes.length}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {activeRoomSection === 'whiteboard'
              ? 'হোয়াইটবোর্ডে আঁকা সমীকরণ ও নোট সাথে সাথে সব সহপাঠীর স্ক্রিনে লাইভ সিঙ্ক হচ্ছে'
              : 'হোস্টের সাথে সাথে স্লাইড পরিবর্তন ও লাইভ পোল আলোচনা'}
          </span>
        </div>
      </div>

      {/* SECTION 1: VIRTUAL WHITEBOARD */}
      {activeRoomSection === 'whiteboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <VirtualWhiteboard
              room={room}
              currentUser={currentUser}
              onSendStroke={onSendWhiteboardStroke || (() => {})}
              onClear={onClearWhiteboard || (() => {})}
              onUndo={onUndoWhiteboard || (() => {})}
              activeDrawer={activeWhiteboardDrawer || null}
              soundEnabled={soundEnabled}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            {renderPeersAndChat()}
          </div>
        </div>
      ) : (
        /* SECTION 2: SLIDE SYNC & DISCUSSION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Slide Sync & Polls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
          {/* Synchronized Slide Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                  স্লাইড #{room.currentSlideId}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {currentSlide.chapterTitle}
                </span>
              </div>

              {/* Sync Status Badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFollowSync(!followSync)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    followSync
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  title="হোস্টের স্লাইড অনুসরণ করার অপশন"
                >
                  <Radio className={`w-3 h-3 ${followSync ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>{followSync ? 'সিঙ্ক মোড চালু' : 'স্বতন্ত্র মোড'}</span>
                </button>
              </div>
            </div>

            {/* Slide Title and Content Teaser */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {currentSlide.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {currentSlide.easyExplanation}
              </p>
              {currentSlide.formula && (
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
                  {currentSlide.formula}
                </div>
              )}
            </div>

            {/* Slide Navigator Controls for Presenter / Peers */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (room.currentSlideId > 1 && canControlSlide) {
                      syncSlideChange(room.currentSlideId - 1);
                      onJumpToSlide(room.currentSlideId - 1);
                    }
                  }}
                  disabled={!canControlSlide || room.currentSlideId <= 1}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-40"
                >
                  ← পূর্ববর্তী স্লাইড
                </button>
                <button
                  onClick={() => {
                    if (canControlSlide) {
                      syncSlideChange(room.currentSlideId + 1);
                      onJumpToSlide(room.currentSlideId + 1);
                    }
                  }}
                  disabled={!canControlSlide}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-40"
                >
                  পরবর্তী স্লাইড →
                </button>
              </div>

              <button
                onClick={onSwitchToSlidesTab}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>পূর্ণ স্লাইড দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!canControlSlide && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                🔒 বর্তমানে শুধুমাত্র হোস্ট <strong>({room.hostName})</strong> স্লাইড পরিচালনা করতে পারবেন।
              </p>
            )}
          </div>

          {/* Comprehension Poll Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  সহপাঠী বোধগম্যতা পোল (Comprehension Poll)
                </h3>
              </div>
              {isHost && (
                <div className="flex items-center gap-2">
                  {room.activePoll?.isActive ? (
                    <button
                      onClick={closePoll}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    >
                      পোল সমাপ্ত করুন
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPollModal(true)}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
                    >
                      + নতুন পোল চালু করুন
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Poll Display */}
            {room.activePoll ? (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {room.activePoll.question}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    room.activePoll.isActive
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {room.activePoll.isActive ? 'চলমান ভোট' : 'সমাপ্ত'}
                  </span>
                </div>

                {/* Poll Options & Vote Bars */}
                <div className="space-y-2.5">
                  {(() => {
                    const totalVotes = Object.keys(room.activePoll.votes).length;
                    const myVote = currentUser ? room.activePoll.votes[currentUser.id] : undefined;

                    return room.activePoll.options.map((opt, idx) => {
                      const voteCount = Object.values(room.activePoll!.votes).filter(v => v === idx).length;
                      const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      const isSelected = myVote === idx;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (room.activePoll?.isActive) {
                              if (soundEnabled) playSound('click');
                              votePoll(idx);
                            }
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                          } ${!room.activePoll?.isActive ? 'cursor-default' : ''}`}
                        >
                          {/* Percentage background fill */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 dark:bg-indigo-500/20 transition-all duration-500 pointer-events-none"
                            style={{ width: `${pct}%` }}
                          />

                          <div className="relative flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-400'
                              }`}>
                                {isSelected && '✓'}
                              </span>
                              <span>{opt}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                              {voteCount} ভোট ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                বর্তমানে কোনো পোল সক্রিয় নেই। {isHost ? 'উপরের বাটনে ক্লিক করে সহপাঠীদের জন্য তাৎক্ষণিক পোল শুরু করুন!' : 'হোস্ট পোল চালু করলে এখানে অপশন প্রদর্শিত হবে।'}
              </div>
            )}

            {/* Modal for creating poll (host only) */}
            {showPollModal && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  নতুন বোধগম্যতা পোল তৈরি
                </h4>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="প্রশ্নের বিবরণ লিখুন..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => {
                      if (!pollQuestion.trim()) return;
                      startPoll(pollQuestion.trim(), [
                        '১০০% বুঝেছি 👍',
                        'কিছুটা সংশয় আছে 🤔',
                        'আবার বুঝান ❓',
                      ]);
                      setShowPollModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    পোল চালু করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Connected Peers & Live Chat (5 cols) */}
        <div className="lg:col-span-5">
          {renderPeersAndChat()}
        </div>
      </div>
    )}
  </div>
);
};
