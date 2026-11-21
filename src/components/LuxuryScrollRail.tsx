import React, { useEffect, useRef } from 'react';
import { scrollToY } from './SmoothScroll';

interface LuxuryScrollRailProps {
  hidden?: boolean;
}

/**
 * Bespoke antique-gold scroll rail.
 *
 * All scroll-driven measurements are written straight to the DOM through refs
 * inside a single requestAnimationFrame, so scrolling never triggers a React
 * render. The rail itself is a scrubbable fast-scroll surface for mouse, pen
 * and touch, with keyboard support for accessibility.
 */
export const LuxuryScrollRail: React.FC<LuxuryScrollRailProps> = ({
  hidden = false,
}) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const lastAriaRef = useRef(-1);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const rail = railRef.current;
      const thumb = thumbRef.current;
      if (!rail || !thumb) return;

      const doc = document.documentElement;
      const railHeight = rail.clientHeight;
      if (railHeight <= 0) return;

      const pageHeight = Math.max(doc.scrollHeight, window.innerHeight);
      const maxScroll = Math.max(0, pageHeight - window.innerHeight);
      const progress =
        maxScroll > 0
          ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
          : 0;

      const thumbHeight = Math.min(
        railHeight,
        Math.max(42, railHeight * (window.innerHeight / pageHeight))
      );
      const travel = Math.max(0, railHeight - thumbHeight);

      thumb.style.height = `${thumbHeight.toFixed(1)}px`;
      thumb.style.transform = `translate3d(0, ${(progress * travel).toFixed(
        2
      )}px, 0)`;

      const ariaValue = Math.round(progress * 100);
      if (ariaValue !== lastAriaRef.current) {
        lastAriaRef.current = ariaValue;
        rail.setAttribute('aria-valuenow', String(ariaValue));
      }
    };

    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule);
      observer.observe(document.body);
    }

    document.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  const scrubTo = (clientY: number) => {
    const rail = railRef.current;
    if (!rail) return;

    const rect = rail.getBoundingClientRect();
    if (rect.height <= 0) return;

    const ratio = Math.min(
      1,
      Math.max(0, (clientY - rect.top) / rect.height)
    );
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    scrollToY(ratio * maxScroll);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (hidden) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    scrubTo(event.clientY);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrubTo(event.clientY);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const pageStep = window.innerHeight * 0.85;
    const lineStep = 72;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      scrollToY(window.scrollY + lineStep, true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      scrollToY(window.scrollY - lineStep, true);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      scrollToY(window.scrollY + pageStep, true);
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      scrollToY(window.scrollY - pageStep, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollToY(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollToY(
        document.documentElement.scrollHeight - window.innerHeight,
        true
      );
    }
  };

  return (
    <div
      ref={railRef}
      role="scrollbar"
      aria-label="Page scroll position"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={hidden ? -1 : 0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      className={`fixed right-2 md:right-3 top-24 bottom-8 w-3 z-[150] flex justify-center touch-none outline-none transition-opacity duration-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#C8A86B]/60 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="relative h-full w-px bg-[#C8A86B]/20">
        <div
          ref={thumbRef}
          className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 bg-[#C8A86B] hover:w-[5px] transition-[width] duration-300 shadow-[0_0_7px_rgba(200,168,107,0.35)] will-change-transform"
        />
      </div>
    </div>
  );
};

export default LuxuryScrollRail;
