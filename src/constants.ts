import type { CellType, ShelfType } from './types';

export const DEFAULT_GRID_SIZE = 10;
export const MAX_ROBOTS = 3;
export const MAX_DEMAND = 6;
export const ACCEL_CELLS = 2; // cells needing extra cost after a turn

export const SHELF_VALUE: Record<ShelfType, CellType> = {
  A: 1,
  B: 2,
  C: 3,
};

export const VALUE_TO_SHELF: Record<number, ShelfType | null> = {
  0: null,
  1: 'A',
  2: 'B',
  3: 'C',
  4: null,
};

export const CELL_COLORS: Record<CellType, string> = {
  0: '#252836',
  1: '#c62828',
  2: '#2e7d32',
  3: '#1565c0',
  4: '#f9a825',
};

export const CELL_LABELS: Record<CellType, string> = {
  0: '',
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
};

export const ROBOT_COLORS = ['#ff8c00', '#ab47bc', '#26c6da'] as const;

export const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];
