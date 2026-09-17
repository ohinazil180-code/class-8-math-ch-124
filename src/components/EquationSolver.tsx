import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator, Sparkles, CheckCircle, ArrowRight, Copy, Check,
  RotateCcw, Lightbulb, HelpCircle, Bot, AlertCircle, ChevronRight
} from 'lucide-react';
import { solveAlgebra, SolveResult, toBengaliNumber } from '../utils/algebraSolver';
import { playSound } from '../utils/audio';

interface Props {
  soundEnabled?: boolean;
  onApplyToWhiteboard?: (equation: string) => void;
}

interface AISolution {
  title: string;
  formulaUsed?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    explanation: string;
    math: string;
  }>;
  finalAnswer: string;
  verification?: string;
  tip?: string;
}

const PRESETS = [
  { label: 'একঘাত সমীকরণ', expr: '2x + 7 = 19' },
  { label: 'উভয়পক্ষে চলক', expr: '5x - 8 = 2x + 7' },
  { label: 'ভগ্নাংশ সমীকরণ', expr: '(x + 2)/3 = 4' },
  { label: 'দ্বিঘাত সমীকরণ', expr: 'x^2 - 5x + 6 = 0' },
  { label: 'বর্গ বিস্তার', expr: '(2x + 3)^2' },
  { label: 'বর্গের অন্তর', expr: 'x^2 - 16' },
  { label: 'উৎপাদক বিশ্লেষণ', expr: 'x^2 + 7x + 12' },
  { label: 'ঘন বিস্তার', expr: '(a + 2)^3' },
];

const MATH_BUTTONS = [
  { label: 'x', insert: 'x' },
  { label: 'y', insert: 'y' },
  { label: 'a', insert: 'a' },
  { label: 'b', insert: 'b' },
  { label: '+', insert: ' + ' },
  { label: '-', insert: ' - ' },
  { label: '=', insert: ' = ' },
  { label: 'x²', insert: '^2' },
  { label: 'x³', insert: '^3' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: '/', insert: '/' },
];

export const EquationSolver: React.FC<Props> = ({ soundEnabled = true, onApplyToWhiteboard }) => {
  const [inputExpression, setInputExpression] = useState<string>('2x + 7 = 19');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSolution, setAiSolution] = useState<AISolution | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Immediate local symbolic solution
  const localSolution: SolveResult | null = useMemo(() => {
    if (!inputExpression.trim()) return null;
    return solveAlgebra(inputExpression);
  }, [inputExpression]);

  // Reset AI solution whenever input changes
  useEffect(() => {
    setAiSolution(null);
    setAiError(null);
  }, [inputExpression]);

  const handleInsert = (str: string) => {
    if (soundEnabled) playSound('click');
    setInputExpression(prev => prev + str);
  };

  const handleClear = () => {
    if (soundEnabled) playSound('click');
    setInputExpression('');
    setAiSolution(null);
    setAiError(null);
  };

  const handleSelectPreset = (expr: string) => {
    if (soundEnabled) playSound('click');
    setInputExpression(expr);
  };

  const handleCopySolution = () => {
    const textToCopy = localSolution
      ? `${localSolution.typeName}\nপ্রদত্ত: ${inputExpression}\n\nধাপসমূহ:\n` +
        localSolution.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.math} (${s.explanation})`).join('\n') +
        `\n\nফলাফল: ${localSolution.finalAnswer}`
      : inputExpression;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (soundEnabled) playSound('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestAiHelp = async () => {
    if (!inputExpression.trim() || isAiLoading) return;
    if (soundEnabled) playSound('click');
    setIsAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/solve-equation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equation: inputExpression.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.solution) {
        setAiSolution(data.solution);
        if (soundEnabled) playSound('correct');
      } else {
        setAiError(data.error || 'AI বিশ্লেষণ বর্তমানে পাওয়া যাচ্ছে না।');
      }
    } catch (err: any) {
      setAiError('নেটওয়ার্ক সংযোগ বা সার্ভারে সমস্যা দেখা দিয়েছে।');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 scrollbar-thin">
      {/* Header Info Banner */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-4 h-4" />
            <span>বীজগণিত সমীকরণ সলভার</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>তাৎক্ষণিক ধাপ</span>
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          যেকোনো একঘাত, দ্বিঘাত সমীকরণ বা রাশির বিস্তার লিখুন। প্রতি ক্লিকেই ধাপে ধাপে সমাধান প্রদর্শিত হবে।
        </p>
      </div>

      {/* Input & Math Pad Section */}
      <div className="p-3 sm:p-4 space-y-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Main Equation Input */}
        <div className="relative">
          <input
            type="text"
            value={inputExpression}
            onChange={(e) => setInputExpression(e.target.value)}
            placeholder="যেমন: 2x + 7 = 19 বা (x+3)^2 বা x^2 - 16"
            className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm sm:text-base font-bold border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
          {inputExpression && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              title="মুছে ফেলুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Math Quick Symbols Bar */}
        <div className="flex flex-wrap gap-1">
          {MATH_BUTTONS.map(btn => (
            <button
              key={btn.label}
              onClick={() => handleInsert(btn.insert)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span>৮ম শ্রেণির অনুশীলন উদাহরণ:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(preset => (
              <button
                key={preset.expr}
                onClick={() => handleSelectPreset(preset.expr)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                  inputExpression === preset.expr
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {preset.label}: <span className="font-mono">{preset.expr}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Results Area */}
      <div className="p-3 sm:p-4 flex-1 space-y-4">
        {localSolution ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Header of solution */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {localSolution.typeName}
                </span>
                {localSolution.formulaUsed && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                    সূত্র: <span className="font-mono text-indigo-600 dark:text-indigo-400">{localSolution.formulaUsed}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopySolution}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-all"
                  title="সম্পূর্ণ সমাধান কপি করুন"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-2.5">
              {localSolution.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                        {toBengaliNumber(step.stepNumber)}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {step.title}
                      </h4>
                    </div>
                    {step.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                    {step.explanation}
                  </p>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 overflow-x-auto">
                    <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{step.math}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Answer Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-500/30 dark:border-emerald-700/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>চূড়ান্ত সমাধান (Final Answer):</span>
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-100 font-mono pl-5">
                {localSolution.finalAnswer}
              </div>
            </div>

            {/* Verification Box (if available) */}
            {localSolution.verification && (
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-300 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>শুদ্ধি পরীক্ষা (Verification Check):</span>
                </div>
                <div className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                  {localSolution.verification.leftSide} এবং {localSolution.verification.rightSide}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {localSolution.verification.explanation}
                </p>
              </div>
            )}

            {/* AI Deep Teacher Assist Button */}
            <div className="pt-2">
              <button
                onClick={handleRequestAiHelp}
                disabled={isAiLoading}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI শিক্ষক ব্যাখ্যা তৈরি করছে...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>AI শিক্ষক থেকে বিকল্প নিয়ম ও পরীক্ষার টিপস নিন</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Error Alert */}
            {aiError && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Solution Panel */}
            {aiSolution && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 pb-2 border-b border-indigo-200 dark:border-indigo-800">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                    AI গণিত শিক্ষকের বিশ্লেষণ ({aiSolution.title})
                  </h4>
                </div>

                {aiSolution.formulaUsed && (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold">প্রযোজ্য সূত্র:</span> {aiSolution.formulaUsed}
                  </p>
                )}

                <div className="space-y-2">
                  {aiSolution.steps?.map((st) => (
                    <div key={st.stepNumber} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                        ধাপ {toBengaliNumber(st.stepNumber)}: {st.title}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-1.5">{st.explanation}</p>
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-300 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg">
                        {st.math}
                      </div>
                    </div>
                  ))}
                </div>

                {aiSolution.tip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">পরীক্ষার টিপস:</span> {aiSolution.tip}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              বীজগণিতীয় সমীকরণ বা রাশি লিখুন
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
              উপরে যেকোনো সমীকরণ টাইপ করুন বা নিচের উদাহরণগুলো থেকে বেছে নিন:
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
              <button
                onClick={() => setInputExpression('3x + 5 = 20')}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                3x + 5 = 20
              </button>
              <button
                onClick={() => setInputExpression('x^2 - 5x + 6 = 0')}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                x² - 5x + 6 = 0
              </button>
              <button
                onClick={() => setInputExpression('(2x + 3)^2')}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                (2x + 3)²
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
