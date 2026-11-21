import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import type { ProjectItem } from '../data/portfolioData';
import { smoothScrollTo } from './SmoothScroll';

gsap.registerPlugin(ScrollTrigger);

interface HexagonDrumShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
}

const SIGNATURE_IDS = [
  'on-his-footsteps',
  'labeeb-almarai',
  'saud-sketches',
  'sherlock-musical',
  'baneen-banat',
  'maqam-growth-strategy',
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const TONE_BG: Record<NonNullable<ProjectItem['accentTone']>, string> = {
  crimson:
    'radial-gradient(circle at 28% 22%, #7D1B1A 0%, #480B0D 56%, #220405 100%)',
  terracotta:
    'radial-gradient(circle at 30% 25%, #963C21 0%, #52180D 56%, #240705 100%)',
  gold:
    'radial-gradient(circle at 28% 22%, #826230 0%, #452913 56%, #200D06 100%)',
  oxblood:
    'radial-gradient(circle at 28% 25%, #631220 0%, #360710 56%, #1B0307 100%)',
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const DrumCardFace: React.FC<{ project: ProjectItem; roman: string }> = ({
  project,
  roman,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(project.coverImage) && !imgFailed;

  if (showImage) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#220405]">
        <img
          src={project.coverImage}
          alt={project.title}
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#190304]/85 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#C8A86B]">
              {project.client}
            </p>
            <p className="font-serif-editorial text-lg text-[#EFE5D1] leading-tight">
              {project.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full p-5 md:p-6 flex flex-col justify-between overflow-hidden select-none"
      style={{ background: TONE_BG[project.accentTone ?? 'crimson'] }}
    >
      <div className="pointer-events-none absolute inset-2.5 border border-[#C8A86B]/40" />
      <div className="pointer-events-none absolute inset-4 border border-[#C8A86B]/15" />

      <span className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 font-serif-editorial italic text-[110px] leading-none text-[#EFE5D1]/[0.06]">
        {roman}
      </span>

      <div className="relative z-10 flex items-center justify-between text-[9px] tracking-[0.24em] uppercase text-[#D5B577]">
        <span>SIGNATURE {roman}</span>
        <span>{project.subTag}</span>
      </div>

      <div className="relative z-10 my-auto py-3">
        <div className="w-7 h-[1px] bg-[#C8A86B]/65 mb-3" />
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#EFE5D1]/70 mb-1.5">
          {project.client}
        </p>
        <h4 className="font-serif-editorial text-xl md:text-2xl leading-[1.12] text-[#F5ECE0] font-normal">
          {project.title}
        </h4>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[#C8A86B]/25 pt-2.5 text-[9px] tracking-[0.2em] uppercase text-[#EFE5D1]/70">
        <span>CLICK TO INSPECT</span>
        {project.metrics && (
          <span className="font-serif-editorial italic text-xs text-[#D5B577] normal-case tracking-normal">
            {project.metrics}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Mobile-only signature card. Rendered in a calm two-up editorial deck with no
 * pinning, no 3D transforms and no RAF loop.
 */
const MobileSignatureCard: React.FC<{
  project: ProjectItem;
  roman: string;
  onSelect: () => void;
}> = ({ project, roman, onSelect }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(project.coverImage) && !imgFailed;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-cursor="view"
      aria-label={`Inspect ${project.title}`}
      className="group text-left"
    >
      <div className="relative aspect-[3/4] overflow-hidden border border-[#C8A86B]/45 bg-[#220405] text-[#EFE5D1]">
        {showImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            draggable={false}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: TONE_BG[project.accentTone ?? 'crimson'] }}
          >
            <div className="absolute inset-2.5 border border-[#C8A86B]/30" />
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 font-serif-editorial italic text-[78px] leading-none text-[#EFE5D1]/[0.07]">
              {roman}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#160304]/92 via-[#160304]/10 to-[#160304]/40" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[8px] tracking-[0.2em] uppercase text-[#C8A86B]">
          <span>SIGNATURE {roman}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-[8px] tracking-[0.18em] uppercase text-[#C8A86B]">
            {project.client}
          </p>
          <h3 className="mt-1 font-serif-editorial text-base leading-tight text-[#F5ECE0]">
            {project.title}
          </h3>
        </div>
      </div>
    </button>
  );
};

export const HexagonDrumShowcase: React.FC<HexagonDrumShowcaseProps> = ({
  onSelectProject,
}) => {
  const items = SIGNATURE_IDS.map((id) =>
    PROJECTS.find((p) => p.id === id)
  ).filter((p): p is ProjectItem => Boolean(p));

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centerLabelRef = useRef<HTMLDivElement | null>(null);
  const leftTitleRef = useRef<HTMLDivElement | null>(null);
  const bottomHintRef = useRef<HTMLDivElement | null>(null);
  const compassRingRef = useRef<SVGSVGElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [inDrumMode, setInDrumMode] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const morphPinPx = 220;
  const pixelsPerCard = 410;
  const maxIdx = Math.max(1, items.length - 1);
  const pinDistance = morphPinPx + maxIdx * pixelsPerCard;

  useEffect(() => {
    if (isMobile) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let disposed = false;
    let rafId = 0;
    let running = false;

    // Pin ONLY for the main drum cycle; pre-morph and post-exit glide seamlessly beyond pin bounds
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${pinDistance}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
    scrollTriggerRef.current = st;

    const state = {
      smoothRel: -400,
      initialized: false,
      lastIdx: 0,
      lastDrumFlag: false,
    };

    const render = () => {
      if (disposed || !running) return;

      const vh = window.innerHeight || 800;
      const leadInPx = vh * 0.48; // Hexagon begins spinning & breaking into 3D drum BEFORE hitting top
      const leadOutPx = vh * 0.65; // Drum keeps rolling upward smoothly AFTER unpinning (no sudden freeze!)

      const rawRel = window.scrollY - st.start;
      const clampedRel = Math.max(-leadInPx, Math.min(pinDistance + leadOutPx, rawRel));

      if (!state.initialized) {
        state.smoothRel = clampedRel;
        state.initialized = true;
      }

      // Weighted museum inertia (eliminates abrupt stops when user releases scroll wheel)
      state.smoothRel += (clampedRel - state.smoothRel) * 0.088;
      const rel = state.smoothRel;

      // Phase 1: Morph from 2D Hexagon -> 3D Vertical Drum across [-leadInPx -> morphPinPx]
      const morphT = smoothstep(-leadInPx * 0.85, morphPinPx, rel);

      // Gentle pre-break hexagon rotation while entering viewport
      const hexEntrySpin = (1 - morphT) * (-0.35 + smoothstep(-leadInPx, 0, rel) * 0.55);

      // Phase 2 & 3: Continuous drum cycling from Card 0 -> Card 5, then silk ease-out exit to 6.15
      let activeFloat = 0;
      let exitT = 0;
      if (rel <= morphPinPx) {
        activeFloat = 0;
      } else if (rel <= pinDistance) {
        const coreT = (rel - morphPinPx) / (pinDistance - morphPinPx);
        activeFloat = coreT * maxIdx;
      } else {
        exitT = Math.max(0, Math.min(1, (rel - pinDistance) / leadOutPx));
        // Smooth deceleration curve as section scrolls upward into Selected Works
        const easedExit = 1 - Math.pow(1 - exitT, 2.3);
        activeFloat = maxIdx + easedExit * 1.18;
      }

      const roundedIdx = Math.max(0, Math.min(maxIdx, Math.round(activeFloat)));
      const isNowDrum = morphT > 0.55;

      if (isNowDrum !== state.lastDrumFlag) {
        state.lastDrumFlag = isNowDrum;
        setInDrumMode(isNowDrum);
      }
      if (roundedIdx !== state.lastIdx) {
        state.lastIdx = roundedIdx;
        setActiveIndex(roundedIdx);
      }

      const stageW = stage.clientWidth || window.innerWidth;
      const stageH = stage.clientHeight || window.innerHeight * 0.72;
      const isMobile = stageW < 768;

      const hexRadius = Math.min(stageW * (isMobile ? 0.31 : 0.22), stageH * 0.34);
      const drumRadius = isMobile ? 250 : 340;
      const hexScale = isMobile ? 0.52 : 0.58;

      // Global gentle fade out at the tail of exit so nothing clips harshly against the navbar
      const exitCurtain = 1 - smoothstep(0.18, 0.95, exitT);

      items.forEach((_, idx) => {
        const el = cardRefs.current[idx];
        if (!el) return;

        // 1. HEXAGON RING COORDINATES
        const hexAngle = -Math.PI / 2 + idx * (Math.PI / 3) + hexEntrySpin;
        const hexX = Math.cos(hexAngle) * hexRadius;
        const hexY = Math.sin(hexAngle) * hexRadius;
        const hexRotZ = ((hexAngle + Math.PI / 2) * 180) / Math.PI;

        // 2. VERTICAL 3D DRUM COORDINATES
        const delta = idx - activeFloat;
        const theta = delta * (Math.PI / 3.15);
        const drumY = Math.sin(theta) * drumRadius;
        const drumZ = (Math.cos(theta) - 1) * drumRadius;
        const drumRotX = (-theta * 180) / Math.PI;
        const dist = Math.abs(delta);
        const drumScale = Math.max(0.74, 1 - dist * 0.12);
        const rawDrumOpacity =
          dist > 1.55 ? 0 : Math.max(0, 1 - Math.max(0, dist - 0.72) * 1.15);
        const drumOpacity = rawDrumOpacity * exitCurtain;

        // 3. INTERPOLATION
        const x = lerp(hexX, 0, morphT);
        const y = lerp(hexY, drumY, morphT);
        const z = lerp(0, drumZ, morphT);
        const rotZ = lerp(hexRotZ, 0, morphT);
        const rotX = lerp(0, drumRotX, morphT);
        const scale = lerp(hexScale, drumScale, morphT);
        const opacity = lerp(1, drumOpacity, morphT);
        const zIndex =
          morphT > 0.5 ? Math.round(50 - dist * 15) : 10 + (items.length - idx);

        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${zIndex}`;
        el.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
      });

      if (centerLabelRef.current) {
        const centerOpacity = 1 - smoothstep(0.05, 0.38, morphT);
        centerLabelRef.current.style.opacity = `${centerOpacity}`;
        centerLabelRef.current.style.transform = `scale(${1 - morphT * 0.16})`;
      }

      if (compassRingRef.current) {
        const ringOpacity = (1 - smoothstep(0.1, 0.65, morphT)) * 0.22;
        compassRingRef.current.style.opacity = `${ringOpacity}`;
        compassRingRef.current.style.transform = `rotate(${hexEntrySpin * 65}deg) scale(${1 + morphT * 0.12})`;
      }

      if (leftTitleRef.current) {
        const leftOpacity = smoothstep(0.45, 0.85, morphT) * exitCurtain;
        leftTitleRef.current.style.opacity = `${leftOpacity}`;
        leftTitleRef.current.style.transform = `translate3d(0, ${(1 - leftOpacity) * 18}px, 0)`;
      }

      if (bottomHintRef.current) {
        bottomHintRef.current.style.opacity = `${exitCurtain}`;
      }

      rafId = requestAnimationFrame(render);
    };

    // GPU discipline: stop the drum entirely while it is far off-screen.
    const startLoop = () => {
      if (disposed || running) return;
      running = true;
      rafId = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoop();
        else stopLoop();
      },
      { rootMargin: '350px 0px' }
    );
    visibility.observe(section);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 160);

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      visibility.disconnect();
      stopLoop();
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [items.length, pinDistance, maxIdx, isMobile]);

  const jumpToCard = (idx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const scrollY = st.start + morphPinPx + idx * pixelsPerCard;
    smoothScrollTo(scrollY);
  };

  const activeProject = items[activeIndex] ?? items[0];

  /* ---------------------------------- MOBILE ---------------------------------- */
  /* Two-up editorial deck: no pin, no scroll trap, no 3D RAF.                    */
  if (isMobile) {
    return (
      <section
        id="signature-works"
        ref={sectionRef}
        className="bg-parchment-paper text-[#1E0707] relative w-full pt-24 pb-16 px-6 border-t border-[#1E0707]/15 overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-[10px] tracking-[0.24em] uppercase text-[#9E4224] mb-1.5">
            02.5 / SIGNATURE REEL
          </p>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-light leading-none text-[#1E0707]">
            Crown <span className="italic text-[#5C1110]">Productions</span>
          </h2>

          <div className="mt-6 flex items-center justify-between text-[9px] tracking-[0.24em] uppercase text-[#9E4224]">
            <span>{String(items.length).padStart(2, '0')} SIGNATURES</span>
            <span className="text-[#1E0707]/45">TAP TO INSPECT</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {items.map((project, idx) => (
              <MobileSignatureCard
                key={project.id}
                project={project}
                roman={ROMAN[idx] ?? String(idx + 1)}
                onSelect={() => onSelectProject(project)}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-[9px] tracking-[0.22em] uppercase text-[#1E0707]/45">
            A CALM, VERTICAL SCROLL — NO PINNED STAGE
          </p>
        </div>
      </section>
    );
  }

  /* ---------------------------------- DESKTOP --------------------------------- */
  return (
    <section
      id="signature-works"
      ref={sectionRef}
      className="bg-parchment-paper text-[#1E0707] relative w-full h-screen flex flex-col justify-between pt-24 pb-8 px-6 md:px-14 overflow-hidden border-t border-[#1E0707]/15"
    >
      {/* Top Header & Right Index */}
      <div className="max-w-[1440px] w-full mx-auto flex items-start justify-between relative z-30 pointer-events-none">
        <div>
          <p className="text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-[#9E4224] mb-1.5">
            02.5 / SIGNATURE REEL
          </p>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-light leading-none text-[#1E0707]">
            Crown <span className="italic text-[#5C1110]">Productions</span>
          </h2>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1.5 pointer-events-auto pt-1">
          {items.map((proj, idx) => {
            const isCurrent = idx === activeIndex && inDrumMode;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => jumpToCard(idx)}
                className={`text-[11px] tracking-[0.14em] uppercase transition-all duration-300 pb-0.5 border-b ${
                  isCurrent
                    ? 'text-[#3E090B] border-[#3E090B] font-medium'
                    : 'text-[#1E0707]/45 border-transparent hover:text-[#1E0707]/85'
                }`}
              >
                {proj.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center 3D Hexagon -> Vertical Drum Stage */}
      <div
        ref={stageRef}
        style={{ perspective: '1250px' }}
        className="relative flex-1 w-full flex items-center justify-center"
      >
        {/* Classical Hairline Compass Ring behind the Hexagon */}
        <svg
          ref={compassRingRef}
          viewBox="0 0 500 500"
          fill="none"
          className="pointer-events-none absolute w-[420px] h-[420px] md:w-[560px] md:h-[560px] z-0"
          aria-hidden="true"
        >
          <circle cx="250" cy="250" r="230" stroke="#5C1110" strokeWidth="0.7" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="168" stroke="#9E4224" strokeWidth="0.6" />
          <line x1="250" y1="8" x2="250" y2="36" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="250" y1="464" x2="250" y2="492" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="8" y1="250" x2="36" y2="250" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="464" y1="250" x2="492" y2="250" stroke="#5C1110" strokeWidth="0.9" />
        </svg>

        {/* Center Watermark inside Hexagon */}
        <div
          ref={centerLabelRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0 text-center"
        >
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#9E4224] mb-1">
            SELECTED
          </span>
          <span className="font-serif-editorial text-3xl md:text-4xl tracking-[0.12em] text-[#1E0707]/80">
            WORKS &apos;26
          </span>
        </div>

        {/* Left Dynamic Active Project Title */}
        <div
          ref={leftTitleRef}
          style={{ opacity: 0 }}
          className="hidden lg:flex flex-col items-start max-w-[260px] absolute left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
        >
          <span className="text-[10px] tracking-[0.24em] uppercase text-[#9E4224] mb-2">
            {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} —{' '}
            {activeProject.subTag}
          </span>
          <h3 className="font-serif-editorial text-3xl leading-[1.1] text-[#1E0707] mb-2">
            {activeProject.title}
          </h3>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#1E0707]/60">
            {activeProject.client}
          </p>
        </div>

        {/* The 6 Morphing 3D Cards */}
        {items.map((project, idx) => (
          <div
            key={project.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            onClick={() => onSelectProject(project)}
            data-cursor="view"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
            }}
            className="absolute w-[280px] sm:w-[340px] md:w-[400px] aspect-[16/10] border border-[#C8A86B]/55 shadow-[0_24px_60px_rgba(30,7,7,0.28)] cursor-pointer bg-[#220405] transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(62,9,11,0.45)]"
          >
            <DrumCardFace project={project} roman={ROMAN[idx] ?? String(idx + 1)} />
          </div>
        ))}
      </div>

      {/* Bottom Scroll Hint */}
      <div
        ref={bottomHintRef}
        className="max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-30"
      >
        <div className="lg:hidden text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#9E4224]">
            {activeProject.client}
          </p>
          <p className="font-serif-editorial text-xl text-[#1E0707]">
            {activeProject.title}
          </p>
        </div>

        <div className="mx-auto inline-flex items-center gap-2.5 px-4 py-2 border border-[#1E0707]/20 bg-[#EFE5D1]/85 text-[10px] tracking-[0.24em] uppercase text-[#1E0707]/75">
          <ArrowDown className="w-3 h-3 text-[#9E4224]" strokeWidth={1.5} />
          <span>SCROLL TO CYCLE ARCHIVE</span>
        </div>
      </div>
    </section>
  );
};