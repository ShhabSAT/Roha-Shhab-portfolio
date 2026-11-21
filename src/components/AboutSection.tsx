import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE_INFO } from '../data/portfolioData';
import { ParchmentCrestWatermark, BaroqueDivider } from './BaroqueOrnaments';

gsap.registerPlugin(ScrollTrigger);

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance reveal: one GPU-only transform/opacity pass, then the
      // elements are left alone so scrolling back never re-runs the work.
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      // The vertical terracotta/gold hairline draws downward once on entry
      if (hairlineRef.current) {
        gsap.fromTo(
          hairlineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            transformOrigin: 'top center',
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }

      // Animate stats reveal
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }

      // Scrubbed Exit: the inner composition softly recedes as the
      // CurvedShowcase rises underneath it.
      if (innerRef.current) {
        gsap.fromTo(
          innerRef.current,
          { y: 0, opacity: 1 },
          {
            y: -28,
            opacity: 0.35,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'bottom 75%',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full bg-parchment-paper py-24 md:py-36 px-6 md:px-14 text-[#1E0707] overflow-hidden"
    >
      {/* Letterpress Crest Watermark on the parchment margin */}
      <ParchmentCrestWatermark className="hidden md:block absolute -left-16 bottom-12 w-72 h-72 opacity-[0.06]" />

      <div ref={innerRef} className="max-w-7xl mx-auto relative z-10">
        {/* 12-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (4 cols) */}
          <div ref={leftColRef} className="lg:col-span-4 flex flex-col items-start">
            {/* Micro-label */}
            <div className="flex items-center gap-3 text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#9E4224] mb-6">
              <span>01 / THE CRAFT</span>
              <span className="w-6 h-[1px] bg-[#9E4224]/40" />
            </div>

            {/* Refined vertical crimson-and-gold decorative hairline accent */}
            <div className="hidden lg:flex items-center gap-6 mt-4">
              <div
                ref={hairlineRef}
                className="w-[1px] h-32 bg-gradient-to-b from-[#9E4224] via-[#5C1110] to-[#C8A86B]/40"
                aria-hidden="true"
              />
              <div className="space-y-3 text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-[#1E0707]/60">
                <div>SCREENWRITING</div>
                <div>THEATRICAL DRAMA</div>
                <div>HISTORICAL ARCHIVES</div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols) */}
          <div ref={contentRef} className="lg:col-span-8 flex flex-col">
            {/* Large Editorial Statement */}
            <h2 className="font-serif-editorial text-3xl md:text-5xl lg:text-[3.25rem] leading-[1.18] font-normal text-[#1E0707] mb-8 tracking-[-0.01em]">
              Where{' '}
              <span className="italic font-normal text-[#5C1110]">
                classical storytelling
              </span>{' '}
              meets modern screen, stage, and visual direction.
            </h2>

            {/* Two Tight Editorial Paragraphs */}
            <div className="space-y-6 text-base md:text-lg font-sans font-light leading-relaxed text-[#1E0707]/85 max-w-3xl">
              <p>
                Roha Shhab operates at the intersection of structural screenwriting, rigorous
                journalistic research, and contemporary visual production. From authoring broadcast
                cartoon series and educational sketches for Spacetoon, Almarai, and Sadafco, to
                creating musical theatre plays staged at the Qatar Toy Festival, every project begins
                with narrative architecture engineered to move audiences deeply.
              </p>
              <p>
                Her practice extends into deep historical and spatial research—exemplified by
                milestone interactive experiences like <em>On His Footsteps (Ala Khotah)</em>,
                chronicling the Prophet’s migration through spatial audio and live exhibition design.
                Backed by specialized credentials in film directing, investigative research with
                ARIJ, and animation storytelling with Pixar in a Box, Roha bridges timeless
                heritage with high-impact digital media.
              </p>
            </div>

            <BaroqueDivider tone="crimson" className="my-10" />

            {/* 3-Column Architectural Stats Strip */}
            <div
              ref={statsRef}
              className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-8"
            >
              {SITE_INFO.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-serif-editorial text-4xl lg:text-5xl font-light text-[#4A0B0C] leading-none mb-3 tracking-tight whitespace-nowrap">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#1E0707]/70 leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
