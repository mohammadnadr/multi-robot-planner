import type { CellType, ShelfType } from './types';

export const DEFAULT_GRID_SIZE = 20;
export const GRID_MIN = 10;
export const GRID_MAX = 50;

export const MAX_DEMAND = 6;
export const MAX_ROBOTS = 4;
/** Product types exposed in the UI and used in task generation (A–D for now). */
export const MAX_PRODUCT_TYPES = 4;
export const DELIVERY_CELL = 7 as const;

export const ACCEL_CELLS = 2; // cells needing extra cost after a turn

export const SHELF_TYPES: ShelfType[] = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Active shelf types for tools, demand, and default map layout. */
export const ACTIVE_PRODUCT_TYPES: ShelfType[] = SHELF_TYPES.slice(
  0,
  MAX_PRODUCT_TYPES,
);

export const SHELF_VALUE: Record<ShelfType, CellType> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
};

export const VALUE_TO_SHELF: Record<number, ShelfType | null> = {
  0: null,
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: null,
};

export const CELL_COLORS: Record<CellType, string> = {
  0: '#252836',
  1: '#c62828',
  2: '#2e7d32',
  3: '#1565c0',
  4: '#6a1b9a',
  5: '#00838f',
  6: '#558b2f',
  7: '#f9a825',
};

export const CELL_LABELS: Record<CellType, string> = {
  0: '',
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'Dlv',
};

export const ROBOT_COLORS = [
  '#ff8c00',
  '#ab47bc',
  '#26c6da',
  '#66bb6a',
  '#ef5350',
  '#ffa726',
  '#5c6bc0',
  '#ec407a',
  '#8d6e63',
  '#7e57c2',
] as const;

export function robotColor(index: number): string {
  if (index < ROBOT_COLORS.length) return ROBOT_COLORS[index];
  const hue = (index * 137.508) % 360;
  return `hsl(${hue} 70% 55%)`;
}

export const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export const DEFAULT_DEMAND: Record<ShelfType, number> = {
  A: 2,
  B: 2,
  C: 1,
  D: 1,
  E: 0,
  F: 0,
};