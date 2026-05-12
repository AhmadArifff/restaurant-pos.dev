'use client';

import { useEffect } from 'react';
import { useWebsiteSettings } from '@/store/settingsStore';

export default function SettingsProvider({ children }) {
  const loadSettings = useWebsiteSettings((state) => state.loadSettings);
  const loading = useWebsiteSettings((state) => state.loading);

  useEffect(() => {
    console.log('🎯 SettingsProvider: Initializing - loading website settings...');
    
    loadSettings()
      .then((settings) => {
        console.log('✅ SettingsProvider: Settings loaded successfully');
        console.log('📌 SettingsProvider: Favicon URL:', settings?.favicon_url);
      })
      .catch((err) => {
        console.error('❌ SettingsProvider: Failed to load settings:', err);
      });
  }, [loadSettings]);

  return <>{children}</>;
}
