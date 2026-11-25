/**
 * Manual run: npx tsx src/planning/conflictResolve.swap.test.ts
 * Meet-in-middle corridor: robots would swap on edge (1,0)↔(2,0) without edge checks.
 */
import assert from 'node:assert/strict';
import type { Point } from '../types';
import { addWaits } from './conflictResolve';

const pathEast: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
];
const pathWest: Point[] = [
  { x: 3, y: 0 },
  { x: 2, y: 0 },
  { x: 1, y: 0 },
];

const result = addWaits([pathEast, pathWest]);
const high = result.paths[0]!;
const low = result.paths[1]!;

assert.ok(result.waitSteps < 50, 'conflicts should resolve with few waits');
assert.ok(result.waitSteps > 0, 'lower-priority robot should wait on head-on traffic');

function snapshot(path: { x: number; y: number; t: number }[], t: number) {
  const p = path.find((q) => q.t === t);
  return p ? `${p.x},${p.y}` : 'missing';
}

for (let t = 0; t <= result.makespan; t++) {
  const a = snapshot(high, t);
  const b = snapshot(low, t);
  if (a !== 'missing' && b !== 'missing') {
    assert.notEqual(a, b, `robots share cell at t=${t}: ${a}`);
  }
}

for (let t = 0; t <= result.makespan; t++) {
  const hi = high.find((p) => p.t === t);
  const lo = low.find((p) => p.t === t);
  if (!hi || !lo) continue;
  const hiPrev = high.find((p) => p.t === t - 1);
  const loPrev = low.find((p) => p.t === t - 1);
  if (!hiPrev || !loPrev) continue;
  const swapped =
    hiPrev.x === lo.x &&
    hiPrev.y === lo.y &&
    hi.x === loPrev.x &&
    hi.y === loPrev.y;
  assert.equal(swapped, false, `head-on swap at t=${t}`);
}

console.log('swap conflict checks passed', {
  waitSteps: result.waitSteps,
  makespan: result.makespan,
});