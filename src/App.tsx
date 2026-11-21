import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScroll } from './components/SmoothScroll';
import { Preloader } from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClientMarquee from './components/ClientMarquee';
import AboutSection from './components/AboutSection';
import { CurvedShowcase } from './components/CurvedShowcase';
import { HexagonDrumShowcase } from './components/HexagonDrumShowcase';
import { SelectedWorks } from './components/SelectedWorks';
import { ServicesSection } from './components/ServicesSection';
import { CredentialsSection } from './components/CredentialsSection';
import Footer from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import type { ProjectItem } from './data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Zero-cost film grain: rasterise a single 128×128 monochrome tile once on
  // desktop, then let CSS repeat that static PNG. No live SVG turbulence filter
  // means the compositor never re-rasterises a full-screen texture on scroll.
  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (isTouch) return;

    const tile = document.createElement('canvas');
    tile.width = 128;
    tile.height = 128;
    const ctx = tile.getContext('2d');
    if (!ctx) return;

    const image = ctx.createImageData(tile.width, tile.height);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = (Math.random() * 255) | 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);

    const overlay = document.querySelector<HTMLElement>('.film-grain-overlay');
    if (overlay) {
      overlay.style.backgroundImage = `url(${tile.toDataURL('image/png')})`;
    }
  }, []);

  // Re-measure every chained Entry / Pin / Exit boundary once webfonts settle.
  useEffect(() => {
    let settleTimer: number | undefined;
    let cancelled = false;

    const refreshAfterSettle = () => {
      if (cancelled) return;
      settleTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(refreshAfterSettle);
    } else {
      refreshAfterSettle();
    }

    return () => {
      cancelled = true;
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <SmoothScroll>
      {/* Theatre curtain opening sequence */}
      <Preloader />

      {/* Subtle repeating static film-grain tile (desktop only) */}
      <div className="film-grain-overlay" aria-hidden="true" />

      {/* Luxury editorial custom cursor */}
      <CustomCursor />

      {/* Fixed Editorial Header */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="min-h-screen w-full bg-[#2D0608] text-[#EFE5D1]">
        <Hero />
        <ClientMarquee />
        <AboutSection />
        <CurvedShowcase onSelectProject={setSelectedProject} />
        <HexagonDrumShowcase onSelectProject={setSelectedProject} />
        <SelectedWorks onSelectProject={setSelectedProject} />
        <ServicesSection />
        <CredentialsSection />
        <Footer />
      </main>

      {/* Project Modal Dossier View */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </SmoothScroll>
  );
};

export default App;
