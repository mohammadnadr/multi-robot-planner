import {
  CELL_COLORS,
  CELL_LABELS,
  DELIVERY_CELL,
  robotColor,
} from '../constants';
import { headingAtFrame } from '../cost/pathToActions';
import type { Heading } from '../cost/types';
import type { GridMap, TimedPaths } from '../types';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const HEADING_RAD: Record<Heading, number> = {
  E: 0,
  S: Math.PI / 2,
  W: Math.PI,
  N: -Math.PI / 2,
};

export type DrawOptions = {
  paths?: TimedPaths | null;
  frame?: number;
  showRobots?: boolean;
  cellSize?: number;
};

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  map: GridMap,
  canvasSize: number,
  options: DrawOptions = {},
) {
  const {
    paths = null,
    frame = 0,
    showRobots = true,
    cellSize: forcedCell,
  } = options;

  const cell =
    forcedCell ??
    Math.floor(canvasSize / Math.max(map.width, map.height));
  const w = map.width * cell;
  const h = map.height * cell;

  ctx.fillStyle = '#151720';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const v = map.cells[y][x];
      ctx.fillStyle = CELL_COLORS[v];
      roundRect(ctx, x * cell + 2, y * cell + 2, cell - 4, cell - 4, 6);
      ctx.fill();
      if (v) {
        ctx.fillStyle = v === DELIVERY_CELL ? '#111' : '#fff';
        ctx.font = `bold ${Math.max(10, cell * 0.32)}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(CELL_LABELS[v], x * cell + cell / 2, y * cell + cell / 2);
      }
    }
  }

  if (paths) {
    Object.keys(paths).forEach((ri) => {
      const path = paths[+ri];
      if (!path || path.length < 2) return;
      ctx.strokeStyle = robotColor(+ri);
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = Math.max(2, cell * 0.08);
      ctx.beginPath();
      path.forEach((p, i) => {
        const px = p.x * cell + cell / 2;
        const py = p.y * cell + cell / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    Object.keys(paths).forEach((ri) => {
      const path = paths[+ri];
      if (!path || !path.length) return;
      const idx = Math.min(frame, path.length - 1);
      const p = path[idx];
      const heading = headingAtFrame(path, idx);
      const waiting = path[idx]?.wait || (
        idx > 0 &&
        path[idx].x === path[idx - 1].x &&
        path[idx].y === path[idx - 1].y
      );
      drawRobotArrow(ctx, p.x, p.y, cell, +ri, heading, waiting);
    });
  } else if (showRobots) {
    map.robots.forEach((r, i) => {
      drawRobotArrow(ctx, r.x, r.y, cell, i, 'E', false);
    });
  }

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let i = 0; i <= map.width; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, h);
    ctx.stroke();
  }
  for (let i = 0; i <= map.height; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(w, i * cell);
    ctx.stroke();
  }
}

/** Triangle arrow pointing along heading; label is robot index. */
function drawRobotArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  index: number,
  heading: Heading,
  waiting: boolean,
) {
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;
  const size = Math.max(10, cell * 0.36);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(HEADING_RAD[heading]);
  if (waiting) ctx.globalAlpha = 0.65;

  ctx.beginPath();
  // Point forward (+x after rotate)
  ctx.moveTo(size * 0.55, 0);
  ctx.lineTo(-size * 0.45, size * 0.42);
  ctx.lineTo(-size * 0.2, 0);
  ctx.lineTo(-size * 0.45, -size * 0.42);
  ctx.closePath();
  ctx.fillStyle = robotColor(index);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(9, cell * 0.22)}px "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(index + 1), cx, cy);
}
