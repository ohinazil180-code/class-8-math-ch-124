import React, { useState, useEffect } from 'react';
import { SlideData } from '../types';
import { textToSpeech, TTSState } from '../utils/textToSpeech';
import { playSound } from '../utils/audio';
import {
  Volume2, VolumeX, Pause, Play, RotateCcw,
  Gauge, Sparkles, Check
} from 'lucide-react';

interface Props {
  slide: SlideData;
  soundEnabled?: boolean;
  compact?: boolean;
}

export const SlideAudioReader: React.FC<Props> = ({
  slide,
  soundEnabled = true,
  compact = false
}) => {
  const [ttsState, setTtsState] = useState<TTSState>({
    isSpeaking: false,
    isPaused: false,
    rate: 1.0,
    supported: true,
    currentSegment: '',
  });

  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = textToSpeech.subscribe(setTtsState);
    return () => {
      unsubscribe();
    };
  }, []);

  // When slide changes, stop previous narration if speaking so it doesn't overlap
  useEffect(() => {
    return () => {
      textToSpeech.stop();
    };
  }, [slide.id]);

  const handleTogglePlay = () => {
    if (soundEnabled) playSound('click');
    textToSpeech.toggle(slide);
  };

  const handleStop = () => {
    if (soundEnabled) playSound('click');
    textToSpeech.stop();
  };

  const handleSpeedChange = (speed: number) => {
    if (soundEnabled) playSound('click');
    textToSpeech.setRate(speed);
    setShowSpeedMenu(false);
  };

  if (!ttsState.supported) {
    return null;
  }

  const speedOptions = [
    { label: '০.৮x (ধীর)', value: 0.8 },
    { label: '১.০x (স্বাভাবিক)', value: 1.0 },
    { label: '১.২x (দ্রুত)', value: 1.2 },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleTogglePlay}
          className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border ${
            ttsState.isSpeaking && !ttsState.isPaused
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 animate-pulse'
              : ttsState.isPaused
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
          title={
            ttsState.isSpeaking && !ttsState.isPaused
              ? 'পড়া থামিয়ে সাময়িক বিরতি দিন'
              : ttsState.isPaused
              ? 'আবার পড়া শুরু করুন'
              : 'স্লাইডের বিষয়বস্তু বাংলায় শুনে নাও'
          }
        >
          {ttsState.isSpeaking && !ttsState.isPaused ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          )}
          <span className="hidden sm:inline">
            {ttsState.isSpeaking && !ttsState.isPaused
              ? 'বিরতি'
              : ttsState.isPaused
              ? 'চালিয়ে যান'
              : 'পড়ে শোনাও'}
          </span>
        </button>

        {ttsState.isSpeaking && (
          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors"
            title="পড়া সম্পূর্ণ বন্ধ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Active Audio Bar / Trigger Box */}
      <div
        className={`rounded-2xl transition-all duration-300 border p-3.5 sm:p-4 ${
          ttsState.isSpeaking
            ? 'bg-gradient-to-r from-indigo-50/90 via-sky-50/90 to-purple-50/90 dark:from-indigo-950/60 dark:via-sky-950/50 dark:to-purple-950/60 border-indigo-200 dark:border-indigo-800 shadow-sm'
            : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Speaker Identity & Status */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                ttsState.isSpeaking && !ttsState.isPaused
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {ttsState.isSpeaking && !ttsState.isPaused ? (
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                  <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_infinite_300ms] h-4" />
                  <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5" />
                </div>
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                  <span>অডিও রিডার (Text-to-Speech)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                    বাংলা
                  </span>
                </h4>
                {ttsState.isSpeaking && !ttsState.isPaused && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    পড়ছে
                  </span>
                )}
                {ttsState.isPaused && (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    (বিরতি)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {ttsState.isSpeaking && ttsState.currentSegment
                  ? ttsState.currentSegment
                  : 'শ্রবণভিত্তিক শিক্ষার্থীদের জন্য স্লাইডের মূল কথা, সূত্র ও সমাধান স্বয়ংক্রিয়ভাবে পড়ে শোনাবে।'}
              </p>
            </div>
          </div>

          {/* Right: Audio Control Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {/* Speed Control Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center gap-1"
                title="পড়ার গতি পরিবর্তন করুন"
              >
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                <span>{ttsState.rate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 z-30 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                    পড়ার গতি
                  </div>
                  {speedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSpeedChange(opt.value)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        ttsState.rate === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {ttsState.rate === opt.value && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={handleTogglePlay}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                ttsState.isSpeaking && !ttsState.isPaused
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                  : ttsState.isPaused
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {ttsState.isSpeaking && !ttsState.isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>বিরতি</span>
                </>
              ) : ttsState.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>পুনরায় শুনুন</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>পড়ে শোনাও</span>
                </>
              )}
            </button>

            {/* Stop / Reset Button */}
            {ttsState.isSpeaking && (
              <button
                onClick={handleStop}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors"
                title="পড়া সম্পূর্ণ বন্ধ করুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Teleprompter when speaking */}
        {ttsState.isSpeaking && ttsState.currentSegment && (
          <div className="mt-2.5 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
            <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 italic">
              &ldquo;{ttsState.currentSegment}&rdquo;
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
