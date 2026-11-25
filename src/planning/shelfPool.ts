import { ACTIVE_PRODUCT_TYPES, VALUE_TO_SHELF } from '../constants';
import type { GridMap, Point, ShelfType } from '../types';

export type ShelfPool = Record<ShelfType, Point[]>;

export function buildShelfPool(map: GridMap): ShelfPool {
  const pool = Object.fromEntries(
    ACTIVE_PRODUCT_TYPES.map((typ) => [typ, [] as Point[]]),
  ) as ShelfPool;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const typ = VALUE_TO_SHELF[map.cells[y][x]];
      if (typ) pool[typ].push({ x, y });
    }
  }
  return pool;
}

export function cloneShelfPool(pool: ShelfPool): ShelfPool {
  const copy = {} as ShelfPool;
  for (const typ of ACTIVE_PRODUCT_TYPES) {
    copy[typ] = [...(pool[typ] ?? [])];
  }
  return copy;
}

export function removeShelfFromPool(pool: ShelfPool, shelf: Point): void {
  for (const typ of ACTIVE_PRODUCT_TYPES) {
    const list = pool[typ];
    const idx = list.findIndex((p) => p.x === shelf.x && p.y === shelf.y);
    if (idx >= 0) {
      list.splice(idx, 1);
      return;
    }
  }
}