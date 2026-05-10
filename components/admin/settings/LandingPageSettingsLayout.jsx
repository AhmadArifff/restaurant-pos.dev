'use client';

import { useState } from 'react';
import HeaderSettings from './HeaderSettings';
import HeroSettings from './HeroSettings';
import HeaderPreview from '../preview/HeaderPreview';
import HeroPreview from '../preview/HeroPreview';
import AccordionSection from '../form/AccordionSection';
import { useLandingSettingsStore } from '@/store/landingSettingsStore';

const SETTINGS_SECTIONS = [
  {
    id: 'header',
    title: 'Header',
    component: HeaderSettings,
    preview: HeaderPreview,
  },
  {
    id: 'hero',
    title: 'Hero Section',
    component: HeroSettings,
    preview: HeroPreview,
  },
];

export default function LandingPageSettingsLayout() {
  const [expandedSection, setExpandedSection] = useState('header');
  const { settings, isDirty, saveSettings, resetSettings } = useLandingSettingsStore();

  const currentSection = SETTINGS_SECTIONS.find((s) => s.id === expandedSection);
  const SettingsComponent = currentSection?.component;
  const PreviewComponent = currentSection?.preview;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">Landing Page Settings</h1>
          <p className="text-slate-400">Manage all landing page sections and see live preview</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={saveSettings}
            disabled={!isDirty}
            className="px-4 py-2 bg-yellow-500 text-slate-950 font-semibold rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save Changes
          </button>
          <button
            onClick={resetSettings}
            disabled={!isDirty}
            className="px-4 py-2 bg-slate-800 text-cream border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Reset
          </button>
          {isDirty && (
            <div className="flex items-center text-yellow-500">
              Unsaved changes
            </div>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Settings Form */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-cream">Settings</h2>
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

          {/* Right Column - Live Preview */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 sticky top-6">
            <h2 className="text-xl font-semibold text-cream mb-6 pb-4 border-b border-slate-700">
              Live Preview
            </h2>

            {PreviewComponent && (
              <div className="bg-black rounded border border-slate-700 overflow-hidden">
                <PreviewComponent settings={settings[expandedSection]} />
              </div>
            )}
          </div>
        </div>

        {/* All Sections List */}
        <div className="mt-12 bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-semibold text-cream mb-6">All Sections</h2>
          <div className="space-y-2">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded transition ${
                  expandedSection === section.id
                    ? 'bg-gold text-slate-950 font-semibold'
                    : 'bg-slate-800 text-cream hover:bg-slate-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
