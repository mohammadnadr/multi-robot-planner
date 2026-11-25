/**
 * Manual run: npx tsx src/planning/shelfPath.approach.test.ts
 */
import assert from 'node:assert/strict';
import type { CellType, GridMap } from '../types';
import { getObstacleSet } from '../map/obstacles';
import { pathToShelfAndBack } from './shelfPath';

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
  return {
    width,
    height,
    cells,
    robots: [{ id: 0, x: 0, y: 5 }],
    delivery: { x: 9, y: 9 },
  };
}

const map = grid(10, 10, [{ x: 5, y: 5, v: 3 }]);
const obstacles = getObstacleSet(map);
const start = { x: 0, y: 5 };
const shelf = { x: 5, y: 5 };

const seg = pathToShelfAndBack(map, start, shelf, obstacles);
assert.ok(seg, 'pick segment should exist');
assert.equal(
  seg.approach.x,
  4,
  'robot on the left should use west approach (x=4), not east',
);
assert.ok(seg.approach.y === 5, 'approach stays on same row as robot');

const segEast = pathToShelfAndBack(
  grid(10, 10, [{ x: 5, y: 5, v: 3 }]),
  { x: 9, y: 5 },
  shelf,
  getObstacleSet(grid(10, 10, [{ x: 5, y: 5, v: 3 }])),
);
assert.ok(segEast);
assert.equal(segEast.approach.x, 6, 'robot on the right should prefer east approach');

console.log('shelfPath.approach.test.ts: ok');