import React, { useState } from 'react';
import { SlideData } from '../types';
import { InteractiveVisualizer } from './InteractiveVisualizer';
import { SlideAudioReader } from './SlideAudioReader';
import { playSound } from '../utils/audio';
import {
  BookOpen, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  Award, HelpCircle, ChevronRight, Eye, Sparkles, FileText,
  GraduationCap
} from 'lucide-react';

interface Props {
  slide: SlideData;
  soundEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  onQuizAnswer?: (correct: boolean) => void;
}

export const SlideRenderer: React.FC<Props> = ({
  slide,
  soundEnabled,
  fontSize,
  onQuizAnswer
}) => {
  // Step revelation state
  const [revealedSteps, setRevealedSteps] = useState<number>(1);
  // MCQ state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  // Creative question tab
  const [creativeTab, setCreativeTab] = useState<'stimulus' | 'partA' | 'partB' | 'partC'>('stimulus');

  // Font size classes
  const fontClasses = {
    sm: 'text-sm md:text-base leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    lg: 'text-lg md:text-xl leading-relaxed'
  }[fontSize];

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = slide.quiz ? idx === slide.quiz.answer : false;
    if (soundEnabled) {
      playSound(isCorrect ? 'correct' : 'wrong');
    }
    if (onQuizAnswer) {
      onQuizAnswer(isCorrect);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Slide Header: Chapter, Section & Type Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            {slide.chapter === 0 ? "ভূমিকা" : `অধ্যায় ${slide.chapter}`}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {slide.section}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {slide.sourcePage && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {slide.sourcePage}
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
            slide.difficulty === 'easy'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
              : slide.difficulty === 'hard' || slide.difficulty === 'challenge'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
          }`}>
            {slide.type}
          </span>
        </div>
      </div>

      {/* Slide Title */}
      <div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {slide.title}
        </h2>
        {slide.objective && (
          <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300 font-medium mt-1 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            লক্ষ্য: {slide.objective}
          </p>
        )}
      </div>

      {/* Text-to-Speech Audio Reader Card */}
      <SlideAudioReader slide={slide} soundEnabled={soundEnabled} />

      {/* Main Textbook Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          পাঠ্যবইয়ের মূল বিষয়বস্তু
        </div>
        <div className={`${fontClasses} text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal`}>
          {slide.textbookContent}
        </div>
      </div>

      {/* Interactive Visualizer Widget (if applicable) */}
      {slide.visualType && (
        <InteractiveVisualizer visualType={slide.visualType} soundEnabled={soundEnabled} />
      )}

      {/* Step-by-Step Worked Example */}
      {slide.example && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-sky-50/50 dark:from-indigo-950/30 dark:to-sky-950/30 rounded-2xl p-5 md:p-6 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ধাপে ধাপে সমাধান: {slide.example.problem}
            </h4>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              ধাপ {Math.min(revealedSteps, slide.example.steps.length)} / {slide.example.steps.length}
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-2.5">
            {slide.example.steps.map((step, idx) => {
              const isVisible = idx < revealedSteps;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl transition-all duration-300 flex items-start gap-3 ${
                    isVisible
                      ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
                      : 'opacity-25 bg-slate-100 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200">
                    {isVisible ? step : "পরবর্তী ধাপ দেখতে নিচে ক্লিক করো..."}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reveal Next Step Button */}
          {revealedSteps < slide.example.steps.length ? (
            <button
              onClick={() => {
                if (soundEnabled) playSound('click');
                setRevealedSteps(prev => prev + 1);
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Eye className="w-4 h-4" /> পরবর্তী ধাপ উন্মোচন কর
            </button>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-900 dark:text-emerald-300">
              <span className="font-bold text-sm block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                চূড়ান্ত ফলাফল: {slide.example.answer}
              </span>
              {slide.example.verification && (
                <span className="text-xs text-emerald-700 dark:text-emerald-400/90 block">
                  যাচাই: {slide.example.verification}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive MCQ Section */}
      {slide.quiz && (
        <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 md:p-6 border border-amber-200 dark:border-amber-800/40 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
              জ্ঞান যাচাই কুইজ
            </h4>
          </div>

          <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
            {slide.quiz.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slide.quiz.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === slide.quiz?.answer;

              let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400";
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500 text-white font-bold border-rose-400";
                } else {
                  btnStyle = "opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleOptionSelect(idx)}
                  className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-950 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation reveal */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-xl text-xs md:text-sm transition-all duration-300 ${
              selectedOption === slide.quiz.answer
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}>
              <span className="font-bold block mb-1">
                {selectedOption === slide.quiz.answer ? "🎉 একদম সঠিক উত্তর!" : "❌ সঠিক উত্তরটি লক্ষ্য করো:"}
              </span>
              <span>{slide.quiz.explanation}</span>
            </div>
          )}
        </div>
      )}

      {/* Creative Board Question Section */}
      {slide.creative && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-base md:text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              বোর্ড স্ট্যান্ডার্ড সৃজনশীল প্রশ্ন (১০ নম্বর)
            </h4>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCreativeTab('stimulus')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  creativeTab === 'stimulus' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                উদ্দীপক
              </button>
              <button
                onClick={() => setCreativeTab('partA')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  creativeTab === 'partA' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ক ({slide.creative.partA.marks})
              </button>
              <button
                onClick={() => setCreativeTab('partB')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  creativeTab === 'partB' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                খ ({slide.creative.partB.marks})
              </button>
              <button
                onClick={() => setCreativeTab('partC')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  creativeTab === 'partC' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                গ ({slide.creative.partC.marks})
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          {creativeTab === 'stimulus' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">উদ্দীপক:</span>
              <p className="text-base font-medium">{slide.creative.stimulus}</p>
            </div>
          )}

          {creativeTab === 'partA' && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                {slide.creative.partA.question}
              </p>
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs md:text-sm text-indigo-900 dark:text-indigo-200 font-mono whitespace-pre-line">
                <strong className="block font-sans text-indigo-600 dark:text-indigo-400 mb-1">আদর্শ সমাধান:</strong>
                {slide.creative.partA.solution}
              </div>
            </div>
          )}

          {creativeTab === 'partB' && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                {slide.creative.partB.question}
              </p>
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs md:text-sm text-indigo-900 dark:text-indigo-200 font-mono whitespace-pre-line">
                <strong className="block font-sans text-indigo-600 dark:text-indigo-400 mb-1">আদর্শ সমাধান:</strong>
                {slide.creative.partB.solution}
              </div>
            </div>
          )}

          {creativeTab === 'partC' && (
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                {slide.creative.partC.question}
              </p>
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs md:text-sm text-indigo-900 dark:text-indigo-200 font-mono whitespace-pre-line">
                <strong className="block font-sans text-indigo-600 dark:text-indigo-400 mb-1">আদর্শ সমাধান:</strong>
                {slide.creative.partC.solution}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Easy Explanation ("সহজ ভাষায়") Callout */}
      {slide.easyExplanation && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 md:p-5 border border-amber-200/80 dark:border-amber-800/40 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
              সহজ ভাষায় বুঝে নাও (Conceptual Insight)
            </h4>
            <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-medium">
              {slide.easyExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Keywords / Tags Footer */}
      {slide.keywords && slide.keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">কীওয়ার্ড:</span>
          {slide.keywords.map((kw, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
