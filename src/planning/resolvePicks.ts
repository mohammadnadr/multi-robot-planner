import type { Assignment, GridMap, Point, ResolvedTask, Robot, ShelfType, Task } from '../types';
import { estimatePickLegCost } from './pickCost';
import { pathToShelfAndBack } from './shelfPath';
import {
  buildShelfPool,
  cloneShelfPool,
  removeShelfFromPool,
  type ShelfPool,
} from './shelfPool';
import { pathTime } from './pathTime';

export type { ShelfPool } from './shelfPool';
export { buildShelfPool, cloneShelfPool } from './shelfPool';

function removeShelf(pool: ShelfPool, shelf: Point): void {
  removeShelfFromPool(pool, shelf);
}

/** Best unused shelf for a pick leg from `from` (timed). */
export function chooseBestShelf(
  map: GridMap,
  from: Point,
  type: ShelfType,
  pool: ShelfPool,
  obstacles: Set<string>,
): Point | null {
  const candidates = pool[type] ?? [];
  if (!candidates.length) return null;

  let bestShelf: Point | null = null;
  let bestTime = Infinity;
  let bestLen = Infinity;

  for (const shelf of candidates) {
    const seg = pathToShelfAndBack(map, from, shelf, obstacles);
    if (!seg) continue;
    const time = pathTime(seg.path).time;
    const len = seg.path.length;
    if (
      time < bestTime ||
      (time === bestTime && len < bestLen)
    ) {
      bestTime = time;
      bestLen = len;
      bestShelf = shelf;
    }
  }

  return bestShelf;
}

export function reserveBestShelf(
  map: GridMap,
  from: Point,
  type: ShelfType,
  pool: ShelfPool,
  obstacles: Set<string>,
): Point | null {
  const shelf = chooseBestShelf(map, from, type, pool, obstacles);
  if (!shelf) return null;
  removeShelf(pool, shelf);
  return shelf;
}

/** Nearest-neighbor task order using flexible shelf costs (pool preview only). */
export function orderTasksNearestNeighbor(
  map: GridMap,
  start: Point,
  tasks: Task[],
  poolSnapshot: ShelfPool,
  obstacles: Set<string>,
): Task[] {
  const remaining = [...tasks];
  const ordered: Task[] = [];
  let pos = { ...start };
  const preview = cloneShelfPool(poolSnapshot);

  while (remaining.length > 0) {
    let bestI = 0;
    let bestC = Infinity;
    let bestShelf: Point | null = null;

    for (let i = 0; i < remaining.length; i++) {
      const task = remaining[i];
      const shelves = preview[task.type] ?? [];
      if (!shelves.length) continue;

      for (const shelf of shelves) {
        const withPick: Task = { ...task, pick: shelf };
        const c = estimatePickLegCost(map, pos, withPick, obstacles);
        if (c < bestC) {
          bestC = c;
          bestI = i;
          bestShelf = shelf;
        }
      }
    }

    if (bestC >= 1e9 || !bestShelf) return ordered;

    const task = remaining.splice(bestI, 1)[0];
    ordered.push(task);
    removeShelf(preview, bestShelf);
    pos = { ...task.deliv };
  }

  return ordered;
}

export function resolveRobotTasks(
  map: GridMap,
  robot: Robot,
  tasks: Task[],
  pool: ShelfPool,
  obstacles: Set<string>,
): ResolvedTask[] | null {
  if (!tasks.length) return [];

  const ordered = orderTasksNearestNeighbor(
    map,
    robot,
    tasks,
    pool,
    obstacles,
  );
  if (ordered.length !== tasks.length) return null;

  const resolved: ResolvedTask[] = [];
  let pos: Point = { x: robot.x, y: robot.y };

  for (const task of ordered) {
    if (task.pick) {
      if (
        !pool[task.type]?.some(
          (p) => p.x === task.pick!.x && p.y === task.pick!.y,
        )
      ) {
        return null;
      }
      removeShelf(pool, task.pick);
      resolved.push({ ...task, pick: task.pick });
      const seg = pathToShelfAndBack(map, pos, task.pick, obstacles);
      if (!seg) return null;
      pos = { ...task.deliv };
      continue;
    }

    const shelf = reserveBestShelf(map, pos, task.type, pool, obstacles);
    if (!shelf) return null;

    resolved.push({ ...task, pick: shelf });

    const seg = pathToShelfAndBack(map, pos, shelf, obstacles);
    if (!seg) return null;
    pos = { ...task.deliv };
  }

  return resolved;
}

export function resolveAssignment(
  map: GridMap,
  robots: Robot[],
  assignment: Assignment,
  obstacles: Set<string>,
): ResolvedTask[][] | null {
  const pool = buildShelfPool(map);
  const resolved: ResolvedTask[][] = [];

  for (let i = 0; i < robots.length; i++) {
    const tasks = assignment[i] ?? [];
    const robotTasks = resolveRobotTasks(
      map,
      robots[i],
      tasks,
      pool,
      obstacles,
    );
    if (robotTasks === null) return null;
    resolved.push(robotTasks);
  }

  return resolved;
}