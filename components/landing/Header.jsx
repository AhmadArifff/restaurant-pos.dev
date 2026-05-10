'use client';

import { useEffect, useState } from 'react';
import { headerContent } from '@/data/landing/headerContent';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileNav = () => setMobileOpen(false);

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo" aria-label="Sultan Kebab">
          {headerContent.logo}
          <span>{headerContent.logoSpan}</span>
        </a>
        <ul className="nav-links">
          {headerContent.navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          <li>
            <a href={headerContent.adminButton.href} className="nav-login">
              {headerContent.adminButton.label}
            </a>
          </li>
          <li>
            <a href={headerContent.ctaButton.href} className="nav-cta" target="_blank" rel="noreferrer">
              {headerContent.ctaButton.label}
            </a>
          </li>
        </ul>
        <button
          className="hamburger"
          id="hamburgerBtn"
          type="button"
          aria-label="Buka menu"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobileNav">
        <button className="mobile-nav-close" id="mobileClose" type="button" onClick={closeMobileNav}>
          ✕
        </button>
        <a href="#about" onClick={closeMobileNav}>Tentang</a>
        <a href="#bestseller" onClick={closeMobileNav}>Best Seller</a>
        <a href="#menu" onClick={closeMobileNav}>Menu</a>
        <a href="#locations" onClick={closeMobileNav}>Cabang</a>
        <a href="#testimonials" onClick={closeMobileNav}>Ulasan</a>
        <a href={headerContent.mobileAdminButton.href} onClick={closeMobileNav}>
          {headerContent.mobileAdminButton.label}
        </a>
        <a href={headerContent.mobileCta.href} style={{ color: 'var(--gold)' }} target="_blank" rel="noreferrer" onClick={closeMobileNav}>
          {headerContent.mobileCta.label}
        </a>
      </div>
    </>
  );
}
