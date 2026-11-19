import { DIRS } from '../constants';
import { key, manhattan } from '../map/obstacles';
import type { GridMap, Point } from '../types';

type Node = Point & { g: number; f: number; parent: Node | null };

/** Geometric A* ignoring time. Obstacles blocked unless they are the goal. */
export function geoAstar(
  map: GridMap,
  start: Point,
  goal: Point,
  obstacles: Set<string>,
): Point[] | null {
  const open: Node[] = [
    {
      x: start.x,
      y: start.y,
      g: 0,
      f: manhattan(start, goal),
      parent: null,
    },
  ];
  const closed = new Set<string>();
  const gmap = new Map<string, number>();
  gmap.set(key(start.x, start.y), 0);

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const ck = key(cur.x, cur.y);
    if (closed.has(ck)) continue;
    closed.add(ck);

    if (cur.x === goal.x && cur.y === goal.y) {
      const path: Point[] = [];
      let n: Node | null = cur;
      while (n) {
        path.push({ x: n.x, y: n.y });
        n = n.parent;
      }
      return path.reverse();
    }

    for (const [dx, dy] of DIRS) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) continue;
      const nk = key(nx, ny);
      if (obstacles.has(nk) && !(nx === goal.x && ny === goal.y)) continue;
      const ng = cur.g + 1;
      if (gmap.has(nk) && ng >= gmap.get(nk)!) continue;
      gmap.set(nk, ng);
      open.push({
        x: nx,
        y: ny,
        g: ng,
        f: ng + manhattan({ x: nx, y: ny }, goal),
        parent: cur,
      });
    }
  }

  return null;
}
