import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type Props = {
  text: string;
  ariaLabel?: string;
  /** Prefer tooltip above (sidebar) or below (table headers). */
  placement?: 'up' | 'down';
};

type BubblePos = {
  top: number;
  left: number;
  placement: 'up' | 'down';
};

const GAP = 8;
const MAX_W = 220;

export function InfoTip({
  text,
  ariaLabel = 'More info',
  placement = 'up',
}: Props) {
  const tipId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<BubblePos | null>(null);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let place: 'up' | 'down' = placement;
    const spaceAbove = r.top;
    const spaceBelow = vh - r.bottom;
    if (placement === 'up' && spaceAbove < 72 && spaceBelow > spaceAbove) {
      place = 'down';
    } else if (placement === 'down' && spaceBelow < 72 && spaceAbove > spaceBelow) {
      place = 'up';
    }

    const bubbleH = bubbleRef.current?.offsetHeight ?? 80;
    const bubbleW = Math.min(
      MAX_W,
      bubbleRef.current?.offsetWidth ?? MAX_W,
    );

    let top =
      place === 'up' ? r.top - GAP - bubbleH : r.bottom + GAP;
    // Clamp vertically into viewport
    top = Math.max(8, Math.min(top, vh - bubbleH - 8));

    // Prefer aligning to icon center, clamp horizontally
    let left = r.left + r.width / 2 - bubbleW / 2;
    left = Math.max(8, Math.min(left, vw - bubbleW - 8));

    setPos({ top, left, placement: place });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    // Second pass after bubble mounts (measure real size)
    const id = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(id);
  }, [open, updatePosition, text]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePosition]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <>
      <span
        ref={anchorRef}
        className={`info-tip info-tip--${placement}${open ? ' info-tip--open' : ''}`}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span className="info-tip__glyph" aria-hidden="true">
          i
        </span>
      </span>
      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            id={tipId}
            role="tooltip"
            className={`info-tip__portal info-tip__portal--${pos?.placement ?? placement}`}
            style={
              pos
                ? {
                    top: pos.top,
                    left: pos.left,
                    opacity: 1,
                    visibility: 'visible',
                  }
                : { opacity: 0, visibility: 'hidden' }
            }
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}
