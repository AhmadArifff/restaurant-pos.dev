import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const DEFAULT_SETTINGS = {
  store_name: 'Sultan Kebab',
  favicon_url: '/images/assets/logo.png',
  gold: '#C9A84C',
  dark: '#0D0A06',
};

const getApiBaseUrl = () => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const getSettings = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch(`${getApiBaseUrl()}/settings`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    if (response.ok) return { ...DEFAULT_SETTINGS, ...(await response.json()) };
  } catch (_) {
    return DEFAULT_SETTINGS;
  } finally {
    clearTimeout(timeoutId);
  }

  return DEFAULT_SETTINGS;
};

const absolutize = (src, requestUrl) => {
  const value = String(src || DEFAULT_SETTINGS.favicon_url).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value.startsWith('/') ? value : `/${value}`, requestUrl).toString();
};

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const requestedSize = Number(requestUrl.searchParams.get('size') || 512);
  const size = [180, 192, 512].includes(requestedSize) ? requestedSize : 512;
  const settings = await getSettings();
  const iconUrl = absolutize(settings.favicon_url, request.url);
  const background = settings.dark || DEFAULT_SETTINGS.dark;
  const accent = settings.gold || DEFAULT_SETTINGS.gold;
  const initials = String(settings.store_name || DEFAULT_SETTINGS.store_name).slice(0, 2).toUpperCase();
  const borderWidth = Math.max(5, Math.round(size * 0.024));
  const outerRadius = Math.round(size * 0.22);
  const frameSize = Math.round(size * 0.74);
  const frameRadius = Math.round(size * 0.18);
  const logoSize = Math.round(frameSize * 0.72);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background,
          borderRadius: outerRadius,
          overflow: 'hidden',
          border: `${borderWidth}px solid ${accent}`,
          boxSizing: 'border-box',
          padding: Math.round(size * 0.08),
        }}
      >
        <div
          style={{
            width: frameSize,
            height: frameSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: frameRadius,
            background: 'rgba(245, 237, 216, 0.08)',
            border: `${Math.max(2, Math.round(size * 0.012))}px solid ${accent}`,
            boxSizing: 'border-box',
          }}
        >
          <img
            src={iconUrl}
            alt={initials}
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
