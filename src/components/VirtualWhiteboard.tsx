import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RoomData, PeerUser, WhiteboardStroke, WhiteboardPoint } from '../types';
import {
  PenTool, Eraser, Highlighter, Type, RotateCcw, Trash2,
  Download, Maximize2, Minimize2, Grid, Sparkles, Plus,
  ChevronDown, Check, Users, Eye, HelpCircle
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface Props {
  room: RoomData;
  currentUser: PeerUser | null;
  onSendStroke: (stroke: WhiteboardStroke) => void;
  onClear: () => void;
  onUndo: () => void;
  activeDrawer: { name: string; color: string } | null;
  soundEnabled: boolean;
}

type WhiteboardTool = 'pen' | 'highlighter' | 'eraser' | 'math';
type BackgroundType = 'graph' | 'dots' | 'lined' | 'chalkboard' | 'white';

const COLOR_PALETTE = [
  { hex: '#6366f1', label: 'নীল (Indigo)' },
  { hex: '#10b981', label: 'সবুজ (Emerald)' },
  { hex: '#f43f5e', label: 'লাল (Rose)' },
  { hex: '#f59e0b', label: 'হলুদ (Amber)' },
  { hex: '#0ea5e9', label: 'আকাশি (Sky)' },
  { hex: '#a855f7', label: 'বেগুনী (Purple)' },
  { hex: '#ffffff', label: 'সাদা (White)' },
  { hex: '#1e293b', label: 'কালো (Slate)' },
];

const PRESET_FORMULAS = [
  { label: '(a+b)²', formula: '(a + b)² = a² + 2ab + b²' },
  { label: '(a-b)²', formula: '(a - b)² = a² - 2ab + b²' },
  { label: 'a² - b²', formula: 'a² - b² = (a + b)(a - b)' },
  { label: 'বৃত্তের ক্ষেত্রফল', formula: 'A = πr²' },
  { label: 'বৃত্তের পরিধি', formula: 'C = 2πr' },
  { label: 'সরল মুনাফা', formula: 'I = Pnr' },
  { label: 'চক্রবৃদ্ধি মূলধন', formula: 'C = P(1 + r)ⁿ' },
  { label: 'ত্রিভুজ ক্ষেত্রফল', formula: 'A = ½ × ভূমি × উচ্চতা' },
  { label: 'পিথাগোরাস', formula: 'a² + b² = c²' },
  { label: 'দ্বিঘাত সূত্র', formula: 'x = (-b ± √(b² - 4ac)) / 2a' },
];

const MATH_SYMBOLS = [
  '√', '±', 'π', 'θ', '²', '³', '½', '¼', '∑', '≠', '≈', '≤', '≥', '×', '÷', '∠', '△', '∞', '∴', '∵', 'বা,'
];

export const VirtualWhiteboard: React.FC<Props> = ({
  room,
  currentUser,
  onSendStroke,
  onClear,
  onUndo,
  activeDrawer,
  soundEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools & Styling State
  const [selectedTool, setSelectedTool] = useState<WhiteboardTool>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1');
  const [strokeSize, setStrokeSize] = useState<number>(3);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('graph');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Math Stamp / Text Insertion State
  const [showFormulaPicker, setShowFormulaPicker] = useState<boolean>(false);
  const [stagedMathText, setStagedMathText] = useState<string>('(a + b)² = a² + 2ab + b²');
  const [customEquationInput, setCustomEquationInput] = useState<string>('');

  // Local drawing state
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<WhiteboardPoint[]>([]);
  const [, setForceRender] = useState<number>(0);

  // Resize canvas according to container
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      redrawCanvas();
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    const ro = new ResizeObserver(() => {
      updateCanvasSize();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [updateCanvasSize]);

  // Redraw all strokes and background on changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw Background
    drawBackground(ctx, width, height, backgroundType);

    // 2. Draw all Strokes
    const strokes = room.whiteboardStrokes || [];
    for (const stroke of strokes) {
      renderStroke(ctx, stroke, width, height);
    }

    // 3. Draw live in-progress stroke if drawing
    if (isDrawingRef.current && currentPointsRef.current.length > 0) {
      const liveStroke: WhiteboardStroke = {
        id: 'live',
        userId: currentUser?.id || 'me',
        userName: currentUser?.name || 'আমি',
        userColor: selectedColor,
        tool: selectedTool,
        color: selectedTool === 'eraser' ? (backgroundType === 'chalkboard' ? '#0f172a' : '#ffffff') : selectedColor,
        size: selectedTool === 'highlighter' ? 24 : strokeSize,
        points: currentPointsRef.current,
        timestamp: Date.now(),
      };
      renderStroke(ctx, liveStroke, width, height);
    }

    ctx.restore();
  }, [room.whiteboardStrokes, backgroundType, selectedColor, selectedTool, strokeSize, currentUser]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas, room.whiteboardStrokes, backgroundType]);

  // Background patterns
  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, type: BackgroundType) => {
    ctx.clearRect(0, 0, w, h);

    if (type === 'chalkboard') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      // Subtle chalk grain
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      return;
    }

    if (type === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    if (type === 'graph') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      // Minor grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.6;
      const minor = 15;
      for (let x = 0; x < w; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Major grid
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      const major = 60;
      for (let x = 0; x < w; x += major) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += major) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      return;
    }

    if (type === 'dots') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#94a3b8';
      const gap = 24;
      for (let x = 12; x < w; x += gap) {
        for (let y = 12; y < h; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return;
    }

    if (type === 'lined') {
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(0, 0, w, h);
      // Pink margin line
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(48, h);
      ctx.stroke();

      // Ruled lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      const lineGap = 32;
      for (let y = 48; y < h; y += lineGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
  };

  // Render an individual stroke
  const renderStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: WhiteboardStroke,
    canvasW: number,
    canvasH: number
  ) => {
    ctx.save();

    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(16, stroke.size * 5);
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
    } else if (stroke.tool === 'eraser') {
      ctx.strokeStyle = backgroundType === 'chalkboard' ? '#090d16' : '#ffffff';
      ctx.lineWidth = Math.max(20, stroke.size * 6);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (stroke.tool === 'math' && stroke.text) {
      // Render equation text badge
      if (stroke.points.length > 0) {
        const pt = stroke.points[0];
        const x = (pt.x / 1000) * canvasW;
        const y = (pt.y / 1000) * canvasH;

        ctx.font = 'bold 16px monospace';
        const metrics = ctx.measureText(stroke.text);
        const padding = 8;
        const badgeW = metrics.width + padding * 2;
        const badgeH = 28;

        // Background box
        ctx.fillStyle = backgroundType === 'chalkboard' ? '#1e293b' : '#ffffff';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 4, y - badgeH + 6, badgeW, badgeH, 6);
        ctx.fill();
        ctx.stroke();

        // Formula text
        ctx.fillStyle = stroke.color;
        ctx.fillText(stroke.text, x + padding - 4, y - 4);

        // Author tag
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(stroke.userName, x - 2, y + 16);
      }
      ctx.restore();
      return;
    } else {
      // Standard pen
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    const points = stroke.points;
    if (points.length === 1) {
      const pt = points[0];
      const x = (pt.x / 1000) * canvasW;
      const y = (pt.y / 1000) * canvasH;
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.arc(x, y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (points.length > 1) {
      ctx.beginPath();
      const first = points[0];
      ctx.moveTo((first.x / 1000) * canvasW, (first.y / 1000) * canvasH);

      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        ctx.lineTo((pt.x / 1000) * canvasW, (pt.y / 1000) * canvasH);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Convert mouse/touch event to normalized point
  const getNormalizedPoint = (e: React.MouseEvent | React.TouchEvent): WhiteboardPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      return null;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const normX = Math.round((relX / rect.width) * 1000);
    const normY = Math.round((relY / rect.height) * 1000);

    return {
      x: Math.max(0, Math.min(1000, normX)),
      y: Math.max(0, Math.min(1000, normY)),
    };
  };

  // Start Drawing
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pt = getNormalizedPoint(e);
    if (!pt) return;

    // If Math Tool is selected, stamp equation directly!
    if (selectedTool === 'math') {
      const textToStamp = stagedMathText.trim() || customEquationInput.trim() || '(a + b)² = a² + 2ab + b²';
      const stroke: WhiteboardStroke = {
        id: 'math_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: currentUser?.id || 'anon',
        userName: currentUser?.name || 'সহপাঠী',
        userColor: selectedColor,
        tool: 'math',
        color: selectedColor,
        size: 16,
        points: [pt],
        text: textToStamp,
        timestamp: Date.now(),
      };
      if (soundEnabled) playSound('click');
      onSendStroke(stroke);
      return;
    }

    isDrawingRef.current = true;
    currentPointsRef.current = [pt];
    redrawCanvas();
  };

  // Move Pointer
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const pt = getNormalizedPoint(e);
    if (!pt) return;

    // Filter points too close
    const last = currentPointsRef.current[currentPointsRef.current.length - 1];
    if (last) {
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist < 4) return;
    }

    currentPointsRef.current.push(pt);
    redrawCanvas();
  };

  // End Drawing
  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      const newStroke: WhiteboardStroke = {
        id: 'stroke_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: currentUser?.id || 'anon',
        userName: currentUser?.name || 'সহপাঠী',
        userColor: selectedColor,
        tool: selectedTool,
        color: selectedTool === 'eraser' ? (backgroundType === 'chalkboard' ? '#090d16' : '#ffffff') : selectedColor,
        size: selectedTool === 'highlighter' ? 24 : strokeSize,
        points: [...currentPointsRef.current],
        timestamp: Date.now(),
      };

      onSendStroke(newStroke);
      currentPointsRef.current = [];
      setForceRender((n) => n + 1);
    }
  };

  // Clear Canvas with sound & confirmation
  const handleClearBoard = () => {
    if (window.confirm('আপনি কি যৌথ হোয়াইটবোর্ডের সকল অঙ্কন ও সমীকরণ মুছে ফেলতে চান?')) {
      if (soundEnabled) playSound('click');
      onClear();
    }
  };

  // Download Canvas as PNG
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (soundEnabled) playSound('success');
    const link = document.createElement('a');
    link.download = `Class8_Math_Whiteboard_${room.roomCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transition-all overflow-hidden ${
        isFullScreen ? 'fixed inset-3 sm:inset-6 z-50 shadow-2xl' : 'w-full h-[640px]'
      }`}
    >
      {/* Top Whiteboard Header & Realtime Peer Status */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                যৌথ ভার্চুয়াল হোয়াইটবোর্ড
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>লাইভ সিঙ্ক</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              সহপাঠীদের সাথে সমীকরণ সমাধান, জ্যামিতিক চিত্র ও সূত্র অঙ্কন করুন
            </p>
          </div>
        </div>

        {/* Live Drawer Notification Pill */}
        {activeDrawer && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md animate-bounce"
            style={{ backgroundColor: activeDrawer.color }}
          >
            <PenTool className="w-3.5 h-3.5 animate-spin" />
            <span>{activeDrawer.name} সমীকরণ আঁকছেন...</span>
          </div>
        )}

        {/* Action Buttons: Undo, Clear, Save, Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (soundEnabled) playSound('click');
              onUndo();
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            title="পূর্বাবস্থায় ফেরান (Undo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">পূর্বাবস্থা</span>
          </button>

          <button
            onClick={handleClearBoard}
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="বোর্ড সম্পূর্ণ পরিষ্কার করুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">মুছুন</span>
          </button>

          <button
            onClick={handleDownloadImage}
            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="হোয়াইটবোর্ড ইমেজ সেভ করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সেভ</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            title={isFullScreen ? 'ছোট করুন' : 'পূর্ণপর্দায় দেখুন'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Drawing Area + Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-950 touch-none select-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Staged Math Placement Hint if 'math' tool selected */}
        {selectedTool === 'math' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-indigo-900/90 text-white px-4 py-2 rounded-full text-xs font-bold border border-indigo-500/50 shadow-xl backdrop-blur flex items-center gap-2 animate-bounce">
            <Type className="w-4 h-4 text-amber-400" />
            <span>হোয়াইটবোর্ডে ক্লিক করে সমীকরণটি স্থাপন করুন: &quot;{stagedMathText}&quot;</span>
          </div>
        )}
      </div>

      {/* Interactive Toolbars (Tools, Colors, Math Presets, Background) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 space-y-2.5">
        {/* Row 1: Tools, Colors & Thickness */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tool Segment */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => {
                setSelectedTool('pen');
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedTool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>কলম</span>
            </button>

            <button
              onClick={() => {
                setSelectedTool('highlighter');
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedTool === 'highlighter'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>হাইলাইটার</span>
            </button>

            <button
              onClick={() => {
                setSelectedTool('eraser');
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedTool === 'eraser'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>মুছনি</span>
            </button>

            <button
              onClick={() => {
                setSelectedTool('math');
                setShowFormulaPicker(true);
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedTool === 'math'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>সমীকরণ স্ট্যাম্প</span>
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => setSelectedColor(c.hex)}
                className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                  selectedColor === c.hex ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex, border: c.hex === '#ffffff' ? '1px solid #cbd5e1' : undefined }}
                title={c.label}
              >
                {selectedColor === c.hex && (
                  <Check className={`w-3 h-3 ${c.hex === '#ffffff' ? 'text-slate-900' : 'text-white'} stroke-[3]`} />
                )}
              </button>
            ))}
          </div>

          {/* Stroke Thickness Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-bold">
            <span className="text-slate-500 text-[11px]">পুরুত্ব:</span>
            {[2, 4, 7, 12].map((sz) => (
              <button
                key={sz}
                onClick={() => setStrokeSize(sz)}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  strokeSize === sz ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Math.min(12, sz + 2)}px`, height: `${Math.min(12, sz + 2)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Background Grid Style Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs">
            <span className="px-2 text-[11px] font-bold text-slate-500">গ্রিড:</span>
            {(
              [
                { id: 'graph', label: 'ছক কাগজ' },
                { id: 'dots', label: 'বিন্দু' },
                { id: 'lined', label: 'খাতা' },
                { id: 'chalkboard', label: 'স্লেট' },
                { id: 'white', label: 'সাদা' },
              ] as { id: BackgroundType; label: string }[]
            ).map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackgroundType(bg.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  backgroundType === bg.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Quick Math Equation & Symbol Stamps Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>দ্রুত সমীকরণ:</span>
          </span>

          {PRESET_FORMULAS.slice(0, 5).map((f, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedTool('math');
                setStagedMathText(f.formula);
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
                selectedTool === 'math' && stagedMathText === f.formula
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Quick symbols */}
          <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200 dark:border-slate-700">
            {MATH_SYMBOLS.slice(0, 7).map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSelectedTool('math');
                  setStagedMathText(sym);
                  if (soundEnabled) playSound('click');
                }}
                className="w-7 h-7 rounded-lg text-xs font-mono font-extrabold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                title={`স্ট্যাম্প প্রতীক ${sym}`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* More Formulas Dropdown button */}
          <button
            onClick={() => setShowFormulaPicker(!showFormulaPicker)}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1 shrink-0 ml-auto"
          >
            <span>সব সূত্র ও কাস্টম টেক্সট</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expanded Formula & Custom Math Input Drawer */}
        {showFormulaPicker && (
          <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                যেকোনো সমীকরণ বা সমাধান ধাপ লিখুন:
              </span>
              <button
                onClick={() => setShowFormulaPicker(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                বন্ধ করুন
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customEquationInput}
                onChange={(e) => setCustomEquationInput(e.target.value)}
                placeholder="যেমন: 2x + 5 = 15 => 2x = 10 => x = 5"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={() => {
                  if (!customEquationInput.trim()) return;
                  setSelectedTool('math');
                  setStagedMathText(customEquationInput.trim());
                  setShowFormulaPicker(false);
                  if (soundEnabled) playSound('click');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                স্ট্যাম্প রেডি করুন
              </button>
            </div>

            {/* All Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {PRESET_FORMULAS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedTool('math');
                    setStagedMathText(f.formula);
                    setShowFormulaPicker(false);
                    if (soundEnabled) playSound('click');
                  }}
                  className="p-2 rounded-xl text-left text-xs bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors"
                >
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] mb-0.5">
                    {f.label}
                  </div>
                  <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                    {f.formula}
                  </div>
                </button>
              ))}
            </div>

            {/* All Math Symbols Bar */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 mr-1">প্রতীক:</span>
              {MATH_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setCustomEquationInput((prev) => prev + s);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-mono hover:bg-indigo-100 text-slate-800 dark:text-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
