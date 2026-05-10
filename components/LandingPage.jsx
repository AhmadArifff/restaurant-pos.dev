'use client';

import { useEffect } from 'react';
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

export default function LandingPage() {
  useEffect(() => {
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

  return (
    <div className="landing-page min-h-screen bg-[var(--dark)]">
      <Header />
      <Hero />
      <Marquee />
      <About />
      <Bestsellers />
      <MenuTabs />
      <Experience />
      <Gallery />
      <Locations />
      <Testimonials />
      <CTA />
      <Footer />
      <FloatButton />
    </div>
  );
}