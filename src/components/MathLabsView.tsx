import React, { useState } from 'react';
import { VisualType } from '../types';
import { InteractiveVisualizer } from './InteractiveVisualizer';
import {
  FlaskConical, Sparkles, Grid3X3, DollarSign, TrendingUp,
  Boxes, Split, Calculator, Shuffle
} from 'lucide-react';

interface Props {
  soundEnabled: boolean;
}

export const MathLabsView: React.FC<Props> = ({ soundEnabled }) => {
  const [activeLab, setActiveLab] = useState<VisualType>('eratosthenes');

  const labsList: { id: VisualType; title: string; chapter: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'eratosthenes',
      title: 'ইরাটোস্থেনিস ছাঁকনি ল্যাব',
      chapter: 'অধ্যায় ১: প্যাটার্ন',
      icon: <Grid3X3 className="w-5 h-5 text-amber-500" />,
      desc: '১ থেকে ১০০ এর মধ্যে মৌলিক সংখ্যা ছাঁকার প্রাচীন গ্রিক অ্যালগরিদম'
    },
    {
      id: 'magic-square-3',
      title: '৩ ক্রমের ম্যাজিক বর্গ ধাঁধা',
      chapter: 'অধ্যায় ১: প্যাটার্ন',
      icon: <Shuffle className="w-5 h-5 text-emerald-500" />,
      desc: 'সব দিক থেকে যোগফল ১৫ মেলানোর ইন্টারেক্টিভ নম্বর পাজল'
    },
    {
      id: 'simple-interest-calc',
      title: 'সরল মুনাফা ক্যালকুলেটর',
      chapter: 'অধ্যায় ২: মুনাফা',
      icon: <DollarSign className="w-5 h-5 text-sky-500" />,
      desc: 'I = Pnr/100 সূত্রের সাহায্যে লাইভ মুনাফা ও অনুপাত প্রদর্শন'
    },
    {
      id: 'compound-interest-calc',
      title: 'চক্রবৃদ্ধি মুনাফা তুলনা ল্যাব',
      chapter: 'অধ্যায় ২: মুনাফা',
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      desc: 'C = P(1+r/100)ⁿ সূত্রের শক্তিমত্তা ও সরল মুনাফার পার্থক্য'
    },
    {
      id: 'algebra-square',
      title: '(a + b)² জ্যামিতিক প্রমাণ ল্যাব',
      chapter: 'অধ্যায় ৪: বীজগণিত',
      icon: <Boxes className="w-5 h-5 text-indigo-500" />,
      desc: 'a² + 2ab + b² জ্যামিতিক ৪টি ব্লকে বিভক্তিকরণ মডেল'
    },
    {
      id: 'ac-method',
      title: 'AC মেথড ও মিডল টার্ম ল্যাব',
      chapter: 'অধ্যায় ৪: বীজগণিত',
      icon: <Split className="w-5 h-5 text-rose-500" />,
      desc: 'ax² + bx + c এর স্বয়ংক্রিয় উৎপাদক ও মধ্যপদ বিভক্তি নির্ণয়'
    },
    {
      id: 'hcf-visualizer',
      title: 'গ.সা.গু ও ল.সা.গু ক্যালকুলেটর',
      chapter: 'অধ্যায় ৪: বীজগণিত',
      icon: <Calculator className="w-5 h-5 text-teal-500" />,
      desc: 'H.C.F., L.C.M. ও গুণফলের গাণিতিক সম্পর্ক যাচাই'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/60 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">
              ইন্টারেক্টিভ ম্যাথ ল্যাব হাব (Math Labs)
            </h2>
            <p className="text-xs md:text-sm text-indigo-200">
              অষ্টম শ্রেণির গণিতের জটিল ধারণাগুলো হাতে-কলমে পরখ করার জন্য ৭টি ডিজিটাল সিমুলেটর
            </p>
          </div>
        </div>
      </div>

      {/* Lab Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {labsList.map(lab => (
          <button
            key={lab.id}
            onClick={() => setActiveLab(lab.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 ${
              activeLab === lab.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-xl ${activeLab === lab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {lab.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeLab === lab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {lab.chapter.split(':')[0]}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm leading-snug mb-1">
                {lab.title}
              </h4>
              <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                activeLab === lab.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {lab.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Active Lab Screen */}
      <div className="transition-all duration-300">
        <InteractiveVisualizer visualType={activeLab} soundEnabled={soundEnabled} />
      </div>
    </div>
  );
};
