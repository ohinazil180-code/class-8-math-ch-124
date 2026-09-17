import { FormulaItem } from '../types';

export const FORMULA_BANK: FormulaItem[] = [
  // Chapter 1
  {
    id: 'pat-1',
    chapter: 1,
    name: 'n-তম বিজোড় সংখ্যা (n-th Odd Number)',
    latexOrText: '2n - 1',
    description: 'যে কোনো স্বাভাবিক বিজোড় সংখ্যার n-তম পদের সাধারণ রাশি।',
    variables: [
      { name: 'n', meaning: 'পদের ক্রম (১, ২, ৩, ...)' }
    ],
    example: 'n = 5 হলে, ৫ম বিজোড় সংখ্যা = 2(5) - 1 = 10 - 1 = 9',
    derivationSummary: 'প্রতিটি বিজোড় সংখ্যা জোড় সংখ্যা (2n) থেকে ১ কম। তাই 2n - 1।',
    tags: ['প্যাটার্ন', 'বিজোড় সংখ্যা', 'বীজগণিতীয় রাশি']
  },
  {
    id: 'pat-2',
    chapter: 1,
    name: 'n-তম জোড় সংখ্যা (n-th Even Number)',
    latexOrText: '2n',
    description: 'যে কোনো স্বাভাবিক জোড় সংখ্যার n-তম পদের সাধারণ রাশি।',
    variables: [
      { name: 'n', meaning: 'পদের ক্রম (১, ২, ৩, ...)' }
    ],
    example: 'n = 10 হলে, ১০ম জোড় সংখ্যা = 2 × 10 = 20',
    derivationSummary: '২ এর যে কোনো গুণিতক একটি জোড় সংখ্যা।',
    tags: ['প্যাটার্ন', 'জোড় সংখ্যা']
  },
  {
    id: 'pat-3',
    chapter: 1,
    name: 'প্রথম n-সংখ্যক বিজোড় সংখ্যার সমষ্টি (Sum of first n odd numbers)',
    latexOrText: 'n²',
    description: 'প্রথম ১ থেকে শুরু করে n-টি ক্রমিক বিজোড় সংখ্যার যোগফল সবসময় n² এর সমান।',
    variables: [
      { name: 'n', meaning: 'বিজোড় পদের সংখ্যা' }
    ],
    example: '১ + ৩ + ৫ = ৯ = ৩² (এখানে ৩টি পদ)',
    derivationSummary: 'বর্গাকারে বিন্যাস করলে দেখা যায় প্রথম n-টি বিজোড় সংখ্যার সমষ্টি পূর্ণবর্গ সংখ্যা গঠন করে।',
    tags: ['প্যাটার্ন', 'সমষ্টি', 'বর্গ']
  },
  {
    id: 'pat-4',
    chapter: 1,
    name: 'n-তম ত্রিভুজাকার সংখ্যা (n-th Triangular Number)',
    latexOrText: 'n(n + 1) / 2',
    description: 'প্রথম n-সংখ্যক স্বাভাবিক সংখ্যার সমষ্টি বা ত্রিভুজাকার বিন্দুর সংখ্যা।',
    variables: [
      { name: 'n', meaning: 'সারি সংখ্যা বা পদের অবস্থান' }
    ],
    example: 'n = 4 হলে, ৪র্থ ত্রিভুজাকার সংখ্যা = 4(4 + 1) / 2 = 20 / 2 = 10 (১+২+৩+৪)',
    derivationSummary: 'দুটি একই রকম ত্রিভুজাকার রূপ একত্র করলে একটি n × (n+1) আয়তক্ষেত্র পাওয়া যায়। তাই অর্ধেক = n(n+1)/2।',
    tags: ['ত্রিভুজাকার সংখ্যা', 'স্বাভাবিক সংখ্যার সমষ্টি']
  },
  {
    id: 'pat-5',
    chapter: 1,
    name: 'n ক্রমের ম্যাজিক সংখ্যা (Magic Constant)',
    latexOrText: 'n(n² + 1) / 2',
    description: 'n ক্রমের ম্যাজিক বর্গের প্রতিটি সারি, কলাম ও কর্ণের যোগফল।',
    variables: [
      { name: 'n', meaning: 'ম্যাজিক বর্গের ক্রম (যেমন ৩, ৪, ৫)' }
    ],
    example: 'n = 3 হলে, ৩ ক্রমের ম্যাজিক সংখ্যা = 3(3² + 1) / 2 = 3(10) / 2 = 15',
    derivationSummary: '১ থেকে n² পর্যন্ত সংখ্যার মোট যোগফল = n²(n²+1)/2। তাকে n টি সারিতে ভাগ করলে n(n²+1)/2 হয়।',
    tags: ['ম্যাজিক বর্গ', 'ম্যাজিক সংখ্যা']
  },

  // Chapter 2
  {
    id: 'prof-1',
    chapter: 2,
    name: 'সরল মুনাফার সূত্র (Simple Interest)',
    latexOrText: 'I = Pnr / 100',
    description: 'নির্দিষ্ট মূলধনের ওপর নির্দিষ্ট হারে নির্দিষ্ট সময়ের সরল মুনাফা নির্ণয়ের মূল সূত্র।',
    variables: [
      { name: 'I', meaning: 'মুনাফা (Interest)' },
      { name: 'P', meaning: 'আসল বা মূলধন (Principal)' },
      { name: 'n', meaning: 'সময় বছরে (Time in years)' },
      { name: 'r', meaning: 'বার্ষিক শতকরা মুনাফার হার (Rate of interest %)' }
    ],
    example: 'P = ৫০০০ টাকা, r = ৫%, n = ৩ বছর হলে, I = (৫০০০ × ৩ × ৫) / ১০০ = ৭৫০ টাকা',
    derivationSummary: '১০০ টাকায় ১ বছরের মুনাফা r টাকা। সুতরাং ১ টাকায় ১ বছরের মুনাফা r/100 টাকা। অতএব P টাকায় n বছরের মুনাফা = Pnr/100 টাকা।',
    tags: ['মুনাফা', 'সরল মুনাফা', 'আসল', 'হার']
  },
  {
    id: 'prof-2',
    chapter: 2,
    name: 'মুনাফা-আসল বা সবৃদ্ধিমূল (Total Amount)',
    latexOrText: 'A = P + I = P(1 + nr/100)',
    description: 'আসল এবং অর্জিত মুনাফার যোগফলকে মুনাফা-আসল বা সবৃদ্ধিমূল বলে।',
    variables: [
      { name: 'A', meaning: 'মুনাফা-আসল (Amount)' },
      { name: 'P', meaning: 'আসল (Principal)' },
      { name: 'I', meaning: 'মুনাফা (Interest)' }
    ],
    example: 'P = ৫০০০ এবং I = ৭৫০ হলে, A = ৫০০০ + ৭৫০ = ৫৭৫০ টাকা',
    derivationSummary: 'A = P + I = P + (Pnr/100) = P(1 + nr/100)।',
    tags: ['মুনাফা-আসল', 'সবৃদ্ধিমূল']
  },
  {
    id: 'prof-3',
    chapter: 2,
    name: 'মুনাফার হার নির্ণয়ের রূপান্তরিত সূত্র (Rate of Interest)',
    latexOrText: 'r = (100 × I) / (P × n)',
    description: 'মুনাফা, আসল ও সময় জানা থাকলে শতকরা মুনাফার হার বের করার সূত্র।',
    variables: [
      { name: 'r', meaning: 'মুনাফার হার (%)' },
      { name: 'I', meaning: 'মুনাফা' },
      { name: 'P', meaning: 'আসল' },
      { name: 'n', meaning: 'সময় (বছর)' }
    ],
    example: 'I = ৭২০, P = ৩০০০, n = ৪ বছর হলে, r = (১০০ × ৭২০) / (৩০০০ × ৪) = ৬%',
    derivationSummary: 'I = Pnr/100 সমীকরণ থেকে r কে বামপাশে রেখে পক্ষান্তর করে পাওয়া যায়।',
    tags: ['মুনাফার হার', 'পক্ষান্তর']
  },
  {
    id: 'prof-4',
    chapter: 2,
    name: 'সময় নির্ণয়ের রূপান্তরিত সূত্র (Time Period)',
    latexOrText: 'n = (100 × I) / (P × r)',
    description: 'মুনাফা, আসল ও মুনাফার হার জানা থাকলে সময় (বছর) বের করার সূত্র।',
    variables: [
      { name: 'n', meaning: 'সময় (বছর)' },
      { name: 'I', meaning: 'মুনাফা' },
      { name: 'P', meaning: 'আসল' },
      { name: 'r', meaning: 'মুনাফার হার (%)' }
    ],
    example: 'I = ৭৫০, P = ৫০০০, r = ৫ হলে, n = (১০০ × ৭৫০) / (৫০০০ × ৫) = ৩ বছর',
    derivationSummary: 'I = Pnr/100 থেকে n = 100I / (Pr)।',
    tags: ['সময়', 'সরল মুনাফা']
  },
  {
    id: 'prof-5',
    chapter: 2,
    name: 'চক্রবৃদ্ধি মূলধন (Compound Amount)',
    latexOrText: 'C = P(1 + r/100)ⁿ',
    description: 'n বছর শেষে বৃদ্ধিপ্রাপ্ত মোট চক্রবৃদ্ধি মূলধন বা সবৃদ্ধিমূল।',
    variables: [
      { name: 'C বা A', meaning: 'চক্রবৃদ্ধি মূলধন (Compound Amount)' },
      { name: 'P', meaning: 'প্রারম্ভিক মূলধন (Principal)' },
      { name: 'r', meaning: 'বার্ষিক শতকরা চক্রবৃদ্ধি হার' },
      { name: 'n', meaning: 'বছর সংখ্যা' }
    ],
    example: 'P = ১০,০০০, r = ১০%, n = ৩ বছর হলে, C = ১০,০০০(১ + ০.১)³ = ১৩,৩১০ টাকা',
    derivationSummary: '১ম বছরান্তে P(1+r), ২য় বছরান্তে P(1+r)², n বছরান্তে P(1+r)ⁿ।',
    tags: ['চক্রবৃদ্ধি মুনাফা', 'সবৃদ্ধিমূল']
  },
  {
    id: 'prof-6',
    chapter: 2,
    name: 'চক্রবৃদ্ধি মুনাফা (Compound Interest)',
    latexOrText: 'CI = C - P = P(1 + r/100)ⁿ - P',
    description: 'চক্রবৃদ্ধি মূলধন থেকে প্রারম্ভিক মূলধন বিয়োগ করলে চক্রবৃদ্ধি মুনাফা পাওয়া যায়।',
    variables: [
      { name: 'CI', meaning: 'চক্রবৃদ্ধি মুনাফা' },
      { name: 'C', meaning: 'চক্রবৃদ্ধি মূলধন' },
      { name: 'P', meaning: 'আসল' }
    ],
    example: 'C = ১৩,৩১০ ও P = ১০,০০০ হলে, CI = ১৩,৩১০ - ১০,০০০ = ৩,৩১০ টাকা',
    derivationSummary: 'মুনাফা = মোট চক্রবৃদ্ধি মূলধন - প্রাথমিক মূলধন।',
    tags: ['চক্রবৃদ্ধি মুনাফা', 'পার্থক্য']
  },

  // Chapter 4
  {
    id: 'alg-1',
    chapter: 4,
    name: 'দ্বিপদী রাশির বর্গের সূত্র (Square of Sum)',
    latexOrText: '(a + b)² = a² + 2ab + b²',
    description: 'দুটি পদের যোগফলের বর্গ = প্রথম পদের বর্গ + ২ × প্রথম পদ × দ্বিতীয় পদ + দ্বিতীয় পদের বর্গ।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদ' },
      { name: 'b', meaning: 'দ্বিতীয় পদ' }
    ],
    example: '(2x + 3y)² = (2x)² + 2(2x)(3y) + (3y)² = 4x² + 12xy + 9y²',
    derivationSummary: '(a+b)(a+b) = a(a+b) + b(a+b) = a² + ab + ba + b² = a² + 2ab + b²।',
    tags: ['বীজগণিতীয় সূত্র', 'বর্গ']
  },
  {
    id: 'alg-2',
    chapter: 4,
    name: 'দ্বিপদী রাশির বিয়োগফলের বর্গ (Square of Difference)',
    latexOrText: '(a - b)² = a² - 2ab + b²',
    description: 'দুটি পদের বিয়োগফলের বর্গ = প্রথম পদের বর্গ - ২ × প্রথম পদ × দ্বিতীয় পদ + দ্বিতীয় পদের বর্গ।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদ' },
      { name: 'b', meaning: 'দ্বিতীয় পদ' }
    ],
    example: '(5x - 2y)² = 25x² - 20xy + 4y²',
    derivationSummary: '(a-b)(a-b) = a² - ab - ba + b² = a² - 2ab + b²।',
    tags: ['বীজগণিতীয় সূত্র', 'বর্গ']
  },
  {
    id: 'alg-3',
    chapter: 4,
    name: 'দুই বর্গের বিয়োগফল (Difference of Two Squares)',
    latexOrText: 'a² - b² = (a + b)(a - b)',
    description: 'দুটি পদের বর্গের বিয়োগফল = পদদ্বয়ের যোগফল × পদদ্বয়ের বিয়োগফল।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদ' },
      { name: 'b', meaning: 'দ্বিতীয় পদ' }
    ],
    example: '9x² - 16y² = (3x)² - (4y)² = (3x + 4y)(3x - 4y)',
    derivationSummary: '(a+b)(a-b) = a² - ab + ab - b² = a² - b²।',
    tags: ['উৎপাদক', 'বর্গান্তর', 'সূত্র ৩']
  },
  {
    id: 'alg-4',
    chapter: 4,
    name: 'সাধারণ পদযুক্ত দুটি দ্বিপদীর গুণফল (Product of Two Binomials)',
    latexOrText: '(x + a)(x + b) = x² + (a + b)x + ab',
    description: 'প্রথম পদ একই থাকলে গুণফল = সাধারণ পদের বর্গ + অনন্য পদদ্বয়ের যোগফল × সাধারণ পদ + অনন্য পদদ্বয়ের গুণফল।',
    variables: [
      { name: 'x', meaning: 'সাধারণ পদ' },
      { name: 'a, b', meaning: 'ধ্রুবক বা ভিন্ন পদ' }
    ],
    example: '(x + 3)(x + 4) = x² + (3 + 4)x + (3 × 4) = x² + 7x + 12',
    derivationSummary: 'x(x+b) + a(x+b) = x² + bx + ax + ab = x² + (a+b)x + ab।',
    tags: ['গুণফল', 'মিডল টার্ম', 'সূত্র ৪']
  },
  {
    id: 'alg-5',
    chapter: 4,
    name: 'যোগফলের ঘন (Cube of Sum)',
    latexOrText: '(a + b)³ = a³ + 3a²b + 3ab² + b³ = a³ + b³ + 3ab(a + b)',
    description: 'দুটি পদের যোগফলের ঘন নির্ণয়ের মৌলিক সূত্র ও তার মান নির্ণয়ের অনুসিদ্ধান্ত।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদ' },
      { name: 'b', meaning: 'দ্বিতীয় পদ' }
    ],
    example: '(2x + 3)³ = (2x)³ + 3(2x)²(3) + 3(2x)(3)² + 3³ = 8x³ + 36x² + 54x + 27',
    derivationSummary: '(a+b)(a+b)² = (a+b)(a²+2ab+b²) বিস্তৃত করলে a³ + 3a²b + 3ab² + b³ পাওয়া যায়।',
    tags: ['ঘন', 'সূত্র ৫']
  },
  {
    id: 'alg-6',
    chapter: 4,
    name: 'বিয়োগফলের ঘন (Cube of Difference)',
    latexOrText: '(a - b)³ = a³ - 3a²b + 3ab² - b³ = a³ - b³ - 3ab(a - b)',
    description: 'দুটি পদের বিয়োগফলের ঘন নির্ণয়ের মৌলিক সূত্র।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদ' },
      { name: 'b', meaning: 'দ্বিতীয় পদ' }
    ],
    example: '(x - 2y)³ = x³ - 3(x)²(2y) + 3(x)(2y)² - (2y)³ = x³ - 6x²y + 12xy² - 8y³',
    derivationSummary: '(a-b)(a²-2ab+b²) বিস্তৃত করে পাওয়া যায়।',
    tags: ['ঘন', 'সূত্র ৬']
  },
  {
    id: 'alg-7',
    chapter: 4,
    name: 'দুই ঘনের যোগফলের উৎপাদক সূত্র (Sum of Cubes Factorization)',
    latexOrText: 'a³ + b³ = (a + b)(a² - ab + b²)',
    description: 'দুটি ঘনের যোগফলকে উৎপাদকে বিশ্লেষণের সূত্র।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদের ঘনমূল' },
      { name: 'b', meaning: 'দ্বিতীয় পদের ঘনমূল' }
    ],
    example: '8x³ + 27 = (2x)³ + 3³ = (2x + 3)((2x)² - (2x)(3) + 3²) = (2x + 3)(4x² - 6x + 9)',
    derivationSummary: '(a+b)(a²-ab+b²) গুণ করলে a³-a²b+ab²+a²b-ab²+b³ = a³+b³।',
    tags: ['উৎপাদক', 'ঘনফল']
  },
  {
    id: 'alg-8',
    chapter: 4,
    name: 'দুই ঘনের বিয়োগফলের উৎপাদক সূত্র (Difference of Cubes Factorization)',
    latexOrText: 'a³ - b³ = (a - b)(a² + ab + b²)',
    description: 'দুটি ঘনের বিয়োগফলকে উৎপাদকে বিশ্লেষণের সূত্র।',
    variables: [
      { name: 'a', meaning: 'প্রথম পদের ঘনমূল' },
      { name: 'b', meaning: 'দ্বিতীয় পদের ঘনমূল' }
    ],
    example: 'x³ - 64 = x³ - 4³ = (x - 4)(x² + 4x + 16)',
    derivationSummary: '(a-b)(a²+ab+b²) গুণ করলে সরাসরি a³-b³ পাওয়া যায়।',
    tags: ['উৎপাদক', 'ঘনফল']
  },
  {
    id: 'alg-9',
    chapter: 4,
    name: 'a² + b² এর অনুসিদ্ধান্ত (Corollaries for a² + b²)',
    latexOrText: 'a² + b² = (a + b)² - 2ab = (a - b)² + 2ab',
    description: 'মান নির্ণয়ের জন্য বহুল ব্যবহৃত দুটি অনুসিদ্ধান্ত।',
    variables: [
      { name: 'a, b', meaning: 'রাশিদ্বয়' }
    ],
    example: 'a + b = 5, ab = 6 হলে, a² + b² = 5² - 2(6) = 25 - 12 = 13',
    derivationSummary: '(a+b)² = a²+2ab+b² থেকে 2ab পক্ষান্তর করে a²+b² = (a+b)²-2ab।',
    tags: ['অনুসিদ্ধান্ত', 'মান নির্ণয়']
  },
  {
    id: 'alg-10',
    chapter: 4,
    name: '4ab ও ab এর অনুসিদ্ধান্ত',
    latexOrText: '4ab = (a + b)² - (a - b)²,  ab = ((a+b)/2)² - ((a-b)/2)²',
    description: 'দুটি পদের গুণফলকে দুটি বর্গের বিয়োগফলরূপে প্রকাশের সূত্র।',
    variables: [
      { name: 'a, b', meaning: 'পদদ্বয়' }
    ],
    example: 'a+b=7, a-b=3 হলে, 4ab = 7² - 3² = 49 - 9 = 40 => ab = 10',
    derivationSummary: '(a+b)² থেকে (a-b)² বিয়োগ করলে 4ab অবশিষ্ট থাকে।',
    tags: ['অনুসিদ্ধান্ত', 'বর্গের অন্তর']
  }
];
