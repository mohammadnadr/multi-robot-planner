import { useEffect, useState } from 'react';

type Options = {
  max?: number;
  min?: number;
  /** Extra horizontal padding subtracted from viewport width */
  pad?: number;
};

export function useCanvasSize({
  max = 500,
  min = 260,
  pad = 32,
}: Options = {}): number {
  const [size, setSize] = useState(max);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const isStacked = w <= 900;
      const horizontalPad = isStacked ? pad : pad + 316;
      const available = w - horizontalPad;
      setSize(Math.max(min, Math.min(max, available)));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [max, min, pad]);

  return size;
}