import React from 'react';
import { SlideData } from '../types';
import { CHAPTER_OUTLINES } from '../data/slides';
import {
  TrendingUp, Award, Bookmark, CheckCircle2, RotateCcw,
  Zap, Flame, BookOpen, ChevronRight
} from 'lucide-react';

interface Props {
  completedSlideIds: number[];
  bookmarkedSlideIds: number[];
  allSlides: SlideData[];
  xp: number;
  onJumpToSlide: (slideId: number) => void;
  onResetProgress: () => void;
}

export const ProgressView: React.FC<Props> = ({
  completedSlideIds,
  bookmarkedSlideIds,
  allSlides,
  xp,
  onJumpToSlide,
  onResetProgress
}) => {
  const totalSlides = allSlides.length;
  const completedCount = completedSlideIds.length;
  const overallPercent = Math.round((completedCount / totalSlides) * 100);

  // Determine user level based on XP
  let userLevel = "গণিত শিক্ষানবিস (Level 1)";
  if (xp >= 1500) userLevel = "গণিত সম্রাট ২০২৬ (Level 5)";
  else if (xp >= 1000) userLevel = "বীজগণিত মাস্টার (Level 4)";
  else if (xp >= 500) userLevel = "মুনাফা বিশেষজ্ঞ (Level 3)";
  else if (xp >= 200) userLevel = "প্যাটার্ন এক্সপ্লোরার (Level 2)";

  // Badges
  const badges = [
    { title: "প্রথম পদার্পণ", desc: "প্রথম স্লাইড সম্পন্ন", earned: completedCount >= 1 },
    { title: "প্যাটার্ন মাস্টার", desc: "অধ্যায় ১ এর অন্তত ২০টি স্লাইড দেখা", earned: completedSlideIds.filter(id => id <= 130 && id >= 21).length >= 20 },
    { title: "মুনাফা বিশেষজ্ঞ", desc: "অধ্যায় ২ এর অন্তত ২০টি স্লাইড দেখা", earned: completedSlideIds.filter(id => id <= 265 && id >= 131).length >= 20 },
    { title: "বীজগণিত জিনিয়াস", desc: "অধ্যায় ৪ এর অন্তত ২০টি স্লাইড দেখা", earned: completedSlideIds.filter(id => id >= 266).length >= 20 },
    { title: "কুইজ বিজয়ী", desc: "১০০ এর বেশি XP অর্জন", earned: xp >= 100 },
    { title: "৫০০ স্লাইড ফিনিশার", desc: "সবগুলো স্লাইড সফলভাবে শেষ করা", earned: completedCount >= 500 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">
              আমার অধ্যয়নের অগ্রগতি (My Progress)
            </h2>
            <p className="text-xs md:text-sm text-purple-200">
              ৫০০ স্লাইডের পূর্ণাঙ্গ ট্র্যাকিং, ব্যাজ ও ব্যক্তিগত অর্জনের ড্যাশবোর্ড
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-purple-500/40 text-purple-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span className="font-bold text-sm">{xp} XP পয়েন্ট</span>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">মোট স্লাইড পাঠ</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {completedCount} / {totalSlides}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block">
              {overallPercent}% সম্পূর্ণ
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">বর্তমান পদমর্যাদা</span>
            <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
              {userLevel}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
              {badges.filter(b => b.earned).length} টি ব্যাজ আনলকড
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">বুকমার্ককৃত স্লাইড</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {bookmarkedSlideIds.length} টি
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">
              দ্রুত অনুশীলনের জন্য সংরক্ষিত
            </span>
          </div>
        </div>
      </div>

      {/* Chapter-wise Progress Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          অধ্যায়ভিত্তিক সমাপ্তি হার:
        </h3>

        <div className="space-y-4">
          {CHAPTER_OUTLINES.map(ch => {
            const chSlides = allSlides.filter(s => s.chapter === ch.chapter);
            const chDone = chSlides.filter(s => completedSlideIds.includes(s.id)).length;
            const pct = chSlides.length > 0 ? Math.round((chDone / chSlides.length) * 100) : 0;

            return (
              <div key={ch.chapter} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {ch.title}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {chDone} / {chSlides.length} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          অর্জিত ব্যাজসমূহ (Achievement Badges):
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border transition-all text-center space-y-1.5 ${
                b.earned
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-sm'
                  : 'opacity-40 grayscale bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                {b.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Bookmarks List */}
      {bookmarkedSlideIds.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
            তোমার বুকমার্ককৃত স্লাইডসমূহ ({bookmarkedSlideIds.length} টি)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bookmarkedSlideIds.map(id => {
              const slide = allSlides.find(s => s.id === id);
              if (!slide) return null;
              return (
                <div
                  key={id}
                  onClick={() => onJumpToSlide(id)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                      স্লাইড {slide.slideNumber}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {slide.title}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Danger Zone: Reset Progress */}
      <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-rose-800 dark:text-rose-300 block">অধ্যয়ন হিস্ট্রি রিসেট</span>
          <span className="text-slate-500 dark:text-slate-400">
            তোমার পড়া স্লাইড, পয়েন্ট ও বুকমার্ক পুনরায় শূন্যে ফেরত নিয়ে যাবে
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm("আপনি কি নিশ্চিতভাবে সব অগ্রগতি ও বুকমার্ক মুছে ফেলতে চান?")) {
              onResetProgress();
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs"
        >
          অগ্রগতি রিসেট করুন
        </button>
      </div>
    </div>
  );
};
