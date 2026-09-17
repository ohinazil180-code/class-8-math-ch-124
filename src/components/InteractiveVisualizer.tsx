import React, { useState } from 'react';
import { VisualType } from '../types';
import { playSound } from '../utils/audio';
import { Play, RotateCcw, Check, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  visualType: VisualType;
  soundEnabled?: boolean;
}

export const InteractiveVisualizer: React.FC<Props> = ({ visualType, soundEnabled = true }) => {
  // Eratosthenes Sieve State
  const [sieveStep, setSieveStep] = useState<number>(1); // primes: 2, 3, 5, 7
  const [sieveCustomNum, setSieveCustomNum] = useState<number>(50);

  // Magic Square 3x3 State
  const [magicGrid, setMagicGrid] = useState<number[]>([
    4, 9, 2,
    3, 5, 7,
    8, 1, 6
  ]);
  const [magicSwapIdx, setMagicSwapIdx] = useState<number | null>(null);

  // Interest Simulator State
  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(3);

  // (a+b)² Visualizer State
  const [aSize, setASize] = useState<number>(5);
  const [bSize, setBSize] = useState<number>(3);

  // Factorization / AC Method State
  const [factP, setFactP] = useState<number>(7);
  const [factQ, setFactQ] = useState<number>(12);

  // AC Method Custom
  const [acA, setAcA] = useState<number>(2);
  const [acB, setAcB] = useState<number>(11);
  const [acC, setAcC] = useState<number>(15);

  // HCF / LCM Calculator State
  const [numA, setNumA] = useState<number>(24);
  const [numB, setNumB] = useState<number>(36);

  // Helper calculation for HCF and LCM
  const getGcd = (x: number, y: number): number => {
    let a = Math.abs(x);
    let b = Math.abs(y);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };
  const gcdVal = getGcd(numA, numB);
  const lcmVal = (numA * numB) / (gcdVal || 1);

  // ================= Eratosthenes Sieve =================
  if (visualType === 'eratosthenes') {
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    const isCrossed = (n: number) => {
      if (n === 1) return true;
      if (sieveStep >= 2 && n > 2 && n % 2 === 0) return true;
      if (sieveStep >= 3 && n > 3 && n % 3 === 0) return true;
      if (sieveStep >= 4 && n > 5 && n % 5 === 0) return true;
      if (sieveStep >= 5 && n > 7 && n % 7 === 0) return true;
      return false;
    };

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-bold text-amber-400 text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              ইরাটোস্থেনিস ছাঁকনি ল্যাব (১ থেকে ১০০)
            </h4>
            <p className="text-xs text-slate-400">
              মৌলিক সংখ্যা বাদে বাকি সব গুণিতককে ছাঁকনি দিয়ে ছেঁকে বাদ দেওয়ার জীবন্ত মডেল
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) playSound('click');
                setSieveStep(prev => (prev < 5 ? prev + 1 : 1));
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5" />
              {sieveStep === 1 && "ধাপ ১: ২ এর গুণিতক বাদ"}
              {sieveStep === 2 && "ধাপ ২: ৩ এর গুণিতক বাদ"}
              {sieveStep === 3 && "ধাপ ৩: ৫ এর গুণিতক বাদ"}
              {sieveStep === 4 && "ধাপ ৪: ৭ এর গুণিতক বাদ"}
              {sieveStep >= 5 && "পুনরায় শুরু"}
            </button>
            <button
              onClick={() => {
                if (soundEnabled) playSound('click');
                setSieveStep(1);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              title="রিসেট"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 10x10 Grid */}
        <div className="grid grid-cols-10 gap-1 md:gap-1.5 max-w-lg mx-auto bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
            const prime = isPrime(num);
            const crossed = isCrossed(num);
            const isBasePrime = num === 2 || num === 3 || num === 5 || num === 7;

            let bgClass = "bg-slate-800/60 text-slate-300";
            if (num === 1) {
              bgClass = "bg-slate-900/40 text-slate-600 line-through";
            } else if (crossed) {
              bgClass = "bg-red-950/40 text-red-400/50 line-through border border-red-900/30";
            } else if (prime) {
              bgClass = isBasePrime
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-105"
                : "bg-emerald-500 text-slate-950 font-bold";
            }

            return (
              <div
                key={num}
                className={`h-7 md:h-8 flex items-center justify-center text-xs md:text-sm rounded transition-all duration-300 ${bgClass}`}
              >
                {num}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> মূল মৌলিক (২, ৩, ৫, ৭)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> অবশিষ্ট মৌলিক (মোট ২৫টি)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-950/60 border border-red-800 inline-block"></span> বাদ পড়া যৌগিক
            </span>
          </div>
          <span className="font-semibold text-amber-300">১ থেকে ১০০ এর মধ্যে মোট মৌলিক সংখ্যা = ২৫টি</span>
        </div>
      </div>
    );
  }

  // ================= 3x3 Magic Square =================
  if (visualType === 'magic-square-3') {
    const rowSums = [
      magicGrid[0] + magicGrid[1] + magicGrid[2],
      magicGrid[3] + magicGrid[4] + magicGrid[5],
      magicGrid[6] + magicGrid[7] + magicGrid[8]
    ];
    const colSums = [
      magicGrid[0] + magicGrid[3] + magicGrid[6],
      magicGrid[1] + magicGrid[4] + magicGrid[7],
      magicGrid[2] + magicGrid[5] + magicGrid[8]
    ];
    const diag1 = magicGrid[0] + magicGrid[4] + magicGrid[8];
    const diag2 = magicGrid[2] + magicGrid[4] + magicGrid[6];
    const isMagicSolved = [...rowSums, ...colSums, diag1, diag2].every(sum => sum === 15);

    const handleTileClick = (idx: number) => {
      if (soundEnabled) playSound('click');
      if (magicSwapIdx === null) {
        setMagicSwapIdx(idx);
      } else {
        const nextGrid = [...magicGrid];
        const temp = nextGrid[magicSwapIdx];
        nextGrid[magicSwapIdx] = nextGrid[idx];
        nextGrid[idx] = temp;
        setMagicGrid(nextGrid);
        setMagicSwapIdx(null);
        if (soundEnabled) playSound('success');
      }
    };

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-bold text-emerald-400 text-base md:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              ৩ ক্রমের ইন্টারেক্টিভ ম্যাজিক বর্গ ধাঁধা (ম্যাজিক সংখ্যা = ১৫)
            </h4>
            <p className="text-xs text-slate-400">
              যেকোনো দুটি ঘরে ক্লিক করে সংখ্যা অদলবদল করো। সব সারি, কলাম ও কর্ণের যোগফল ১৫ মেলাও!
            </p>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) playSound('click');
              setMagicGrid([4, 9, 2, 3, 5, 7, 8, 1, 6]);
            }}
            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs flex items-center gap-1.5 border border-emerald-500/40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> সমাধান রিসেট
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
          {/* Grid with outer row/col indicators */}
          <div className="relative p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <div className="grid grid-cols-3 gap-2">
              {magicGrid.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl text-2xl font-extrabold flex items-center justify-center transition-all duration-200 border-2 ${
                    magicSwapIdx === idx
                      ? "bg-amber-500 text-slate-950 border-amber-300 scale-105 shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/40"
                      : val === 5
                      ? "bg-indigo-600/80 hover:bg-indigo-600 text-white border-indigo-400"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 active:scale-95"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Diagonal Indicators */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400 px-2 font-mono">
              <span>কর্ণ ১ = <strong className={diag1 === 15 ? "text-emerald-400" : "text-amber-400"}>{diag1}</strong></span>
              <span>কর্ণ ২ = <strong className={diag2 === 15 ? "text-emerald-400" : "text-amber-400"}>{diag2}</strong></span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`w-full text-center py-2 px-4 rounded-xl text-sm font-bold transition-all ${
            isMagicSolved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
              : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
          }`}>
            {isMagicSolved
              ? "অভিনন্দন! সব দিক থেকেই যোগফল নিখুঁত ১৫ হয়েছে!"
              : `বর্তমান সারি যোগফল: [${rowSums.join(', ')}] | কলাম: [${colSums.join(', ')}]`}
          </div>
        </div>
      </div>
    );
  }

  // ================= Simple Interest Simulator =================
  if (visualType === 'simple-interest-calc') {
    const interest = (principal * rate * years) / 100;
    const totalAmount = principal + interest;

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="mb-4">
          <h4 className="font-bold text-sky-400 text-base md:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            সরল মুনাফা ক্যালকুলেটর ও গ্রাফ (I = Pnr/100)
          </h4>
          <p className="text-xs text-slate-400">
            মূলধন (P), মুনাফার হার (r%) এবং সময় (n) পরিবর্তন করে মুনাফা ও মোট আসলের হিসাব সরাসরি দেখো
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>মূলধন (P):</span>
                <span className="font-bold text-sky-400">৳ {principal.toLocaleString('bn-BD')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>বার্ষিক মুনাফার হার (r):</span>
                <span className="font-bold text-sky-400">{rate}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>সময় (n বছর):</span>
                <span className="font-bold text-sky-400">{years} বছর</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="md:col-span-2 flex flex-col justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">মুনাফা (I = Pnr)</span>
                <span className="text-xl md:text-2xl font-black text-amber-400">
                  ৳ {interest.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  ({principal} × {years} × {rate}) ÷ ১০০
                </span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">মুনাফা-আসল (A = P + I)</span>
                <span className="text-xl md:text-2xl font-black text-emerald-400">
                  ৳ {totalAmount.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  আসল {principal} + মুনাফা {interest}
                </span>
              </div>
            </div>

            {/* Dynamic Comparison Bar */}
            <div>
              <span className="text-xs text-slate-400 block mb-1.5">অনুপাত তুলনা: আসল বনাম অর্জিত মুনাফা</span>
              <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-800 text-[11px] font-bold">
                <div
                  style={{ width: `${(principal / totalAmount) * 100}%` }}
                  className="bg-sky-500 text-slate-950 flex items-center justify-center transition-all duration-300"
                >
                  মূলধন ({Math.round((principal / totalAmount) * 100)}%)
                </div>
                <div
                  style={{ width: `${(interest / totalAmount) * 100}%` }}
                  className="bg-amber-400 text-slate-950 flex items-center justify-center transition-all duration-300"
                >
                  মুনাফা ({Math.round((interest / totalAmount) * 100)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= Compound Interest Simulator =================
  if (visualType === 'compound-interest-calc') {
    const simpleI = (principal * rate * years) / 100;
    const compoundAmount = principal * Math.pow(1 + rate / 100, years);
    const compoundI = compoundAmount - principal;
    const diff = compoundI - simpleI;

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="mb-4">
          <h4 className="font-bold text-purple-400 text-base md:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            সরল মুনাফা বনাম চক্রবৃদ্ধি মুনাফা তুলনা ল্যাব
          </h4>
          <p className="text-xs text-slate-400">
            C = P(1 + r/100)ⁿ সূত্রের শক্তি এবং সরল মুনাফার সাথে পার্থক্য লাইভ পর্যবেক্ষণ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>মূলধন (P):</span>
                <span className="font-bold text-purple-400">৳ {principal.toLocaleString('bn-BD')}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>বার্ষিক হার (r):</span>
                <span className="font-bold text-purple-400">{rate}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={15}
                step={0.5}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>সময় (n বছর):</span>
                <span className="font-bold text-purple-400">{years} বছর</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">সরল মুনাফা (I)</span>
              <span className="text-xl font-bold text-sky-400">
                ৳ {Math.round(simpleI).toLocaleString('bn-BD')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">প্রতি বছর নির্দিষ্ট মুনাফা</span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">চক্রবৃদ্ধি মুনাফা (CI)</span>
              <span className="text-xl font-bold text-purple-400">
                ৳ {Math.round(compoundI).toLocaleString('bn-BD')}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">মুনাফার ওপরও মুনাফা</span>
            </div>

            <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/40">
              <span className="text-xs text-emerald-400 block mb-1">চক্রবৃদ্ধির অতিরিক্ত লাভ</span>
              <span className="text-xl font-bold text-emerald-300">
                ৳ {Math.round(diff).toLocaleString('bn-BD')}
              </span>
              <span className="text-[10px] text-emerald-400/80 block mt-1">চক্রবৃদ্ধি - সরল</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= (a + b)² Geometric Visualizer =================
  if (visualType === 'algebra-square') {
    const totalSide = aSize + bSize;
    const a2 = aSize * aSize;
    const ab = aSize * bSize;
    const b2 = bSize * bSize;
    const totalArea = totalSide * totalSide;

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="mb-4">
          <h4 className="font-bold text-indigo-400 text-base md:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            (a + b)² এর জ্যামিতিক প্রমাণ ল্যাব: a² + 2ab + b²
          </h4>
          <p className="text-xs text-slate-400">
            a ও b এর মাপ পরিবর্তন করে ৪টি অংশের ক্ষেত্রফল একত্র করে দেখো
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Controls & Breakdown */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>বাহু a এর মান:</span>
                  <span className="font-bold text-blue-400">{aSize} একক</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={aSize}
                  onChange={e => setASize(Number(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>বাহু b এর মান:</span>
                  <span className="font-bold text-amber-400">{bSize} একক</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={bSize}
                  onChange={e => setBSize(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-950/50 p-2.5 rounded-lg border border-blue-800/40">
                <span className="text-blue-300 block font-semibold">a² নীল বর্গ = {a2}</span>
                <span className="text-[10px] text-blue-400/80">{aSize} × {aSize}</span>
              </div>
              <div className="bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-800/40">
                <span className="text-emerald-300 block font-semibold">2ab দুটি আয়ত = {2 * ab}</span>
                <span className="text-[10px] text-emerald-400/80">2 × ({aSize} × {bSize})</span>
              </div>
              <div className="bg-amber-950/50 p-2.5 rounded-lg border border-amber-800/40">
                <span className="text-amber-300 block font-semibold">b² হলুদ বর্গ = {b2}</span>
                <span className="text-[10px] text-amber-400/80">{bSize} × {bSize}</span>
              </div>
              <div className="bg-purple-950/50 p-2.5 rounded-lg border border-purple-800/40">
                <span className="text-purple-300 block font-semibold">মোট = {totalArea}</span>
                <span className="text-[10px] text-purple-400/80">({aSize} + {bSize})² = {totalSide}²</span>
              </div>
            </div>
          </div>

          {/* Geometric Visual Square */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-950 shadow-2xl transition-all duration-300"
              style={{ width: '240px', height: '240px' }}
            >
              {/* Row 1: a² (blue) + ab (green) */}
              <div className="flex" style={{ height: `${(aSize / totalSide) * 100}%` }}>
                <div
                  style={{ width: `${(aSize / totalSide) * 100}%` }}
                  className="bg-blue-600/90 border border-blue-400/30 flex items-center justify-center font-bold text-white text-xs md:text-sm"
                >
                  a² ({a2})
                </div>
                <div
                  style={{ width: `${(bSize / totalSide) * 100}%` }}
                  className="bg-emerald-600/90 border border-emerald-400/30 flex items-center justify-center font-bold text-white text-xs"
                >
                  ab ({ab})
                </div>
              </div>

              {/* Row 2: ab (green) + b² (amber) */}
              <div className="flex" style={{ height: `${(bSize / totalSide) * 100}%` }}>
                <div
                  style={{ width: `${(aSize / totalSide) * 100}%` }}
                  className="bg-emerald-600/90 border border-emerald-400/30 flex items-center justify-center font-bold text-white text-xs"
                >
                  ab ({ab})
                </div>
                <div
                  style={{ width: `${(bSize / totalSide) * 100}%` }}
                  className="bg-amber-500/90 border border-amber-300/30 flex items-center justify-center font-bold text-slate-950 text-xs"
                >
                  b² ({b2})
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-mono">
              মোট ক্ষেত্রফল = a² + ab + ab + b² = a² + 2ab + b²
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ================= Factorization & AC Method Lab =================
  if (visualType === 'ac-method' || visualType === 'factorization-lab') {
    const ac = acA * acC;
    // find factor pairs of ac
    const pairs: [number, number][] = [];
    const absAc = Math.abs(ac);
    for (let i = 1; i <= Math.sqrt(absAc); i++) {
      if (absAc % i === 0) {
        const j = absAc / i;
        if (ac > 0) {
          pairs.push([i, j], [-i, -j]);
        } else {
          pairs.push([i, -j], [-i, j]);
        }
      }
    }
    const matchingPair = pairs.find(([x, y]) => x + y === acB);

    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="mb-4">
          <h4 className="font-bold text-rose-400 text-base md:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            AC মেথড ও মধ্যপদ বিভক্তিকরণ ল্যাব (ax² + bx + c)
          </h4>
          <p className="text-xs text-slate-400">
            a, b, c সহগ ইনপুট দিলে স্বয়ংক্রিয়ভাবে ac এর গুণনীয়ক ও মধ্যপদ বিভক্তি ধাপ বের করে দেয়
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1">সহগ a (x² এর)</label>
            <input
              type="number"
              value={acA}
              onChange={e => setAcA(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-rose-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">সহগ b (x এর)</label>
            <input
              type="number"
              value={acB}
              onChange={e => setAcB(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-rose-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">ধ্রুবক c</label>
            <input
              type="number"
              value={acC}
              onChange={e => setAcC(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-rose-300"
            />
          </div>
        </div>

        {/* Steps display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs md:text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-xs">১</span>
            <span>প্রান্তীয় গুণফল ac = {acA} × {acC} = <strong className="text-amber-400">{ac}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 font-bold flex items-center justify-center text-xs">২</span>
            <span>খোঁজা হচ্ছে এমন দুটি সংখ্যা যাদের যোগফল b = <strong className="text-sky-400">{acB}</strong></span>
          </div>

          {matchingPair ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 font-mono mt-3">
              <span className="block font-bold mb-1">সফল নির্বাচন: {matchingPair[0]} এবং {matchingPair[1]}</span>
              <span className="block text-xs text-emerald-400/80">
                {matchingPair[0]} + {matchingPair[1]} = {acB} এবং {matchingPair[0]} × {matchingPair[1]} = {ac}
              </span>
              <span className="block text-xs text-slate-300 mt-2 font-sans">
                বিভক্ত রূপ: {acA}x² {matchingPair[0] >= 0 ? `+ ${matchingPair[0]}x` : `${matchingPair[0]}x`} {matchingPair[1] >= 0 ? `+ ${matchingPair[1]}x` : `${matchingPair[1]}x`} {acC >= 0 ? `+ ${acC}` : `${acC}`}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-300 text-xs">
              এই পূর্ণসংখ্যার সহগগুলোর জন্য কোনো সহজ পূর্ণসংখ্যা জোড়া পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= HCF & LCM Calculator =================
  if (visualType === 'hcf-visualizer' || visualType === 'lcm-visualizer') {
    return (
      <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl border border-slate-800 my-4 shadow-xl">
        <div className="mb-4">
          <h4 className="font-bold text-teal-400 text-base md:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            গ.সা.গু ও ল.সা.গু ক্যালকুলেটর ও সম্পর্ক ল্যাব
          </h4>
          <p className="text-xs text-slate-400">
            দুটি সংখ্যা দিলে তাদের গ.সা.গু, ল.সা.গু এবং গুণফলের সম্পর্ক যাচাই করো
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1">প্রথম সংখ্যা (A)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={numA}
              onChange={e => setNumA(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-teal-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">দ্বিতীয় সংখ্যা (B)</label>
            <input
              type="number"
              min={1}
              max={500}
              value={numB}
              onChange={e => setNumB(Number(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-bold text-teal-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">গ.সা.গু (H.C.F.)</span>
            <span className="text-2xl font-black text-amber-400">{gcdVal}</span>
            <span className="text-[10px] text-slate-500 block mt-1">উভয়ের গরিষ্ঠ সাধারণ উৎপাদক</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">ল.সা.গু (L.C.M.)</span>
            <span className="text-2xl font-black text-teal-400">{lcmVal}</span>
            <span className="text-[10px] text-slate-500 block mt-1">উভয়ের লঘিষ্ঠ সাধারণ গুণিতক</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">সম্পর্ক যাচাই</span>
            <span className="text-sm font-bold text-emerald-400 block">
              A × B = {numA * numB}
            </span>
            <span className="text-xs text-slate-300 block">
              গ.সা.গু × ল.সা.গু = {gcdVal * lcmVal}
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-1">সমান! (প্রমাণিত)</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / default
  return null;
};
