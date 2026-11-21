import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import type { ProjectItem } from '../data/portfolioData';
import { BaroqueCorner } from './BaroqueOrnaments';

gsap.registerPlugin(ScrollTrigger);

type FilterKey = 'all' | ProjectItem['category'];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'screenwriting', label: 'SCREENWRITING & CARTOONS' },
  { key: 'theatre-historical', label: 'THEATRE & HISTORICAL' },
  { key: 'social-brand', label: 'SOCIAL & BRAND' },
  { key: 'field-reels', label: 'FIELD & REELS' },
];

interface SelectedWorksProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const SelectedWorks: React.FC<SelectedWorksProps> = ({
  onSelectProject,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLButtonElement>(null);
  const refreshTimer = useRef<number | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const filtered =
    activeFilter === 'all'
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === activeFilter);

  const previewProject =
    filtered.find((project) => project.id === previewId) ?? filtered[0];
  const previewIndex = previewProject
    ? filtered.findIndex((project) => project.id === previewProject.id)
    : 0;

  const previewKey = previewProject?.id;
  const showImage =
    Boolean(previewProject?.coverImage) &&
    Boolean(previewKey) &&
    !failedImages.includes(previewKey as string);

  // Subtle fade / scale handoff whenever the previewed plate changes
  useEffect(() => {
    if (!plateRef.current || !previewKey) return;
    const anim = gsap.fromTo(
      plateRef.current,
      { opacity: 0.4, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
    return () => {
      anim.kill();
    };
  }, [previewKey]);

  // Scrubbed header + filter tabs entry (connects the HexagonDrum exit above)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!headerRef.current) return;

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Editorial row reveal on scroll (re-armed whenever the filter changes)
  useEffect(() => {
    if (!listRef.current) return;

    const ctx = gsap.context(() => {
      const rows = Array.from(listRef.current?.children ?? []);
      if (rows.length === 0) return;

      gsap.from(rows, {
        y: 26,
        opacity: 0,
        duration: 0.7,
        stagger: 0.045,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 82%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeFilter]);

  const handleFilter = (key: FilterKey) => {
    setActiveFilter(key);
    setPreviewId(null);

    // Filtering changes the document height, so downstream pinned/scroll
    // triggers must be re-measured once React has committed the new rows.
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
  }, []);

  return (
    <section
      id="works"
      ref={sectionRef}
      className="relative w-full bg-parchment-paper py-24 md:py-36 px-6 md:px-14 text-[#1E0707] border-t border-[#1E0707]/15 overflow-x-clip"
    >
      {/* Crimson damask-tint radial depth across the parchment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 18% 0%, rgba(92, 17, 16, 0.10) 0%, rgba(92, 17, 16, 0.035) 42%, transparent 75%), radial-gradient(ellipse 55% 60% at 100% 85%, rgba(158, 66, 36, 0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Row */}
        <div
          ref={headerRef}
          className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between mb-12 md:mb-16"
        >
          <div>
            <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-sans font-semibold uppercase tracking-[0.24em] text-[#9E4224] mb-5">
              <span>03 / COMPLETE ARCHIVE</span>
              <span className="w-6 h-[1px] bg-[#9E4224]/40" />
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-light leading-[0.95] tracking-[-0.02em] text-[#1E0707]">
              Selected <span className="italic text-[#5C1110]">Works</span>
            </h2>
          </div>

          {/* Sharp Architectural Filter Tabs — swipeable ledger on mobile */}
          <div className="scrollbar-hide -mx-6 flex gap-2 overflow-x-auto whitespace-nowrap px-6 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => handleFilter(filter.key)}
                  className={`shrink-0 rounded-none border px-3.5 py-2.5 text-[10px] font-sans tracking-[0.18em] uppercase transition-colors duration-300 ${
                    isActive
                      ? 'bg-[#3E090B] border-[#3E090B] text-[#EFE5D1]'
                      : 'bg-transparent border-[#1E0707]/20 text-[#1E0707] hover:border-[#9E4224] hover:text-[#9E4224]'
                  }`}
                >
                  {filter.label}
                  {filter.key === 'all' ? ` (${PROJECTS.length})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Column Editorial Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left — Sticky Preview Plate */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 self-start">
            {previewProject && (
              <button
                type="button"
                ref={plateRef}
                onClick={() => onSelectProject(previewProject)}
                data-cursor="view"
                aria-label={`Inspect ${previewProject.title}`}
                className="group relative w-full aspect-[4/5] bg-crimson-canvas border border-[#C8A86B]/40 p-7 flex flex-col justify-between text-left text-[#EFE5D1] overflow-hidden"
              >
                {showImage && (
                  <>
                    <img
                      src={previewProject.coverImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() =>
                        setFailedImages((prev) =>
                          prev.includes(previewProject.id)
                            ? prev
                            : [...prev, previewProject.id]
                        )
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B0405] via-[#1B0405]/55 to-[#1B0405]/15" />
                  </>
                )}

                {!showImage && (
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-[14px] border border-[#C8A86B]/20" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 28% 18%, rgba(200, 168, 107, 0.18) 0%, rgba(200, 168, 107, 0) 62%)',
                      }}
                    />
                    <span className="absolute bottom-4 right-5 font-serif-editorial italic text-[7rem] leading-none text-[#C8A86B]/10">
                      {String(previewIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[0.24em] uppercase text-[#C8A86B]">
                  <span>
                    ARCHIVE PLATE {String(previewIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[#EFE5D1]/55">
                    {String(filtered.length).padStart(2, '0')} ENTRIES
                  </span>
                </div>

                <div className="relative z-10 my-auto py-8">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[#C8A86B] mb-3">
                    {previewProject.client}
                  </p>
                  <h3 className="font-serif-editorial italic text-3xl xl:text-4xl leading-[1.05] text-[#EFE5D1]">
                    {previewProject.title}
                  </h3>
                  <div className="w-10 h-[1px] bg-[#C8A86B]/50 my-5" />
                  <p className="text-xs leading-relaxed text-[#EFE5D1]/75">
                    {previewProject.summary}
                  </p>
                  {previewProject.metrics && (
                    <p className="mt-4 font-serif-editorial italic text-sm text-[#C8A86B]">
                      {previewProject.metrics}
                    </p>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-[#C8A86B]/25 pt-4 text-[10px] tracking-[0.22em] uppercase text-[#C8A86B]">
                  <span>CLICK TO INSPECT DOSSIER</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <BaroqueCorner
                  corner="tl"
                  tone="gold"
                  className="absolute top-3 left-3 opacity-60 z-20"
                />
                <BaroqueCorner
                  corner="br"
                  tone="gold"
                  className="absolute bottom-3 right-3 opacity-60 z-20"
                />
              </button>
            )}
          </div>

          {/* Right — Interactive Project Index */}
          <div className="lg:col-span-7">
            <div
              ref={listRef}
              onMouseLeave={() => setPreviewId(null)}
              className="border-t border-[#1E0707]/15"
            >
              {filtered.map((project, idx) => (
                <button
                  key={project.id}
                  type="button"
                  data-cursor="view"
                  data-project-row={project.id}
                  onClick={() => onSelectProject(project)}
                  onMouseEnter={() => setPreviewId(project.id)}
                  onFocus={() => setPreviewId(project.id)}
                  className="group w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 border-b border-[#1E0707]/15 py-6 px-4 text-left cursor-pointer transition-colors duration-300 hover:bg-[#3E090B] hover:text-[#EFE5D1]"
                >
                  <div className="flex items-start gap-5 md:gap-8 min-w-0">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-[#1E0707]/45 group-hover:text-[#C8A86B] pt-1.5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif-editorial text-2xl md:text-3xl font-normal leading-tight">
                        {project.title}
                      </h3>
                      <p className="mt-1.5 text-[11px] tracking-[0.18em] uppercase opacity-65">
                        {project.client}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 md:gap-7 pl-0 md:pl-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="block text-[10px] tracking-[0.2em] uppercase opacity-80">
                        {project.subTag}
                      </span>
                      {project.metrics && (
                        <span className="block mt-1 font-serif-editorial italic text-sm text-[#9E4224] group-hover:text-[#C8A86B]">
                          {project.metrics}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      strokeWidth={1.3}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SelectedWorks;
