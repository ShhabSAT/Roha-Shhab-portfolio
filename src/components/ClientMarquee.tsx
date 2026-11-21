import React from 'react';
import { SITE_INFO } from '../data/portfolioData';

export const ClientMarquee: React.FC = () => {
  const clients = SITE_INFO.trustedBy;
  // Duplicate array for seamless infinite marquee loop
  const marqueeList = [...clients, ...clients, ...clients, ...clients];

  return (
    <div className="relative w-full bg-[#1C0405] border-y border-[#C8A86B]/25 py-5 md:py-6 overflow-hidden select-none">
      {/* Woven Tapestry Weave Layer (normal blend on mobile for locked 60fps) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-normal md:mix-blend-soft-light"
        style={{ backgroundImage: "url('/media/bg-tapestry.webp')" }}
      />

      {/* Edge Fade Gradients */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#1C0405] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#1C0405] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Scrolling Content Track */}
      <div className="relative z-[1] animate-marquee flex items-center will-change-transform">
        {marqueeList.map((client, index) => (
          <div key={`${client}-${index}`} className="flex items-center">
            <span className="font-serif-editorial text-base md:text-xl font-light tracking-[0.22em] text-[#EFE5D1]/80 hover:text-[#C8A86B] transition-colors duration-300 whitespace-nowrap">
              {client}
            </span>
            <span
              className="text-[#C8A86B]/60 text-[10px] mx-6 md:mx-10 select-none"
              aria-hidden="true"
            >
              ◆
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientMarquee;
