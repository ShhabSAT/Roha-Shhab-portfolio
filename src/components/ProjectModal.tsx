import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Film } from 'lucide-react';
import type { ProjectItem } from '../data/portfolioData';
import { BaroqueCorner } from './BaroqueOrnaments';
import { lockSmoothScroll, unlockSmoothScroll } from './SmoothScroll';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setSlideIdx(0);
    setVideoFailed(false);
    setImgFailed(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (project.gallery && project.gallery.length > 1) {
        if (e.key === 'ArrowRight') {
          setSlideIdx((prev) => (prev + 1) % project.gallery!.length);
        } else if (e.key === 'ArrowLeft') {
          setSlideIdx(
            (prev) => (prev - 1 + project.gallery!.length) % project.gallery!.length
          );
        }
      }
    };
    lockSmoothScroll();
    window.addEventListener('keydown', handleKey);
    return () => {
      unlockSmoothScroll();
      window.removeEventListener('keydown', handleKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  const slides =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : project.coverImage
        ? [project.coverImage]
        : [];

  const activeSlide = slides[slideIdx];
  const hasMultipleSlides = slides.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} project dossier`}
      data-lenis-prevent
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-[#120203]/90"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto overscroll-contain bg-parchment-paper text-[#1E0707] border border-[#C8A86B]/50 shadow-[0_35px_90px_rgba(0,0,0,0.75)]"
      >
        {/* Top Modal Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-4 bg-[#EFE5D1]/95 border-b border-[#1E0707]/15">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-[#9E4224]">
            <span>{project.subTag}</span>
            {project.metrics && (
              <>
                <span className="text-[#1E0707]/30">•</span>
                <span className="text-[#4A0B0C] font-medium">{project.metrics}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 border border-[#1E0707]/25 flex items-center justify-center text-[#1E0707] hover:bg-[#3E090B] hover:text-[#EFE5D1] hover:border-[#3E090B] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.4} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Media Column (Video, Carousel, or Manuscript Plate) */}
          <div className="lg:col-span-7 bg-[#240506] text-[#EFE5D1] relative min-h-[320px] md:min-h-[440px] flex flex-col justify-center items-center p-6 border-b lg:border-b-0 lg:border-r border-[#1E0707]/15">
            <BaroqueCorner
              corner="tl"
              tone="gold"
              className="absolute top-3 left-3 opacity-50 z-20"
            />
            <BaroqueCorner
              corner="br"
              tone="gold"
              className="absolute bottom-3 right-3 opacity-50 z-20"
            />

            {project.videoUrl && !videoFailed ? (
              <div className="w-full flex justify-center">
                <div className="relative aspect-[9/16] h-[64vh] max-h-[560px] w-auto shrink-0 bg-[#120203] border border-[#C8A86B]/40 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
                  <video
                    src={project.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                    className="w-full h-full object-contain bg-[#120203]"
                  />
                </div>
              </div>
            ) : activeSlide && !imgFailed ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative inline-flex max-w-full items-center justify-center">
                  <img
                    src={activeSlide}
                    alt={`${project.title} — slide ${slideIdx + 1}`}
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className="aspect-[3/4] max-h-[520px] w-auto object-contain mx-auto"
                  />

                  {hasMultipleSlides && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx(
                            (prev) => (prev - 1 + slides.length) % slides.length
                          )
                        }
                        aria-label="Previous slide"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1B0405]/85 border border-[#C8A86B]/50 flex items-center justify-center text-[#EFE5D1] hover:bg-[#EFE5D1] hover:text-[#1E0707] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx((prev) => (prev + 1) % slides.length)
                        }
                        aria-label="Next slide"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1B0405]/85 border border-[#C8A86B]/50 flex items-center justify-center text-[#EFE5D1] hover:bg-[#EFE5D1] hover:text-[#1E0707] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#1B0405]/90 border border-[#C8A86B]/30 px-3 py-1 text-[10px] tracking-[0.22em] text-[#C8A86B]">
                        {String(slideIdx + 1).padStart(2, '0')} /{' '}
                        {String(slides.length).padStart(2, '0')}
                      </div>
                    </>
                  )}
                </div>

                {hasMultipleSlides && (
                  <div className="scrollbar-hide flex gap-2 overflow-x-auto justify-center mt-4 w-full pb-1">
                    {slides.map((slide, idx) => {
                      const isActive = idx === slideIdx;
                      return (
                        <button
                          key={slide}
                          type="button"
                          onClick={() => setSlideIdx(idx)}
                          aria-label={`View slide ${idx + 1} of ${slides.length}`}
                          aria-current={isActive ? 'true' : undefined}
                          className={`relative shrink-0 w-11 h-[58px] overflow-hidden border transition-all duration-300 ${
                            isActive
                              ? 'border-[#C8A86B] opacity-100'
                              : 'border-[#C8A86B]/25 opacity-55 hover:opacity-90 hover:border-[#C8A86B]/60'
                          }`}
                        >
                          <img
                            src={slide}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Clean Manuscript Folio Fallback for Script/Theatre Works */
              <div className="w-full h-full min-h-[300px] border border-[#C8A86B]/25 p-8 flex flex-col justify-between bg-crimson-canvas">
                <div className="flex items-center justify-between text-[10px] tracking-[0.24em] uppercase text-[#C8A86B]">
                  <span>NARRATIVE DOSSIER</span>
                  {project.videoUrl && (
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> REEL READY
                    </span>
                  )}
                </div>
                <div className="my-auto py-8">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#EFE5D1]/60 mb-3">
                    {project.client}
                  </p>
                  <h3 className="font-serif-editorial text-3xl md:text-4xl italic text-[#EFE5D1] leading-tight">
                    “{project.title}”
                  </h3>
                </div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#C8A86B]/80 border-t border-[#C8A86B]/20 pt-4">
                  WRITTEN & CRAFTED BY ROHA SHHAB
                </p>
              </div>
            )}
          </div>

          {/* Right Editorial Narrative Column */}
          <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#9E4224] mb-2">
                {project.client}
              </p>
              <h2 className="font-serif-editorial text-3xl md:text-4xl leading-[1.1] text-[#1E0707] mb-6">
                {project.title}
              </h2>
              <div className="w-10 h-[1px] bg-[#5C1110]/40 mb-6" />
              <p className="text-[15px] leading-[1.8] text-[#1E0707]/85 font-normal">
                {project.fullStory}
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-[#1E0707]/15 flex flex-wrap items-center justify-between gap-4">
              {project.instagramUrl ? (
                <a
                  href={project.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#5C1110] hover:text-[#9E4224] transition-colors"
                >
                  <span>VIEW ON INSTAGRAM</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#1E0707]/50">
                  PORTFOLIO ARCHIVE '26
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#3E090B] text-[#EFE5D1] text-[11px] tracking-[0.22em] uppercase hover:bg-[#5C1110] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};