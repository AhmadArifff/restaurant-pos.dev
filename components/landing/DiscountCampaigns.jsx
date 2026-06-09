'use client';

import { useEffect, useMemo, useState } from 'react';
import { getActiveDiscountPrograms } from '@/lib/api';

const PENDING_VOUCHER_KEY = 'landing-campaign-voucher-code';

const formatDiscount = (program) => {
  const value = Number(program?.discount_value || 0);
  if (program?.discount_type === 'fixed') return `Rp ${value.toLocaleString('id-ID')}`;
  return `${value.toLocaleString('id-ID')}%`;
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTypeMeta = (type) => {
  if (type === 'review_reward') {
    return {
      label: 'Review Voucher',
      accent: 'campaign-card-review',
      icon: '*',
      action: 'Review & Ambil Voucher',
      summary: 'Beri rating pelayanan dan menu setelah pesanan selesai, lalu dapatkan voucher QR untuk pesanan berikutnya.',
    };
  }
  if (type === 'bundle') {
    return {
      label: 'Paket Bundle',
      accent: 'campaign-card-bundle',
      icon: '[]',
      action: 'Lihat Menu Paket',
      summary: 'Masukkan semua menu syarat paket ke keranjang. Diskon otomatis dihitung dari menu paket saja.',
    };
  }
  return {
    label: 'Kode Voucher',
    accent: 'campaign-card-voucher',
    icon: '#',
    action: 'Copy & Rendem',
    summary: 'Copy kode voucher, pilih cabang dan meja, lalu kode otomatis masuk ke field voucher saat checkout.',
  };
};

const getValidityText = (program) => {
  const start = formatDate(program.start_at);
  const end = formatDate(program.end_at);
  if (start && end) return `Mulai ${start} - sampai ${end}`;
  if (end) return `Berlaku sampai ${end}`;
  if (start) return `Aktif mulai ${start}, tanpa expired sampai kuota habis atau dinonaktifkan.`;
  return 'Tidak expired, aktif sampai kuota habis atau dinonaktifkan.';
};

const getQuotaText = (program) => {
  if (program.total_usage_limit == null) return 'Kuota tanpa batas';
  return `${Number(program.remaining_quota || 0).toLocaleString('id-ID')} kuota tersisa dari ${Number(program.total_usage_limit || 0).toLocaleString('id-ID')}`;
};

const buildRules = (program) => {
  if (program.type === 'review_reward') {
    return [
      `Rating layanan minimal ${program.min_service_rating || 1}/5.`,
      `Rating menu minimal ${program.min_menu_rating || 1}/5.`,
      'Voucher QR dipakai untuk pesanan berikutnya dengan upload gambar voucher di keranjang.',
      Number(program.usage_limit_per_phone || 0) > 0
        ? `Maksimal ${program.usage_limit_per_phone} klaim per nomor HP.`
        : 'Bisa diklaim tanpa batas per nomor HP selama kuota tersedia.',
    ];
  }

  if (program.type === 'bundle') {
    const bundleText = (program.bundle_items || [])
      .map((item) => `${item.name || `Menu #${item.product_id}`} x${Math.max(1, Number(item.qty || 1))}`)
      .join(', ');
    return [
      bundleText ? `Wajib pesan: ${bundleText}.` : 'Wajib memenuhi menu paket yang diatur admin.',
      'Potongan hanya dihitung dari menu yang termasuk paket bundle.',
      'Isi nomor HP agar sistem bisa menghitung batas klaim.',
      Number(program.usage_limit_per_phone || 0) > 0
        ? `Maksimal ${program.usage_limit_per_phone} klaim per nomor HP.`
        : 'Bisa diklaim tanpa batas per nomor HP selama kuota tersedia.',
    ];
  }

  return [
    program.code ? `Kode: ${program.code}` : 'Kode voucher tersedia di kasir atau campaign.',
    'Paste kode voucher di keranjang self order atau minta kasir memasukkan kode saat pembayaran.',
    'Kode voucher memotong menu di luar paket bundle jika bundle juga digunakan.',
    Number(program.usage_limit_per_phone || 0) > 0
      ? `Maksimal ${program.usage_limit_per_phone} klaim per nomor HP.`
      : 'Bisa diklaim tanpa batas per nomor HP selama kuota tersedia.',
  ];
};

export default function DiscountCampaigns() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    let mounted = true;
    getActiveDiscountPrograms()
      .then((res) => {
        if (!mounted) return;
        setPrograms(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => mounted && setPrograms([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const activePrograms = useMemo(() => (
    programs
      .filter((program) => program?.status === 'active')
      .filter((program) => program.total_usage_limit == null || Number(program.remaining_quota || 0) > 0)
      .slice(0, 6)
  ), [programs]);

  const redeemProgram = async (program) => {
    if (program?.type === 'voucher' && program.code) {
      try {
        await navigator.clipboard?.writeText(program.code);
      } catch {
        // Some browsers block clipboard without HTTPS/user permission; localStorage still carries the code.
      }
      try {
        window.localStorage.setItem(PENDING_VOUCHER_KEY, program.code);
      } catch {
        // Ignore private mode storage failures.
      }
      setCopiedCode(program.code);
    }
    window.location.href = program?.type === 'voucher' && program.code
      ? `/order?voucher=${encodeURIComponent(program.code)}`
      : '/order';
  };

  if (!loading && activePrograms.length === 0) return null;

  return (
    <section id="campaigns" className="campaign-section">
      <div className="campaign-header">
        <div className="section-label">Campaign Aktif</div>
        <h2 className="section-title">
          Klaim <span className="italic gold">Voucher & Diskon</span>
          <br />
          Sebelum Kuota Habis
        </h2>
        <p className="section-desc">
          Pilih promo yang sedang aktif, baca rule klaimnya, lalu lanjut ke cabang dan meja untuk redeem saat self order atau pembayaran kasir.
        </p>
      </div>

      <div className="campaign-grid">
        {loading
          ? [...Array(3)].map((_, index) => (
              <div key={index} className="campaign-card campaign-card-loading">
                <div />
                <span />
                <p />
              </div>
            ))
          : activePrograms.map((program) => {
              const meta = getTypeMeta(program.type);
              const rules = buildRules(program);
              return (
                <article key={`${program.type}-${program.id}`} className={`campaign-card ${meta.accent}`}>
                  <div className="campaign-card-top">
                    <span className="campaign-icon">{meta.icon}</span>
                    <div>
                      <span className="campaign-type">{meta.label}</span>
                      <h3>{program.type === 'voucher' && program.code ? program.code : program.name}</h3>
                    </div>
                  </div>

                  <div className="campaign-discount">
                    <strong>{formatDiscount(program)}</strong>
                    <span>{program.discount_type === 'fixed' ? 'potongan nominal' : 'diskon'}</span>
                  </div>

                  <p className="campaign-summary">{meta.summary}</p>

                  <div className="campaign-info">
                    <span>{getValidityText(program)}</span>
                    <span>{getQuotaText(program)}</span>
                    {Number(program.min_order_amount || 0) > 0 && (
                      <span>Minimal order Rp {Number(program.min_order_amount || 0).toLocaleString('id-ID')}</span>
                    )}
                  </div>

                  <ul className="campaign-rules">
                    {rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>

                  {program.type === 'bundle' && program.bundle_items?.length > 0 && (
                    <div className="campaign-bundle-list">
                      {program.bundle_items.slice(0, 4).map((item) => (
                        <span key={`${program.id}-${item.product_id}`}>
                          {item.name} x{Math.max(1, Number(item.qty || 1))}
                        </span>
                      ))}
                    </div>
                  )}

                  <button type="button" className="campaign-btn" onClick={() => redeemProgram(program)}>
                    {meta.action}
                  </button>
                  {copiedCode && copiedCode === program.code && (
                    <p className="campaign-copy-note">
                      Kode tersalin. Setelah pilih meja, field voucher akan otomatis terisi. Jika belum, tekan tombol Paste.
                    </p>
                  )}
                </article>
              );
            })}
      </div>
    </section>
  );
}
