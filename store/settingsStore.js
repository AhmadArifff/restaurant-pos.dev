import { create } from 'zustand';
import { getWebsiteSettings } from '@/lib/api';

export const DEFAULT_THEME_COLORS = {
  gold: '#C9A84C',
  gold_light: '#E8C96A',
  dark: '#0D0A06',
  dark2: '#1A1409',
  dark3: '#241C0E',
  cream: '#F5EDD8',
  cream2: '#EDE0C4',
  red: '#8B1A1A',
  text: '#F5EDD8',
  text_muted: '#9E8E6E',
};

export const DEFAULT_SETTINGS = {
  store_name: 'Sultan Kebab',
  browser_title: 'Sultan Kebab POS',
  store_description: 'Point of Sale System - Sultan Kebab',
  logo_url: '/images/assets/logo.png',
  favicon_url: '/images/assets/logo.png',
  ...DEFAULT_THEME_COLORS,
  theme_mode: 'dark',
  business_phone: '',
  business_email: '',
  business_address: '',
};

export const useWebsiteSettings = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,
  loadedAt: null,

  loadSettings: async ({ force = false } = {}) => {
    const current = get();
    if (!force && current.loadedAt) return current.settings;
    if (!force && current.loading) return current.settings;

    set({ loading: true, error: null });
    try {
      const response = await getWebsiteSettings();
      const data = response?.data ?? response ?? {};
      const migratedData = { ...data };

      if (data.primary_color && !data.gold) migratedData.gold = data.primary_color;
      if (data.secondary_color && !data.dark) migratedData.dark = data.secondary_color;
      if (data.accent_color && !data.red) migratedData.red = data.accent_color;

      const normalizedSettings = {
        ...DEFAULT_SETTINGS,
        ...migratedData,
      };

      set({
        settings: normalizedSettings,
        loading: false,
        loadedAt: Date.now(),
      });
      return normalizedSettings;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Gagal memuat pengaturan website';
      set({
        error: errorMsg,
        loading: false,
      });
      throw err;
    }
  },

  updateSetting: (key, value) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        [key]: value,
      },
    });
  },

  updateSettings: (newSettings) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        ...newSettings,
      },
    });
  },

  getSetting: (key) => {
    const settings = get().settings;
    return settings[key] || null;
  },

  resetSettings: () => {
    set({
      settings: DEFAULT_SETTINGS,
      error: null,
      loadedAt: null,
    });
  },
}));

export default useWebsiteSettings;
