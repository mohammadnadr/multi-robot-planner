import type { Point, TimedPoint, TimedPaths } from '../types';
import { expandPathWithAccel, pathTime } from './pathTime';

export type ResolveResult = {
  paths: TimedPaths;
  makespan: number;
  waitSteps: number;
  accelPenalty: number;
  perRobotWaits: number[];
  perRobotAccel: number[];
  perRobotFinish: number[];
};

function atTime(path: TimedPoint[], time: number): TimedPoint | undefined {
  return path.find((p) => p.t === time);
}

/** Insert before step k; walk back if stalling would share high's cell at t. */
function waitIndexAvoidingHigh(
  high: TimedPoint[],
  low: TimedPoint[],
  k: number,
): number {
  let waitIndex = k;
  const conflictTime = low[k].t;

  while (waitIndex > 0) {
    const stall = low[waitIndex - 1];
    const highAt = atTime(high, conflictTime);
    if (!highAt || stall.x !== highAt.x || stall.y !== highAt.y) {
      return waitIndex;
    }
    waitIndex--;
  }
  return 0;
}

function insertWaitBeforeStep(
  low: TimedPoint[],
  k: number,
  onInserted: () => void,
): void {
  const waitPoint: TimedPoint = {
    x: k > 0 ? low[k - 1].x : low[k].x,
    y: k > 0 ? low[k - 1].y : low[k].y,
    t: low[k].t,
    wait: true,
  };
  for (let m = k; m < low.length; m++) {
    low[m].t++;
  }
  low.splice(k, 0, waitPoint);
  onInserted();
}

/** Head-on swap: both robots exchange cells in one timestep (no shared vertex). */
function isSwapConflict(
  high: TimedPoint[],
  low: TimedPoint[],
  k: number,
): boolean {
  if (k <= 0) return false;
  const from = low[k - 1];
  const to = low[k];
  if (from.x === to.x && from.y === to.y) return false;

  const t = to.t;
  const highTo = atTime(high, t);
  const highFrom = atTime(high, t - 1);
  if (!highTo || !highFrom) return false;

  return (
    highFrom.x === to.x &&
    highFrom.y === to.y &&
    highTo.x === from.x &&
    highTo.y === from.y
  );
}

/**
 * Resolve spatial conflicts by inserting waits on lower-priority robots.
 * Robot index 0 = highest priority. Shared corridors/cells are allowed;
 * same (x,y,t) and head-on edge swaps are forbidden.
 */
export function addWaits(rawPaths: Point[][]): ResolveResult {
  const n = rawPaths.length;
  // Expand accel into dwell so timing reflects turn penalties
  const expanded = rawPaths.map((p) => expandPathWithAccel(p));
  const timed: TimedPoint[][] = expanded.map((path) =>
    path.map((p, i) => ({ x: p.x, y: p.y, t: i, wait: false })),
  );

  let changed = true;
  let guard = 0;
  let waitSteps = 0;

  const maxWaitSteps = Math.max(400, 80 * n * (rawPaths[0]?.length ?? 1));

  while (changed && guard < 2000 && waitSteps < maxWaitSteps) {
    changed = false;
    guard++;

    for (let hi = 0; hi < n; hi++) {
      for (let lo = hi + 1; lo < n; lo++) {
        const high = timed[hi];
        const low = timed[lo];
        const occupied = new Map<string, true>();
        for (const p of high) {
          occupied.set(`${p.x},${p.y},${p.t}`, true);
        }

        for (let k = 0; k < low.length; k++) {
          const cell = `${low[k].x},${low[k].y},${low[k].t}`;
          const vertexHit = occupied.has(cell);
          const swapHit = !vertexHit && isSwapConflict(high, low, k);

          if (vertexHit || swapHit) {
            const waitIndex = waitIndexAvoidingHigh(high, low, k);
            insertWaitBeforeStep(low, waitIndex, () => {
              waitSteps++;
              changed = true;
            });
            break;
          }
        }
        if (changed) break;
      }
      if (changed) break;
    }
  }

  const paths: TimedPaths = {};
  const perRobotWaits: number[] = [];
  const perRobotAccel: number[] = [];
  const perRobotFinish: number[] = [];
  let makespan = 0;
  let totalAccel = 0;

  for (let i = 0; i < n; i++) {
    paths[i] = timed[i];
    const waits = timed[i].filter((p) => p.wait).length;
    perRobotWaits.push(waits);
    const accel = pathTime(rawPaths[i]).accelPenalty;
    perRobotAccel.push(accel);
    totalAccel += accel;
    const finish = timed[i].length
      ? timed[i][timed[i].length - 1].t
      : 0;
    perRobotFinish.push(finish);
    makespan = Math.max(makespan, finish);
  }

  return {
    paths,
    makespan,
    waitSteps,
    accelPenalty: totalAccel,
    perRobotWaits,
    perRobotAccel,
    perRobotFinish,
  };
}