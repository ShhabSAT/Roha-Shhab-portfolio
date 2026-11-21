import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE_INFO } from '../data/portfolioData';
import { smoothScrollTo } from './SmoothScroll';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'SHOWCASE', href: '#showcase' },
  { label: 'WORKS', href: '#works' },
  { label: 'SERVICES', href: '#services' },
  { label: 'CREDENTIALS', href: '#credentials' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  /**
   * Editorial anchor navigation.
   * Closes the drawer first, then glides with Lenis once the body scroll lock
   * has been released so the destination always lands exactly on the section.
   */
  const handleAnchor = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    const target = href === '#' ? 0 : href;

    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      window.setTimeout(() => smoothScrollTo(target), 140);
      return;
    }

    smoothScrollTo(target);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500 flex items-center ${
          isScrolled
            ? 'bg-[#240506]/90 border-b border-[#C8A86B]/20 shadow-[0_8px_32px_rgba(27,4,5,0.45)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-14 flex items-center justify-between">
          {/* Left: Minimal Serif Wordmark */}
          <a
            href="#"
            onClick={(event) => handleAnchor(event, '#')}
            className="flex items-center gap-3 group transition-transform duration-300 hover:opacity-90"
          >
            <span className="font-serif-editorial text-xl md:text-2xl font-normal tracking-wide text-[#EFE5D1] group-hover:text-[#C8A86B] transition-colors duration-300">
              {SITE_INFO.nameEn}
            </span>
          </a>

          {/* Center (Desktop): Uppercase micro-links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => handleAnchor(event, link.href)}
                className="text-[11px] font-sans font-medium uppercase tracking-[0.22em] text-[#EFE5D1]/80 hover:text-[#C8A86B] transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C8A86B] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right (Desktop): Architectural Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#contact"
              onClick={(event) => handleAnchor(event, '#contact')}
              className="px-5 py-2.5 rounded-none border border-[#C8A86B]/50 text-[11px] font-sans font-medium uppercase tracking-[0.22em] text-[#EFE5D1] transition-all duration-300 hover:bg-[#EFE5D1] hover:text-[#1E0707] hover:border-[#EFE5D1]"
            >
              LET'S TALK
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[#EFE5D1] hover:text-[#C8A86B] transition-colors"
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1.25} /> : <Menu size={24} strokeWidth={1.25} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[#1B0405] transition-all duration-500 md:hidden flex flex-col justify-between pt-28 pb-12 px-8 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        <div className="flex flex-col space-y-6">
          <div className="text-[10px] tracking-[0.25em] uppercase text-[#C8A86B]/70 mb-2">
            INDEX / ARCHIVE '26
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => handleAnchor(event, link.href)}
              className="font-serif-editorial text-3xl font-light tracking-wide text-[#EFE5D1] hover:text-[#C8A86B] transition-colors flex items-center justify-between border-b border-[#C8A86B]/15 pb-4"
            >
              <span>{link.label}</span>
              <span className="text-xs font-sans tracking-[0.2em] text-[#C8A86B]/60">→</span>
            </a>
          ))}
        </div>

        <div className="flex flex-col space-y-6 pt-6 border-t border-[#C8A86B]/20">
          <a
            href="#contact"
            onClick={(event) => handleAnchor(event, '#contact')}
            className="w-full text-center py-3.5 rounded-none border border-[#C8A86B] text-xs font-sans font-medium uppercase tracking-[0.22em] bg-[#EFE5D1] text-[#1E0707]"
          >
            LET'S TALK
          </a>
          <div className="flex flex-col gap-2 items-start text-[11px] tracking-[0.2em] text-[#EFE5D1]/60 uppercase">
            <span className="break-all">{SITE_INFO.email}</span>
            <span className="text-[#C8A86B]/80">ARCHIVE '26</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
