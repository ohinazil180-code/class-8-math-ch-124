import React, { useState } from 'react';
import { FORMULA_BANK } from '../data/formulas';
import {
  Calculator, Search, Copy, Check, Printer, Filter,
  BookOpen, Sparkles
} from 'lucide-react';

export const FormulaBankView: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getChapterTitle = (ch: number) => {
    if (ch === 1) return 'অধ্যায় ১: প্যাটার্ন';
    if (ch === 2) return 'অধ্যায় ২: মুনাফা';
    return 'অধ্যায় ৪: বীজগণিত';
  };

  const filteredFormulas = FORMULA_BANK.filter(item => {
    if (selectedChapter !== 'all' && item.chapter !== selectedChapter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.latexOrText.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.example && item.example.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-6 rounded-3xl border border-sky-800/60 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">
              ডিজিটাল সূত্র ভাণ্ডার (Formula Bank)
            </h2>
            <p className="text-xs md:text-sm text-sky-200">
              অষ্টম শ্রেণির সকল প্রয়োজনীয় গাণিতিক সূত্র, অনুসিদ্ধান্ত ও বাস্তব উদাহরণ
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur shadow-sm active:scale-95"
          title="প্রিন্ট উপযোগী ফরম্যাটে রূপান্তর"
        >
          <Printer className="w-4 h-4" />
          <span>চিটশিট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Chapter Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedChapter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedChapter === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            সকল অধ্যায় ({FORMULA_BANK.length})
          </button>
          <button
            onClick={() => setSelectedChapter(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedChapter === 1
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            অধ্যায় ১: প্যাটার্ন
          </button>
          <button
            onClick={() => setSelectedChapter(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedChapter === 2
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            অধ্যায় ২: মুনাফা
          </button>
          <button
            onClick={() => setSelectedChapter(4)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedChapter === 4
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            অধ্যায় ৪: বীজগণিত
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="সূত্র বা নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  {getChapterTitle(item.chapter)}
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.latexOrText)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="সূত্র কপি করুন"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[11px] text-emerald-500 font-semibold">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">কপি</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formula Title */}
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                {item.name}
              </h3>

              {/* Highlighted Formula Display */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-base md:text-lg font-black text-sky-600 dark:text-sky-400 text-center tracking-wide overflow-x-auto select-all">
                {item.latexOrText}
              </div>

              {/* Explanation */}
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Variables and Example */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
              {item.variables && item.variables.length > 0 && (
                <div className="text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">চলকসমূহ:</strong>{' '}
                  {item.variables.map(v => `${v.name}: ${v.meaning}`).join(', ')}
                </div>
              )}
              {item.example && (
                <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                  <strong className="font-semibold block mb-0.5">ব্যবহারিক উদাহরণ:</strong>
                  {item.example}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
