import { DIRS } from '../constants';
import { key } from '../map/obstacles';
import type { GridMap, Point } from '../types';
import { geoAstar } from './geoAstar';
import { pathTime } from './pathTime';

export type ShelfSegment = {
  path: Point[];
  exitPos: Point;
  /** Aisle cell used immediately before entering the shelf. */
  approach: Point;
};

/** Free aisle cells adjacent to a shelf (not on the shelf). */
export function listShelfApproachCells(
  map: GridMap,
  shelfCell: Point,
  obstacles: Set<string>,
): Point[] {
  const out: Point[] = [];
  for (const [dx, dy] of DIRS) {
    const nx = shelfCell.x + dx;
    const ny = shelfCell.y + dy;
    if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) continue;
    if (obstacles.has(key(nx, ny))) continue;
    out.push({ x: nx, y: ny });
  }
  return out;
}

function buildShelfSegment(
  map: GridMap,
  start: Point,
  shelfCell: Point,
  approach: Point,
  obstacles: Set<string>,
): ShelfSegment | null {
  const toApproach = geoAstar(map, start, approach, obstacles);
  if (!toApproach) return null;

  const enter = [...toApproach, { x: shelfCell.x, y: shelfCell.y }];
  const reverse = [
    { x: shelfCell.x, y: shelfCell.y },
    { x: approach.x, y: approach.y },
  ];
  const path = enter.concat(reverse.slice(1));

  return {
    path,
    exitPos: { ...approach },
    approach: { ...approach },
  };
}

/**
 * Enter shelf from the approach with shortest timed pick leg (A* + enter + reverse).
 * Tie-break: shorter geometric path, then stable DIRS neighbor order.
 */
export function pathToShelfAndBack(
  map: GridMap,
  start: Point,
  shelfCell: Point,
  obstacles: Set<string>,
): ShelfSegment | null {
  const approaches = listShelfApproachCells(map, shelfCell, obstacles);
  if (!approaches.length) return null;

  let best: ShelfSegment | null = null;
  let bestTime = Infinity;
  let bestLen = Infinity;
  let bestRank = Infinity;

  approaches.forEach((approach, rank) => {
    const seg = buildShelfSegment(map, start, shelfCell, approach, obstacles);
    if (!seg) return;

    const time = pathTime(seg.path).time;
    const len = seg.path.length;

    if (
      time < bestTime ||
      (time === bestTime && len < bestLen) ||
      (time === bestTime && len === bestLen && rank < bestRank)
    ) {
      bestTime = time;
      bestLen = len;
      bestRank = rank;
      best = seg;
    }
  });

  return best;
}

/** Human-readable approach side (for UI). */
export function describeApproachSide(
  shelfCell: Point,
  approach: Point,
): string {
  const dx = approach.x - shelfCell.x;
  const dy = approach.y - shelfCell.y;
  if (dx === -1) return 'west aisle';
  if (dx === 1) return 'east aisle';
  if (dy === -1) return 'north aisle';
  if (dy === 1) return 'south aisle';
  return 'aisle';
}