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

/**
 * Resolve spatial conflicts by inserting waits on lower-priority robots.
 * Robot index 0 = highest priority. Shared corridors/cells are allowed;
 * only same (x,y,t) is forbidden.
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

  while (changed && guard < 2000) {
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
          if (occupied.has(cell)) {
            // Lower priority brakes: insert a wait before this step
            const waitPoint: TimedPoint = {
              x: k > 0 ? low[k - 1].x : low[k].x,
              y: k > 0 ? low[k - 1].y : low[k].y,
              t: low[k].t,
              wait: true,
            };
            // Shift all times from k onward by +1
            for (let m = k; m < low.length; m++) {
              low[m].t++;
            }
            low.splice(k, 0, waitPoint);
            waitSteps++;
            changed = true;
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
