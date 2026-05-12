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
  if (!candidate) {
    console.warn('⚠️ resolveAssetUrl: No candidate provided, returning empty string');
    return '';
  }

  console.log('🔍 resolveAssetUrl: Processing:', {
    value,
    fallback,
    candidate,
  });

  // Skip default branding placeholders
  if (
    candidate === '/images/branding/default-logo.png' ||
    candidate === '/images/branding/default-logo.svg' ||
    candidate === '/images/branding/default-favicon.ico' ||
    candidate === '/images/branding/default-favicon.svg'
  ) {
    console.log('🔍 resolveAssetUrl: Using fallback for default branding');
    return fallback;
  }

  // Handle data URIs and absolute URLs
  if (/^(data:|blob:|https?:\/\/)/i.test(candidate)) {
    console.log('🔍 resolveAssetUrl: Returning absolute URL or data URI:', candidate);
    return candidate;
  }

  // Handle relative paths (no leading slash)
  if (!candidate.startsWith('/')) {
    console.log('🔍 resolveAssetUrl: Not absolute path, returning as-is:', candidate);
    return candidate;
  }

  // Handle non-images paths
  if (!candidate.startsWith('/images/')) {
    console.log('🔍 resolveAssetUrl: Not an images path, returning as-is:', candidate);
    return candidate;
  }

  // Resolve with API origin
  const origin = getApiOrigin();
  const result = origin ? `${origin}${candidate}` : candidate;
  console.log('🔍 resolveAssetUrl: Final resolved URL:', {
    origin,
    candidate,
    result,
    isFullPath: !!origin,
  });
  return result;
};
