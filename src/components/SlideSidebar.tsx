import React, { useState, useEffect, useRef } from 'react';
import { SlideData } from '../types';
import { CHAPTER_OUTLINES } from '../data/slides';
import {
  X, Bookmark, CheckCircle2, ChevronDown, ChevronRight,
  Sparkles, BookOpen, Layers, Calculator
} from 'lucide-react';
import { EquationSolver } from './EquationSolver';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSlideId: number;
  onSelectSlide: (id: number) => void;
  allSlides: SlideData[];
  bookmarkedSlideIds: number[];
  completedSlideIds: number[];
  onToggleBookmark: (id: number) => void;
  soundEnabled?: boolean;
  activeView?: 'slides' | 'solver';
  onViewChange?: (view: 'slides' | 'solver') => void;
}

export const SlideSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  currentSlideId,
  onSelectSlide,
  allSlides,
  bookmarkedSlideIds,
  completedSlideIds,
  onToggleBookmark,
  soundEnabled = true,
  activeView: controlledActiveView,
  onViewChange
}) => {
  const [internalActiveView, setInternalActiveView] = useState<'slides' | 'solver'>('slides');
  const activeView = controlledActiveView || internalActiveView;

  const setActiveView = (view: 'slides' | 'solver') => {
    setInternalActiveView(view);
    if (onViewChange) onViewChange(view);
  };

  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [filterBookmarksOnly, setFilterBookmarksOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const activeSlideRef = useRef<HTMLDivElement>(null);

  // Sync active chapter with current slide
  useEffect(() => {
    const currentSlide = allSlides.find(s => s.id === currentSlideId);
    if (currentSlide) {
      setActiveChapter(currentSlide.chapter);
    }
  }, [currentSlideId, allSlides]);

  // Auto scroll to active slide when drawer is opened
  useEffect(() => {
    if (isOpen && activeSlideRef.current) {
      activeSlideRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, currentSlideId]);

  // Filter slides
  const filteredSlides = allSlides.filter(s => {
    if (filterBookmarksOnly && !bookmarkedSlideIds.includes(s.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(q) ||
        s.slideNumber.includes(q) ||
        s.section.toLowerCase().includes(q)
      );
    }
    return s.chapter === activeChapter;
  });

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-84 sm:w-96 md:w-[420px] max-w-[95vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              {activeView === 'solver' ? (
                <Calculator className="w-4 h-4" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {activeView === 'solver' ? 'সমীকরণ সমাধান টুল' : 'পাঠ্যবই সূচিপত্র'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeView === 'solver'
                  ? 'তাৎক্ষণিক বীজগণিত সমাধান'
                  : '৫০০টি ডিজিটাল স্লাইড ভাণ্ডার'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Mode Tabs (Slides vs Equation Solver) */}
        <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveView('slides')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeView === 'slides'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>সূচিপত্র</span>
            </button>
            <button
              onClick={() => setActiveView('solver')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
                activeView === 'solver'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              <span>সমীকরণ সলভার</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        </div>

        {/* View 1: Math Equation Solver */}
        {activeView === 'solver' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <EquationSolver soundEnabled={soundEnabled} />
          </div>
        )}

        {/* View 2: Slide Table of Contents */}
        {activeView === 'slides' && (
          <>
            {/* Chapter Tabs Accordion / Buttons */}
            <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1 bg-slate-50/50 dark:bg-slate-950/40">
              {CHAPTER_OUTLINES.map(outline => {
                const isActive = activeChapter === outline.chapter && !filterBookmarksOnly;
                return (
                  <button
                    key={outline.chapter}
                    onClick={() => {
                      setFilterBookmarksOnly(false);
                      setActiveChapter(outline.chapter);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {outline.badge}
                  </button>
                );
              })}

              <button
                onClick={() => setFilterBookmarksOnly(!filterBookmarksOnly)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterBookmarksOnly
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                বুকমার্ক ({bookmarkedSlideIds.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="স্লাইড খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Slide List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSlides.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  কোনো স্লাইড পাওয়া যায়নি
                </div>
              ) : (
                filteredSlides.map(slide => {
                  const isCurrent = slide.id === currentSlideId;
                  const isBookmarked = bookmarkedSlideIds.includes(slide.id);
                  const isCompleted = completedSlideIds.includes(slide.id);

                  return (
                    <div
                      key={slide.id}
                      ref={isCurrent ? activeSlideRef : null}
                      className={`group rounded-xl p-2.5 transition-all flex items-start justify-between gap-2 cursor-pointer border ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                      onClick={() => {
                        onSelectSlide(slide.id);
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {slide.slideNumber}
                        </span>

                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-indigo-950 dark:text-indigo-200 font-bold' : ''
                          }`}>
                            {slide.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {slide.section}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(slide.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                            isBookmarked ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}
                          title={isBookmarked ? "বুকমার্ক মুছুন" : "বুকমার্ক করুন"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>সম্পন্ন: {completedSlideIds.length} / {allSlides.length}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((completedSlideIds.length / allSlides.length) * 100)}% সম্পন্ন
              </span>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
