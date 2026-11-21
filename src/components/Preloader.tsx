import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Theatre curtain preloader.
 *
 * Two velvet panels hold the stage while the wordmark settles, then part
 * vertically to reveal the portfolio. Scroll is locked for the duration so the
 * pinned showcases below always measure from the true top of the document.
 */
export const Preloader: React.FC = () => {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    // Freeze the stage while the curtains are closed.
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Swallow user scroll gestures so Lenis / native scrolling cannot drift
    // behind the closed curtain.
    const swallow = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const swallowKey = (event: KeyboardEvent) => {
      const keys = [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ];
      if (keys.includes(event.key)) swallow(event);
    };
    let guardsAttached = false;

    const attachGuards = () => {
      if (guardsAttached) return;
      guardsAttached = true;
      window.addEventListener('wheel', swallow, {
        passive: false,
        capture: true,
      });
      window.addEventListener('touchmove', swallow, {
        passive: false,
        capture: true,
      });
      window.addEventListener('keydown', swallowKey, { capture: true });
    };

    // MUST be called once the curtain starts to part — otherwise these
    // capture-phase guards live for the whole session and every wheel,
    // touch and arrow-key scroll is silently swallowed.
    const detachGuards = () => {
      if (!guardsAttached) return;
      guardsAttached = false;
      window.removeEventListener('wheel', swallow, { capture: true });
      window.removeEventListener('touchmove', swallow, { capture: true });
      window.removeEventListener('keydown', swallowKey, { capture: true });
    };

    attachGuards();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      detachGuards();
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      // Always open on the hero — never inherit a browser-restored scroll offset.
      window.scrollTo(0, 0);
      setDone(true);
      // Pinned sections were mounted behind the curtain; re-measure now that
      // the real document height is scrollable again.
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
      });
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: finish,
    });

    tl.fromTo(
      contentRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.95, ease: 'power2.out' },
      0.12
    )
      .fromTo(
        ruleRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: reduced ? 0.2 : 1.25,
          ease: 'power2.inOut',
        },
        0.24
      )
      // A beat of stillness — the audience settles.
      .to({}, { duration: reduced ? 0.15 : 0.7 })
      .addLabel('open')
      // Hand control back to the visitor the moment the curtains part.
      .call(detachGuards, undefined, 'open')
      .to(
        contentRef.current,
        {
          opacity: 0,
          y: -14,
          duration: reduced ? 0.15 : 0.5,
          ease: 'power2.in',
        },
        'open'
      )
      .to(
        leftCurtainRef.current,
        {
          xPercent: -101,
          duration: reduced ? 0.3 : 1.3,
          ease: 'power4.inOut',
        },
        'open'
      )
      .to(
        rightCurtainRef.current,
        {
          xPercent: 101,
          duration: reduced ? 0.3 : 1.3,
          ease: 'power4.inOut',
        },
        'open'
      );

    return () => {
      tl.kill();
      detachGuards();
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#120203]"
      aria-label="Opening the archive"
    >
      {/* Left velvet curtain */}
      <div
        ref={leftCurtainRef}
        className="bg-crimson-canvas absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r border-[#C8A86B]/25 will-change-transform"
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#120203]/45 to-transparent" />
        <div className="absolute inset-y-0 left-6 w-[1px] bg-[#C8A86B]/10" />
        <div className="absolute inset-y-0 left-[32%] w-[1px] bg-[#120203]/25" />
        <div className="absolute inset-y-0 left-[66%] w-[1px] bg-[#120203]/20" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#120203]/55 to-transparent" />
      </div>

      {/* Right velvet curtain */}
      <div
        ref={rightCurtainRef}
        className="bg-crimson-canvas absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-[#C8A86B]/25 will-change-transform"
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#120203]/45 to-transparent" />
        <div className="absolute inset-y-0 right-6 w-[1px] bg-[#C8A86B]/10" />
        <div className="absolute inset-y-0 right-[32%] w-[1px] bg-[#120203]/25" />
        <div className="absolute inset-y-0 right-[66%] w-[1px] bg-[#120203]/20" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#120203]/55 to-transparent" />
      </div>

      {/* Centre wordmark */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        <div
          ref={contentRef}
          className="flex flex-col items-center text-center opacity-0"
        >
          <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.34em] text-[#C8A86B]">
            ATELIER — ARCHIVE &apos;26
          </span>

          <h1 className="mt-5 font-serif-editorial text-5xl sm:text-6xl md:text-7xl font-light leading-none tracking-[-0.02em] text-[#EFE5D1]">
            Roha <span className="italic font-normal text-[#C8A86B]">Shhab</span>
          </h1>

          <span
            ref={ruleRef}
            className="mt-7 block h-[1px] w-44 origin-center bg-[#C8A86B]/60"
            aria-hidden="true"
          />

          <span className="mt-6 text-[8px] sm:text-[9px] font-sans uppercase tracking-[0.3em] text-[#EFE5D1]/55">
            PREPARING THE STAGE
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
