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

  // Load settings from API
  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      console.log('📥 loadSettings: Fetching website settings from API...');
      
      const response = await getWebsiteSettings();
      console.log('📦 loadSettings: Raw API response:', response);
      
      const data = response?.data ?? response ?? {};
      console.log('📋 loadSettings: Extracted data:', data);

      // Migration: Convert old color keys to new keys
      const migratedData = { ...data };
      console.log('🔄 loadSettings: Checking for old color keys to migrate...');
      
      if (data.primary_color && !data.gold) {
        console.log('🔄 loadSettings: Migrating primary_color → gold:', data.primary_color);
        migratedData.gold = data.primary_color;
      }
      if (data.secondary_color && !data.dark) {
        console.log('🔄 loadSettings: Migrating secondary_color → dark:', data.secondary_color);
        migratedData.dark = data.secondary_color;
      }
      if (data.accent_color && !data.red) {
        console.log('🔄 loadSettings: Migrating accent_color → red:', data.accent_color);
        migratedData.red = data.accent_color;
      }
      
      const normalizedSettings = {
        ...DEFAULT_SETTINGS,
        ...migratedData,
      };

      console.log('✅ loadSettings: Normalized settings after migration:', {
        store_name: normalizedSettings.store_name,
        favicon_url: normalizedSettings.favicon_url,
        gold: normalizedSettings.gold,
        gold_light: normalizedSettings.gold_light,
        dark: normalizedSettings.dark,
        red: normalizedSettings.red,
      });

      set({ 
        settings: normalizedSettings,
        loading: false 
      });
      return normalizedSettings;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Gagal memuat pengaturan website';
      console.error('❌ loadSettings: Error loading settings:', {
        message: errorMsg,
        status: err.response?.status,
        error: err,
      });
      
      set({ 
        error: errorMsg,
        loading: false 
      });
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
