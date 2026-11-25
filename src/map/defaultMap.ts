import { DEFAULT_GRID_SIZE, DELIVERY_CELL, SHELF_TYPES } from '../constants';
import type { CellType, GridMap } from '../types';

export function emptyGrid(width: number, height: number): CellType[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0 as CellType),
  );
}

/** Default 20×20 warehouse: six pick aisles, delivery band, staging robots. */
export function createDefaultMap(
  width = DEFAULT_GRID_SIZE,
  height = DEFAULT_GRID_SIZE,
): GridMap {
  const cells = emptyGrid(width, height);
  const aisleX = [2, 5, 8, 11, 14, 17];

  for (let yi = 0; yi < SHELF_TYPES.length; yi++) {
    const x = aisleX[yi];
    if (x >= width) continue;
    const shelfVal = (yi + 1) as CellType;
    for (let y = 3; y <= Math.min(14, height - 1); y++) {
      cells[y][x] = shelfVal;
    }
  }

  const delivY = Math.min(17, height - 1);
  const delivCells = [
    { x: 8, y: delivY },
    { x: 9, y: delivY },
    { x: 10, y: delivY },
    { x: 11, y: delivY },
  ];
  for (const { x, y } of delivCells) {
    if (x < width && y < height) cells[y][x] = DELIVERY_CELL;
  }
  const delivery = { x: 9, y: delivY };

  const robotRows = [3, 7, 11, 15, 18];
  const robots = robotRows
    .filter((y) => y < height)
    .map((y, id) => ({ id, x: 0, y }));

  return {
    width,
    height,
    cells,
    delivery,
    robots,
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