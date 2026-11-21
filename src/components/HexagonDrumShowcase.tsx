import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import type { ProjectItem } from '../data/portfolioData';



gsap.registerPlugin(ScrollTrigger);

interface HexagonDrumShowcaseProps {
  onSelectProject: (project: ProjectItem) => void;
}

// The 6 Editorial & Seasonal series (Folders 3, 5, 6, 8, 10, 11)
const SIGNATURE_IDS = [
  'occasions-mothers-day',
  'occasions-ramadan-hijri',
  'carousel-handwriting-craft',
  'carousel-podcast-retention',
  'carousel-child-book-choice',
  'carousel-world-theatre-day',
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

const DrumCardFace = memo<{ project: ProjectItem; roman: string }>(
  ({ project, roman }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const cover = project.coverImage || project.gallery?.[0];
    const showImage = Boolean(cover) && !imgFailed;

    if (showImage) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-[#220405]">
          <img
            src={cover}
            alt={project.title}
            draggable={false}
            decoding="async"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        className="relative w-full h-full p-5 flex flex-col justify-between overflow-hidden select-none"
        style={{ background: TONE_BG[project.accentTone ?? 'crimson'] }}
      >
        <span className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 font-serif-editorial italic text-[90px] leading-none text-[#EFE5D1]/[0.06]">
          {roman}
        </span>
        <div className="relative z-10 text-[9px] tracking-[0.24em] uppercase text-[#D5B577]">
          SIGNATURE {roman}
        </div>
        <div className="relative z-10 my-auto">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#EFE5D1]/70 mb-1.5">
            {project.client}
          </p>
          <h4 className="font-serif-editorial text-xl leading-[1.12] text-[#F5ECE0] font-normal">
            {project.title}
          </h4>
        </div>
        <div className="relative z-10 border-t border-[#C8A86B]/25 pt-2 text-[9px] tracking-[0.2em] uppercase text-[#EFE5D1]/70">
          {project.subTag}
        </div>
      </div>
    );
  }
);
DrumCardFace.displayName = 'DrumCardFace';

export const HexagonDrumShowcase: React.FC<HexagonDrumShowcaseProps> = ({
  onSelectProject,
}) => {
  const items = useMemo(() => {
    const picked = SIGNATURE_IDS.map((id) =>
      PROJECTS.find((p) => p.id === id)
    ).filter((p): p is ProjectItem => Boolean(p));
    return picked.length === 6 ? picked : PROJECTS.slice(0, 6);
  }, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centerLabelRef = useRef<HTMLDivElement | null>(null);
  const leftTitleRef = useRef<HTMLDivElement | null>(null);
  const bottomHintRef = useRef<HTMLDivElement | null>(null);
  const compassRingRef = useRef<SVGSVGElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [inDrumMode, setInDrumMode] = useState(false);

  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Luxurious timing: hold the open hexagon, then a slow 700px unwrap into the 3D portrait drum
  const hexHoldPx = 120;
  const morphEndPx = 820;
  const pixelsPerCard = 340;
  const maxIdx = Math.max(1, items.length - 1);
  const pinDistance = morphEndPx + maxIdx * pixelsPerCard;

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let disposed = false;
    let rafId = 0;
    let isVisible = false;

    const metrics = {
      stageW: stage.clientWidth || window.innerWidth,
      stageH: stage.clientHeight || window.innerHeight * 0.72,
      vh: window.innerHeight || 800,
    };

    const updateMetrics = () => {
      metrics.stageW = stage.clientWidth || window.innerWidth;
      metrics.stageH = stage.clientHeight || window.innerHeight * 0.72;
      metrics.vh = window.innerHeight || 800;
    };
    window.addEventListener('resize', updateMetrics);

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
      if (disposed || !isVisible) {
        rafId = 0;
        return;
      }

      const leadInPx = metrics.vh * 0.48;
      const leadOutPx = metrics.vh * 0.62;
      const rawRel = window.scrollY - st.start;
      const clampedRel = Math.max(-leadInPx, Math.min(pinDistance + leadOutPx, rawRel));

      if (!state.initialized) {
        state.smoothRel = clampedRel;
        state.initialized = true;
      }

      state.smoothRel += (clampedRel - state.smoothRel) * 0.075;
      const rel = state.smoothRel;

      // 1. Crisp open landscape Hexagon holds briefly on arrival, then morphs smoothly into upright 3:4 Drum
      const morphT = smoothstep(hexHoldPx, morphEndPx, rel);
      const entryT = smoothstep(-leadInPx, hexHoldPx, rel);
      const hexEntrySpin = (1 - morphT) * (-0.36 + entryT * 0.48);

      // 2. Cycle smoothly through the 6 portrait cards with gentle post-unpin roll-out
      let activeFloat = 0;
      let exitT = 0;
      if (rel <= morphEndPx) {
        activeFloat = 0;
      } else if (rel <= pinDistance) {
        const coreT = (rel - morphEndPx) / (pinDistance - morphEndPx);
        activeFloat = coreT * maxIdx;
      } else {
        exitT = Math.max(0, Math.min(1, (rel - pinDistance) / leadOutPx));
        const easedExit = 1 - Math.pow(1 - exitT, 2.3);
        activeFloat = maxIdx + easedExit * 1.15;
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

      // Generous upright 3:4 center card size on drum (smart portrait scaling on phones)
      const isNarrow = metrics.stageW < 768;
      const baseCardH = 312;
      const fitScale = isNarrow
        ? Math.min(
            1.08,
            (metrics.stageW * 0.72) / 234,
            (metrics.stageH * 0.58) / 312
          )
        : Math.min(1.16, (metrics.stageH * 0.65) / baseCardH);
      const renderedCardH = baseCardH * fitScale;

      // Bigger, bolder horizontal Hexagon tiles — exact trig guarantees ZERO corner overlap & wide center space
      const hexUnit = isNarrow
        ? Math.min(metrics.stageW * 0.94, metrics.stageH * 0.86)
        : Math.min(metrics.stageH, metrics.stageW * 0.72);
      const hexScaleX = isNarrow
        ? (hexUnit * 0.30) / 234
        : (hexUnit * 0.322) / 234;
      const hexScaleY = isNarrow
        ? (hexUnit * 0.21) / 312
        : (hexUnit * 0.222) / 312;
      const hexRadius = isNarrow ? hexUnit * 0.37 : hexUnit * 0.395;

      // Proportional 3D drum spacing (~34px crisp air gap between cards on any screen)
      const drumRadius = renderedCardH * (isNarrow ? 0.86 : 0.95);
      const extraGap = renderedCardH * 0.03;
      const exitCurtain = 1 - smoothstep(0.18, 0.95, exitT);

      items.forEach((_, idx) => {
        const el = cardRefs.current[idx];
        const inner = innerRefs.current[idx];
        if (!el) return;

        // Hexagon Ring Coordinates
        const hexAngle = -Math.PI / 2 + idx * (Math.PI / 3) + hexEntrySpin;
        const hexX = Math.cos(hexAngle) * hexRadius;
        const hexY = Math.sin(hexAngle) * hexRadius;
        const hexRotZ = ((hexAngle + Math.PI / 2) * 180) / Math.PI;

        // Vertical 3D Drum Coordinates (balanced framing matching reference)
        const delta = idx - activeFloat;
        const theta = delta * (Math.PI / 3.4);
        const drumY = Math.sin(theta) * drumRadius + delta * extraGap;
        const drumZ = (Math.cos(theta) - 1) * drumRadius;
        const drumRotX = (-theta * 180) / Math.PI;
        const dist = Math.abs(delta);
        const drumScale = Math.max(0.74, 1 - dist * 0.12) * fitScale;
        const rawDrumOpacity =
          dist > 1.55 ? 0 : Math.max(0, 1 - Math.max(0, dist - 0.95) * 1.65);
        const drumOpacity = rawDrumOpacity * exitCurtain;

        // Smooth landscape-to-portrait morph
        const x = lerp(hexX, 0, morphT);
        const y = lerp(hexY, drumY, morphT);
        const z = lerp(0, drumZ, morphT);
        const rotZ = lerp(hexRotZ, 0, morphT);
        const rotX = lerp(0, drumRotX, morphT);
        const sX = lerp(hexScaleX, drumScale, morphT);
        const sY = lerp(hexScaleY, drumScale, morphT);
        const opacity = lerp(1, drumOpacity, morphT);
        const zIndex =
          morphT > 0.5 ? Math.round(50 - dist * 15) : 10 + (items.length - idx);

        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale3d(${sX}, ${sY}, 1)`;
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${zIndex}`;
        el.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';

        // Exact inverse Y counter-scale so artwork stays 100% undistorted while frame morphs landscape -> portrait
        if (inner) {
          const counterY = sY > 0.001 ? sX / sY : 1;
          inner.style.transform = `scale3d(1, ${counterY}, 1)`;
        }
      });

      if (centerLabelRef.current) {
        const centerOpacity = 1 - smoothstep(0.06, 0.42, morphT);
        centerLabelRef.current.style.opacity = `${centerOpacity}`;
        centerLabelRef.current.style.transform = `scale(${1 - morphT * 0.14})`;
      }

      if (compassRingRef.current) {
        const ringOpacity = (1 - smoothstep(0.1, 0.62, morphT)) * 0.24;
        compassRingRef.current.style.opacity = `${ringOpacity}`;
        compassRingRef.current.style.transform = `rotate(${hexEntrySpin * 65}deg) scale(${1 + morphT * 0.1})`;
      }

      if (leftTitleRef.current) {
        const leftOpacity = smoothstep(0.45, 0.85, morphT) * exitCurtain;
        leftTitleRef.current.style.opacity = `${leftOpacity}`;
        leftTitleRef.current.style.transform = `translate3d(0, ${(1 - leftOpacity) * 16}px, 0)`;
      }

      if (bottomHintRef.current) {
        bottomHintRef.current.style.opacity = `${exitCurtain}`;
      }

      rafId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId && !disposed) {
          rafId = requestAnimationFrame(render);
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(section);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 160);

    return () => {
      disposed = true;
      window.clearTimeout(refreshTimer);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateMetrics);
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [items.length, pinDistance, maxIdx]);

  const jumpToCard = (idx: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const scrollY = st.start + morphEndPx + idx * pixelsPerCard;
    window.scrollTo({ top: scrollY, behavior: 'smooth' });
  };

  const activeProject = items[activeIndex] ?? items[0];

  return (
    <section
      id="signature-works"
      ref={sectionRef}
      className="bg-parchment-paper text-[#1E0707] relative w-full h-screen flex flex-col justify-between pt-20 pb-5 px-6 md:px-14 overflow-hidden border-t border-[#1E0707]/15"
    >
      {/* Top Header & Right Index */}
      <div className="max-w-[1440px] w-full mx-auto flex items-start justify-between relative z-30 pointer-events-none">
        <div>
          <p className="text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-[#9E4224] mb-1.5">
            03 / EDITORIAL &amp; SEASONAL
          </p>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-light leading-none text-[#1E0707]">
            Editorial <span className="italic text-[#5C1110]">Series</span>
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
                className={`text-[11px] tracking-[0.14em] uppercase transition-colors duration-300 pb-0.5 border-b ${
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
        style={{ perspective: '1300px' }}
        className="relative flex-1 w-full flex items-center justify-center"
      >
        <svg
          ref={compassRingRef}
          viewBox="0 0 500 500"
          fill="none"
          className="pointer-events-none absolute w-[420px] h-[420px] md:w-[540px] md:h-[540px] z-0"
          aria-hidden="true"
        >
          <circle cx="250" cy="250" r="230" stroke="#5C1110" strokeWidth="0.7" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="158" stroke="#9E4224" strokeWidth="0.6" />
          <line x1="250" y1="8" x2="250" y2="36" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="250" y1="464" x2="250" y2="492" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="8" y1="250" x2="36" y2="250" stroke="#5C1110" strokeWidth="0.9" />
          <line x1="464" y1="250" x2="492" y2="250" stroke="#5C1110" strokeWidth="0.9" />
        </svg>

        {/* Center Watermark inside Open Hexagon */}
        <div
          ref={centerLabelRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-0 text-center"
        >
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#9E4224] mb-1">
            SELECTED
          </span>
          <span className="font-serif-editorial text-2xl md:text-3xl tracking-[0.14em] text-[#1E0707]/85">
            WORKS &apos;26
          </span>
        </div>

        {/* Left Dynamic Active Project Title (Drum Mode) */}
        <div
          ref={leftTitleRef}
          style={{ opacity: 0 }}
          className="hidden lg:flex flex-col items-start max-w-[270px] absolute left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
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

        {/* The 6 Morphing Cards: Landscape Hexagon Tiles -> Upright 3:4 Portrait Drum */}
        {items.map((project, idx) => (
          <div
            key={project.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            onClick={() => onSelectProject(project)}
            data-cursor="view"
            style={{
              willChange: 'transform, opacity',
            }}
            className="absolute w-[234px] h-[312px] overflow-hidden border border-[#C8A86B]/60 shadow-[0_14px_30px_rgba(30,7,7,0.22)] cursor-pointer bg-[#220405]"
          >
            <div
              ref={(el) => {
                innerRefs.current[idx] = el;
              }}
              style={{ willChange: 'transform' }}
              className="w-full h-full"
            >
              <DrumCardFace project={project} roman={ROMAN[idx] ?? String(idx + 1)} />
            </div>
          </div>
        ))}
      </div>

      {/* Compact mobile drum caption — crisp parchment plate above the scroll pill */}
      <div
        aria-hidden={!inDrumMode}
        className={`lg:hidden pointer-events-none absolute bottom-[84px] left-0 right-0 z-30 px-6 flex justify-center transition-opacity duration-500 ${
          inDrumMode ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full max-w-[340px] bg-[#EFE5D1]/95 border border-[#C8A86B]/45 px-4 py-2.5 text-center">
          <span className="block text-[9px] tracking-[0.24em] uppercase text-[#9E4224] mb-1">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(items.length).padStart(2, '0')}
          </span>
          <p className="font-serif-editorial text-[19px] leading-tight text-[#1E0707]">
            {activeProject.title}
          </p>
          <p className="text-[9px] tracking-[0.18em] uppercase text-[#1E0707]/60 mt-1">
            {activeProject.client}
          </p>
        </div>
      </div>

      {/* Bottom Scroll Hint */}
      <div
        ref={bottomHintRef}
        className="max-w-[1440px] w-full mx-auto flex items-center justify-center relative z-30"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[#1E0707]/20 bg-[#EFE5D1]/85 text-[10px] tracking-[0.24em] uppercase text-[#1E0707]/75">
          <ArrowDown className="w-3 h-3 text-[#9E4224]" strokeWidth={1.5} />
          <span>SCROLL TO CYCLE ARCHIVE</span>
        </div>
      </div>
    </section>
  );
};