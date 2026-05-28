import { NextResponse } from 'next/server';

const DEFAULT_MANIFEST = {
  name: 'Sultan Kebab',
  short_name: 'Sultan Kebab',
  description: 'Point of Sale System - Sultan Kebab',
  icon: '/images/assets/logo.png',
  theme_color: '#C9A84C',
  background_color: '#0D0A06',
};

const getApiBaseUrl = () => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const pickString = (value, fallback) => {
  const text = String(value || '').trim();
  return text || fallback;
};

const getIconType = (src) => {
  const path = String(src || '').split('?')[0].toLowerCase();
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
};

const buildManifest = (settings = {}) => {
  const name = pickString(settings.store_name, DEFAULT_MANIFEST.name);
  const description = pickString(settings.store_description, DEFAULT_MANIFEST.description);
  const icon = pickString(settings.favicon_url, DEFAULT_MANIFEST.icon);
  const iconType = getIconType(icon);

  return {
    name,
    short_name: name.slice(0, 30),
    description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: settings.dark || DEFAULT_MANIFEST.background_color,
    theme_color: settings.gold || DEFAULT_MANIFEST.theme_color,
    categories: ['business', 'productivity'],
    icons: [
      {
        src: icon,
        sizes: 'any',
        type: iconType,
        purpose: 'any',
      },
      {
        src: icon,
        sizes: 'any',
        type: iconType,
        purpose: 'maskable',
      },
    ],
  };
};

export async function GET() {
  let settings = {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${getApiBaseUrl()}/settings`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    if (response.ok) settings = await response.json();
  } catch (_) {}
  clearTimeout(timeoutId);

  return NextResponse.json(buildManifest(settings), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
}
