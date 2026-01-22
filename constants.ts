
import { Module, ModuleType } from './types';

export const MAZE_LEVELS = [
  // Module 1: Flight - Focused on teaching sequencing and spatial awareness
  { id: 'lvl1', name: 'Straight Flight', solution: ['MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_RIGHT'], map: [[1,1,1,1,1,1,1,1],[1,2,4,0,4,3,1,1],[1,1,1,1,1,1,1,1]] },
  { id: 'lvl2', name: 'The Corner', solution: ['MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_DOWN'], map: [[1,1,1,1,1,1],[1,2,0,4,1,1],[1,1,1,0,1,1],[1,1,1,4,1,1],[1,1,1,3,1,1],[1,1,1,1,1,1]] },
  { id: 'lvl3', name: 'U-Turn', solution: ['MOVE_DOWN', 'MOVE_DOWN', 'MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_UP', 'MOVE_UP'], map: [[1,1,1,1,1,1,1],[1,2,1,3,1,1,1],[1,0,1,0,1,1,1],[1,0,4,0,1,1,1],[1,0,0,4,1,1,1],[1,1,1,1,1,1,1]] },
  { id: 'lvl4', name: 'Zig-Zag', solution: ['MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_RIGHT', 'MOVE_UP', 'MOVE_RIGHT'], map: [[1,1,1,1,1,1,1,1],[1,1,1,0,4,3,1,1],[1,4,0,0,1,1,1,1],[1,2,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]] },
  { id: 'lvl5', name: 'Hidden Orchard', solution: ['MOVE_RIGHT', 'MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_DOWN', 'MOVE_RIGHT', 'MOVE_RIGHT'], map: [[1,1,1,1,1,1,1],[1,2,0,4,1,1,1],[1,1,1,0,1,1,1],[1,1,0,0,1,1,1],[1,1,4,1,1,1,1],[1,1,0,4,4,3,1],[1,1,1,1,1,1,1]] }
];

export const COURSE_MODULES: Module[] = [
  {
    id: 'm1',
    type: ModuleType.MOTION,
    title: 'Flight Basics',
    description: 'Master simple movements and help Batty find the magical fruit trees.',
    isLocked: false,
    isCompleted: false,
    lessons: [
      { id: 'l1.1', title: 'Mission 1', type: 'project', miniProjectLevelId: 'lvl1', content: 'L1' },
      { id: 'l1.2', title: 'Mission 2', type: 'project', miniProjectLevelId: 'lvl2', content: 'L2' },
      { id: 'l1.3', title: 'Mission 3', type: 'project', miniProjectLevelId: 'lvl3', content: 'L3' },
      { id: 'l1.4', title: 'Mission 4', type: 'project', miniProjectLevelId: 'lvl4', content: 'L4' },
      { id: 'l1.5', title: 'Mission 5', type: 'project', miniProjectLevelId: 'lvl5', content: 'L5' }
    ]
  }
];

// Block definitions optimized for young learners
export const AVAILABLE_BLOCKS = [
  { id: 'b1', type: 'motion', label: 'MOVE RIGHT', action: 'MOVE_RIGHT', icon: '➡️' },
  { id: 'b2', type: 'motion', label: 'MOVE LEFT', action: 'MOVE_LEFT', icon: '⬅️' },
  { id: 'b3', type: 'motion', label: 'MOVE UP', action: 'MOVE_UP', icon: '⬆️' },
  { id: 'b4', type: 'motion', label: 'MOVE DOWN', action: 'MOVE_DOWN', icon: '⬇️' }
];

export const VARIABLE_BLOCKS = [
  { id: 'v1', type: 'variable', label: 'RESET SCORE', action: 'SET_SCORE_0', icon: '🔄' },
  { id: 'v2', type: 'variable', label: 'SCORE +1', action: 'INC_SCORE', icon: '➕' },
  { id: 'v3', type: 'motion', label: 'GO LEFT', action: 'GO_LEFT', icon: '⬅️' },
  { id: 'v4', type: 'motion', label: 'GO RIGHT', action: 'GO_RIGHT', icon: '➡️' },
];

export const SPACE_BLOCKS = [
  { id: 'sb1', type: 'motion', label: 'STEP', action: 'STEP', icon: '🚀' },
  { id: 'sb2', type: 'motion', label: 'TURN', action: 'TURN_R', icon: '↪️' },
  { id: 'sb3', type: 'sensor', label: 'SCAN', action: 'SCAN', icon: '📡' },
  { id: 'sb4', type: 'logic', label: 'GEMS', action: 'COLLECT', icon: '💎' },
];
