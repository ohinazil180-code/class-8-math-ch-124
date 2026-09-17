import React, { useState, useEffect, useRef } from 'react';
import { SlideData, LaserPointer } from '../types';
import { SlideRenderer } from './SlideRenderer';
import { SlideAudioReader } from './SlideAudioReader';
import { playSound } from '../utils/audio';
import {
  ChevronLeft, ChevronRight, Play, Pause, Bookmark,
  Type, CheckCircle2, RotateCcw, Share2, Sparkles, Target
} from 'lucide-react';

interface Props {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  soundEnabled: boolean;
  isPresentationMode: boolean;
  onQuizAnswer?: (correct: boolean) => void;
  isLaserActive?: boolean;
  onSendLaserPointer?: (x: number, y: number) => void;
  remotePointer?: LaserPointer | null;
}

export const SlideViewer: React.FC<Props> = ({
  slide,
  slideIndex,
  totalSlides,
  onNextSlide,
  onPrevSlide,
  isBookmarked,
  onToggleBookmark,
  soundEnabled,
  isPresentationMode,
  onQuizAnswer,
  isLaserActive,
  onSendLaserPointer,
  remotePointer
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(5000); // 5s default
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !onSendLaserPointer || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onSendLaserPointer(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setTimeout(() => {
        if (slideIndex < totalSlides - 1) {
          onNextSlide();
        } else {
          setIsPlaying(false);
        }
      }, playSpeed);
    } else if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isPlaying, slideIndex, totalSlides, playSpeed, onNextSlide]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        onNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        onPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextSlide, onPrevSlide]);

  const progressPercent = Math.round(((slideIndex + 1) / totalSlides) * 100);

  return (
    <div className={`flex flex-col h-full ${isPresentationMode ? 'bg-slate-950 text-white p-4 md:p-8 min-h-screen' : ''}`}>
      {/* Top Slide Meta & Progress Bar */}
      <div className="w-full max-w-4xl mx-auto mb-4 px-2 sm:px-0">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              স্লাইড {slide.slideNumber} / {totalSlides}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-indigo-600 dark:text-indigo-400 font-sans font-medium">
              {slide.chapterTitle}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {progressPercent}% পাঠ শেষ
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Slide Content Card */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`flex-1 overflow-y-auto px-2 sm:px-4 py-2 relative ${isLaserActive ? 'cursor-crosshair' : ''}`}
      >
        {/* Remote Laser Pointer Ping */}
        {remotePointer && remotePointer.slideId === slide.id && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-all duration-150 animate-in fade-in zoom-in"
            style={{ left: `${remotePointer.x}%`, top: `${remotePointer.y}%` }}
          >
            <div className="relative">
              <div
                className="w-5 h-5 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: remotePointer.userColor || '#ef4444' }}
              />
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg absolute top-0.5 left-0.5"
                style={{ backgroundColor: remotePointer.userColor || '#ef4444' }}
              />
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-md whitespace-nowrap"
              style={{ backgroundColor: remotePointer.userColor || '#ef4444' }}
            >
              {remotePointer.userName} 🎯
            </span>
          </div>
        )}

        <SlideRenderer
          slide={slide}
          soundEnabled={soundEnabled}
          fontSize={fontSize}
          onQuizAnswer={onQuizAnswer}
        />
      </div>

      {/* Bottom Sticky Control Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 py-3 px-3 sm:px-6 mt-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left Controls: Bookmark & Font Size */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (soundEnabled) playSound('click');
                onToggleBookmark();
              }}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold ${
                isBookmarked
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? "বুকমার্ক মুছে ফেলুন" : "বুকমার্ক যোগ করুন"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? "বুকমার্কড" : "বুকমার্ক"}</span>
            </button>

            {/* Font Size Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'sm' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'md' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded-lg font-bold ${fontSize === 'lg' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'}`}
              >
                A+
              </button>
            </div>

            {/* Quick Audio TTS Read Button */}
            <SlideAudioReader slide={slide} soundEnabled={soundEnabled} compact={true} />
          </div>

          {/* Center Controls: Auto Play */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (soundEnabled) playSound('click');
                setIsPlaying(!isPlaying);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? "বিরতি" : "অটো-প্লে"}</span>
            </button>

            {isPlaying && (
              <select
                value={playSpeed}
                onChange={e => setPlaySpeed(Number(e.target.value))}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-slate-700 dark:text-slate-300"
              >
                <option value={3000}>৩ সেকেন্ড</option>
                <option value={5000}>৫ সেকেন্ড</option>
                <option value={10000}>১০ সেকেন্ড</option>
              </select>
            )}
          </div>

          {/* Right Controls: Previous & Next Slide Buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={slideIndex === 0}
              onClick={() => {
                if (soundEnabled) playSound('click');
                onPrevSlide();
              }}
              className="px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">পূর্ববর্তী</span>
            </button>

            <button
              disabled={slideIndex >= totalSlides - 1}
              onClick={() => {
                if (soundEnabled) playSound('click');
                onNextSlide();
              }}
              className="px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
