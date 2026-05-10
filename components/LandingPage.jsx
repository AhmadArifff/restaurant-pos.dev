'use client';

import { useState } from 'react';
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

const SECTIONS = [
  { id: 'header', label: 'Header', component: Header },
  { id: 'hero', label: 'Hero', component: Hero },
  { id: 'marquee', label: 'Marquee', component: Marquee },
  { id: 'about', label: 'About', component: About },
  { id: 'bestsellers', label: 'Bestsellers', component: Bestsellers },
  { id: 'menu', label: 'Menu', component: MenuTabs },
  { id: 'experience', label: 'Experience', component: Experience },
  { id: 'gallery', label: 'Gallery', component: Gallery },
  { id: 'locations', label: 'Locations', component: Locations },
  { id: 'testimonials', label: 'Testimonials', component: Testimonials },
  { id: 'cta', label: 'CTA', component: CTA },
  { id: 'footer', label: 'Footer', component: Footer },
];

export default function LandingPage() {
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState('header');

  // In preview mode, only show selected section
  if (previewMode) {
    const section = SECTIONS.find((s) => s.id === selectedSection);
    if (!section) return null;

    const Component = section.component;
    return (
      <div className="min-h-screen bg-[var(--dark)]">
        {/* Preview Controls */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--dark2)] border-b-2 border-[var(--gold)] p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-[var(--gold)] font-bold text-lg">
              Preview Mode: {section.label}
            </h2>

            <div className="flex flex-wrap justify-center gap-2">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-4 py-2 bg-[var(--dark)] text-[var(--cream)] border border-[var(--gold)] rounded"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 bg-[var(--gold)] text-[var(--dark)] font-semibold rounded hover:bg-[var(--gold-light)] transition-colors"
              >
                ✓ Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Component Preview */}
        <div className="pt-24">
          <Component />
        </div>
      </div>
    );
  }

  // Full landing page
  return (
    <div className="min-h-screen bg-[var(--dark)]">
      {/* Preview Toggle Button */}
      <button
        onClick={() => {
          setPreviewMode(true);
          setSelectedSection('header');
        }}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-[var(--gold)] text-[var(--dark)] font-semibold rounded-lg hover:bg-[var(--gold-light)] transition-colors shadow-lg md:px-6 md:py-3"
        title="Enter preview mode to review sections"
      >
        👁️ Preview Mode
      </button>

      {/* Full Landing Page */}
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
