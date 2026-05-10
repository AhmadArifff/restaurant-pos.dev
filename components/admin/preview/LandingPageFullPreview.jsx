'use client';

import { useEffect, useMemo, useRef } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Marquee from '@/components/landing/Marquee';
import About from '@/components/landing/About';
import Bestsellers from '@/components/landing/Bestsellers';
import MenuTabs from '@/components/landing/MenuTabs';
import Experience from '@/components/landing/Experience';
import Gallery from '@/components/landing/Gallery';
import Locations from '@/components/landing/Locations';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import FloatButton from '@/components/landing/FloatButton';

const PREVIEW_SECTIONS = [
  { id: 'header', title: 'Header', Component: Header },
  { id: 'hero', title: 'Hero Section', Component: Hero },
  { id: 'marquee', title: 'Marquee Section', Component: Marquee },
  { id: 'about', title: 'About Section', Component: About },
  { id: 'bestsellers', title: 'Bestsellers Section', Component: Bestsellers, previewMode: true },
  { id: 'menuTabs', title: 'Menu Tabs Section', Component: MenuTabs, previewMode: true },
  { id: 'experience', title: 'Experience Section', Component: Experience },
  { id: 'gallery', title: 'Gallery Section', Component: Gallery },
  { id: 'locations', title: 'Locations Section', Component: Locations, previewMode: true },
  { id: 'testimonials', title: 'Testimonials Section', Component: Testimonials },
  { id: 'cta', title: 'CTA Section', Component: CTA, previewMode: true },
  { id: 'footer', title: 'Footer Section', Component: Footer },
  { id: 'floatButton', title: 'Float Button Section', Component: FloatButton, previewMode: true },
];

function toFlatText(value) {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function makeCursorText(sectionId, content) {
  switch (sectionId) {
    case 'header':
      return toFlatText(
        `${content?.header?.logo || ''} ${content?.header?.logoSpan || ''} | ${(content?.header?.navLinks || [])
          .map((item) => item.label)
          .join(' • ')}`,
      );
    case 'hero':
      return toFlatText(
        `${content?.hero?.badge || ''} | ${content?.hero?.titleTop || ''} ${content?.hero?.titleAccent || ''} ${content?.hero?.titleBottom || ''} | ${content?.hero?.subtitle || ''}`,
      );
    case 'marquee':
      return toFlatText((content?.marquee?.items || []).join(' • '));
    case 'about':
      return toFlatText(
        `${content?.about?.sectionLabel || ''} | ${content?.about?.title || ''} | ${content?.about?.description || ''}`,
      );
    case 'bestsellers':
      return toFlatText(
        `${content?.bestsellers?.sectionLabel || ''} | ${(content?.bestsellers?.products || [])
          .map((item) => item.name)
          .join(' • ')}`,
      );
    case 'menuTabs':
      return toFlatText(
        `${content?.menuTabs?.sectionLabel || ''} | ${(content?.menuTabs?.categories || [])
          .map((item) => item.label)
          .join(' • ')}`,
      );
    case 'experience':
      return toFlatText(
        `${content?.experience?.sectionLabel || ''} | ${content?.experience?.title || ''} ${content?.experience?.subtitle || ''} | ${(content?.experience?.features || [])
          .map((item) => item.title)
          .join(' • ')}`,
      );
    case 'gallery':
      return toFlatText(
        (content?.gallery?.images || []).map((item) => item.alt || 'Gallery').join(' • '),
      );
    case 'locations':
      return toFlatText(
        `${content?.locations?.sectionLabel || ''} | ${(content?.locations?.branches || [])
          .map((item) => item.name)
          .join(' • ')}`,
      );
    case 'testimonials':
      return toFlatText(
        `${content?.testimonials?.sectionLabel || ''} | ${(content?.testimonials?.items || [])
          .map((item) => item.author)
          .join(' • ')}`,
      );
    case 'cta':
      return toFlatText(
        `${content?.cta?.sectionLabel || ''} | ${content?.cta?.title || ''} | ${content?.cta?.description || ''}`,
      );
    case 'footer':
      return toFlatText(
        `${content?.footer?.brand || ''} | ${(content?.footer?.columns || [])
          .map((col) => col.title)
          .join(' • ')}`,
      );
    case 'floatButton':
      return toFlatText(`${content?.floatButton?.ariaLabel || ''} | ${content?.floatButton?.whatsappUrl || ''}`);
    default:
      return '';
  }
}

function normalizeContent(settings) {
  const header = settings?.header || {};
  const hero = settings?.hero || {};

  const heroStats = (hero.stats || []).map((stat) => {
    if (typeof stat?.value === 'string' && !stat?.suffix) {
      return {
        ...stat,
        text: stat.value,
      };
    }
    return {
      ...stat,
      text: stat?.text ?? undefined,
    };
  });

  return {
    header: {
      logo: header.logo?.part1 || 'SULTAN',
      logoSpan: header.logo?.part2 || 'KEBAB',
      navLinks: header.navLinks || [],
      ctaButton: header.buttons?.cta || { label: 'Pesan Sekarang', href: '#' },
      adminButton: header.buttons?.admin || { label: 'Login Admin', href: '/login' },
      mobileCta: header.buttons?.cta || { label: 'Pesan Sekarang', href: '#' },
      mobileAdminButton: header.buttons?.admin || { label: 'Login Admin', href: '/login' },
    },
    hero: {
      backgroundImage: hero.backgroundImage,
      badge: hero.badge,
      titleTop: hero.title?.part1,
      titleAccent: hero.title?.part2,
      titleBottom: hero.title?.part3,
      subtitle: hero.subtitle,
      ctaPrimary: hero.buttons?.primary || { label: '', href: '#' },
      ctaSecondary: hero.buttons?.secondary || { label: '', href: '#' },
      stats: heroStats,
    },
    marquee: settings?.marquee || {},
    about: settings?.about || {},
    bestsellers: settings?.bestsellers || {},
    menuTabs: settings?.menuTabs || {},
    experience: settings?.experience || {},
    gallery: settings?.gallery || {},
    locations: settings?.locations || {},
    testimonials: settings?.testimonials || {},
    cta: settings?.cta || {},
    footer: settings?.footer || {},
    floatButton: {
      whatsappUrl: settings?.floatButton?.href || settings?.cta?.whatsappUrl || '#',
      icon: settings?.floatButton?.icon === 'Chat' ? '💬' : (settings?.floatButton?.icon || '💬'),
      ariaLabel: settings?.floatButton?.ariaLabel || 'Pesan via WhatsApp',
    },
  };
}

export default function LandingPageFullPreview({ settings, highlightedSection }) {
  const previewRootRef = useRef(null);
  const content = useMemo(() => normalizeContent(settings), [settings]);

  useEffect(() => {
    const root = previewRootRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [settings]);

  return (
    <div ref={previewRootRef} className="landing-page landing-admin-preview min-h-screen bg-[var(--dark)]">
      {PREVIEW_SECTIONS.map((section) => {
        const SectionComponent = section.Component;
        const isActive = highlightedSection === section.id;
        const cursorText = makeCursorText(section.id, content);

        return (
          <div key={section.id} className={isActive ? 'landing-preview-section--active' : ''}>
            <div className="landing-preview-section-label">
              <div className="text-slate-200">{section.title}</div>
              <span className="landing-preview-cursor-text">{cursorText || section.title}</span>
            </div>
            <SectionComponent
              content={content[section.id]}
              previewMode={section.previewMode}
            />
          </div>
        );
      })}
    </div>
  );
}
