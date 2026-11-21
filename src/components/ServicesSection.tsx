import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';
import { SERVICES, TOOLKIT } from '../data/portfolioData';
import { BaroqueDivider } from './BaroqueOrnaments';

gsap.registerPlugin(ScrollTrigger);

export const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const toolkitRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(SERVICES[0]?.id ?? null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));

    // Pinned stages above rely on a stable document height; re-measure once
    // the 500ms grid-row expansion has settled.
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 560);
  };

  useEffect(() => {
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scrubbed Entry: "The Craft We Deliver" lifts into view
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

      // Scrubbed Exit: toolkit band dims & lifts as CredentialsSection rises
      if (toolkitRef.current) {
        gsap.fromTo(
          toolkitRef.current,
          { y: 0, opacity: 1 },
          {
            y: -24,
            opacity: 0.4,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'bottom 70%',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // Accordion rows settle in once on first reveal
      gsap.from('.services-reveal', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full bg-[#E7DAC1] text-[#1E0707] py-24 md:py-36 px-6 md:px-14 border-t border-[#1E0707]/15 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#9E4224] mb-5">
            <span>04 / SERVICES &amp; CRAFT</span>
            <span className="w-6 h-[1px] bg-[#9E4224]/40" />
          </div>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-light leading-[0.95] tracking-[-0.02em] text-[#1E0707]">
            The Craft <span className="italic text-[#5C1110]">We Deliver</span>
          </h2>
        </div>

        {/* Signature Accordion */}
        <div className="border-b border-[#1E0707]/20">
          {SERVICES.map((service) => {
            const isOpen = openId === service.id;
            return (
              <div
                key={service.id}
                className={`services-reveal relative transition-colors duration-500 ${
                  isOpen
                    ? 'bg-crimson-canvas text-[#EFE5D1] border-y border-[#C8A86B]/35'
                    : 'border-t border-[#1E0707]/20'
                }`}
              >
                {isOpen && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.13] mix-blend-normal md:mix-blend-soft-light"
                    style={{ backgroundImage: "url('/media/bg-tapestry.webp')" }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleToggle(service.id)}
                  aria-expanded={isOpen}
                  aria-controls={`service-panel-${service.id}`}
                  className="group relative z-10 w-full flex items-center gap-4 md:gap-8 py-5 sm:py-6 md:py-8 px-1 md:px-2 text-left"
                >
                  <span
                    className={`font-serif-editorial text-sm md:text-base tracking-[0.12em] transition-colors duration-500 ${
                      isOpen ? 'text-[#C8A86B]' : 'text-[#9E4224]'
                    }`}
                  >
                    {service.number}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-serif-editorial text-xl sm:text-2xl md:text-4xl leading-none font-normal">
                      {service.title}
                    </span>
                    <span
                      className={`hidden md:block mt-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                        isOpen ? 'text-[#EFE5D1]/60' : 'text-[#1E0707]/55'
                      }`}
                    >
                      {service.subtitle}
                    </span>
                  </span>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-500 ${
                      isOpen
                        ? 'border-[#C8A86B]/60 text-[#C8A86B]'
                        : 'border-[#1E0707]/25 text-[#1E0707] group-hover:border-[#9E4224] group-hover:text-[#9E4224]'
                    }`}
                  >
                    <Plus
                      className={`w-4 h-4 transition-transform duration-500 ${
                        isOpen ? 'rotate-45' : 'rotate-0'
                      }`}
                      strokeWidth={1.3}
                    />
                  </span>
                </button>

                {/* Zero-jump grid expansion */}
                <div
                  id={`service-panel-${service.id}`}
                  className="relative z-10 grid transition-all duration-500 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 px-1 md:px-2 pb-8 md:pb-10 md:pl-[4.5rem]">
                      <p className="md:col-span-7 text-sm leading-relaxed text-[#EFE5D1]/80">
                        {service.description}
                      </p>

                      <div className="md:col-span-5">
                        <p className="text-[10px] tracking-[0.22em] uppercase text-[#C8A86B] mb-4">
                          DELIVERABLES
                        </p>
                        <ul className="space-y-2.5">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-xs tracking-wide text-[#EFE5D1]/75"
                            >
                              <span className="text-[#C8A86B] text-[8px] leading-5">◆</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <BaroqueDivider tone="crimson" className="my-12" />

        {/* Tools, Software & AI Proficiency Band */}
        <div ref={toolkitRef}>
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#9E4224] mb-9">
            <span>TOOLS, SOFTWARE &amp; AI PROFICIENCY</span>
            <span className="w-8 h-[1px] bg-[#9E4224]/40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {TOOLKIT.map((group) => (
              <div key={group.group}>
                <h3 className="font-serif-editorial text-xl md:text-2xl text-[#4A0B0C] mb-5">
                  {group.group}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.tools.map((tool) => (
                    <span
                      key={tool}
                      className="border border-[#1E0707]/25 px-3.5 py-2 text-xs tracking-wider text-[#1E0707]/80"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
