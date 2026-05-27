'use client';

import { useEffect, useMemo, useState } from 'react';
import HeaderSettings from './HeaderSettings';
import HeroSettings from './HeroSettings';
import MarqueeSettings from './MarqueeSettings';
import AboutSettings from './AboutSettings';
import BestsellersSettings from './BestsellersSettings';
import MenuTabsSettings from './MenuTabsSettings';
import ExperienceSettings from './ExperienceSettings';
import GallerySettings from './GallerySettings';
import LocationsSettings from './LocationsSettings';
import TestimonialsSettings from './TestimonialsSettings';
import CTASettings from './CTASettings';
import FooterSettings from './FooterSettings';
import FloatButtonSettings from './FloatButtonSettings';
import LandingPageFullPreview from '../preview/LandingPageFullPreview';
import { useLandingSettingsStore } from '@/store/landingSettingsStore';
import SectionSkeleton from '@/components/ui/SectionSkeleton';

const SETTINGS_SECTIONS = [
  { id: 'header', title: 'Header', component: HeaderSettings },
  { id: 'hero', title: 'Hero Section', component: HeroSettings },
  { id: 'marquee', title: 'Marquee Section', component: MarqueeSettings },
  { id: 'about', title: 'About Section', component: AboutSettings },
  { id: 'bestsellers', title: 'Bestsellers Section', component: BestsellersSettings },
  { id: 'menuTabs', title: 'Menu Tabs Section', component: MenuTabsSettings },
  { id: 'experience', title: 'Experience Section', component: ExperienceSettings },
  { id: 'gallery', title: 'Gallery Section', component: GallerySettings },
  { id: 'locations', title: 'Locations Section', component: LocationsSettings },
  { id: 'testimonials', title: 'Testimonials Section', component: TestimonialsSettings },
  { id: 'cta', title: 'CTA Section', component: CTASettings },
  { id: 'footer', title: 'Footer Section', component: FooterSettings },
  { id: 'floatButton', title: 'Float Button Section', component: FloatButtonSettings },
];

export default function LandingPageSettingsLayout() {
  const [expandedSection, setExpandedSection] = useState('header');
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  const {
    settings,
    isDirty,
    isSaving,
    isLoading,
    saveError,
    loadError,
    lastSavedAt,
    saveSettings,
    loadSettings,
    resetSettings,
  } = useLandingSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const currentSection = useMemo(
    () => SETTINGS_SECTIONS.find((s) => s.id === expandedSection),
    [expandedSection],
  );
  const SettingsComponent = currentSection?.component;

  const handleSave = async () => {
    await saveSettings();
  };

  return (
    <div className="h-full bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-[1700px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cream mb-2">Landing Page Settings</h1>
          <p className="text-slate-400">Kelola semua 13 section landing page dengan preview lengkap.</p>
        </div>

        {isLoading && !lastSavedAt && (
          <div className="mb-6">
            <SectionSkeleton />
          </div>
        )}

        {(loadError || saveError) && (
          <div className="mb-5 px-4 py-3 rounded border border-red-700 bg-red-950/40 text-red-200 text-sm">
            {loadError || saveError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-yellow-500 text-slate-950 font-semibold rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={resetSettings}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-slate-800 text-cream border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Reset
          </button>
          <button
            onClick={() => setIsPreviewFullscreen(true)}
            className="px-4 py-2 bg-slate-800 text-cream border border-slate-600 rounded hover:bg-slate-700 transition"
          >
            Full Screen Preview
          </button>
          {isLoading && <div className="flex items-center text-slate-400 text-sm">Loading from database...</div>}
          {!isLoading && isDirty && <div className="flex items-center text-yellow-400 text-sm">Unsaved changes</div>}
          {!isDirty && lastSavedAt && (
            <div className="flex items-center text-emerald-400 text-sm">
              Saved at {new Date(lastSavedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[560px_minmax(0,1fr)] gap-6">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-cream">Section Form</h2>
              <select
                value={expandedSection}
                onChange={(e) => setExpandedSection(e.target.value)}
                className="bg-slate-800 text-cream px-3 py-2 rounded border border-slate-600 text-sm"
              >
                {SETTINGS_SECTIONS.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>

            {SettingsComponent && (
              <div className="space-y-4">
                <SettingsComponent />
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-semibold text-cream">Full Landing Preview</h2>
              <span className="text-xs text-slate-400">
                Highlight: {currentSection?.title || '-'}
              </span>
            </div>
            <div className="h-[78vh] overflow-y-auto rounded border border-slate-700">
              <LandingPageFullPreview settings={settings} highlightedSection={expandedSection} />
            </div>
          </div>
        </div>

        <div className="mt-10 bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold text-cream mb-6">All Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(section.id)}
                className={`text-left px-4 py-3 rounded transition ${
                  expandedSection === section.id
                    ? 'bg-yellow-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-cream hover:bg-slate-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPreviewFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/85 p-4 md:p-6">
          <div className="h-full max-w-[1800px] mx-auto bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h3 className="text-cream font-semibold">Landing Page Full Screen Preview</h3>
              <button
                onClick={() => setIsPreviewFullscreen(false)}
                className="px-3 py-1.5 text-sm bg-slate-800 text-cream rounded border border-slate-600 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            <div className="h-[calc(100%-56px)] overflow-y-auto">
              <LandingPageFullPreview settings={settings} highlightedSection={expandedSection} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
