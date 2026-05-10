'use client';

import AccordionSection from '../form/AccordionSection';
import TextInput from '../form/TextInput';
import TextArea from '../form/TextArea';
import ImageUpload from '../form/ImageUpload';
import DynamicArray from '../form/DynamicArray';
import { useLandingSettingsStore } from '@/store/landingSettingsStore';

export default function MenuTabsSettings() {
  const { settings, updateNestedSetting, addArrayItem, removeArrayItem } = useLandingSettingsStore();
  const menuTabsSettings = settings.menuTabs || {};
  const categories = menuTabsSettings.categories || [];

  return (
    <div className="space-y-6">
      <AccordionSection title="Section Content" defaultOpen={true}>
        <TextInput
          label="Section Label"
          value={menuTabsSettings.sectionLabel}
          onChange={(val) => updateNestedSetting('menuTabs', 'sectionLabel', val)}
          maxLength={60}
        />
        <TextInput
          label="Title"
          value={menuTabsSettings.title}
          onChange={(val) => updateNestedSetting('menuTabs', 'title', val)}
          maxLength={100}
        />
        <TextInput
          label="Highlight Text"
          value={menuTabsSettings.highlight}
          onChange={(val) => updateNestedSetting('menuTabs', 'highlight', val)}
          maxLength={40}
        />
        <TextArea
          label="Description"
          value={menuTabsSettings.description}
          onChange={(val) => updateNestedSetting('menuTabs', 'description', val)}
          rows={4}
          maxLength={320}
        />
      </AccordionSection>

      <AccordionSection title="Categories & Items">
        <DynamicArray
          items={categories}
          label="Menu Categories"
          onAdd={() =>
            addArrayItem('menuTabs', 'categories', {
              id: `cat-${Date.now()}`,
              label: 'Kategori Baru',
              items: [],
            })
          }
          onRemove={(idx) => removeArrayItem('menuTabs', 'categories', idx)}
          renderItem={(category, cIdx) => (
            <div className="space-y-3">
              <TextInput
                label="Category ID"
                value={category.id}
                onChange={(val) => updateNestedSetting('menuTabs', `categories.${cIdx}.id`, val)}
                maxLength={40}
              />
              <TextInput
                label="Category Label"
                value={category.label}
                onChange={(val) => updateNestedSetting('menuTabs', `categories.${cIdx}.label`, val)}
                maxLength={80}
              />

              <DynamicArray
                items={category.items || []}
                label="Items"
                onAdd={() =>
                  addArrayItem('menuTabs', `categories.${cIdx}.items`, {
                    id: Date.now(),
                    name: 'Menu Baru',
                    orderName: 'Menu Baru',
                    image: '',
                    tag: '',
                    tagClass: 'tag-new',
                    description: 'Deskripsi menu',
                    price: 'Rp 0',
                  })
                }
                onRemove={(iIdx) => removeArrayItem('menuTabs', `categories.${cIdx}.items`, iIdx)}
                renderItem={(item, iIdx) => (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <TextInput
                        label="Item ID"
                        value={item.id}
                        onChange={(val) =>
                          updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.id`, val)
                        }
                      />
                      <TextInput
                        label="Tag Class"
                        value={item.tagClass}
                        onChange={(val) =>
                          updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.tagClass`, val)
                        }
                        placeholder="tag-popular"
                      />
                    </div>
                    <TextInput
                      label="Name"
                      value={item.name}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.name`, val)
                      }
                      maxLength={80}
                    />
                    <TextInput
                      label="Order Name"
                      value={item.orderName}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.orderName`, val)
                      }
                      maxLength={80}
                    />
                    <ImageUpload
                      label="Image"
                      value={item.image}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.image`, val)
                      }
                    />
                    <TextInput
                      label="Tag"
                      value={item.tag}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.tag`, val)
                      }
                      maxLength={30}
                    />
                    <TextArea
                      label="Description"
                      value={item.description}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.description`, val)
                      }
                      rows={3}
                      maxLength={220}
                    />
                    <TextInput
                      label="Price"
                      value={item.price}
                      onChange={(val) =>
                        updateNestedSetting('menuTabs', `categories.${cIdx}.items.${iIdx}.price`, val)
                      }
                      maxLength={40}
                    />
                  </div>
                )}
                addButtonLabel="+ Add Item"
                maxItems={24}
              />
            </div>
          )}
          addButtonLabel="+ Add Category"
          maxItems={12}
        />
      </AccordionSection>
    </div>
  );
}
