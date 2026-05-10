'use client';

import { useState } from 'react';
import FormGroup from './FormGroup';

export default function ImageUpload({
  label,
  value,
  onChange,
  error,
  required,
  hint,
  className = '',
}) {
  const [preview, setPreview] = useState(value || null);

  const handleChange = (e) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormGroup label={label} error={error} required={required} hint={hint} className={className}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="form-input flex-1 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange('');
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>

        <div className="text-xs text-gray-400 my-2">or paste URL</div>

        <input
          type="url"
          value={value || ''}
          onChange={handleChange}
          placeholder="Paste image URL..."
          className="form-input"
        />

        {preview && (
          <div className="mt-3 p-2 bg-slate-800 rounded border border-slate-700">
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
          </div>
        )}
      </div>
    </FormGroup>
  );
}
