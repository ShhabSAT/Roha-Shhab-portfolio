import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | null = null;

/**
 * Luxury smooth navigation helper used by Navbar & Footer links.
 */
export function smoothScrollTo(target: string | number) {
  if (activeLenis) {
    activeLenis.scrollTo(target, {
      duration: 1.55,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      offset: 0,
    });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    // Native touch scrolling on mobile is smoother & far lighter on low-end phones
    if (isTouchDevice) {
      activeLenis = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    activeLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, []);

  return <>{children}</>;
};