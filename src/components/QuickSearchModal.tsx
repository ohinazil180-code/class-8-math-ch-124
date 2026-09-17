import React, { useState, useEffect, useRef } from 'react';
import { SlideData } from '../types';
import { Search, X, ChevronRight, BookOpen, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allSlides: SlideData[];
  onSelectSlide: (id: number) => void;
}

export const QuickSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  allSlides,
  onSelectSlide
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // trigger toggle in parent
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allSlides.filter(s => {
        const q = query.toLowerCase().trim();
        return (
          s.title.toLowerCase().includes(q) ||
          s.slideNumber.includes(q) ||
          s.section.toLowerCase().includes(q) ||
          s.textbookContent.toLowerCase().includes(q) ||
          s.easyExplanation.toLowerCase().includes(q) ||
          (s.keywords && s.keywords.some(k => k.toLowerCase().includes(q)))
        );
      }).slice(0, 25)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="যেকোনো বিষয়, সূত্র বা স্লাইড নম্বর দিয়ে খুঁজুন (যেমন: ১৪৬, সরল মুনাফা, মিডল টার্ম)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p>৫০০টি স্লাইডের যেকোনো বিষয় বা নম্বর লিখে অনুসন্ধান করুন</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {["মৌলিক সংখ্যা", "ম্যাজিক বর্গ", "সরল মুনাফা", "চক্রবৃদ্ধি", "বর্গের সূত্র", "উৎপাদক", "গ.সা.গু"].map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              "{query}" সংক্রান্ত কোনো স্লাইড পাওয়া যায়নি
            </div>
          ) : (
            filtered.map(slide => (
              <div
                key={slide.id}
                onClick={() => {
                  onSelectSlide(slide.id);
                  onClose();
                }}
                className="p-3 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60 cursor-pointer flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      স্লাইড {slide.slideNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {slide.section}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">
                    {slide.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {slide.easyExplanation || slide.textbookContent}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>{filtered.length} টি ফলাফল প্রদর্শিত</span>
          <span>ক্লিক করে সরাসরি স্লাইডে যান</span>
        </div>
      </div>
    </div>
  );
};
