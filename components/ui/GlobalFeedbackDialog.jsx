'use client';

import { useEffect, useState } from 'react';
import SuccessModal from '@/components/stock/SuccessModal';

function classifyMessage(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('gagal') || text.includes('error') || text.includes('tidak valid')) {
    return 'error';
  }
  if (
    text.includes('wajib') ||
    text.includes('melebihi') ||
    text.includes('tidak cukup') ||
    text.includes('batal')
  ) {
    return 'warning';
  }
  return 'success';
}

function titleFromType(type) {
  if (type === 'error') return 'Terjadi Kesalahan';
  if (type === 'warning') return 'Perlu Diperiksa';
  return 'Berhasil';
}

export default function GlobalFeedbackDialog() {
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    const nativeAlert = window.alert;

    window.alert = (message) => {
      const type = classifyMessage(message);
      setDialog({
        isOpen: true,
        type,
        title: titleFromType(type),
        message: String(message || ''),
      });
    };

    const handleFeedback = (event) => {
      const detail = event.detail || {};
      const type = detail.type || classifyMessage(detail.message);
      setDialog({
        isOpen: true,
        type,
        title: detail.title || titleFromType(type),
        message: detail.message || '',
      });
    };

    window.addEventListener('app:feedback', handleFeedback);

    return () => {
      window.alert = nativeAlert;
      window.removeEventListener('app:feedback', handleFeedback);
    };
  }, []);

  return (
    <SuccessModal
      isOpen={dialog.isOpen}
      requestType={dialog.type}
      title={dialog.title}
      message={dialog.message}
      onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
    />
  );
}
