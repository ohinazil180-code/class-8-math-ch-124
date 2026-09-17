import { SlideData } from '../../types';
import { SLIDES_PART_A } from './slidesPartA';
import { SLIDES_PART_B } from './slidesPartB';
import { SLIDES_PART_C } from './slidesPartC';
import { SLIDES_PART_D } from './slidesPartD';
import { SLIDES_PART_E } from './slidesPartE';
import { SLIDES_PART_F } from './slidesPartF';
import { SLIDES_PART_G } from './slidesPartG';
import { SLIDES_PART_H } from './slidesPartH';

export const ALL_SLIDES: SlideData[] = [
  ...SLIDES_PART_A,
  ...SLIDES_PART_B,
  ...SLIDES_PART_C,
  ...SLIDES_PART_D,
  ...SLIDES_PART_E,
  ...SLIDES_PART_F,
  ...SLIDES_PART_G,
  ...SLIDES_PART_H
];

export const TOTAL_SLIDES_COUNT = ALL_SLIDES.length;

export function getSlideByIndex(index: number): SlideData | undefined {
  if (index < 0 || index >= ALL_SLIDES.length) return undefined;
  return ALL_SLIDES[index];
}

export function getSlideById(id: number): SlideData | undefined {
  return ALL_SLIDES.find(s => s.id === id);
}

export function getSlidesByChapter(chapter: number): SlideData[] {
  return ALL_SLIDES.filter(s => s.chapter === chapter);
}

export function searchSlides(query: string): SlideData[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_SLIDES.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.slideNumber.includes(q) ||
    s.section.toLowerCase().includes(q) ||
    s.textbookContent.toLowerCase().includes(q) ||
    s.easyExplanation.toLowerCase().includes(q) ||
    (s.keywords && s.keywords.some(k => k.toLowerCase().includes(q)))
  );
}

export interface ChapterOutline {
  chapter: number;
  title: string;
  startSlide: number;
  endSlide: number;
  slideCount: number;
  badge: string;
  sections: { title: string; startSlide: number; count: number }[];
}

export const CHAPTER_OUTLINES: ChapterOutline[] = [
  {
    chapter: 0,
    title: "ভূমিকা ও ডিজিটাল প্ল্যাটফর্ম পরিচিতি",
    startSlide: 1,
    endSlide: 20,
    slideCount: 20,
    badge: "ভূমিকা",
    sections: [
      { title: "প্ল্যাটফর্ম পরিচিতি ও নির্দেশিকা", startSlide: 1, count: 10 },
      { title: "গণিত অধ্যয়নের বৈজ্ঞানিক কৌশল", startSlide: 11, count: 10 }
    ]
  },
  {
    chapter: 1,
    title: "অধ্যায় ১ — প্যাটার্ন (Pattern)",
    startSlide: 21,
    endSlide: 130,
    slideCount: 110,
    badge: "প্যাটার্ন",
    sections: [
      { title: "১.১ প্যাটার্ন পরিচিতি", startSlide: 21, count: 20 },
      { title: "১.২ মৌলিক সংখ্যা ও ইরাটোস্থেনিস", startSlide: 41, count: 15 },
      { title: "১.৩ সংখ্যা প্যাটার্ন ও বীজগণিতীয় রাশি", startSlide: 56, count: 15 },
      { title: "১.৪ ফিবোনাচ্চি সংখ্যা", startSlide: 71, count: 15 },
      { title: "১.৫ ক্রমিক স্বাভাবিক সংখ্যার যোগফল", startSlide: 86, count: 15 },
      { title: "১.৬ জ্যামিতিক প্যাটার্ন", startSlide: 101, count: 15 },
      { title: "১.৭ ম্যাজিক বর্গ (৩, ৪, ৫ ক্রম)", startSlide: 116, count: 15 }
    ]
  },
  {
    chapter: 2,
    title: "অধ্যায় ২ — মুনাফা (Profit)",
    startSlide: 131,
    endSlide: 265,
    slideCount: 135,
    badge: "মুনাফা",
    sections: [
      { title: "২.১ ভূমিকা ও প্রাথমিক ধারণা", startSlide: 131, count: 15 },
      { title: "২.২ সরল মুনাফা (I = Pnr/100)", startSlide: 146, count: 35 },
      { title: "২.৩ চক্রবৃদ্ধি মুনাফা (C = P(1+r/100)ⁿ)", startSlide: 181, count: 40 },
      { title: "২.৪ বাস্তব জীবনের প্রয়োগ ও ব্যাংকিং", startSlide: 221, count: 25 },
      { title: "২.৫ পরীক্ষা প্রস্তুতি ও সৃজনশীল প্রশ্ন", startSlide: 246, count: 20 }
    ]
  },
  {
    chapter: 4,
    title: "অধ্যায় ৪ — বীজগণিতীয় সূত্রাবলি ও প্রয়োগ",
    startSlide: 266,
    endSlide: 498,
    slideCount: 233,
    badge: "বীজগণিত",
    sections: [
      { title: "৪.০ অধ্যায় পরিচিতি ও পূর্বজ্ঞান", startSlide: 266, count: 10 },
      { title: "৪.১ বর্গের সূত্র ও অনুসিদ্ধান্ত", startSlide: 276, count: 45 },
      { title: "৪.১ উদাহরণ ও অনুশীলন", startSlide: 321, count: 15 },
      { title: "৪.২ ঘনফলের সূত্র ও মান নির্ণয়", startSlide: 336, count: 25 },
      { title: "৪.৩ তিনটি উৎপাদকের সূত্র", startSlide: 361, count: 10 },
      { title: "৪.৪ উৎপাদকে বিশ্লেষণ (মিডল টার্ম)", startSlide: 371, count: 35 },
      { title: "৪.৫ x² + px + q পদ্ধতি", startSlide: 406, count: 7 },
      { title: "৪.৬ AC মেথড ল্যাব", startSlide: 413, count: 33 },
      { title: "৪.৭ গ.সা.গু ও ল.সা.গু", startSlide: 446, count: 30 },
      { title: "অনুশীলনী ৪.৪ ও সৃজনশীল প্রশ্ন ২০", startSlide: 476, count: 23 }
    ]
  },
  {
    chapter: 99,
    title: "চূড়ান্ত সমাপনী ও ফাইনাল এক্সাম",
    startSlide: 499,
    endSlide: 500,
    slideCount: 2,
    badge: "সমাপনী",
    sections: [
      { title: "সার্বিক মাস্টার রিভিশন ও স্লাইড ৫০০", startSlide: 499, count: 2 }
    ]
  }
];
