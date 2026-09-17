import React, { useState } from 'react';
import { GLOSSARY_ITEMS } from '../data/glossary';
import { GlossaryItem } from '../types';
import { BookA, Search, Lightbulb } from 'lucide-react';

export const GlossaryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Unique starting letters in Bengali
  const letters = ['all', 'প', 'ম', 'ব', 'য', 'ফ', 'ক', 'স', 'চ', 'আ', 'দ', 'গ', 'ল', 'অ', 'উ'];

  const filteredGlossary = GLOSSARY_ITEMS.filter((item: GlossaryItem) => {
    if (selectedLetter !== 'all' && !item.termBn.startsWith(selectedLetter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.termBn.toLowerCase().includes(q) ||
        item.termEn.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.example && item.example.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800/60 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
            <BookA className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">
              গণিত শব্দকোষ ও পরিভাষা (Math Glossary)
            </h2>
            <p className="text-xs md:text-sm text-emerald-200">
              অষ্টম শ্রেণির গণিত পাঠ্যবইয়ের সকল পারিভাষিক শব্দের প্রমিত বাংলা সংজ্ঞা, ইংরেজি প্রতিশব্দ ও বাস্তব ব্যাখ্যা
            </p>
          </div>
        </div>
      </div>

      {/* Search & Letter Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="বাংলা বা ইংরেজি পরিভাষা দিয়ে খুঁজুন (যেমন: প্যাটার্ন, মুনাফা, HCF)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Letter filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {letters.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedLetter === letter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {letter === 'all' ? 'সকল অক্ষর' : letter}
            </button>
          ))}
        </div>
      </div>

      {/* Glossary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGlossary.map((item: GlossaryItem) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {item.chapter === 1 ? 'অধ্যায় ১: প্যাটার্ন' : item.chapter === 2 ? 'অধ্যায় ২: মুনাফা' : 'অধ্যায় ৪: বীজগণিত'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {item.termEn}
                </span>
              </div>

              {/* Term Title */}
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight mb-1">
                {item.termBn}
              </h3>

              {/* Definition */}
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed mt-2">
                {item.definition}
              </p>
            </div>

            {/* Example */}
            {item.example && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="font-medium">
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">উদাহরণ: </strong>
                    {item.example}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
