import { useEffect, useRef } from 'react';
import { drawGrid } from '../canvas/drawGrid';
import type { GridMap, TimedPaths } from '../types';

type Props = {
  map: GridMap;
  size?: number;
  paths?: TimedPaths | null;
  frame?: number;
  showRobots?: boolean;
  onCellClick?: (x: number, y: number) => void;
  className?: string;
};

export function GridCanvas({
  map,
  size = 500,
  paths = null,
  frame = 0,
  showRobots = true,
  onCellClick,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, map, size, { paths, frame, showRobots });
  }, [map, size, paths, frame, showRobots]);

  const cell = Math.floor(size / Math.max(map.width, map.height));

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={className ?? 'grid-canvas'}
      style={{ maxWidth: '100%', height: 'auto', touchAction: 'manipulation' }}
      onClick={(e) => {
        if (!onCellClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = size / rect.width;
        const scaleY = size / rect.height;
        const localX = (e.clientX - rect.left) * scaleX;
        const localY = (e.clientY - rect.top) * scaleY;
        const x = Math.floor(localX / cell);
        const y = Math.floor(localY / cell);
        if (x < 0 || x >= map.width || y < 0 || y >= map.height) return;
        onCellClick(x, y);
      }}
    />
  );
}
