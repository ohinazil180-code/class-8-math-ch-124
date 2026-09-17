import { GlossaryItem } from '../types';

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: 'glo-1',
    termBn: 'প্যাটার্ন',
    termEn: 'Pattern',
    definition: 'গণিতে কোনো নির্দিষ্ট নিয়ম বা সুশৃঙ্খল বিন্যাস অনুযায়ী সংখ্যা বা বস্তুর পুনরাবৃত্তিকে প্যাটার্ন বলে।',
    example: '১, ৩, ৫, ৭, ৯... (প্রতি পদে ২ বৃদ্ধি পাওয়ার প্যাটার্ন)',
    chapter: 1,
    relatedSlideId: 31
  },
  {
    id: 'glo-2',
    termBn: 'স্বাভাবিক সংখ্যা',
    termEn: 'Natural Number',
    definition: '১, ২, ৩, ৪, ৫... ইত্যাদি গণনাযোগ্য ধনাত্মক পূর্ণসংখ্যাকে স্বাভাবিক সংখ্যা বলে।',
    example: 'N = {১, ২, ৩, ৪, ৫...}',
    chapter: 1,
    relatedSlideId: 56
  },
  {
    id: 'glo-3',
    termBn: 'মৌলিক সংখ্যা',
    termEn: 'Prime Number',
    definition: '১ এর চেয়ে বড় যে সব সংখ্যার ১ এবং সেই সংখ্যা ছাড়া অন্য কোনো গুণনীয়ক নেই, তাদের মৌলিক সংখ্যা বলে।',
    example: '২, ৩, ৫, ৭, ১১, ১৩, ১৭, ১৯...',
    chapter: 1,
    relatedSlideId: 58
  },
  {
    id: 'glo-4',
    termBn: 'বর্গ সংখ্যা',
    termEn: 'Square Number',
    definition: 'কোনো সংখ্যাকে সেই সংখ্যা দ্বারাই গুণ করলে যে গুণফল পাওয়া যায়, তাকে ওই সংখ্যার বর্গ বা পূর্ণবর্গ সংখ্যা বলে।',
    example: '১, ৪, ৯, ১৬, ২৫, ৩৬... (১², ২², ৩², ৪²...)',
    chapter: 1,
    relatedSlideId: 42
  },
  {
    id: 'glo-5',
    termBn: 'ঘন সংখ্যা',
    termEn: 'Cube Number',
    definition: 'কোনো সংখ্যাকে পরপর তিনবার গুণ করলে প্রাপ্ত গুণফলকে ঘন সংখ্যা বলে।',
    example: '১, ৮, ২৭, ৬৪, ১২৫... (১³, ২³, ৩³, ৪³...)',
    chapter: 1,
    relatedSlideId: 50
  },
  {
    id: 'glo-6',
    termBn: 'ত্রিভুজাকার সংখ্যা',
    termEn: 'Triangular Number',
    definition: 'যেসব সংখ্যার পরিমাণ বিন্দু দিয়ে সমবাহু ত্রিভুজ গঠন করা যায়, তাদের ত্রিভুজাকার সংখ্যা বলে। সূত্র: n(n+1)/2।',
    example: '১, ৩, ৬, ১০, ১৫, ২১...',
    chapter: 1,
    relatedSlideId: 86
  },
  {
    id: 'glo-7',
    termBn: 'ফিবোনাচি ধারা',
    termEn: 'Fibonacci Sequence',
    definition: 'যে ধারার প্রতিটি পদ পূর্ববর্তী দুটি পদের যোগফলের সমান, তাকে ফিবোনাচি ধারা বলে।',
    example: '০, ১, ১, ২, ৩, ৫, ৮, ১৩, ২১...',
    chapter: 1,
    relatedSlideId: 126
  },
  {
    id: 'glo-8',
    termBn: 'ম্যাজিক বর্গ',
    termEn: 'Magic Square',
    definition: 'একটি বর্গাকার গ্রিড যেখানে প্রতিটি সারি, কলাম ও কর্ণের সংখ্যাগুলোর যোগফল সবসময় একই ধ্রুবক সংখ্যা হয়।',
    example: '৩×৩ ম্যাজিক বর্গের প্রতিটি রেখার যোগফল ১৫।',
    chapter: 1,
    relatedSlideId: 116
  },
  {
    id: 'glo-9',
    termBn: 'আসল বা মূলধন',
    termEn: 'Principal (P)',
    definition: 'যে পরিমাণ টাকা প্রারম্ভে ব্যাংকে জমা রাখা হয় বা ঋণ হিসেবে গ্রহণ করা হয়, তাকে আসল বা মূলধন বলে।',
    example: 'ব্যাংকে ৫০০০ টাকা জমা রাখলে, P = ৫০০০ টাকা।',
    chapter: 2,
    relatedSlideId: 156
  },
  {
    id: 'glo-10',
    termBn: 'মুনাফার হার',
    termEn: 'Rate of Interest (r)',
    definition: '১০০ টাকার ১ বছরের মুনাফাকে বার্ষিক শতকরা মুনাফার হার বলে।',
    example: 'বার্ষিক ৫% মুনাফা অর্থ ১০০ টাকার ১ বছরের মুনাফা ৫ টাকা।',
    chapter: 2,
    relatedSlideId: 159
  },
  {
    id: 'glo-11',
    termBn: 'মুনাফা',
    termEn: 'Interest (I)',
    definition: 'নির্দিষ্ট সময়ের জন্য আসল টাকা ব্যবহারের জন্য ব্যাংক বা গ্রহীতা যে অতিরিক্ত অর্থ প্রদান করে, তাকে মুনাফা বলে।',
    example: '১ বছর পর মূলধনের উপর অতিরিক্ত ২৫০ টাকা পেলে I = ২৫০ টাকা।',
    chapter: 2,
    relatedSlideId: 164
  },
  {
    id: 'glo-12',
    termBn: 'মুনাফা-আসল বা সবৃদ্ধিমূল',
    termEn: 'Total Amount (A)',
    definition: 'আসল এবং মুনাফার সমষ্টিকে মুনাফা-আসল বা সবৃদ্ধিমূল বলা হয় (A = P + I)।',
    example: 'আসল ৫০০০ এবং মুনাফা ৭৫০ টাকা হলে মুনাফা-আসল ৫৭৫০ টাকা।',
    chapter: 2,
    relatedSlideId: 166
  },
  {
    id: 'glo-13',
    termBn: 'সরল মুনাফা',
    termEn: 'Simple Interest',
    definition: 'প্রতি বছর শুধুমাত্র প্রারম্ভিক মূলধনের ওপর যে মুনাফা হিসাব করা হয়, তাকে সরল মুনাফা বলে (I = Pnr/100)।',
    example: '৩ বছরে প্রতি বছর নির্দিষ্ট হারে একই পরিমাণ মুনাফা লাভ করা।',
    chapter: 2,
    relatedSlideId: 186
  },
  {
    id: 'glo-14',
    termBn: 'চক্রবৃদ্ধি মুনাফা',
    termEn: 'Compound Interest',
    definition: 'প্রতি বছর বৃদ্ধিপ্রাপ্ত মূলধনের ওপর (আসল + বিগত বছরের মুনাফা) যে মুনাফা হিসাব করা হয়, তাকে চক্রবৃদ্ধি মুনাফা বলে।',
    example: '১ম বছরের মুনাফা ২য় বছরের আসলের সাথে যোগ হয়ে মূলধন বৃদ্ধি পায়।',
    chapter: 2,
    relatedSlideId: 226
  },
  {
    id: 'glo-15',
    termBn: 'বীজগণিতীয় রাশি',
    termEn: 'Algebraic Expression',
    definition: 'সংখ্যা নির্দেশক প্রতীক ও চলক এবং প্রক্রিয়া চিহ্নের অর্থবোধক বিন্যাসকে বীজগণিতীয় রাশি বলে।',
    example: '2x + 3y - 5z',
    chapter: 4,
    relatedSlideId: 268
  },
  {
    id: 'glo-16',
    termBn: 'বীজগণিতীয় সূত্র ও অভেদ',
    termEn: 'Algebraic Identity',
    definition: 'চলকের সকল বাস্তব মানের জন্য যে সমীকরণ বা সম্পর্ক সত্য হয়, তাকে অভেদ বা সূত্র বলে।',
    example: '(a + b)² = a² + 2ab + b²',
    chapter: 4,
    relatedSlideId: 269
  },
  {
    id: 'glo-17',
    termBn: 'উৎপাদক বা গুণনীয়ক',
    termEn: 'Factor',
    definition: 'যদি কোনো বীজগণিতীয় রাশিকে দুই বা ততোধিক রাশির গুণফলরূপে প্রকাশ করা যায়, তবে শেষোক্ত রাশিগুলোর প্রত্যেকটিকে প্রথম রাশির উৎপাদক বলে।',
    example: 'x² - 9 = (x + 3)(x - 3) এখানে (x+3) ও (x-3) দুটি উৎপাদক।',
    chapter: 4,
    relatedSlideId: 372
  },
  {
    id: 'glo-18',
    termBn: 'উৎপাদকে বিশ্লেষণ',
    termEn: 'Factorization',
    definition: 'কোনো বীজগণিতীয় রাশিকে সম্ভাব্য ক্ষুদ্রতম গুণনীয়কসমূহের গুণফল আকারে প্রকাশ করার প্রক্রিয়াকে উৎপাদকে বিশ্লেষণ বলে।',
    example: 'x² + 7x + 12 = (x + 3)(x + 4)',
    chapter: 4,
    relatedSlideId: 371
  },
  {
    id: 'glo-19',
    termBn: 'গরিষ্ঠ সাধারণ গুণনীয়ক (গ.সা.গু)',
    termEn: 'Highest Common Factor (H.C.F.)',
    definition: 'দুই বা ততোধিক রাশির মধ্যে যতগুলো সাধারণ মৌলিক উৎপাদক থাকে, তাদের গুণফলকে গ.সা.গু বলে। চলকের ক্ষেত্রে সর্বনিম্ন ঘাত গ্রহণ করতে হয়।',
    example: '6x²y এবং 9xy² এর গ.সা.গু = 3xy',
    chapter: 4,
    relatedSlideId: 448
  },
  {
    id: 'glo-20',
    termBn: 'লঘিষ্ঠ সাধারণ গুণিতক (ল.সা.গু)',
    termEn: 'Lowest Common Multiple (L.C.M.)',
    definition: 'দুই বা ততোধিক রাশির মধ্যে সম্ভাব্য সকল সাধারণ ও অসাধারণ উৎপাদকের সর্বোচ্চ ঘাতগুলোর গুণফলকে ল.সা.গু বলে।',
    example: '4a²b এবং 6ab² এর ল.সা.গু = 12a²b²',
    chapter: 4,
    relatedSlideId: 467
  },
  {
    id: 'glo-21',
    termBn: 'মধ্যপদ বিভক্তিকরণ (মিডল টার্ম)',
    termEn: 'Middle-Term Splitting',
    definition: 'x² + px + q বা ax² + bx + c আকারের রাশিতে মধ্যপদটিকে এমন দুটি পদে বিভক্ত করা যাদের যোগফল মধ্যপদের সমান এবং গুণফল প্রান্তীয় পদদ্বয়ের গুণফলের সমান।',
    example: 'x² + 5x + 6 = x² + 2x + 3x + 6 = (x + 2)(x + 3)',
    chapter: 4,
    relatedSlideId: 390
  },
  {
    id: 'glo-22',
    termBn: 'সহগ',
    termEn: 'Coefficient',
    definition: 'কোনো একপদী রাশিতে চলকের সাথে যখন কোনো সংখ্যা বা অক্ষর গুণক হিসেবে যুক্ত থাকে, তখন তাকে সহগ বলে।',
    example: '7xy রাশিতে xy এর সাংখ্যিক সহগ হলো 7।',
    chapter: 4,
    relatedSlideId: 293
  }
];
