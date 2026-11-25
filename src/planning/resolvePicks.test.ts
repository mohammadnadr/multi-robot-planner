/**
 * Manual run: npx tsx src/planning/resolvePicks.test.ts
 */
import assert from 'node:assert/strict';
import type { CellType, GridMap, Task } from '../types';
import { getObstacleSet } from '../map/obstacles';
import { buildShelfPool } from './shelfPool';
import { resolveRobotTasks } from './resolvePicks';

function grid(
  width: number,
  height: number,
  shelves: { x: number; y: number; v: CellType }[],
): GridMap {
  const cells: CellType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0 as CellType),
  );
  for (const s of shelves) {
    cells[s.y][s.x] = s.v;
  }
  const robot = { id: 0, x: 0, y: 12 };
  return {
    width,
    height,
    cells,
    robots: [robot],
    delivery: { x: 9, y: 17 },
  };
}

const cShelves: { x: number; y: number; v: CellType }[] = [];
for (let y = 10; y <= 14; y++) {
  cShelves.push({ x: 11, y, v: 3 });
}
const map = grid(20, 20, cShelves);
const obstacles = getObstacleSet(map);

const twoC: Task[] = [
  { id: 'C0', type: 'C', deliv: map.delivery! },
  { id: 'C1', type: 'C', deliv: map.delivery! },
];

const pool = buildShelfPool(map);
const resolved = resolveRobotTasks(
  map,
  map.robots[0],
  twoC,
  pool,
  obstacles,
);
assert.ok(resolved);
assert.equal(resolved.length, 2);

const picks = resolved.map((t) => t.pick.y).sort((a, b) => b - a);
assert.equal(picks[0], 14, 'first pick should be lowest shelf row toward delivery');
assert.deepEqual(
  new Set(picks),
  new Set(picks),
  'distinct shelves',
);
assert.notEqual(picks[0], picks[1]);

const pool2 = buildShelfPool(map);
const t1: Task[] = [{ id: 'C0', type: 'C', deliv: map.delivery! }];
const t2: Task[] = [{ id: 'C1', type: 'C', deliv: map.delivery! }];
const r1 = resolveRobotTasks(map, map.robots[0], t1, pool2, obstacles);
const r2 = resolveRobotTasks(
  map,
  { id: 1, x: 0, y: 8 },
  t2,
  pool2,
  obstacles,
);
assert.ok(r1 && r2);
assert.ok(
  r1[0].pick.x !== r2[0].pick.x || r1[0].pick.y !== r2[0].pick.y,
  'two robots should not pick the same shelf',
);

console.log('resolvePicks.test.ts: ok');