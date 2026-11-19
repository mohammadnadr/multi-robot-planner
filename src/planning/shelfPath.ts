import { DIRS } from '../constants';
import { key } from '../map/obstacles';
import type { GridMap, Point } from '../types';
import { geoAstar } from './geoAstar';

export type ShelfSegment = {
  path: Point[];
  exitPos: Point;
};

/**
 * Approach a free neighbor of the shelf, enter, then reverse out the same way.
 * No turning inside the shelf cell.
 */
export function pathToShelfAndBack(
  map: GridMap,
  start: Point,
  shelfCell: Point,
  obstacles: Set<string>,
): ShelfSegment | null {
  let approach: Point | null = null;
  for (const [dx, dy] of DIRS) {
    const nx = shelfCell.x + dx;
    const ny = shelfCell.y + dy;
    if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) continue;
    if (obstacles.has(key(nx, ny))) continue;
    approach = { x: nx, y: ny };
    break;
  }
  if (!approach) return null;

  const toApproach = geoAstar(map, start, approach, obstacles);
  if (!toApproach) return null;

  const enter = [...toApproach, { x: shelfCell.x, y: shelfCell.y }];
  const reverse = [
    { x: shelfCell.x, y: shelfCell.y },
    { x: approach.x, y: approach.y },
  ];

  return {
    path: enter.concat(reverse.slice(1)),
    exitPos: approach,
  };
}
