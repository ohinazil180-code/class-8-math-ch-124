export type ChapterId = 0 | 1 | 2 | 4;

export type SlideType = 
  | 'Cover' 
  | 'ChapterIntro' 
  | 'LearningObjective' 
  | 'Text' 
  | 'TextVisual' 
  | 'Definition' 
  | 'Formula' 
  | 'FormulaDerivation' 
  | 'WorkedExample' 
  | 'StepSolution' 
  | 'Visualizer' 
  | 'NumberPattern' 
  | 'ShapePattern' 
  | 'MagicSquare' 
  | 'Fibonacci' 
  | 'InteractivePractice' 
  | 'MCQ' 
  | 'CommonMistake' 
  | 'ExamTip' 
  | 'CreativeQuestion' 
  | 'ShortQuestion' 
  | 'Summary' 
  | 'Revision' 
  | 'ChapterTest' 
  | 'Lab';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'challenge';

export interface SlideExample {
  problem: string;
  given?: string;
  required?: string;
  formulaUsed?: string;
  steps: string[];
  answer: string;
  verification?: string;
}

export interface SlideCommonMistake {
  wrong: string;
  right: string;
  explanation: string;
}

export interface SlideQuiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface SlideCreativeQuestion {
  stimulus: string; // উদ্দীপক
  partA: { question: string; marks: number; solution: string };
  partB: { question: string; marks: number; solution: string };
  partC: { question: string; marks: number; solution: string };
}

export type VisualType = 
  | 'number-line'
  | 'pattern-builder'
  | 'square-number'
  | 'triangular-number'
  | 'magic-square'
  | 'simple-interest'
  | 'compound-interest'
  | 'algebra-square'
  | 'diff-squares'
  | 'cube-formula'
  | 'factorization-lab'
  | 'ac-method'
  | 'hcf-visualizer'
  | 'lcm-visualizer'
  | 'dot-pattern'
  | 'fibonacci-tree'
  | 'eratosthenes'
  | 'magic-square-3'
  | 'simple-interest-calc'
  | 'compound-interest-calc';

export interface SlideData {
  id: number;
  slideNumber: string; // e.g. "001", "036", "198"
  chapter: ChapterId;
  chapterTitle: string;
  section: string;
  subsection?: string;
  title: string;
  type: SlideType;
  objective: string;
  textbookContent: string;
  easyExplanation: string;
  visualType?: VisualType;
  visualData?: any;
  formula?: string;
  example?: SlideExample;
  examTip?: string;
  commonMistake?: SlideCommonMistake;
  quiz?: SlideQuiz;
  creative?: SlideCreativeQuestion;
  why?: string;
  keywords: string[];
  difficulty: DifficultyLevel;
  estimatedTime: string; // e.g. "2 মিনিট"
  sourcePage: string;
}

export interface FormulaItem {
  id: string;
  chapter: ChapterId;
  name: string;
  latexOrText: string;
  description: string;
  variables: { name: string; meaning: string }[];
  example: string;
  derivationSummary?: string;
  tags: string[];
}

export interface GlossaryItem {
  id: string;
  termBn: string;
  termEn: string;
  definition: string;
  example: string;
  chapter: ChapterId;
  relatedSlideId?: number;
}

export interface ExamQuestion {
  id: string;
  chapter: ChapterId;
  topic: string;
  type: 'mcq' | 'short' | 'creative' | 'formula';
  difficulty: DifficultyLevel;
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  marks: number;
  creativeParts?: {
    a: { q: string; ans: string; marks: number };
    b: { q: string; ans: string; marks: number };
    c: { q: string; ans: string; marks: number };
  };
}

export interface UserProgressState {
  completedSlides: number[];
  bookmarks: number[];
  notes: Record<number, string>;
  quizScores: Record<string, { score: number; total: number; timestamp: number }>;
  weakTopics: Record<string, number>; // topic name -> error count
  xp: number;
  streak: number;
  lastActiveDate: string;
  currentSlide: number;
  theme: 'dark' | 'light' | 'projector';
  fontSize: 'normal' | 'large' | 'xl';
  soundEnabled: boolean;
  teacherMode: boolean;
  showTeacherAnswers: boolean;
  badges: string[];
}

export type MainNavTab = 'home' | 'learn' | 'lab' | 'practice' | 'exam' | 'formulas' | 'glossary' | 'progress' | 'slides' | 'labs' | 'peer';

export interface PeerUser {
  id: string;
  name: string;
  avatarColor: string;
  role: 'host' | 'participant';
  joinedAt: number;
}

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  type: 'text' | 'reaction' | 'system';
  timestamp: number;
}

export interface RoomPoll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // userId -> optionIndex
  isActive: boolean;
  createdAt: number;
}

export interface LaserPointer {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  slideId: number;
  timestamp: number;
}

export interface WhiteboardPoint {
  x: number; // normalized 0 to 1000
  y: number; // normalized 0 to 1000
}

export interface WhiteboardStroke {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  tool: 'pen' | 'highlighter' | 'eraser' | 'math';
  color: string;
  size: number;
  points: WhiteboardPoint[];
  text?: string;
  timestamp: number;
}

export interface RoomData {
  roomCode: string;
  roomName: string;
  hostId: string;
  hostName: string;
  currentSlideId: number;
  allowAnyPresenter: boolean;
  createdAt: number;
  users: PeerUser[];
  messages: RoomMessage[];
  activePoll: RoomPoll | null;
  lastPointer: LaserPointer | null;
  whiteboardStrokes?: WhiteboardStroke[];
}

