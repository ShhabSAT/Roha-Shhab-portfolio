import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type CursorMode = 'default' | 'pointer' | 'view';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const modeRef = useRef<CursorMode>('default');

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    setEnabled(true);

    const pos = {
      x: -200,
      y: -200,
      ringX: -200,
      ringY: -200,
      initialized: false,
    };
    let rafId = 0;
    let lastTime = performance.now();
    let lastModeCheck = 0;

    const applyMode = (next: CursorMode) => {
      if (modeRef.current === next) return;
      modeRef.current = next;
      setMode(next);
    };

    const resolveMode = (el: Element | null): CursorMode => {
      if (!el) return 'default';
      if (el.closest('[data-cursor="view"]')) return 'view';
      if (
        el.closest(
          'a, button, [role="button"], input, textarea, select, label, summary'
        )
      ) {
        return 'pointer';
      }
      return 'default';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;

      pos.x = e.clientX;
      pos.y = e.clientY;

      if (!pos.initialized) {
        pos.ringX = e.clientX;
        pos.ringY = e.clientY;
        pos.initialized = true;
        setVisible(true);
        document.documentElement.classList.add('custom-cursor-active');
      }

      applyMode(resolveMode(e.target as Element | null));
    };

    // Hide the whole custom cursor whenever the pointer leaves the document,
    // the window loses focus, or the tab is backgrounded. This prevents a
    // stale gold dot from "sticking" on screen after alt-tab or edge exits.
    const hideCursor = () => {
      setVisible(false);
      pos.initialized = false;
      document.documentElement.classList.remove('custom-cursor-active');
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hideCursor();
    };

    const onWindowBlur = () => hideCursor();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') hideCursor();
    };

    const render = (time: number) => {
      const dt = Math.min(Math.max((time - lastTime) / 1000, 0), 0.05);
      lastTime = time;

      // Frame-rate independent trailing ring
      const ease = 1 - Math.pow(1 - 0.18, dt * 60);

      if (pos.initialized) {
        pos.ringX += (pos.x - pos.ringX) * ease;
        pos.ringY += (pos.y - pos.ringY) * ease;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.ringX}px, ${pos.ringY}px, 0) translate(-50%, -50%)`;
      }

      // Re-resolve the hovered element a few times per second. This catches
      // asynchronously-added states such as the WebGL stage's data-cursor="view"
      // without requiring the user to keep moving the mouse.
      if (pos.initialized && time - lastModeCheck > 90) {
        lastModeCheck = time;
        applyMode(
          resolveMode(document.elementFromPoint(pos.x, pos.y))
        );
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  if (!enabled || typeof document === 'undefined') return null;

  const isView = mode === 'view';
  const isPointer = mode === 'pointer';

  return createPortal(
    <>
      {/* Sharp Antique Gold Center Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 99999,
          pointerEvents: 'none',
          transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%)',
          willChange: 'transform',
          opacity: visible && !isView ? 1 : 0,
          transition: 'opacity 180ms ease, width 180ms ease, height 180ms ease',
        }}
        className={`rounded-full bg-[#C8A86B] ${
          isPointer ? 'w-1.5 h-1.5' : 'w-2 h-2'
        }`}
      />

      {/* Smooth Trailing Editorial Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 99998,
          pointerEvents: 'none',
          transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%)',
          willChange: 'transform',
          opacity: visible ? 1 : 0,
          transition:
            'opacity 200ms ease, width 260ms cubic-bezier(0.22,1,0.36,1), height 260ms cubic-bezier(0.22,1,0.36,1), background-color 220ms ease, border-color 220ms ease',
        }}
        className={`rounded-full flex items-center justify-center border ${
          isView
            ? 'w-20 h-20 border-[#C8A86B] bg-[#1B0405]/75'
            : isPointer
              ? 'w-12 h-12 border-[#C8A86B] bg-[#C8A86B]/10'
              : 'w-9 h-9 border-[#C8A86B]/60 bg-transparent'
        }`}
      >
        {isView && (
          <span className="text-[9px] tracking-[0.26em] uppercase text-[#EFE5D1] font-medium">
            VIEW
          </span>
        )}
      </div>
    </>,
    document.body
  );
};

export default CustomCursor;
