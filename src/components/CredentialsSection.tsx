import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CERTIFICATIONS } from '../data/portfolioData';
import { BaroqueDivider } from './BaroqueOrnaments';

gsap.registerPlugin(ScrollTrigger);

export const CredentialsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Painterly chiaroscuro backdrop drifts slowly behind the ledger
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // Scrubbed Entry: "Formal Pedigree" lifts into view
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 40, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'top 35%',
              scrub: true,
            },
          }
        );
      }

      // Each certification row scrubs into the ledger as it crosses the fold
      const rows =
        sectionRef.current?.querySelectorAll<HTMLElement>('.credentials-row') ??
        [];

      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { y: 26, opacity: 0.15 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top 92%',
              end: 'top 65%',
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="credentials"
      ref={sectionRef}
      className="relative w-full bg-crimson-canvas py-24 md:py-36 px-6 md:px-14 text-[#EFE5D1] border-t border-[#C8A86B]/20 overflow-hidden"
    >
      {/* Art-Directed Chiaroscuro Pomegranate Oil Painting */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="absolute inset-[-14%] z-0 pointer-events-none"
      >
        <img
          src="/media/bg-pomegranates.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-right opacity-45"
        />
        {/* Readability vignette — left-to-right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #1E0405 0%, rgba(34, 5, 6, 0.90) 36%, rgba(40, 6, 8, 0.52) 72%, rgba(22, 3, 4, 0.72) 100%)',
          }}
        />
        {/* Smooth top/bottom edge fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #1E0405 0%, transparent 18%, transparent 82%, #160304 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#C8A86B] mb-5">
            <span>05 / CREDENTIALS &amp; TRAINING</span>
            <span className="w-6 h-[1px] bg-[#C8A86B]/40" />
          </div>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-light leading-[0.95] tracking-[-0.02em] text-[#EFE5D1]">
            Formal <span className="italic text-[#C8A86B]">Pedigree</span>
          </h2>
        </div>

        <BaroqueDivider tone="gold" className="my-10 !justify-start" />

        {/* Editorial Ledger */}
        <div className="border-b border-[#C8A86B]/20">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.id}
              className="credentials-row relative z-10 border-t border-[#C8A86B]/20 py-7 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline transition-colors duration-300 hover:bg-[#EFE5D1]/[0.04] px-3"
            >
              <div className="md:col-span-2">
                <div className="font-mono text-[11px] tracking-[0.22em] text-[#C8A86B]">
                  {cert.year}
                </div>
                {cert.highlight && (
                  <div className="mt-1.5 font-serif-editorial italic text-sm text-[#EFE5D1]/70">
                    {cert.highlight}
                  </div>
                )}
              </div>

              <div className="md:col-span-5">
                <h3 className="font-serif-editorial text-2xl md:text-3xl font-light leading-tight text-[#EFE5D1]">
                  {cert.title}
                </h3>
                <p className="mt-2 text-[11px] tracking-[0.2em] uppercase text-[#C8A86B]/80 leading-relaxed">
                  {cert.institution}
                </p>
              </div>

              <div className="md:col-span-5">
                <p className="text-sm text-[#EFE5D1]/70 leading-relaxed">
                  {cert.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CredentialsSection;
