import { create } from 'zustand';
import { getWebsiteSettings, bulkUpdateWebsiteSettings } from '@/lib/api';
import { headerContent } from '@/data/landing/headerContent';
import { heroContent } from '@/data/landing/heroContent';
import { marqueeContent } from '@/data/landing/marqueeContent';
import { aboutContent } from '@/data/landing/aboutContent';
import { bestsellersContent } from '@/data/landing/bestsellersContent';
import { menuContent } from '@/data/landing/menuContent';
import { experienceContent } from '@/data/landing/experienceContent';
import { galleryContent } from '@/data/landing/galleryContent';
import { locationsContent } from '@/data/landing/locationsContent';
import { testimonialsContent } from '@/data/landing/testimonialsContent';
import { ctaContent } from '@/data/landing/ctaContent';
import { footerContent } from '@/data/landing/footerContent';

const LANDING_SETTINGS_DB_KEY = 'landing_page_settings';

const clone = (value) => JSON.parse(JSON.stringify(value));

const safeParse = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const deepMergeWithDefaults = (defaults, overrides) => {
  if (Array.isArray(defaults)) {
    return Array.isArray(overrides) ? overrides : defaults;
  }

  if (defaults && typeof defaults === 'object') {
    const merged = { ...defaults };
    const source = overrides && typeof overrides === 'object' ? overrides : {};

    Object.keys(merged).forEach((key) => {
      merged[key] = deepMergeWithDefaults(merged[key], source[key]);
    });

    Object.keys(source).forEach((key) => {
      if (!(key in merged)) {
        merged[key] = source[key];
      }
    });

    return merged;
  }

  return overrides ?? defaults;
};

const defaultLandingSettings = {
  header: {
    logo: {
      part1: headerContent.logo || 'SULTAN',
      part2: headerContent.logoSpan || 'KEBAB',
    },
    navLinks: headerContent.navLinks || [],
    buttons: {
      cta: {
        label: headerContent.ctaButton?.label || 'Pesan Sekarang',
        href: headerContent.ctaButton?.href || 'https://wa.me/6281234567890',
      },
      admin: {
        label: headerContent.adminButton?.label || 'Login Admin',
        href: headerContent.adminButton?.href || '/login',
      },
    },
  },
  hero: {
    backgroundImage: heroContent.backgroundImage || '',
    badge: heroContent.badge || '',
    title: {
      part1: heroContent.titleTop || '',
      part2: heroContent.titleAccent || '',
      part3: heroContent.titleBottom || '',
    },
    subtitle: heroContent.subtitle || '',
    buttons: {
      primary: {
        label: heroContent.ctaPrimary?.label || 'Lihat Menu',
        href: heroContent.ctaPrimary?.href || '#menu',
      },
      secondary: {
        label: heroContent.ctaSecondary?.label || 'Temukan Cabang',
        href: heroContent.ctaSecondary?.href || '#locations',
      },
    },
    stats: (heroContent.stats || []).map((stat) => ({
      value: stat.value ?? stat.text ?? '',
      suffix: stat.suffix || '',
      label: stat.label || '',
    })),
  },
  marquee: {
    items: marqueeContent.items || [],
    dot: marqueeContent.dot || '*',
  },
  about: {
    sectionLabel: aboutContent.sectionLabel || '',
    title: aboutContent.title || '',
    highlight: aboutContent.highlight || '',
    description: aboutContent.description || '',
    mainImage: aboutContent.mainImage || '',
    accentImage: aboutContent.accentImage || '',
    badgeTop: aboutContent.badgeTop || '',
    badgeBottom: aboutContent.badgeBottom || '',
    features: aboutContent.features || [],
  },
  bestsellers: {
    sectionLabel: bestsellersContent.sectionLabel || '',
    title: bestsellersContent.title || '',
    highlight: bestsellersContent.highlight || '',
    description: bestsellersContent.description || '',
    products: bestsellersContent.products || [],
  },
  menuTabs: {
    sectionLabel: menuContent.sectionLabel || '',
    title: menuContent.title || '',
    highlight: menuContent.highlight || '',
    description: menuContent.description || '',
    categories: menuContent.categories || [],
  },
  experience: {
    sectionLabel: experienceContent.sectionLabel || '',
    title: experienceContent.title || '',
    highlight: experienceContent.highlight || '',
    subtitle: experienceContent.subtitle || '',
    features: experienceContent.features || [],
  },
  gallery: {
    images: galleryContent.images || [],
  },
  locations: {
    sectionLabel: locationsContent.sectionLabel || '',
    title: locationsContent.title || '',
    highlight: locationsContent.highlight || '',
    subtitle: locationsContent.subtitle || '',
    description: locationsContent.description || '',
    branches: locationsContent.branches || [],
  },
  testimonials: {
    sectionLabel: testimonialsContent.sectionLabel || '',
    title: testimonialsContent.title || '',
    highlight: testimonialsContent.highlight || '',
    description: testimonialsContent.description || '',
    items: testimonialsContent.items || [],
  },
  cta: {
    backgroundImage: ctaContent.backgroundImage || '',
    sectionLabel: ctaContent.sectionLabel || '',
    title: ctaContent.title || '',
    highlight: ctaContent.highlight || '',
    description: ctaContent.description || '',
    whatsappUrl: ctaContent.whatsappUrl || '',
    secondaryButton: ctaContent.secondaryButton || { label: '', href: '' },
    deliveryPlatforms: ctaContent.deliveryPlatforms || [],
  },
  footer: {
    brand: footerContent.brand || '',
    brandDescription: footerContent.brandDescription || '',
    socialLinks: footerContent.socialLinks || [],
    columns: footerContent.columns || [],
    copyright: footerContent.copyright || '',
    note: footerContent.note || '',
  },
  floatButton: {
    href: ctaContent.whatsappUrl || '',
    icon: 'Chat',
    ariaLabel: 'Pesan via WhatsApp',
  },
};

const normalizeFromApi = (apiSettings) => {
  const base = clone(defaultLandingSettings);
  if (!apiSettings || typeof apiSettings !== 'object') return base;

  const persistedRaw = apiSettings[LANDING_SETTINGS_DB_KEY];
  const persisted = typeof persistedRaw === 'object' ? persistedRaw : safeParse(persistedRaw);
  if (!persisted || typeof persisted !== 'object') return base;

  return deepMergeWithDefaults(base, persisted);
};

export const useLandingSettingsStore = create((set, get) => ({
  settings: clone(defaultLandingSettings),
  isDirty: false,
  isSaving: false,
  isLoading: false,
  saveError: null,
  loadError: null,
  lastSavedAt: null,

  loadSettings: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const response = await getWebsiteSettings();
      const data = response?.data ?? response ?? {};
      const normalized = normalizeFromApi(data);

      set({
        settings: normalized,
        isLoading: false,
        isDirty: false,
        loadError: null,
      });

      return normalized;
    } catch (error) {
      set({
        settings: clone(defaultLandingSettings),
        isLoading: false,
        loadError: error?.response?.data?.error || 'Gagal memuat landing page settings',
      });
      throw error;
    }
  },

  saveSettings: async () => {
    const currentSettings = get().settings;
    set({ isSaving: true, saveError: null });

    try {
      await bulkUpdateWebsiteSettings([
        {
          setting_key: LANDING_SETTINGS_DB_KEY,
          setting_value: JSON.stringify(currentSettings),
          data_type: 'json',
        },
      ]);

      set({
        isSaving: false,
        isDirty: false,
        saveError: null,
        lastSavedAt: new Date(),
      });

      return true;
    } catch (error) {
      set({
        isSaving: false,
        saveError: error?.response?.data?.error || 'Gagal menyimpan landing page settings',
      });
      return false;
    }
  },

  updateSettings: (section, data) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [section]: { ...state.settings[section], ...data },
      },
      isDirty: true,
    })),

  updateNestedSetting: (section, path, value) =>
    set((state) => {
      const newSettings = clone(state.settings);
      const keys = path.split('.');
      let current = newSettings[section];

      if (!current || typeof current !== 'object') {
        newSettings[section] = {};
        current = newSettings[section];
      }

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  updateArrayItem: (section, arrayPath, index, itemData) =>
    set((state) => {
      const newSettings = clone(state.settings);
      const keys = arrayPath.split('.');
      let current = newSettings[section];

      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }

      if (!Array.isArray(current) || !current[index]) return state;

      current[index] = { ...current[index], ...itemData };

      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  addArrayItem: (section, arrayPath, newItem) =>
    set((state) => {
      const newSettings = clone(state.settings);
      const keys = arrayPath.split('.');
      let current = newSettings[section];

      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = [];
        }
        current = current[keys[i]];
      }

      if (!Array.isArray(current)) return state;
      current.push(newItem);

      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  removeArrayItem: (section, arrayPath, index) =>
    set((state) => {
      const newSettings = clone(state.settings);
      const keys = arrayPath.split('.');
      let current = newSettings[section];

      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }

      if (!Array.isArray(current)) return state;
      current.splice(index, 1);

      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  resetSettings: () =>
    set({
      settings: clone(defaultLandingSettings),
      isDirty: false,
      saveError: null,
    }),

  getSettings: () => get().settings,
  getSection: (section) => get().settings[section],
  getIsDirty: () => get().isDirty,
}));
