'use client';

import AccordionSection from '../form/AccordionSection';
import TextInput from '../form/TextInput';
import TextArea from '../form/TextArea';
import DynamicArray from '../form/DynamicArray';
import { useLandingSettingsStore } from '@/store/landingSettingsStore';

export default function ExperienceSettings() {
  const { settings, updateNestedSetting, addArrayItem, removeArrayItem } = useLandingSettingsStore();
  const experienceSettings = settings.experience || {};
  const features = experienceSettings.features || [];

  return (
    <div className="space-y-6">
      <AccordionSection title="Section Content" defaultOpen={true}>
        <TextInput
          label="Section Label"
          value={experienceSettings.sectionLabel}
          onChange={(val) => updateNestedSetting('experience', 'sectionLabel', val)}
          maxLength={60}
        />
        <TextInput
          label="Title"
          value={experienceSettings.title}
          onChange={(val) => updateNestedSetting('experience', 'title', val)}
          maxLength={100}
        />
        <TextInput
          label="Highlight Text"
          value={experienceSettings.highlight}
          onChange={(val) => updateNestedSetting('experience', 'highlight', val)}
          maxLength={50}
        />
        <TextInput
          label="Subtitle"
          value={experienceSettings.subtitle}
          onChange={(val) => updateNestedSetting('experience', 'subtitle', val)}
          maxLength={100}
        />
      </AccordionSection>

      <AccordionSection title="Features">
        <DynamicArray
          items={features}
          label="Experience Features"
          onAdd={() =>
            addArrayItem('experience', 'features', {
              icon: '*',
              title: 'Fitur Baru',
              description: 'Deskripsi fitur',
            })
          }
          onRemove={(idx) => removeArrayItem('experience', 'features', idx)}
          renderItem={(item, idx) => (
            <div className="space-y-2">
              <TextInput
                label="Icon"
                value={item.icon}
                onChange={(val) => updateNestedSetting('experience', `features.${idx}.icon`, val)}
                maxLength={6}
                placeholder="*"
              />
              <TextInput
                label="Title"
                value={item.title}
                onChange={(val) => updateNestedSetting('experience', `features.${idx}.title`, val)}
                maxLength={80}
              />
              <TextArea
                label="Description"
                value={item.description}
                onChange={(val) => updateNestedSetting('experience', `features.${idx}.description`, val)}
                rows={3}
                maxLength={240}
              />
            </div>
          )}
          addButtonLabel="+ Add Feature"
          maxItems={10}
        />
      </AccordionSection>
    </div>
  );
}
