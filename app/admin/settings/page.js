'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useWebsiteSettings } from '@/store/settingsStore';
import {
  uploadWebsiteImage,
  bulkUpdateWebsiteSettings,
} from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assetUrl';

// ========== VALIDATORS ==========
const validators = {
  store_name: (value) => {
    if (!value || value.trim().length === 0) return 'Nama toko tidak boleh kosong';
    if (value.length < 3) return 'Nama toko minimal 3 karakter';
    if (value.length > 50) return 'Nama toko maksimal 50 karakter';
    return null;
  },

  store_description: (value) => {
    if (value && value.length > 200) return 'Deskripsi maksimal 200 karakter';
    return null;
  },

  business_phone: (value) => {
    if (!value) return null; // Optional
    const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
    if (!/^[0-9+\-\s()]*$/.test(value)) return 'Nomor telepon hanya boleh berisi angka, +, -, (), dan spasi';
    if (value.replace(/\D/g, '').length < 8) return 'Nomor telepon minimal 8 digit';
    if (value.replace(/\D/g, '').length > 15) return 'Nomor telepon maksimal 15 digit';
    return null;
  },

  business_email: (value) => {
    if (!value) return null; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Format email tidak valid (contoh: email@toko.com)';
    return null;
  },

  business_address: (value) => {
    if (value && value.length > 200) return 'Alamat maksimal 200 karakter';
    return null;
  },

  file_size: (file) => {
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) return `Ukuran file maksimal ${maxSizeInMB}MB`;
    return null;
  },

  file_type: (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return 'Format file harus JPG, PNG, GIF, atau WebP';
    return null;
  }
};

// ========== INPUT MASKING FUNCTIONS ==========
const inputMasking = {
  phone: (value) => {
    // Allow only numbers, +, -, (), and spaces
    return value.replace(/[^0-9+\-() ]/g, '');
  },

  email: (value) => {
    // Allow alphanumeric, @, ., -, _
    return value.replace(/[^a-zA-Z0-9@._\-]/g, '');
  },

  text: (value) => {
    // Allow letters, numbers, spaces, basic punctuation
    return value.replace(/[^a-zA-Z0-9\s\-.,!?()]/g, '');
  },

  number: (value) => {
    // Allow only numbers
    return value.replace(/[^0-9]/g, '');
  }
};

export default function SettingsPage() {
  const { settings, loadSettings, updateSettings } = useWebsiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState({});

  const buildErrorMessage = (err, fallbackMessage) => {
    if (err?.code === 'ERR_NETWORK') {
      return 'Tidak bisa terhubung ke backend. Pastikan server backend aktif di http://localhost:5000';
    }
    return err?.response?.data?.error || err?.message || fallbackMessage;
  };

  // Load settings on mount
  useEffect(() => {
    const init = async () => {
      try {
        await loadSettings();
      } catch (err) {
        setError('Gagal memuat pengaturan');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadSettings]);

  // Validate single field
  const validateField = (fieldName, value) => {
    if (validators[fieldName]) {
      const error = validators[fieldName](value);
      return error;
    }
    return null;
  };

  // Handle text input changes with validation & masking
  const handleInputChange = (key, value) => {
    // Apply input masking based on field type
    let maskedValue = value;
    
    if (key === 'business_phone') {
      maskedValue = inputMasking.phone(value);
    } else if (key === 'business_email') {
      maskedValue = inputMasking.email(value);
    } else if (key === 'store_name' || key === 'store_description' || key === 'business_address') {
      // Allow text fields as-is (only validate length)
      maskedValue = value;
    }

    updateSettings({ [key]: maskedValue });
    
    // Validate on change
    const error = validateField(key, maskedValue);
    setFieldErrors(prev => ({
      ...prev,
      [key]: error
    }));
  };

  // Handle color changes
  const handleColorChange = (key, color) => {
    updateSettings({ [key]: color });
  };

  // Handle logo file selection with validation
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const sizeError = validators.file_size(file);
      const typeError = validators.file_type(file);

      if (sizeError) {
        setFieldErrors(prev => ({ ...prev, logo_url: sizeError }));
        return;
      }
      if (typeError) {
        setFieldErrors(prev => ({ ...prev, logo_url: typeError }));
        return;
      }

      setFieldErrors(prev => ({ ...prev, logo_url: null }));
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle favicon file selection with validation
  const handleFaviconSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const sizeError = validators.file_size(file);
      const typeError = validators.file_type(file);

      if (sizeError) {
        setFieldErrors(prev => ({ ...prev, favicon_url: sizeError }));
        return;
      }
      if (typeError) {
        setFieldErrors(prev => ({ ...prev, favicon_url: typeError }));
        return;
      }

      setFieldErrors(prev => ({ ...prev, favicon_url: null }));
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFaviconPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate all fields before save
  const validateAllFields = () => {
    const errors = {};

    // Validate text fields
    const textFields = [
      'store_name',
      'store_description',
      'business_phone',
      'business_email',
      'business_address',
    ];

    textFields.forEach(field => {
      const error = validateField(field, settings[field] || '');
      if (error) errors[field] = error;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Upload image and update settings
  const uploadImage = async (file, settingKey) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('setting_key', settingKey);

      const response = await uploadWebsiteImage(formData);
      return response?.data?.setting_value || response?.data?.file_url || null;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error(buildErrorMessage(err, 'Gagal mengupload gambar'));
    }
  };

  // Save all settings
  const handleSaveSettings = async () => {
    try {
      // Validate all fields first
      if (!validateAllFields()) {
        setError('Silakan perbaiki kesalahan di form sebelum menyimpan');
        setTimeout(() => setError(null), 4000);
        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      const settingsToUpdate = [];

      // Add logo upload if changed
      if (logoFile) {
        try {
          const logoUrl = await uploadImage(logoFile, 'logo_url');
          if (logoUrl) {
            settingsToUpdate.push({ setting_key: 'logo_url', setting_value: logoUrl, data_type: 'string' });
          }
          setLogoFile(null);
          setLogoPreview(null);
        } catch (err) {
          setError(`Gagal upload logo. ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // Add favicon upload if changed
      if (faviconFile) {
        try {
          const faviconUrl = await uploadImage(faviconFile, 'favicon_url');
          if (faviconUrl) {
            settingsToUpdate.push({ setting_key: 'favicon_url', setting_value: faviconUrl, data_type: 'string' });
          }
          setFaviconFile(null);
          setFaviconPreview(null);
        } catch (err) {
          setError(`Gagal upload favicon. ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // Add other settings
      const textSettings = [
        'store_name',
        'store_description',
        'business_phone',
        'business_email',
        'business_address',
      ];

      const colorSettings = [
        'primary_color',
        'secondary_color',
        'accent_color',
      ];

      textSettings.forEach(key => {
        settingsToUpdate.push({
          setting_key: key,
          setting_value: settings[key] || '',
          data_type: 'string',
        });
      });

      colorSettings.forEach(key => {
        settingsToUpdate.push({
          setting_key: key,
          setting_value: settings[key] || '#000000',
          data_type: 'string',
        });
      });

      // Bulk update
      if (settingsToUpdate.length > 0) {
        await bulkUpdateWebsiteSettings(settingsToUpdate);
        await loadSettings();
        
        setSuccess('Pengaturan berhasil disimpan. Perubahan akan muncul di dashboard dan landing page.');
        setFieldErrors({});
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setSuccess('Tidak ada perubahan untuk disimpan');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      const errorMsg = buildErrorMessage(err, 'Gagal menyimpan pengaturan');
      setError(errorMsg);
      console.error('Error saving settings:', err);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">⚙️ Pengaturan Website</h1>
          <p className="text-slate-400 text-sm mt-2">Sesuaikan branding, tema, dan informasi website Anda</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/15 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="text-red-300 text-sm font-semibold">Terjadi Error</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/15 border-l-4 border-green-500 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-green-300 text-sm font-semibold">Sukses</p>
                <p className="text-green-200 text-sm mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Section: Informasi Toko */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
            <h2 className="text-white font-bold text-lg mb-4">📦 Informasi Toko</h2>
            <div className="space-y-5">
              {/* Nama Toko */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-400 text-sm font-medium">Nama Toko *</label>
                  <span className="text-xs text-slate-500">{(settings.store_name || '').length}/50</span>
                </div>
                <input
                  type="text"
                  value={settings.store_name || ''}
                  onChange={(e) => handleInputChange('store_name', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                    text-white placeholder-slate-500 focus:outline-none transition-all
                    ${fieldErrors.store_name 
                      ? 'border-red-500/50 focus:border-red-500/70' 
                      : 'border-slate-600/50 focus:border-orange-500/50'}`}
                  placeholder="Nama toko Anda"
                />
                {fieldErrors.store_name && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center">
                    <span className="mr-1">⚠️</span> {fieldErrors.store_name}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-400 text-sm font-medium">Deskripsi Toko</label>
                  <span className="text-xs text-slate-500">{(settings.store_description || '').length}/200</span>
                </div>
                <textarea
                  value={settings.store_description || ''}
                  onChange={(e) => handleInputChange('store_description', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                    text-white placeholder-slate-500 focus:outline-none transition-all resize-none
                    ${fieldErrors.store_description 
                      ? 'border-red-500/50 focus:border-red-500/70' 
                      : 'border-slate-600/50 focus:border-orange-500/50'}`}
                  placeholder="Deskripsi singkat toko Anda"
                  rows={3}
                />
                {fieldErrors.store_description && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center">
                    <span className="mr-1">⚠️</span> {fieldErrors.store_description}
                  </p>
                )}
              </div>

              {/* Kontak */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-slate-400 text-sm font-medium">📞 Nomor Telepon</label>
                    <span className="text-xs text-slate-500">{(settings.business_phone || '').replace(/\D/g, '').length}/15 digit</span>
                  </div>
                  <input
                    type="text"
                    value={settings.business_phone || ''}
                    onChange={(e) => handleInputChange('business_phone', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                      text-white placeholder-slate-500 focus:outline-none transition-all
                      ${fieldErrors.business_phone 
                        ? 'border-red-500/50 focus:border-red-500/70' 
                        : 'border-slate-600/50 focus:border-orange-500/50'}`}
                    placeholder="+62812345678 atau 0812-345-678"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">💡 Hanya angka, +, -, (), dan spasi diperbolehkan</p>
                  {fieldErrors.business_phone && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {fieldErrors.business_phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">✉️ Email</label>
                  <input
                    type="text"
                    value={settings.business_email || ''}
                    onChange={(e) => handleInputChange('business_email', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                      text-white placeholder-slate-500 focus:outline-none transition-all
                      ${fieldErrors.business_email 
                        ? 'border-red-500/50 focus:border-red-500/70' 
                        : 'border-slate-600/50 focus:border-orange-500/50'}`}
                    placeholder="email@toko.com"
                  />
                  {fieldErrors.business_email && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center">
                      <span className="mr-1">⚠️</span> {fieldErrors.business_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Alamat */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-slate-400 text-sm font-medium">📍 Alamat</label>
                  <span className="text-xs text-slate-500">{(settings.business_address || '').length}/200</span>
                </div>
                <textarea
                  value={settings.business_address || ''}
                  onChange={(e) => handleInputChange('business_address', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                    text-white placeholder-slate-500 focus:outline-none transition-all resize-none
                    ${fieldErrors.business_address 
                      ? 'border-red-500/50 focus:border-red-500/70' 
                      : 'border-slate-600/50 focus:border-orange-500/50'}`}
                  placeholder="Alamat lengkap toko Anda"
                  rows={2}
                />
                {fieldErrors.business_address && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center">
                    <span className="mr-1">⚠️</span> {fieldErrors.business_address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Branding */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
            <h2 className="text-white font-bold text-lg mb-4">🎨 Branding</h2>
            <div className="space-y-5">
              {/* Logo */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Logo Toko</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                        text-slate-400 focus:outline-none transition-all
                        file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                        file:bg-orange-500 file:text-white file:cursor-pointer file:font-medium
                        ${fieldErrors.logo_url 
                          ? 'border-red-500/50 focus:border-red-500/70' 
                          : 'border-slate-600/50 focus:border-orange-500/50'}`}
                    />
                    {fieldErrors.logo_url && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center">
                        <span className="mr-1">⚠️</span> {fieldErrors.logo_url}
                      </p>
                    )}
                  </div>
                  {(logoPreview || settings.logo_url) && (
                    <div className="w-20 h-20 rounded-lg border border-slate-600/50 flex items-center justify-center bg-slate-700/30 overflow-hidden">
                      <img
                        src={logoPreview || resolveAssetUrl(settings.logo_url)}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/images/assets/logo.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Favicon</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconSelect}
                      className={`w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg
                        text-slate-400 focus:outline-none transition-all
                        file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                        file:bg-orange-500 file:text-white file:cursor-pointer file:font-medium
                        ${fieldErrors.favicon_url 
                          ? 'border-red-500/50 focus:border-red-500/70' 
                          : 'border-slate-600/50 focus:border-orange-500/50'}`}
                    />
                    {fieldErrors.favicon_url && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center">
                        <span className="mr-1">⚠️</span> {fieldErrors.favicon_url}
                      </p>
                    )}
                  </div>
                  {(faviconPreview || settings.favicon_url) && (
                    <div className="w-20 h-20 rounded-lg border border-slate-600/50 flex items-center justify-center bg-slate-700/30 overflow-hidden">
                      <img
                        src={faviconPreview || resolveAssetUrl(settings.favicon_url)}
                        alt="Favicon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/images/assets/logo.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tema Warna */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60">
            <h2 className="text-white font-bold text-lg mb-4">🎯 Tema Warna</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Primary Color */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Warna Utama (Primary)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.primary_color || '#f97316'}
                    onChange={(e) => handleColorChange('primary_color', e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-slate-600/50"
                  />
                  <span className="text-slate-400 text-sm font-mono min-w-24 bg-slate-700/50 px-2 py-1 rounded">
                    {settings.primary_color}
                  </span>
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Warna Sekunder (Secondary)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.secondary_color || '#0f172a'}
                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-slate-600/50"
                  />
                  <span className="text-slate-400 text-sm font-mono min-w-24 bg-slate-700/50 px-2 py-1 rounded">
                    {settings.secondary_color}
                  </span>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Warna Aksen (Accent)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.accent_color || '#22c55e'}
                    onChange={(e) => handleColorChange('accent_color', e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border border-slate-600/50"
                  />
                  <span className="text-slate-400 text-sm font-mono min-w-24 bg-slate-700/50 px-2 py-1 rounded">
                    {settings.accent_color}
                  </span>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-slate-400 text-sm mb-3 font-medium">Preview Warna:</p>
              <div className="flex gap-3">
                <div
                  className="flex-1 h-20 rounded-lg border-2 border-slate-600/50 transition-all"
                  style={{ backgroundColor: settings.primary_color }}
                  title="Primary"
                />
                <div
                  className="flex-1 h-20 rounded-lg border-2 border-slate-600/50 transition-all"
                  style={{ backgroundColor: settings.secondary_color }}
                  title="Secondary"
                />
                <div
                  className="flex-1 h-20 rounded-lg border-2 border-slate-600/50 transition-all"
                  style={{ backgroundColor: settings.accent_color }}
                  title="Accent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving || Object.keys(fieldErrors).some(key => fieldErrors[key])}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all
                ${saving || Object.keys(fieldErrors).some(key => fieldErrors[key])
                  ? 'bg-orange-500/50 text-white/70 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
            >
              {saving ? '💾 Menyimpan...' : '💾 Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

