import type { GridMap, Point } from '../types';

/** Shelf cells are hard obstacles except intentional enter/exit goals. */
export function getObstacleSet(map: GridMap): Set<string> {
  const s = new Set<string>();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const v = map.cells[y][x];
      if (v >= 1 && v <= 3) s.add(key(x, y));
    }
  }
  return s;
}

export function key(x: number, y: number): string {
  return `${x},${y}`;
}

export function pointKey(p: Point): string {
  return key(p.x, p.y);
}

export function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function inBounds(map: GridMap, x: number, y: number): boolean {
  return x >= 0 && x < map.width && y >= 0 && y < map.height;
}

export function isShelfCell(map: GridMap, x: number, y: number): boolean {
  const v = map.cells[y]?.[x];
  return v === 1 || v === 2 || v === 3;
}
