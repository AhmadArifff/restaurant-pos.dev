import { create } from 'zustand';

// Default landing page content
const defaultLandingSettings = {
  header: {
    logo: {
      part1: 'SULTAN',
      part2: 'KEBAB',
    },
    navLinks: [
      { label: 'Tentang Kami', href: '#about' },
      { label: 'Best Seller', href: '#bestseller' },
      { label: 'Menu Lengkap', href: '#menu' },
      { label: 'Cabang', href: '#locations' },
      { label: 'Ulasan', href: '#testimonials' },
    ],
    buttons: {
      cta: {
        label: 'Pesan Sekarang',
        href: 'https://wa.me/6281234567890',
      },
      admin: {
        label: 'Login Admin',
        href: '/login',
      },
    },
  },
  hero: {
    backgroundImage: 'https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=1600&q=80',
    badge: 'Authentic Middle Eastern Cuisine Since 2015',
    title: {
      part1: 'Taste the',
      part2: 'Legend of',
      part3: 'Sultan Kebab',
    },
    subtitle: 'Kebab premium dengan cita rasa autentik Timur Tengah yang memanjakan lidah Anda.',
    buttons: {
      primary: { label: 'Lihat Menu', href: '#menu' },
      secondary: { label: 'Temukan Cabang', href: '#locations' },
    },
    stats: [
      { value: 12, suffix: '+', label: 'Cabang' },
      { value: 50, suffix: 'K+', label: 'Pelanggan' },
      { value: '4.9', suffix: 'Star', label: 'Rating' },
    ],
  },
};

export const useLandingSettingsStore = create((set, get) => ({
  // State
  settings: defaultLandingSettings,
  isDirty: false,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,

  // Actions
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
      const newSettings = JSON.parse(JSON.stringify(state.settings));
      const keys = path.split('.');
      let current = newSettings[section];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
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
      const newSettings = JSON.parse(JSON.stringify(state.settings));
      const keys = arrayPath.split('.');
      let current = newSettings[section];
      
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      
      current[index] = { ...current[index], ...itemData };
      
      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  addArrayItem: (section, arrayPath, newItem) =>
    set((state) => {
      const newSettings = JSON.parse(JSON.stringify(state.settings));
      const keys = arrayPath.split('.');
      let current = newSettings[section];
      
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      
      current.push(newItem);
      
      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  removeArrayItem: (section, arrayPath, index) =>
    set((state) => {
      const newSettings = JSON.parse(JSON.stringify(state.settings));
      const keys = arrayPath.split('.');
      let current = newSettings[section];
      
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      
      current.splice(index, 1);
      
      return {
        settings: newSettings,
        isDirty: true,
      };
    }),

  resetSettings: () =>
    set({
      settings: defaultLandingSettings,
      isDirty: false,
      saveError: null,
    }),

  setSaving: (isSaving) =>
    set({ isSaving }),

  setSaveError: (error) =>
    set({ saveError: error }),

  setLastSavedAt: () =>
    set({ lastSavedAt: new Date(), isDirty: false }),

  getSettings: () => get().settings,
  getSection: (section) => get().settings[section],
  getIsDirty: () => get().isDirty,
}));
