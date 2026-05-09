const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const getApiOrigin = () => {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  if (!normalizedBaseUrl) return '';
  return normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl.slice(0, -4)
    : normalizedBaseUrl;
};

export const resolveAssetUrl = (value, fallback = '/images/assets/logo.png') => {
  const candidate = value || fallback;
  if (!candidate) return '';

  if (candidate === '/images/branding/default-logo.png' || candidate === '/images/branding/default-favicon.ico') {
    return fallback;
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(candidate)) {
    return candidate;
  }

  if (!candidate.startsWith('/')) {
    return candidate;
  }

  if (!candidate.startsWith('/images/')) {
    return candidate;
  }

  const origin = getApiOrigin();
  return origin ? `${origin}${candidate}` : candidate;
};
