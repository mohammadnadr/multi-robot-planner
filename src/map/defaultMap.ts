import { DEFAULT_GRID_SIZE } from '../constants';
import type { CellType, GridMap } from '../types';

export function emptyGrid(width: number, height: number): CellType[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0 as CellType),
  );
}

/** Default warehouse matching the original HTML demo. */
export function createDefaultMap(
  size = DEFAULT_GRID_SIZE,
): GridMap {
  const cells = emptyGrid(size, size);

  ;[1, 2, 3].forEach((y) => {
    cells[y][1] = 1;
    cells[y][2] = 1;
  });
  ;[1, 2, 3].forEach((y) => {
    cells[y][4] = 2;
    cells[y][5] = 2;
  });
  ;[1, 2, 3].forEach((y) => {
    cells[y][7] = 3;
    cells[y][8] = 3;
  });

  cells[8][4] = 4;
  cells[8][5] = 4;

  return {
    width: size,
    height: size,
    cells,
    delivery: { x: 4, y: 8 },
    robots: [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 0, y: 4 },
      { id: 2, x: 0, y: 9 },
    ],
  };
}

export function createEmptyMap(width: number, height: number): GridMap {
  return {
    width,
    height,
    cells: emptyGrid(width, height),
    robots: [],
    delivery: null,
  };
}
