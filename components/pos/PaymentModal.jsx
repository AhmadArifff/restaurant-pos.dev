'use client';
import { useEffect, useMemo, useState } from 'react';
import { previewDiscount } from '@/lib/api';
import { formatIndonesianPhone, normalizeIndonesianPhoneForSubmit } from '@/lib/phoneFormat';

const PECAHAN = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50];

const fmtPecahan = (n) => {
  if (n >= 1000) return `Rp ${(n / 1000).toLocaleString('id-ID')}rb`;
  return `Rp ${n}`;
};

export default function PaymentModal({
  total,
  itemCount = 0,
  onPay,
  onClose,
  processing = false,
  tables = [],
  selectedTableId = '',
  onSelectTable,
  items = [],
}) {
  const [method, setMethod]   = useState('cash');
  const [tunai, setTunai]     = useState(0);
  const [tunaiStr, setTunaiStr] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+62');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPreview, setDiscountPreview] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const previewItems = useMemo(
    () => items.map((item) => ({ product_id: item.id || item.product_id, qty: item.qty, price: item.price })),
    [items]
  );
  const payableTotal = Math.max(0, Number(discountPreview?.final_total ?? total));
  const discountAmount = Math.max(0, Number(discountPreview?.discount_amount || 0));
  const kembalian = method === 'cash' ? tunai - payableTotal : 0;
  const canPay    = !processing && (method !== 'cash' || (tunai >= payableTotal));
  const customerPhoneForApi = normalizeIndonesianPhoneForSubmit(customerPhone);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (!total || previewItems.length === 0) {
        setDiscountPreview(null);
        return;
      }

      try {
        setDiscountLoading(true);
        const res = await previewDiscount({
          subtotal: total,
          items: previewItems,
          customer_phone: customerPhoneForApi,
          voucher_code: voucherCode,
        });
        if (!cancelled) setDiscountPreview(res.data?.applicable ? res.data : null);
      } catch (err) {
        if (!cancelled) {
          setDiscountPreview({
            applicable: false,
            message: err.response?.data?.message || 'Voucher belum bisa digunakan.',
            error: true,
          });
        }
      } finally {
        if (!cancelled) setDiscountLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [customerPhoneForApi, previewItems, total, voucherCode]);

  const addPecahan = (p) => {
    const newVal = tunai + p;
    setTunai(newVal);
    setTunaiStr(newVal.toLocaleString('id-ID'));
  };

  const handleTunaiInput = (val) => {
    const clean = parseInt(val.replace(/\D/g, '')) || 0;
    setTunai(clean);
    setTunaiStr(clean > 0 ? clean.toLocaleString('id-ID') : '');
  };

  const handleMethod = (m) => {
    setMethod(m);
    setTunai(0);
    setTunaiStr('');
  };

  const methods = [
    { id: 'cash',     label: 'Tunai',    icon: '💵' },
    { id: 'qris',     label: 'QRIS',     icon: '📱' },
    { id: 'transfer', label: 'Transfer', icon: '🏦' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 my-4 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Pembayaran</h2>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-slate-500 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 text-xl leading-none transition-colors"
          >×</button>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Total Tagihan */}
          <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center border border-slate-700">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Total Tagihan</p>
              <p className="text-orange-400 text-2xl font-black mt-0.5">
                Rp {total.toLocaleString('id-ID')}
              </p>
              {discountAmount > 0 && (
                <p className="mt-1 text-xs font-semibold text-emerald-300">
                  Setelah diskon: Rp {payableTotal.toLocaleString('id-ID')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">{itemCount} item</p>
            </div>
          </div>

          {/* Meja untuk status publik */}
          {tables.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Meja Pelanggan</p>
              <select
                value={selectedTableId || ''}
                onChange={(e) => onSelectTable?.(e.target.value)}
                disabled={processing}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-orange-500 disabled:opacity-60"
              >
                <option value="">Tanpa QR status meja</option>
                {tables.map((table) => {
                  const busy = Number(table.active_orders || 0) > 0;
                  return (
                    <option key={table.id} value={table.id} disabled={busy}>
                      Meja {table.table_number} {table.table_name ? `- ${table.table_name}` : ''}{busy ? ' (ada pesanan aktif)' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Jika dipilih, struk akan berisi QR publik untuk pelanggan memantau status pesanan dan mengunduh struk digital.
              </p>
            </div>
          )}

          {/* Voucher */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Voucher & Diskon</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(formatIndonesianPhone(e.target.value))}
                disabled={processing}
                inputMode="numeric"
                placeholder="+62895-3530-25503"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                disabled={processing}
                placeholder="Kode voucher"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold uppercase text-white outline-none focus:border-orange-500"
              />
            </div>
            <div className="mt-2 rounded-lg bg-slate-900/70 px-3 py-2 text-xs">
              {discountLoading ? (
                <span className="text-slate-400">Mengecek diskon...</span>
              ) : discountPreview?.error ? (
                <span className="text-yellow-300">{discountPreview.message}</span>
              ) : discountAmount > 0 ? (
                <div className="flex items-center justify-between gap-2 text-emerald-300">
                  <span>{discountPreview.label}</span>
                  <strong>-Rp {discountAmount.toLocaleString('id-ID')}</strong>
                </div>
              ) : (
                <span className="text-slate-500">Bundle aktif otomatis terdeteksi. Voucher memakai batas klaim berdasarkan nomor HP.</span>
              )}
            </div>
          </div>

          {/* Metode Bayar */}
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Metode Bayar</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMethod(m.id)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                    method === m.id
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section Tunai */}
          {method === 'cash' && (
            <>
              {/* Pecahan Uang */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mb-2">Pecahan Uang</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {PECAHAN.map(p => (
                    <button
                      key={p}
                      onClick={() => addPecahan(p)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500 text-slate-300 hover:text-orange-400 text-xs font-semibold py-2 rounded-lg transition-all active:scale-95"
                    >
                      {fmtPecahan(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Uang Diterima */}
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wide font-medium block mb-2">
                  Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tunaiStr}
                    onChange={e => handleTunaiInput(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 text-white font-bold text-lg rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                  />
                  {tunai > 0 && (
                    <button
                      onClick={() => { setTunai(0); setTunaiStr(''); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg transition-colors"
                    >×</button>
                  )}
                </div>
              </div>

              {/* Kembalian */}
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wide font-medium block mb-2">
                  Kembalian
                </label>
                <div className={`w-full rounded-xl px-4 py-3 font-black text-lg border transition-colors ${
                  tunai === 0        ? 'bg-slate-800 border-slate-700 text-slate-500' :
                  kembalian >= 0     ? 'bg-green-950 border-green-800 text-green-400' :
                                       'bg-red-950 border-red-800 text-red-400'
                }`}>
                  {tunai === 0 ? 'Rp 0' :
                   kembalian >= 0
                     ? `Rp ${kembalian.toLocaleString('id-ID')}`
                     : `Kurang Rp ${Math.abs(kembalian).toLocaleString('id-ID')}`
                  }
                </div>
              </div>
            </>
          )}

          {/* Non-cash info */}
          {method !== 'cash' && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                {method === 'qris' ? '📱 Tunjukkan QR kepada pelanggan' : '🏦 Konfirmasi transfer sebelum proses'}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl py-3 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => canPay && onPay(method, tunai, kembalian, {
              customer_phone: customerPhoneForApi,
              voucher_code: voucherCode,
              discount_amount: discountAmount,
              final_total: payableTotal,
            })}
            disabled={!canPay}
            className="flex-[2] bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl py-3 text-base transition-colors"
          >
            {processing ? 'Memproses transaksi...' : 'Proses & Cetak Struk'}
          </button>
        </div>

      </div>
    </div>
  );
}
