'use client';

import AccordionSection from '../form/AccordionSection';
import TextInput from '../form/TextInput';
import TextArea from '../form/TextArea';
import ImageUpload from '../form/ImageUpload';
import { useLandingSettingsStore } from '@/store/landingSettingsStore';

export default function CTASettings() {
  const { settings, updateNestedSetting } = useLandingSettingsStore();
  const ctaSettings = settings.cta || {};

  return (
    <div className="space-y-6">
      <AccordionSection title="Background" defaultOpen={true}>
        <ImageUpload
          label="Background Image"
          value={ctaSettings.backgroundImage}
          onChange={(val) => updateNestedSetting('cta', 'backgroundImage', val)}
        />
      </AccordionSection>

      <AccordionSection title="Section Content">
        <TextInput
          label="Section Label"
          value={ctaSettings.sectionLabel}
          onChange={(val) => updateNestedSetting('cta', 'sectionLabel', val)}
          maxLength={60}
        />
        <TextInput
          label="Title"
          value={ctaSettings.title}
          onChange={(val) => updateNestedSetting('cta', 'title', val)}
          maxLength={120}
        />
        <TextInput
          label="Highlight"
          value={ctaSettings.highlight}
          onChange={(val) => updateNestedSetting('cta', 'highlight', val)}
          maxLength={60}
        />
        <TextArea
          label="Description"
          value={ctaSettings.description}
          onChange={(val) => updateNestedSetting('cta', 'description', val)}
          rows={4}
          maxLength={320}
        />
      </AccordionSection>

      <AccordionSection title="Buttons">
        <TextInput
          label="WhatsApp URL"
          value={ctaSettings.whatsappUrl}
          onChange={(val) => updateNestedSetting('cta', 'whatsappUrl', val)}
        />
        <TextInput
          label="Secondary Label"
          value={ctaSettings.secondaryButton?.label}
          onChange={(val) => updateNestedSetting('cta', 'secondaryButton.label', val)}
          maxLength={50}
        />
        <TextInput
          label="Secondary Link"
          value={ctaSettings.secondaryButton?.href}
          onChange={(val) => updateNestedSetting('cta', 'secondaryButton.href', val)}
        />
      </AccordionSection>
    </div>
  );
}
