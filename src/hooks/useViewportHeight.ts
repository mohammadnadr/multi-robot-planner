import { useEffect, useState } from 'react';

/** Stable mobile height using visualViewport when available (avoids URL bar jump). */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );

  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      setHeight(vv ? vv.height : window.innerHeight);
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return height;
}