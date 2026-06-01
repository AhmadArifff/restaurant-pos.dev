'use client';

import { useEffect, useState } from 'react';
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
import { getWebsiteSettings } from '@/lib/api';
import { getDefaultLandingContent, resolveLandingContentFromSettings } from '@/lib/landingContent';

const LANDING_CONTENT_CACHE_KEY = 'landing-content-cache-v1';

const readLandingContentCache = () => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = window.localStorage.getItem(LANDING_CONTENT_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const writeLandingContentCache = (content) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LANDING_CONTENT_CACHE_KEY, JSON.stringify(content));
  } catch {
    // Ignore storage quota/private mode failures.
  }
};

function LandingContentShell() {
  return (
    <div className="landing-page min-h-screen bg-[var(--dark)]">
      <div className="landing-loading-shell" aria-label="Memuat Sultan Kebab">
        <div className="landing-loading-card">
          <p>Sultan Kebab</p>
          <div />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [landingContent, setLandingContent] = useState(() => readLandingContentCache());
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(() => Boolean(readLandingContentCache()));

  useEffect(() => {
    let isMounted = true;

    const loadLandingContent = async () => {
      try {
        const response = await getWebsiteSettings();
        const data = response?.data ?? response ?? {};
        if (!isMounted) return;
        const resolvedContent = resolveLandingContentFromSettings(data);
        setLandingContent(resolvedContent);
        writeLandingContentCache(resolvedContent);
      } catch {
        if (isMounted && !landingContent) {
          setLandingContent(getDefaultLandingContent());
        }
      } finally {
        if (isMounted) setHasAttemptedLoad(true);
      }
    };

    loadLandingContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!landingContent) return undefined;

    const revealEls = document.querySelectorAll('.reveal');
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
  }, []);

  if (!landingContent || !hasAttemptedLoad) {
    return <LandingContentShell />;
  }

  return (
    <div className="landing-page min-h-screen bg-[var(--dark)]">
      <Header content={landingContent.header} />
      <Hero content={landingContent.hero} />
      <Marquee content={landingContent.marquee} />
      <About content={landingContent.about} />
      <Bestsellers content={landingContent.bestsellers} />
      <MenuTabs content={landingContent.menuTabs} />
      <Experience content={landingContent.experience} />
      <Gallery content={landingContent.gallery} />
      <Locations content={landingContent.locations} />
      <Testimonials content={landingContent.testimonials} />
      <CTA content={landingContent.cta} />
      <Footer content={landingContent.footer} />
      <FloatButton content={landingContent.floatButton} />
    </div>
  );
}
