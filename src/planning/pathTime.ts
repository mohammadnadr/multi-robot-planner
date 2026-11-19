import { ACCEL_CELLS } from '../constants';
import type { Point } from '../types';

export type PathTimeBreakdown = {
  /** Total time = move steps + accel penalties (no waits). */
  time: number;
  moveSteps: number;
  accelPenalty: number;
};

/**
 * After every direction change, the next ACCEL_CELLS moves cost +1 each
 * (simplified acceleration recovery).
 */
export function pathTime(path: Point[]): PathTimeBreakdown {
  if (!path || path.length < 2) {
    return { time: path?.length ?? 0, moveSteps: 0, accelPenalty: 0 };
  }

  let time = 0;
  let accelPenalty = 0;
  let prevDir: string | null = null;
  let accelLeft = 0;
  let moveSteps = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    // Wait in place: still costs 1, no turn/accel
    if (dx === 0 && dy === 0) {
      time += 1;
      moveSteps += 1;
      continue;
    }

    const dir = dx === 0 ? (dy > 0 ? 'S' : 'N') : dx > 0 ? 'E' : 'W';
    if (prevDir && dir !== prevDir) {
      accelLeft = ACCEL_CELLS;
    }

    const extra = accelLeft > 0 ? 1 : 0;
    time += 1 + extra;
    accelPenalty += extra;
    moveSteps += 1;
    if (accelLeft > 0) accelLeft--;
    prevDir = dir;
  }

  return { time, moveSteps, accelPenalty };
}

/** Expand a geometric path into timed steps with accel cost as dwell. */
export function expandPathWithAccel(path: Point[]): Point[] {
  if (!path || path.length < 2) return path ? [...path] : [];

  const out: Point[] = [{ ...path[0] }];
  let prevDir: string | null = null;
  let accelLeft = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const dir = dx === 0 ? (dy > 0 ? 'S' : 'N') : dx > 0 ? 'E' : 'W';

    if (prevDir && dir !== prevDir) {
      accelLeft = ACCEL_CELLS;
    }

    // Move into next cell
    out.push({ ...path[i] });
    // Extra dwell after turn while recovering speed
    if (accelLeft > 0) {
      out.push({ ...path[i] }); // wait in place for accel cost
      accelLeft--;
    }
    prevDir = dir;
  }

  return out;
}
