import type { Point, TimedPoint } from '../types';
import type { Heading, PathAction } from './types';

const OPPOSITE: Record<Heading, Heading> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
};

const LEFT: Record<Heading, Heading> = {
  N: 'W',
  W: 'S',
  S: 'E',
  E: 'N',
};

const RIGHT: Record<Heading, Heading> = {
  N: 'E',
  E: 'S',
  S: 'W',
  W: 'N',
};

export function headingFromDelta(dx: number, dy: number): Heading | null {
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'E' : 'W';
  return dy > 0 ? 'S' : 'N';
}

export function isOpposite(a: Heading, b: Heading): boolean {
  return OPPOSITE[a] === b;
}

export function turnKind(
  from: Heading,
  to: Heading,
): 'turnL' | 'turnR' | 'reverse' | null {
  if (from === to) return null;
  if (isOpposite(from, to)) return 'reverse';
  if (LEFT[from] === to) return 'turnL';
  if (RIGHT[from] === to) return 'turnR';
  return 'reverse';
}

/** Convert a timed path into discrete motion actions with heading. */
export function pathToActions(path: TimedPoint[] | Point[]): PathAction[] {
  if (!path || path.length < 2) return [];

  const actions: PathAction[] = [];
  let heading: Heading | null = null;

  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1];
    const to = path[i];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const isWait =
      (dx === 0 && dy === 0) ||
      ('wait' in to && Boolean((to as TimedPoint).wait));

    if (isWait) {
      actions.push({
        kind: 'wait',
        heading,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
        wait: true,
      });
      continue;
    }

    const nextH = headingFromDelta(dx, dy);
    if (!nextH) continue;

    if (!heading) {
      actions.push({
        kind: 'straight',
        heading: nextH,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
      });
      heading = nextH;
      continue;
    }

    const turn = turnKind(heading, nextH);
    if (!turn) {
      actions.push({
        kind: 'straight',
        heading: nextH,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
      });
    } else if (turn === 'reverse') {
      actions.push({
        kind: 'reverse',
        heading: nextH,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
      });
      heading = nextH;
    } else {
      actions.push({
        kind: turn,
        heading: nextH,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
      });
      heading = nextH;
    }
  }

  return actions;
}

export function headingAtFrame(
  path: TimedPoint[] | Point[],
  frame: number,
): Heading {
  if (!path || path.length < 2) return 'E';
  const idx = Math.min(Math.max(frame, 1), path.length - 1);
  // Walk backward to find last real move
  for (let i = idx; i >= 1; i--) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const h = headingFromDelta(dx, dy);
    if (h) return h;
  }
  // Forward lookup
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const h = headingFromDelta(dx, dy);
    if (h) return h;
  }
  return 'E';
}
