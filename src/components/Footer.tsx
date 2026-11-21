import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { SITE_INFO } from '../data/portfolioData';
import { BaroqueDivider } from './BaroqueOrnaments';
import { smoothScrollTo } from './SmoothScroll';

gsap.registerPlugin(ScrollTrigger);

const SOCIALS = [
  { label: 'INSTAGRAM', href: SITE_INFO.socials.instagram },
  { label: 'LINKEDIN', href: SITE_INFO.socials.linkedin },
  { label: 'FACEBOOK', href: SITE_INFO.socials.facebook },
];

export const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contactGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets: HTMLElement[] = [];
      if (headlineRef.current) targets.push(headlineRef.current);
      if (contactGridRef.current) targets.push(contactGridRef.current);
      if (targets.length === 0) return;

      // Signature curtain reveal: the finale rises out of a recessed frame
      gsap.fromTo(
        targets,
        { y: -55, opacity: 0.2, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'top 35%',
            scrub: true,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleBackToTop = () => {
    smoothScrollTo(0);
  };

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative w-full bg-[#160304] text-[#EFE5D1] pt-28 pb-12 px-6 md:px-14 border-t border-[#C8A86B]/25 overflow-hidden"
    >
      {/* Art-Directed Candlelit Renaissance Fan Painting */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-full md:w-[56%] pointer-events-none overflow-hidden z-0"
      >
        <img
          src="/media/bg-fan.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[70%_62%] opacity-60"
        />
        {/* Seamless left-to-right vignette into the crimson shadow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #160304 0%, rgba(22, 3, 4, 0.88) 28%, rgba(22, 3, 4, 0.18) 72%, rgba(22, 3, 4, 0.45) 100%)',
          }}
        />
        {/* Top/bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #160304 0%, transparent 22%, transparent 80%, #160304 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <BaroqueDivider tone="gold" className="mb-10" />

        {/* Micro-label */}
        <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#C8A86B]">
          <span>06 / INQUIRIES &amp; COMMISSIONS</span>
          <span className="w-6 h-[1px] bg-[#C8A86B]/40" />
        </div>

        {/* Monumental Display Headline */}
        <h2
          ref={headlineRef}
          className="mt-5 font-serif-editorial text-[16vw] md:text-[11vw] leading-[0.88] tracking-[-0.03em] font-light text-[#EFE5D1]"
        >
          Let&apos;s <span className="italic text-[#C8A86B]">Talk</span>
        </h2>

        {/* Direct Action Row */}
        <div
          ref={contactGridRef}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 pb-16 border-b border-[#C8A86B]/20"
        >
          {/* Left — Invitation & Direct Email */}
          <div className="max-w-md">
            <p className="text-sm md:text-base font-light leading-relaxed text-[#EFE5D1]/70">
              Available for broadcast screenwriting, theatrical commissions,
              historical storytelling, and visual direction across the MENA region
              and beyond.
            </p>
            <a
              href={`mailto:${SITE_INFO.email}`}
              className="mt-7 inline-block max-w-full font-serif-editorial lining-nums text-xl sm:text-2xl md:text-3xl text-[#EFE5D1] underline underline-offset-[7px] decoration-[#C8A86B]/40 transition-colors duration-300 break-all sm:break-normal hover:text-[#C8A86B] hover:decoration-[#C8A86B]"
            >
              {SITE_INFO.email}
            </a>
          </div>

          {/* Right — Architectural CTA & Social Ledger */}
          <div className="w-full md:max-w-md md:justify-self-end flex flex-col">
            <a
              href={SITE_INFO.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 border border-[#C8A86B] px-6 py-5 text-[#EFE5D1] transition-colors duration-300 hover:bg-[#EFE5D1] hover:text-[#1E0707]"
            >
              <span>
                <span className="block text-[10px] tracking-[0.24em] uppercase text-[#C8A86B] transition-colors duration-300 group-hover:text-[#3E090B]">
                  WHATSAPP DIRECT
                </span>
                <span className="mt-2 block font-serif-editorial lining-nums text-lg md:text-xl tracking-wide">
                  {SITE_INFO.phoneDisplay}
                </span>
              </span>
              <ArrowUpRight
                className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                strokeWidth={1.25}
              />
            </a>

            <div className="mt-9 flex flex-col gap-3">
              <span className="text-[10px] tracking-[0.24em] uppercase text-[#EFE5D1]/40">
                FOLLOW THE WORK
              </span>
              <div className="flex flex-wrap gap-x-7 gap-y-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#EFE5D1]/75 transition-colors duration-300 hover:text-[#C8A86B]"
                  >
                    <span>{social.label}</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.25}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.22em] uppercase text-[#EFE5D1]/50">
          <span>© 2026 ROHA SHHAB — ALL RIGHTS RESERVED</span>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span>SCREENWRITING • THEATRE • VISUAL DIRECTION</span>
            <button
              type="button"
              onClick={handleBackToTop}
              className="group inline-flex items-center gap-2 tracking-[0.22em] uppercase transition-colors duration-300 hover:text-[#C8A86B]"
            >
              <span>BACK TO TOP</span>
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
