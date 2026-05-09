import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => {
        // Simpan juga di key 'token' untuk kompatibilitas axios interceptor lama
        localStorage.setItem('token', token);
        set({ user, token });
      },

      logout: async () => {
        try {
          const token = get().token;
          if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch (_) {}
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-store',
      // Untuk PWA — pastikan storage tersedia
      storage: {
        getItem: (name) => {
          try {
            return JSON.parse(localStorage.getItem(name));
          } catch { return null; }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (_) {}
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (_) {}
        },
      },
    }
  )
);