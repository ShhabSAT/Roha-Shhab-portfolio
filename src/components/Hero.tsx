import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_INFO } from '../data/portfolioData';
import { BaroqueCorner } from './BaroqueOrnaments';
import { smoothScrollTo } from './SmoothScroll';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const nameLineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const roleTitleRef = useRef<HTMLDivElement>(null);
  const ghostRoleRef = useRef<HTMLDivElement>(null);

  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roles = SITE_INFO.roles;

  // Kinetic Role Switcher Animation
  const animateRoleSwitch = (newIndex: number) => {
    if (!roleTitleRef.current || !ghostRoleRef.current) {
      setActiveRoleIndex(newIndex);
      return;
    }

    const currentTitle = roleTitleRef.current;
    const currentGhost = ghostRoleRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveRoleIndex(newIndex);
      },
    });

    // Animate out current title and ghost
    tl.to(currentTitle, {
      y: -36,
      opacity: 0,
      duration: 0.32,
      ease: 'power3.in',
    })
      .to(
        currentGhost,
        {
          x: -40,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        '<0.05'
      );
  };

  // Switch role and reset auto-timer
  const handleSelectRole = (index: number) => {
    if (index === activeRoleIndex) return;
    if (timerRef.current) clearInterval(timerRef.current);
    animateRoleSwitch(index);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveRoleIndex((prev) => {
        const next = (prev + 1) % roles.length;
        animateRoleSwitch(next);
        return prev; // Let onComplete update the state
      });
    }, 3400);
  };

  // Animate in new role when index changes
  useEffect(() => {
    if (!roleTitleRef.current || !ghostRoleRef.current) return;

    gsap.fromTo(
      roleTitleRef.current,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    );

    gsap.fromTo(
      ghostRoleRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }
    );
  }, [activeRoleIndex]);

  // Initial Hero Entrance & Parallax
  useEffect(() => {
    startTimer();

    const ctx = gsap.context(() => {
      // Monumental Display Name & micro-labels reveal
      gsap.from(nameLineRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
      });

      if (subtextRef.current) {
        gsap.from(subtextRef.current.children, {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.5,
        });
      }

      // Graceful Scroll Exit: typography recedes while the museum painting
      // pushes through with cinematic depth as ClientMarquee glides over it.
      if (
        backdropRef.current &&
        heroRef.current &&
        contentRef.current &&
        bottomBarRef.current
      ) {
        const exitTl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        exitTl
          .to(
            [contentRef.current, bottomBarRef.current],
            { y: -48, opacity: 0.25 },
            0
          )
          .to(
            backdropRef.current,
            { yPercent: 10, scale: 1.07, transformOrigin: '50% 50%' },
            0
          );
      }
    }, heroRef);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ctx.revert();
    };
  }, []);

  const formattedRoleNum = `0${activeRoleIndex + 1}`;

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full bg-crimson-canvas overflow-hidden flex flex-col justify-end md:justify-between pt-28 pb-12 px-6 md:px-14 select-none"
    >
      {/* Art-Directed Museum Painting Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Layer A — The Classical Painting, colour grade already baked into the WebP.
            Gently offset to the right on desktop so the figure balances the
            left-aligned wordmark; the crimson scrim below hides the left edge. */}
        <img
          src="/media/hero-muse.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[72%_18%] md:object-[72%_26%] md:translate-x-[7%] opacity-80 select-none"
        />

        {/* Layer B — Editorial Readability & Candlelight Vignette (desktop) */}
        <div
          className="hidden md:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #1E0405 0%, #1E0405 14%, rgba(36, 5, 6, 0.94) 42%, rgba(45, 6, 8, 0.42) 70%, rgba(24, 3, 4, 0.58) 100%)',
          }}
        />
        <div
          className="hidden md:block absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(24, 3, 4, 0.72) 0%, transparent 25%, transparent 72%, #1C0405 100%)',
          }}
        />
        {/* Mobile warm crimson wash — grades the classical sky into the velvet
            palette so the cover reads as one image, never a blue void. */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(40, 6, 8, 0.46) 0%, rgba(36, 5, 7, 0.32) 38%, rgba(30, 4, 5, 0.52) 72%, rgba(28, 4, 5, 0.78) 100%)',
          }}
        />
        {/* Mobile-only bottom-up crimson vignette keeps the type razor sharp
            while letting the classical painting read as a magazine cover. */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(28, 4, 5, 0.45) 0%, rgba(28, 4, 5, 0.28) 38%, rgba(26, 4, 5, 0.88) 72%, #1C0405 100%)',
          }}
        />
      </div>

      {/* Architectural Baroque Framing: Antique-Gold Corner Flourishes */}
      <BaroqueCorner
        corner="tl"
        tone="gold"
        className="hidden md:block absolute top-6 left-6 md:top-8 md:left-10 opacity-55 z-10"
      />
      <BaroqueCorner
        corner="br"
        tone="gold"
        className="absolute bottom-6 right-6 md:bottom-8 md:right-10 opacity-55 z-10"
      />

      {/* Main Content Area */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-none md:flex-1 flex-col justify-center my-0 md:my-auto py-4 md:py-8"
      >
        {/* Top Micro-label Row */}
        <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-[#C8A86B] mb-6 md:mb-8">
          <span>PORTFOLIO — ARCHIVE '26</span>
          <span className="hidden sm:inline-block w-8 h-[1px] bg-[#C8A86B]/40" />
          <span className="hidden sm:inline text-[#EFE5D1]/70">NARRATIVE &amp; MEDIA</span>
        </div>

        {/* Monumental Display Name */}
        <h1
          ref={nameLineRef}
          className="font-serif-editorial font-light text-[15vw] md:text-[10.5vw] leading-[0.88] tracking-[-0.03em] text-[#EFE5D1] mb-4 md:mb-6"
        >
          Roha <span className="italic font-normal text-[#C8A86B]">Shhab</span>
        </h1>

        {/* Kinetic Role Switcher & Sub-copy */}
        <div ref={subtextRef} className="flex flex-col space-y-4 md:space-y-6">
          {/* Kinetic Switcher Box with generous breathing room (no top clipping) */}
          <div className="relative py-6 min-h-[68px] md:min-h-[80px] flex items-center">
            <div className="relative w-full">
              {/* Ghost Word — anchored to the role baseline and masked before the painting */}
              <div
                className="absolute bottom-0 left-0 w-full max-w-xl overflow-hidden pointer-events-none select-none"
                style={{
                  maskImage:
                    'linear-gradient(90deg, black 0%, black 65%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(90deg, black 0%, black 65%, transparent 100%)',
                }}
                aria-hidden="true"
              >
                <div
                  ref={ghostRoleRef}
                  className="font-serif-editorial italic text-3xl sm:text-5xl text-[#EFE5D1]/[0.07] leading-[0.82] whitespace-nowrap will-change-transform"
                >
                  {roles[activeRoleIndex]}
                </div>
              </div>

              {/* Foreground Active Role Title in masked overflow */}
              <div className="relative z-10 overflow-hidden py-1 w-full">
                <div
                  ref={roleTitleRef}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] sm:text-base md:text-2xl font-sans font-light tracking-[0.12em] sm:tracking-[0.16em] uppercase text-[#EFE5D1]"
                >
                  <span className="text-[#C8A86B] font-medium text-[11px] md:text-sm tracking-[0.2em]">
                    {formattedRoleNum} /
                  </span>
                  <span className="break-words">{roles[activeRoleIndex]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Role Dots / Pills */}
          <div className="flex items-center gap-3 pt-0">
            {roles.map((role, idx) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelectRole(idx)}
                aria-label={`Select role: ${role}`}
                className={`group flex items-center gap-2 py-1 transition-all duration-300 ${
                  idx === activeRoleIndex ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
              >
                <span
                  className={`h-[2px] transition-all duration-300 ${
                    idx === activeRoleIndex
                      ? 'w-8 bg-[#C8A86B]'
                      : 'w-3 bg-[#EFE5D1]/50 group-hover:bg-[#EFE5D1]'
                  }`}
                />
                <span className="text-[9px] font-sans tracking-[0.2em] text-[#EFE5D1]">
                  0{idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Concise Editorial Sub-copy */}
          <p className="max-w-xl text-sm md:text-base font-sans font-light leading-relaxed text-[#EFE5D1]/80 pt-2">
            {SITE_INFO.tagline}
          </p>
        </div>
      </div>

      {/* Bottom Hero Bar */}
      <div
        ref={bottomBarRef}
        className="relative z-10 w-full max-w-7xl mx-auto border-t border-[#C8A86B]/20 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-[#EFE5D1]/70"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#C8A86B]">◆</span>
          <span className="leading-relaxed">CARTOON • THEATRE • HISTORICAL • VISUAL MEDIA</span>
        </div>

        <a
          href="#showcase"
          onClick={(event) => {
            event.preventDefault();
            smoothScrollTo('#showcase');
          }}
          className="flex items-center gap-3 group text-[#EFE5D1]/70 hover:text-[#C8A86B] transition-colors"
        >
          <span>SCROLL TO EXPLORE</span>
          <span className="inline-flex flex-col items-center justify-center w-3 h-5">
            <span className="w-[1px] h-4 bg-gradient-to-b from-[#C8A86B] to-transparent animate-pulse" />
          </span>
        </a>
      </div>
    </section>
  );
};

export default Hero;
