import React, { useState } from 'react';
import { RoomData, PeerUser } from '../types';
import {
  Users, Radio, MessageSquare, Target, X, Send,
  HelpCircle, ChevronUp, ChevronDown, Check, ArrowRight, PenTool
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props {
  room: RoomData;
  currentUser: PeerUser | null;
  currentSlideId: number;
  followSync: boolean;
  onToggleFollowSync: () => void;
  onJumpToRoomSlide: () => void;
  isLaserActive: boolean;
  onToggleLaser: () => void;
  sendChat: (text: string, reactionType?: 'text' | 'reaction') => void;
  votePoll: (optionIndex: number) => void;
  onOpenPeerTab: () => void;
  onOpenWhiteboard?: () => void;
  soundEnabled: boolean;
}

const QUICK_REACTIONS = ['👍 বুঝেছি', '🙋‍♂️ আরেকবার', '💡 দারুণ', '❓ প্রশ্ন'];

export const PeerRoomBanner: React.FC<Props> = ({
  room,
  currentUser,
  currentSlideId,
  followSync,
  onToggleFollowSync,
  onJumpToRoomSlide,
  isLaserActive,
  onToggleLaser,
  sendChat,
  votePoll,
  onOpenPeerTab,
  onOpenWhiteboard,
  soundEnabled,
}) => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPollOpen, setIsPollOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const isDesynced = room.currentSlideId !== currentSlideId;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendChat(chatMessage.trim(), 'text');
    setChatMessage('');
  };

  const handleReaction = (rx: string) => {
    if (soundEnabled) playSound('click');
    sendChat(rx, 'reaction');
  };

  return (
    <div className="fixed bottom-16 right-3 sm:right-6 z-40 flex flex-col items-end gap-2 max-w-sm pointer-events-none">
      {/* Active Poll Floating Alert (if active and unvoted) */}
      {room.activePoll && room.activePoll.isActive && (
        <div className="pointer-events-auto bg-indigo-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-indigo-700/80 backdrop-blur max-w-xs animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>সহপাঠী কুইজ পোল চলমান</span>
            </span>
            <button
              onClick={() => setIsPollOpen(!isPollOpen)}
              className="text-slate-300 hover:text-white text-xs"
            >
              {isPollOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs font-bold text-slate-100 mb-2.5">
            {room.activePoll.question}
          </p>

          <div className="space-y-1.5">
            {room.activePoll.options.map((opt, idx) => {
              const myVote = currentUser ? room.activePoll?.votes[currentUser.id] : undefined;
              const isSelected = myVote === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (soundEnabled) playSound('click');
                    votePoll(idx);
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating In-Slide Quick Chat Drawer */}
      {isChatOpen && (
        <div className="pointer-events-auto w-80 sm:w-88 bg-white/95 dark:bg-slate-900/95 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur flex flex-col h-80 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                রুম চ্যাট ({room.users.length} জন)
              </h4>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-2 space-y-2 text-xs pr-1 scrollbar-thin">
            {room.messages.slice(-15).map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-xl text-xs ${
                  m.senderId === currentUser?.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 ml-4'
                    : m.type === 'system'
                    ? 'bg-slate-100 dark:bg-slate-800/50 text-[10px] text-slate-500 italic text-center'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mr-4'
                }`}
              >
                {m.type !== 'system' && (
                  <div className="text-[10px] font-bold mb-0.5" style={{ color: m.senderColor }}>
                    {m.senderName}
                  </div>
                )}
                <div>{m.text}</div>
              </div>
            ))}
          </div>

          {/* Quick reactions */}
          <div className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-100 dark:border-slate-800">
            {QUICK_REACTIONS.map((rx) => (
              <button
                key={rx}
                onClick={() => handleReaction(rx)}
                className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap"
              >
                {rx}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="বার্তা লিখুন..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="p-1.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Main Floating Status Bar */}
      <div className="pointer-events-auto bg-slate-900/95 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-indigo-500/40 backdrop-blur flex items-center gap-2.5 transition-all">
        {/* Connection status indicator & room code */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenPeerTab}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="leading-none">
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-amber-300">{room.roomCode}</span>
              <span className="text-[10px] text-slate-400 font-sans">({room.users.length} জন)</span>
            </div>
          </div>
        </div>

        <div className="w-px h-5 bg-slate-700" />

        {/* Desync Alert & Jump Button */}
        {isDesynced && (
          <button
            onClick={onJumpToRoomSlide}
            className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all animate-bounce"
            title="হোস্টের স্লাইডে ফেরত যান"
          >
            <span>স্লাইড #{room.currentSlideId}-এ যান</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {/* Laser Pointer Mode Toggle */}
        <button
          onClick={onToggleLaser}
          className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
            isLaserActive
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-300'
              : 'bg-white/10 hover:bg-white/20 text-slate-300'
          }`}
          title={isLaserActive ? 'লেজার পয়েন্টার বন্ধ করুন' : 'লেজার পয়েন্টার চালু করুন (স্লাইডে ক্লিক করলে লাল মার্কার দেখাবে)'}
        >
          <Target className={`w-3.5 h-3.5 ${isLaserActive ? 'animate-spin' : ''}`} />
          <span className="text-[10px] hidden sm:inline">{isLaserActive ? 'পয়েন্টার চালু' : 'পয়েন্টার'}</span>
        </button>

        {/* Quick Whiteboard Button */}
        <button
          onClick={onOpenWhiteboard || onOpenPeerTab}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 transition-colors flex items-center gap-1"
          title="যৌথ ভার্চুয়াল হোয়াইটবোর্ডে যান"
        >
          <PenTool className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] hidden sm:inline">বোর্ড</span>
        </button>

        {/* Quick In-Slide Chat Toggle */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors relative"
          title="ইন-স্লাইড চ্যাট খুলুন"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {room.messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>

        {/* Go to Peer Tab */}
        <button
          onClick={onOpenPeerTab}
          className="px-2 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all"
        >
          রুম
        </button>
      </div>
    </div>
  );
};
