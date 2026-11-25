import { manhattan } from '../map/obstacles';
import type { GridMap, Point, Task } from '../types';
import { geoAstar } from './geoAstar';
import { pathTime } from './pathTime';
import type { ShelfPool } from './shelfPool';
import { pathToShelfAndBack } from './shelfPath';

/** Timed cost: best shelf approach + delivery leg (no multi-robot waits). */
export function estimatePickLegCost(
  map: GridMap,
  from: Point,
  task: Task,
  obstacles: Set<string>,
): number {
  if (!task.pick) {
    return 1e9;
  }
  const seg = pathToShelfAndBack(map, from, task.pick, obstacles);
  if (!seg) {
    return (
      1e6 +
      manhattan(from, task.pick) +
      manhattan(task.pick, task.deliv)
    );
  }
  const pickTime = pathTime(seg.path).time;
  const toDel = geoAstar(map, seg.exitPos, task.deliv, obstacles);
  if (!toDel) {
    return pickTime + manhattan(seg.exitPos, task.deliv);
  }
  return pickTime + pathTime(toDel).time;
}

export function estimateFlexiblePickCost(
  map: GridMap,
  from: Point,
  task: Task,
  pool: ShelfPool,
  obstacles: Set<string>,
): number {
  if (task.pick) {
    return estimatePickLegCost(map, from, task, obstacles);
  }
  const shelves = pool[task.type] ?? [];
  if (!shelves.length) return 1e9;
  let best = Infinity;
  for (const shelf of shelves) {
    const withPick: Task = { ...task, pick: shelf };
    const c = estimatePickLegCost(map, from, withPick, obstacles);
    if (c < best) best = c;
  }
  return best;
}

export function estimateTaskCost(
  map: GridMap,
  robotPos: Point,
  task: Task,
  loadSoFar: number,
  obstacles: Set<string>,
  pool?: ShelfPool,
): number {
  const leg = task.pick
    ? estimatePickLegCost(map, robotPos, task, obstacles)
    : pool
      ? estimateFlexiblePickCost(map, robotPos, task, pool, obstacles)
      : 1e9;
  return loadSoFar + leg;
}