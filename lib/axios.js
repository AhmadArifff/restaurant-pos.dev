import axios from 'axios';

const getApiBaseUrl = () => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  try {
    // Baca dari zustand persist (key: auth-store)
    const stored = localStorage.getItem('auth-store');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      const branchId = state?.selectedBranchId || state?.user?.default_branch_id || state?.user?.branch_id;
      if (branchId) {
        config.headers['X-Branch-Id'] = String(branchId);
      }
    } else {
      // Fallback ke token langsung (backward compat)
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Auto logout jika 401 - tapi hanya redirect jika sudah ada token sebelumnya
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Check apakah user sudah punya token (berarti sudah login sebelumnya)
      const stored = localStorage.getItem('auth-store');
      const hasToken = localStorage.getItem('token');
      
      if (stored || hasToken) {
        // Jika ada token sebelumnya, berarti user logout, hapus dan redirect
        localStorage.removeItem('auth-store');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
      // Jika tidak ada token sebelumnya (public request), jangan redirect
    }
    return Promise.reject(err);
  }
);

export default api;
