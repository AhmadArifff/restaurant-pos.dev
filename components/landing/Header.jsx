'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { headerContent } from '@/data/landing/headerContent';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(13,10,6,0.95)] backdrop-blur-md border-b border-[rgba(201,168,76,0.2)]'
          : 'bg-transparent'
      } px-[5%] py-3 md:py-5`}
    >
      <nav className="flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="font-[var(--font-brand)] text-2xl md:text-3xl tracking-widest text-[var(--gold)]"
        >
          {headerContent.logo}
          <span className="text-[var(--cream)]">{headerContent.logoSpan}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {headerContent.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[var(--cream2)] text-sm uppercase tracking-widest font-medium hover:text-[var(--gold)] transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Button Desktop */}
        <a
          href={headerContent.ctaButton.href}
          className="hidden md:inline-block bg-[var(--gold)] text-[var(--dark)] px-4 py-2 rounded text-sm font-medium hover:bg-[var(--gold-light)] transition-colors duration-300"
        >
          {headerContent.ctaButton.label}
        </a>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[var(--gold)] text-2xl"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-[rgba(201,168,76,0.2)]">
          {headerContent.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-[var(--cream2)] text-sm uppercase tracking-widest hover:text-[var(--gold)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={headerContent.ctaButton.href}
            className="block bg-[var(--gold)] text-[var(--dark)] px-4 py-2 rounded text-sm font-medium text-center hover:bg-[var(--gold-light)] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {headerContent.ctaButton.label}
          </a>
        </div>
      )}
    </header>
  );
}
