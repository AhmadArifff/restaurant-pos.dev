'use client';

import { useEffect, useRef } from 'react';
import { useWebsiteSettings, DEFAULT_SETTINGS } from '@/store/settingsStore';
import { resolveAssetUrl } from '@/lib/assetUrl';

const THEME_VARIABLES = [
  ['gold', '--gold', DEFAULT_SETTINGS.gold],
  ['gold_light', '--gold-light', DEFAULT_SETTINGS.gold_light],
  ['dark', '--dark', DEFAULT_SETTINGS.dark],
  ['dark2', '--dark2', DEFAULT_SETTINGS.dark2],
  ['dark3', '--dark3', DEFAULT_SETTINGS.dark3],
  ['cream', '--cream', DEFAULT_SETTINGS.cream],
  ['cream2', '--cream2', DEFAULT_SETTINGS.cream2],
  ['red', '--red', DEFAULT_SETTINGS.red],
  ['text', '--text', DEFAULT_SETTINGS.text],
  ['text_muted', '--text-muted', DEFAULT_SETTINGS.text_muted],
];

const hexToRgb = (hex, fallback = '201, 168, 76') => {
  if (!hex || typeof hex !== 'string') return fallback;
  const sanitized = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) return fallback;
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

const setThemeColorMeta = (color) => {
  if (!color) return;
  try {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head?.appendChild(meta);
    }
    meta.setAttribute('content', color);
  } catch (error) {
    console.warn('⚠️ setThemeColorMeta: Error setting theme color meta:', error);
  }
};

export default function WebsiteThemeRuntime() {
  const { settings, loadSettings } = useWebsiteSettings();
  const faviconLinksRef = useRef({ icon: null, shortcut: null });

  useEffect(() => {
    loadSettings().catch(() => {});
  }, [loadSettings]);

  useEffect(() => {
    // Skip if no document (SSR)
    if (typeof document === 'undefined') {
      console.log('🎨 WebsiteThemeRuntime: Skipping on server-side');
      return;
    }

    console.log('🎨 WebsiteThemeRuntime: Starting theme and favicon application...');

    try {
      const root = document.documentElement;

      // Apply theme colors
      THEME_VARIABLES.forEach(([settingKey, cssVar, fallback]) => {
        const color = settings?.[settingKey] || fallback;
        root.style.setProperty(cssVar, color);
      });

      const goldRgb = hexToRgb(settings?.gold || DEFAULT_SETTINGS.gold);
      root.style.setProperty('--gold-rgb', goldRgb);

      // Apply document title
      document.title = settings?.browser_title || settings?.store_name || DEFAULT_SETTINGS.browser_title;

      // Apply theme color meta
      setThemeColorMeta(settings?.gold || DEFAULT_SETTINGS.gold);

      // Handle favicon - only update if changed
      const rawFaviconUrl = settings?.favicon_url || DEFAULT_SETTINGS.favicon_url;
      const faviconUrl = resolveAssetUrl(rawFaviconUrl, DEFAULT_SETTINGS.favicon_url);

      console.log('📌 WebsiteThemeRuntime: Favicon settings:', {
        raw: rawFaviconUrl,
        resolved: faviconUrl,
      });

      // Update favicon links if URL changed
      if (faviconUrl && (!faviconLinksRef.current.icon || faviconLinksRef.current.icon.href !== faviconUrl)) {
        try {
          // Update existing icon link or create new one
          if (faviconLinksRef.current.icon) {
            console.log('🔗 WebsiteThemeRuntime: Updating existing icon link');
            faviconLinksRef.current.icon.href = faviconUrl;
          } else {
            console.log('🔗 WebsiteThemeRuntime: Creating new icon link');
            const iconLink = document.createElement('link');
            iconLink.rel = 'icon';
            iconLink.href = faviconUrl;
            document.head?.appendChild(iconLink);
            faviconLinksRef.current.icon = iconLink;
          }

          // Update existing shortcut link or create new one
          if (faviconLinksRef.current.shortcut) {
            console.log('🔗 WebsiteThemeRuntime: Updating existing shortcut icon link');
            faviconLinksRef.current.shortcut.href = faviconUrl;
          } else {
            console.log('🔗 WebsiteThemeRuntime: Creating new shortcut icon link');
            const shortcutLink = document.createElement('link');
            shortcutLink.rel = 'shortcut icon';
            shortcutLink.href = faviconUrl;
            document.head?.appendChild(shortcutLink);
            faviconLinksRef.current.shortcut = shortcutLink;
          }

          console.log('✅ WebsiteThemeRuntime: Favicon updated successfully');
        } catch (faviconError) {
          console.error('❌ WebsiteThemeRuntime: Error updating favicon:', faviconError);
        }
      }

      console.log('✅ WebsiteThemeRuntime: Theme and favicon applied successfully');
    } catch (error) {
      console.error('❌ WebsiteThemeRuntime: Error applying settings:', error);
    }

    // Cleanup - do NOT remove favicon links
    return () => {
      console.log('🧹 WebsiteThemeRuntime: Component cleanup');
    };
  }, [settings]);

  return null;
}
