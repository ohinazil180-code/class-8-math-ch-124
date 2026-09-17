import React, { useState } from 'react';
import { MainNavTab } from '../types';
import {
  BookOpen, FlaskConical, Calculator, BookA,
  Trophy, TrendingUp, Search, Volume2, VolumeX,
  Menu, Maximize2, Minimize2, Sparkles, Users, Radio
} from 'lucide-react';

interface Props {
  currentTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  currentSlideId: number;
  totalSlides: number;
  onJumpToSlide: (slideId: number) => void;
  onOpenSearch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPresentationMode: boolean;
  onTogglePresentation: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSolver?: () => void;
  xp: number;
  activePeerRoomCode?: string | null;
  peerUserCount?: number;
}

export const Header: React.FC<Props> = ({
  currentTab,
  onTabChange,
  currentSlideId,
  totalSlides,
  onJumpToSlide,
  onOpenSearch,
  soundEnabled,
  onToggleSound,
  isPresentationMode,
  onTogglePresentation,
  onToggleSidebar,
  isSidebarOpen,
  onOpenSolver,
  xp,
  activePeerRoomCode,
  peerUserCount
}) => {
  const [jumpInput, setJumpInput] = useState<string>('');

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= totalSlides) {
      onJumpToSlide(num);
      setJumpInput('');
    }
  };

  const navTabs: { id: MainNavTab; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { id: 'slides', label: 'স্লাইডস', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'peer', label: 'সহপাঠী মোড', icon: <Users className="w-4 h-4" />, isLive: Boolean(activePeerRoomCode) },
    { id: 'labs', label: 'ম্যাথ ল্যাব', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'formulas', label: 'সূত্র ভাণ্ডার', icon: <Calculator className="w-4 h-4" /> },
    { id: 'glossary', label: 'শব্দকোষ', icon: <BookA className="w-4 h-4" /> },
    { id: 'exam', label: 'পরীক্ষা এরিনা', icon: <Trophy className="w-4 h-4" /> },
    { id: 'progress', label: 'অগ্রগতি', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          {/* Left: Sidebar toggle + App Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="সূচিপত্র খুলুন/বন্ধ করুন"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onTabChange('slides')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <span className="font-black text-base md:text-lg">৮</span>
              </div>
              <div className="hidden xs:block sm:block">
                <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  গণিত ২০২৬
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 hidden sm:inline-block">
                    ৫০০ স্লাইড
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden md:block">
                  ইন্টারেক্টিভ পাঠ্যবই ও শিক্ষক উপস্থাপনা
                </p>
              </div>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all relative ${
                  currentTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.isLive && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{peerUserCount || 1}</span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: Quick Jump, Search, XP, Sound, Presentation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Slide Jump Form */}
            <form onSubmit={handleJumpSubmit} className="hidden sm:flex items-center">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={`১-${totalSlides}`}
                  value={jumpInput}
                  onChange={e => setJumpInput(e.target.value)}
                  className="w-16 md:w-20 px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-center font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="সরাসরি স্লাইড নম্বরে যান (১-৫০০)"
                />
              </div>
            </form>

            {/* Live Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="খুঁজুন (সব ৫০০ স্লাইড ও বিষয়)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline font-medium">খুঁজুন</span>
            </button>

            {/* Quick Equation Solver Trigger */}
            {onOpenSolver && (
              <button
                onClick={onOpenSolver}
                className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1.5 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30"
                title="বীজগণিত সমীকরণ সমাধান টুল খুলুন"
              >
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">সলভার</span>
              </button>
            )}

            {/* XP Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{xp} XP</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Presentation Mode Toggle */}
            <button
              onClick={onTogglePresentation}
              className={`p-2 rounded-xl transition-colors ${
                isPresentationMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isPresentationMode ? "ক্লাসরুম মোড বন্ধ" : "ফুলস্ক্রিন ক্লাসরুম প্রেজেন্টেশন"}
            >
              {isPresentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800 scrollbar-none gap-1">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                currentTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.isLive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
