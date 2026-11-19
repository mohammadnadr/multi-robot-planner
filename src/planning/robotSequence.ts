import type { GridMap, Point, Task } from '../types';
import { geoAstar } from './geoAstar';
import { pathToShelfAndBack } from './shelfPath';

/** Full sequence: for each task pick (with reverse) → deliver → finally home. */
export function buildRobotSequence(
  map: GridMap,
  start: Point,
  tasks: Task[],
  obstacles: Set<string>,
): Point[] | null {
  let pos = { ...start };
  const full: Point[] = [];

  for (const task of tasks) {
    const seg = pathToShelfAndBack(map, pos, task.pick, obstacles);
    if (!seg) return null;
    full.push(...seg.path);
    pos = { ...seg.exitPos };

    const toDel = geoAstar(map, pos, task.deliv, obstacles);
    if (!toDel) return null;
    full.push(...toDel.slice(1));
    pos = { ...task.deliv };
  }

  if (pos.x !== start.x || pos.y !== start.y) {
    const home = geoAstar(map, pos, start, obstacles);
    if (home) full.push(...home.slice(1));
  }

  return dedupeConsecutive(full);
}

function dedupeConsecutive(path: Point[]): Point[] {
  const clean: Point[] = [];
  for (const p of path) {
    const last = clean[clean.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) clean.push(p);
  }
  return clean;
}
