
export enum ModuleType {
  WELCOME = 'WELCOME',
  MOTION = 'MOTION',
  EVENTS = 'EVENTS',
  LOGIC = 'LOGIC',
  VARIABLES = 'VARIABLES',
  DESIGN = 'DESIGN',
  CREATIVE = 'CREATIVE',
  SPACE = 'SPACE'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'project' | 'quiz';
  quiz?: QuizQuestion[];
  miniProjectPrompt?: string;
  miniProjectLevelId?: string;
}

export interface Module {
  id: string;
  type: ModuleType;
  title: string;
  description: string;
  lessons: Lesson[];
  isLocked: boolean;
  isCompleted: boolean;
}

export interface CodeBlock {
  id: string;
  type: 'motion' | 'looks' | 'events' | 'control' | 'sound' | 'variable' | 'logic' | 'sensor';
  label: string;
  action: string;
  icon?: string;
}

export interface UserProgress {
  completedModules: string[];
  completedLessons: string[];
  currentModuleId: string;
  lastLessonId?: string;
  score: number;
  totalCoins: number;
  unlockedSkins: string[];
  activeSkin: string;
}
