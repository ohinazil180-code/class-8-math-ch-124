import { SlideData } from '../types';

/**
 * Text-to-Speech Engine for reading Slide contents aloud
 * Designed for students with diverse learning styles (auditory learners, dyslexic, or vision-impaired).
 * Uses the Web Speech API (SpeechSynthesis) with smart Bengali & English math terminology support,
 * sentence chunking, playback speed controls, and auto-voice selection.
 */

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  rate: number; // 0.8x, 1.0x, 1.2x
  supported: boolean;
  currentSegment: string;
}

export type TTSStatusListener = (state: TTSState) => void;

class TextToSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<TTSStatusListener> = new Set();
  private voices: SpeechSynthesisVoice[] = [];
  private rate: number = 1.0;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentSegment: string = '';
  private chunks: string[] = [];
  private currentChunkIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public subscribe(listener: TTSStatusListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state: TTSState = {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      rate: this.rate,
      supported: this.isSupported(),
      currentSegment: this.currentSegment,
    };
    this.listeners.forEach((listener) => listener(state));
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.7, Math.min(1.5, newRate));
    if (this.isSpeaking && !this.isPaused) {
      // Re-read current chunk at new rate
      const currentIdx = Math.max(0, this.currentChunkIndex - 1);
      this.speakRemainingChunks(currentIdx);
    } else {
      this.notify();
    }
  }

  public getRate(): number {
    return this.rate;
  }

  /**
   * Format slide contents into human-friendly spoken sentences in natural Bengali
   */
  public prepareSlideScript(slide: SlideData): string[] {
    const parts: string[] = [];

    // Header announcement
    const chapterName = slide.chapter === 0 ? 'ভূমিকা ও পরিচিতি' : `অধ্যায় ${slide.chapter}: ${slide.chapterTitle}`;
    parts.push(`স্লাইড ${slide.slideNumber}। ${chapterName}।`);

    // Title
    if (slide.title) {
      parts.push(`পাঠের শিরোনাম: ${this.cleanForSpeech(slide.title)}।`);
    }

    // Objective
    if (slide.objective) {
      parts.push(`শিখন লক্ষ্য: ${this.cleanForSpeech(slide.objective)}।`);
    }

    // Main Textbook Content
    if (slide.textbookContent) {
      const cleanContent = this.cleanForSpeech(slide.textbookContent);
      parts.push(`পাঠ্যবইয়ের মূল বিষয়বস্তু: ${cleanContent}`);
    }

    // Conceptual Explanation ("সহজ ভাষায়")
    if (slide.easyExplanation) {
      parts.push(`সহজ ভাষায় সারসংক্ষেপ: ${this.cleanForSpeech(slide.easyExplanation)}`);
    }

    // Worked Example if present
    if (slide.example) {
      let exampleText = `উদাহরণ সমস্যা: ${this.cleanForSpeech(slide.example.problem)}। `;
      if (slide.example.steps && slide.example.steps.length > 0) {
        exampleText += 'সমাধানের ধাপসমূহ: ';
        slide.example.steps.forEach((st, idx) => {
          exampleText += `ধাপ ${idx + 1}: ${this.cleanForSpeech(st)}। `;
        });
      }
      if (slide.example.answer) {
        exampleText += `চূড়ান্ত ফলাফল: ${this.cleanForSpeech(slide.example.answer)}।`;
      }
      parts.push(exampleText);
    }

    // Exam Tip if present
    if (slide.examTip) {
      parts.push(`পরীক্ষার জরুরি টিপস: ${this.cleanForSpeech(slide.examTip)}`);
    }

    // Split text into digestible audio sentence chunks
    const allChunks: string[] = [];
    parts.forEach((p) => {
      // Split on punctuation while preserving meaning
      const sentences = p
        .split(/(।|\.|\n)+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s !== '।' && s !== '.');
      sentences.forEach((sentence) => {
        allChunks.push(sentence);
      });
    });

    return allChunks;
  }

  /**
   * Clean mathematical text and symbols so screen readers speak them naturally
   */
  private cleanForSpeech(text: string): string {
    return text
      .replace(/\^2/g, ' স্কয়ার ')
      .replace(/\^3/g, ' কিউব ')
      .replace(/²/g, ' স্কয়ার ')
      .replace(/³/g, ' কিউব ')
      .replace(/\+/g, ' যোগ ')
      .replace(/ - /g, ' বিয়োগ ')
      .replace(/×/g, ' গুণ ')
      .replace(/÷/g, ' ভাগ ')
      .replace(/=/g, ' সমান ')
      .replace(/\*/g, ' গুণ ')
      .replace(/≠/g, ' সমান নয় ')
      .replace(/π/g, ' পাই ')
      .replace(/√/g, ' রুট ')
      .replace(/\(([^)]+)\)/g, ' ব্র্যাকেটে $1 ')
      .replace(/#\w+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Best voice selection for Bengali (bn-BD, bn-IN, or generic fallback)
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    // Prefer Bengali voices
    const bnVoice = this.voices.find(
      (v) => v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.name.includes('Bangla') || v.name.includes('Bengali')
    );
    if (bnVoice) return bnVoice;

    // Fallback to Hindi or Indian English if Bengali isn't natively installed on user system
    const inVoice = this.voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('hi-IN'));
    if (inVoice) return inVoice;

    // Default voice
    return this.voices[0] || null;
  }

  /**
   * Start reading slide aloud
   */
  public speakSlide(slide: SlideData) {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.stop();

    this.chunks = this.prepareSlideScript(slide);
    this.currentChunkIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    this.speakNextChunk();
  }

  private speakRemainingChunks(startIndex: number) {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentChunkIndex = startIndex;
    this.speakNextChunk();
  }

  private speakNextChunk() {
    if (!this.synth || !this.isSpeaking) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentSegment = '';
      this.notify();
      return;
    }

    const chunk = this.chunks[this.currentChunkIndex];
    this.currentSegment = chunk;
    this.notify();

    const utterance = new SpeechSynthesisUtterance(chunk);
    this.currentUtterance = utterance;

    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'bn-BD';
    }

    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentChunkIndex++;
      this.speakNextChunk();
    };

    utterance.onerror = (e) => {
      console.warn('TTS playback chunk error:', e);
      // Move to next chunk on non-fatal error
      this.currentChunkIndex++;
      this.speakNextChunk();
    };

    this.synth.speak(utterance);
  }

  /**
   * Pause ongoing speech
   */
  public pause() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.pause();
    this.isPaused = true;
    this.notify();
  }

  /**
   * Resume paused speech
   */
  public resume() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.resume();
    this.isPaused = false;
    this.notify();
  }

  /**
   * Stop speech completely
   */
  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentSegment = '';
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.notify();
  }

  /**
   * Toggle Play/Pause
   */
  public toggle(slide: SlideData) {
    if (!this.isSpeaking) {
      this.speakSlide(slide);
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }
}

export const textToSpeech = new TextToSpeechManager();
