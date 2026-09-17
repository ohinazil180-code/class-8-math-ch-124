import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/audio';
import {
  Trophy, Clock, CheckCircle2, XCircle, RotateCcw,
  Award, HelpCircle, ArrowRight, Printer, Sparkles
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  chapter: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const EXAM_QUESTIONS: QuizQuestion[] = [
  // Chapter 1: Pattern
  {
    id: 1,
    chapter: 1,
    question: "১ থেকে ১০০ এর মধ্যে মোট কয়টি মৌলিক সংখ্যা রয়েছে?",
    options: ["২১টি", "২৩টি", "২৫টি", "২৮টি"],
    answer: 2,
    explanation: "ইরাটোস্থেনিস ছাঁকনি অনুসারে ১ থেকে ১০০ এর মধ্যে ২৫টি মৌলিক সংখ্যা রয়েছে (৪, ৪, ২, ২, ৩, ২, ২, ৩, ২, ১ নিয়ম)।"
  },
  {
    id: 2,
    chapter: 1,
    question: "৩ ক্রমের ম্যাজিক বর্গের ম্যাজিক সংখ্যা কত?",
    options: ["১২", "১৫", "৩৪", "৬৫"],
    answer: 1,
    explanation: "ম্যাজিক সংখ্যা = n(n² + 1) / 2 = 3(9 + 1) / 2 = 15।"
  },
  {
    id: 3,
    chapter: 1,
    question: "ফিবোনাচ্চি ধারা 0, 1, 1, 2, 3, 5, 8 এর পরবর্তী পদটি কত?",
    options: ["১১", "১২", "১৩", "১৪"],
    answer: 2,
    explanation: "পরপর দুটি পদের যোগফল: ৫ + ৮ = ১৩।"
  },
  {
    id: 4,
    chapter: 1,
    question: "প্রথম n সংখ্যক বিজোড় স্বাভাবিক সংখ্যার যোগফল কোনটি?",
    options: ["2n", "n(n+1)", "n²", "n(n+1)/2"],
    answer: 2,
    explanation: "প্রথম n সংখ্যক বিজোড় সংখ্যার যোগফল সবসময় n² এর সমান।"
  },

  // Chapter 2: Profit
  {
    id: 5,
    chapter: 2,
    question: "বার্ষিক ১০% মুনাফায় ৫০০০ টাকার ৩ বছরের সরল মুনাফা কত?",
    options: ["১০০০ টাকা", "১২০০ টাকা", "১৫০০ টাকা", "২০০০ টাকা"],
    answer: 2,
    explanation: "I = (P × n × r) / 100 = (5000 × 3 × 10) / 100 = ১৫০০ টাকা।"
  },
  {
    id: 6,
    chapter: 2,
    question: "চক্রবৃদ্ধি মূলধনের সূত্র কোনটি?",
    options: ["C = P(1 + r)", "C = P(1 + r/100)ⁿ", "C = Pnr/100", "C = P(1 - r/100)ⁿ"],
    answer: 1,
    explanation: "চক্রবৃদ্ধি মূলধন C = P(1 + r/100)ⁿ যেখানে n হলো সময়কাল।"
  },
  {
    id: 7,
    chapter: 2,
    question: "টাকায় ৩টি লেবু কিনে টাকায় ২টি বিক্রি করলে শতকরা কত লাভ হবে?",
    options: ["২৫%", "৩৩.৩৩%", "৫০%", "৬০%"],
    answer: 2,
    explanation: "১টির ক্রয়মূল্য ১/৩ টাকা, বিক্রয়মূল্য ১/২ টাকা। লাভ = (১/৬) ÷ (১/৩) × ১০০ = ৫০%।"
  },

  // Chapter 4: Algebra
  {
    id: 8,
    chapter: 4,
    question: "4x² - 9y² এর উৎপাদকে বিশ্লেষিত রূপ কোনটি?",
    options: ["(2x - 3y)²", "(2x + 3y)(2x - 3y)", "(4x - 9y)(x + y)", "(2x + 3y)²"],
    answer: 1,
    explanation: "a² - b² = (a + b)(a - b) অনুযায়ী (2x)² - (3y)² = (2x + 3y)(2x - 3y)।"
  },
  {
    id: 9,
    chapter: 4,
    question: "x² + 7x + 12 এর উৎপাদকে বিশ্লেষণ কোনটি?",
    options: ["(x + 2)(x + 6)", "(x + 3)(x + 4)", "(x - 3)(x - 4)", "(x + 1)(x + 12)"],
    answer: 1,
    explanation: "৩ × ৪ = ১২ এবং ৩ + ৪ = ৭। অতএব (x + 3)(x + 4)।"
  },
  {
    id: 10,
    chapter: 4,
    question: "যদি a + b = 5 এবং ab = 6 হয়, তবে a³ + b³ এর মান কত?",
    options: ["২৫", "৩৫", "৬৫", "১২৫"],
    answer: 1,
    explanation: "a³ + b³ = (a + b)³ - 3ab(a + b) = 5³ - 3(6)(5) = 125 - 90 = 35।"
  },
  {
    id: 11,
    chapter: 4,
    question: "x² - 4 এবং x² - 5x + 6 এর গ.সা.গু কোনটি?",
    options: ["x + 2", "x - 2", "x - 3", "(x-2)(x-3)"],
    answer: 1,
    explanation: "১ম = (x+2)(x-2); ২য় = (x-2)(x-3)। সাধারণ উৎপাদক = (x - 2)।"
  },
  {
    id: 12,
    chapter: 4,
    question: "দুটি রাশির গুণফল = গ.সা.গু × _____?",
    options: ["ভগ্নাংশ", "ল.সা.গু", "বর্গমূল", "উৎপাদক"],
    answer: 1,
    explanation: "অমর পাটিগণিতীয় ও বীজগণিতীয় সূত্র: দুটি রাশির গুণফল = গ.সা.গু × ল.সা.গু।"
  }
];

interface Props {
  soundEnabled: boolean;
  onAwardXP: (amount: number) => void;
}

export const ExamArenaView: React.FC<Props> = ({ soundEnabled, onAwardXP }) => {
  const [selectedExamChapter, setSelectedExamChapter] = useState<number | 'all'>('all');
  const [examActive, setExamActive] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins default
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  const activeQuestions = EXAM_QUESTIONS.filter(q =>
    selectedExamChapter === 'all' ? true : q.chapter === selectedExamChapter
  );

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && !examSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, examSubmitted, timeLeft]);

  const startExam = (chapter: number | 'all') => {
    setSelectedExamChapter(chapter);
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(chapter === 'all' ? 600 : 300);
    setExamSubmitted(false);
    setExamActive(true);
    if (soundEnabled) playSound('click');
  };

  const handleSelectOption = (optionIdx: number) => {
    if (examSubmitted) return;
    const qId = activeQuestions[currentQIndex].id;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    if (soundEnabled) playSound('click');
  };

  const handleExamSubmit = () => {
    setExamSubmitted(true);
    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });

    const earnedXP = correctCount * 25;
    onAwardXP(earnedXP);

    if (soundEnabled) {
      playSound(correctCount > activeQuestions.length / 2 ? 'fanfare' : 'wrong');
    }
  };

  // Calculate score
  let correctCount = 0;
  activeQuestions.forEach(q => {
    if (selectedAnswers[q.id] === q.answer) correctCount++;
  });
  const scorePercent = Math.round((correctCount / activeQuestions.length) * 100);

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 text-white p-6 rounded-3xl border border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/20 border border-white/30 text-amber-200">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">
              পরীক্ষা এরিনা (Exam Arena 2026)
            </h2>
            <p className="text-xs md:text-sm text-amber-100">
              অধ্যায়ভিত্তিক মডেল টেস্ট, সময় নিয়ন্ত্রিত মক পরীক্ষা ও সার্বিক বোর্ড স্ট্যান্ডার্ড মূল্যায়ন
            </p>
          </div>
        </div>

        {examActive && !examSubmitted && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 rounded-2xl border border-amber-400 font-mono text-base font-bold text-amber-400 shadow-md">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>অবশিষ্ট সময়: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Screen 1: Exam Selection Menu */}
      {!examActive && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
            মডেল টেস্ট নির্বাচন করুন:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">অধ্যায় ১</span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  প্যাটার্ন মডেল টেস্ট
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  মৌলিক সংখ্যা, ম্যাজিক বর্গ, ফিবোনাচ্চি ও স্বাভাবিক সংখ্যার যোগফল
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">৪টি প্রশ্ন • ৫ মিনিট</span>
                <button
                  onClick={() => startExam(1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  পরীক্ষা শুরু
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">অধ্যায় ২</span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  মুনাফা মডেল টেস্ট
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  সরল মুনাফা (I=Pnr), চক্রবৃদ্ধি মূলধন ও বাস্তব শতকরা লাভ-ক্ষতি
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">৩টি প্রশ্ন • ৫ মিনিট</span>
                <button
                  onClick={() => startExam(2)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  পরীক্ষা শুরু
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">অধ্যায় ৪</span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  বীজগণিতীয় সূত্রাবলি টেস্ট
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  বর্গ ও ঘনের সূত্র, মিডল টার্ম উৎপাদক ও গ.সা.গু-ল.সা.গু
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">৫টি প্রশ্ন • ৫ মিনিট</span>
                <button
                  onClick={() => startExam(4)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  পরীক্ষা শুরু
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 shadow-md flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> পূর্ণাঙ্গ পরীক্ষা
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  সার্বিক ফাইনাল এক্সাম ২০২৬
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  তিনটি অধ্যায়ের সমন্বয়ে বোর্ড স্ট্যান্ডার্ড পূর্ণাঙ্গ মূল্যায়ন ও সনদ
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">১২টি প্রশ্ন • ১০ মিনিট</span>
                <button
                  onClick={() => startExam('all')}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  ফাইনাল পরীক্ষা শুরু
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Active Exam in progress */}
      {examActive && !examSubmitted && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Question progress */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white">
              প্রশ্ন {currentQIndex + 1} / {activeQuestions.length}
            </span>
            <span>
              উত্তর দেওয়া হয়েছে: {Object.keys(selectedAnswers).length} টি
            </span>
          </div>

          {/* Current Question */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-4">
              {activeQuestions[currentQIndex].question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {activeQuestions[currentQIndex].options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[activeQuestions[currentQIndex].id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigator footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              পূর্ববর্তী
            </button>

            {currentQIndex < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
              >
                পরবর্তী <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleExamSubmit}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                উত্তরপত্র জমা দিন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Screen 3: Exam Results & Answer Sheet */}
      {examActive && examSubmitted && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                পরীক্ষার ফলাফল ও পারফরম্যান্স
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                অষ্টম শ্রেণি গণিত ২০২৬ মডেল টেস্ট মূল্যায়ন
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">মোট প্রশ্ন</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{activeQuestions.length}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">সঠিক উত্তর</span>
                <span className="text-lg font-bold text-emerald-500">{correctCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">প্রাপ্ত নম্বর</span>
                <span className="text-lg font-bold text-indigo-500">{scorePercent}%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setExamActive(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> অন্য পরীক্ষা দিন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> ফলাফল প্রিন্ট করুন
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              প্রশ্নের নির্ভুল সমাধান ও পর্যালোচনা:
            </h4>

            {activeQuestions.map((q, qIdx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.answer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h5 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </h5>
                    {isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+১)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500 text-white flex items-center gap-1 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> ভুল (০)
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1 my-3 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>তোমার উত্তর:</strong>{' '}
                      <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {userAns !== undefined ? q.options[userAns] : 'উত্তর দেওয়া হয়নি'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p>
                        <strong>সঠিক উত্তর:</strong>{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {q.options[q.answer]}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">ব্যাখ্যা:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
