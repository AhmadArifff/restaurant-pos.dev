import { create } from 'zustand';
import { getWebsiteSettings } from '@/lib/api';

const DEFAULT_SETTINGS = {
  store_name: 'Lumpia Beef Bang.Han',
  store_description: 'Point of Sale System - Lumpia Beef Bang.Han',
  logo_url: '/images/branding/default-logo.svg',
  favicon_url: '/images/branding/default-logo.svg',
  primary_color: '#f97316',
  secondary_color: '#0f172a',
  accent_color: '#22c55e',
  theme_mode: 'dark',
  business_phone: '',
  business_email: '',
  business_address: '',
};

export const useWebsiteSettings = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  
  loading: false,
  error: null,

  // Load settings from API
  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getWebsiteSettings();
      const data = response?.data ?? response ?? {};
      const normalizedSettings = {
        ...DEFAULT_SETTINGS,
        ...(data && typeof data === 'object' ? data : {}),
      };

      set({ 
        settings: normalizedSettings,
        loading: false 
      });
      return normalizedSettings;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Gagal memuat pengaturan website';
      set({ 
        error: errorMsg,
        loading: false 
      });
      console.error('Error loading settings:', err);
      throw err;
    }
  },

  // Update single setting
  updateSetting: (key, value) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        [key]: value,
      },
    });
  },

  // Update multiple settings
  updateSettings: (newSettings) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        ...newSettings,
      },
    });
  },

  // Get specific setting
  getSetting: (key) => {
    const settings = get().settings;
    return settings[key] || null;
  },

  // Reset to defaults
  resetSettings: () => {
    set({
      settings: DEFAULT_SETTINGS,
      error: null,
    });
  },
}));

export default useWebsiteSettings;
