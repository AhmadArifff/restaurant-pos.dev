'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/ui/AuthGuard';
import {
  createDiscountProgram,
  getDiscountPrograms,
  getProducts,
  hardDeleteDiscountProgram,
  updateDiscountProgram,
} from '@/lib/api';

const emptyForm = {
  name: '',
  type: 'voucher',
  code: '',
  discount_type: 'percent',
  discount_value: 5,
  min_order_amount: 0,
  usage_limit_per_phone: 1,
  total_usage_limit: '',
  min_service_rating: 1,
  min_menu_rating: 1,
  bundle_items: [],
  bundle_product_ids: [],
  status: 'active',
  validity_mode: 'quota_only',
  start_at: '',
  end_at: '',
  note: '',
};

const typeLabel = {
  review_reward: 'Reward Review',
  voucher: 'Kode Voucher',
  bundle: 'Paket Bundle',
};

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const uniqueNumbers = (items) => [...new Set((items || []).map(Number).filter(Boolean))];

const normalizeBundleItems = (value) => {
  const raw = Array.isArray(value) ? value : [];
  const byProduct = new Map();
  raw.forEach((item) => {
    const productId = Number(item?.product_id || item?.id || item);
    if (!productId) return;
    const qty = Math.max(1, Number(item?.qty || item?.min_qty || 1));
    const prev = byProduct.get(productId);
    byProduct.set(productId, {
      product_id: productId,
      qty: prev ? Math.max(Number(prev.qty || 1), qty) : qty,
    });
  });
  return [...byProduct.values()];
};

const getProgramBundleItems = (program) => {
  const items = normalizeBundleItems(program.bundle_items);
  if (items.length) return items;
  return normalizeBundleItems(program.bundle_product_ids);
};

const generateVoucherCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint32Array(13);

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let index = 0; index < randomValues.length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * chars.length);
    }
  }

  return Array.from(randomValues, (value) => chars[value % chars.length]).join('');
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getProgramState = (program) => {
  if (program.status !== 'active') return { label: 'Nonaktif', className: 'bg-slate-700 text-slate-400' };
  const now = Date.now();
  const start = program.start_at ? new Date(program.start_at).getTime() : null;
  const end = program.end_at ? new Date(program.end_at).getTime() : null;
  if (start && start > now) return { label: 'Terjadwal', className: 'bg-sky-500/15 text-sky-300' };
  if (end && end < now) return { label: 'Expired', className: 'bg-red-500/15 text-red-300' };
  if (program.total_usage_limit != null && Number(program.used_count || 0) >= Number(program.total_usage_limit || 0)) {
    return { label: 'Kuota Habis', className: 'bg-yellow-500/15 text-yellow-300' };
  }
  return { label: 'Aktif', className: 'bg-emerald-500/15 text-emerald-300' };
};

export default function DiscountsPage() {
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [programRes, productRes] = await Promise.all([
        getDiscountPrograms(),
        getProducts(),
      ]);
      setPrograms(programRes.data || []);
      setProducts(productRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = programs.filter((item) => getProgramState(item).label === 'Aktif').length;
    const distributed = programs.reduce((sum, item) => sum + Number(item.distributed_amount || 0), 0);
    const used = programs.reduce((sum, item) => sum + Number(item.used_count || 0), 0);
    return { active, distributed, used };
  }, [programs]);

  const typeFilters = useMemo(() => ([
    { key: 'all', label: 'Semua', count: programs.length },
    { key: 'review_reward', label: 'Reward Review', count: programs.filter((item) => item.type === 'review_reward').length },
    { key: 'voucher', label: 'Kode Voucher', count: programs.filter((item) => item.type === 'voucher').length },
    { key: 'bundle', label: 'Paket Bundle', count: programs.filter((item) => item.type === 'bundle').length },
  ]), [programs]);

  const filteredPrograms = useMemo(() => (
    typeFilter === 'all'
      ? programs
      : programs.filter((program) => program.type === typeFilter)
  ), [programs, typeFilter]);

  const allBundleProductIds = useMemo(() => products.map((product) => product.id), [products]);
  const allBundleSelected = allBundleProductIds.length > 0
    && allBundleProductIds.every((id) => form.bundle_items.some((item) => Number(item.product_id) === Number(id)));
  const productNameById = useMemo(() => (
    new Map(products.map((product) => [Number(product.id), product.name]))
  ), [products]);
  const selectedState = getProgramState({ ...form, used_count: 0, total_usage_limit: form.total_usage_limit || null });

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const editProgram = (program) => {
    setEditing(program);
    setForm({
      ...emptyForm,
      ...program,
      code: program.code || '',
      total_usage_limit: program.total_usage_limit ?? '',
      validity_mode: program.end_at ? 'date_range' : 'quota_only',
      start_at: toDateTimeLocal(program.start_at),
      end_at: toDateTimeLocal(program.end_at),
      bundle_items: getProgramBundleItems(program),
      bundle_product_ids: uniqueNumbers(program.bundle_product_ids),
      note: program.note || '',
    });
  };

  const toggleAllBundleProducts = () => {
    setForm((prev) => ({
      ...prev,
      bundle_items: allBundleSelected
        ? []
        : allBundleProductIds.map((id) => ({ product_id: Number(id), qty: 1 })),
      bundle_product_ids: allBundleSelected ? [] : allBundleProductIds,
    }));
  };

  const toggleBundleProduct = (id) => {
    setForm((prev) => {
      const productId = Number(id);
      const exists = prev.bundle_items.some((item) => Number(item.product_id) === productId);
      const nextItems = exists
        ? prev.bundle_items.filter((item) => Number(item.product_id) !== productId)
        : [...prev.bundle_items, { product_id: productId, qty: 1 }];
      return {
        ...prev,
        bundle_items: nextItems,
        bundle_product_ids: nextItems.map((item) => item.product_id),
      };
    });
  };

  const updateBundleQty = (id, qty) => {
    const productId = Number(id);
    setForm((prev) => {
      const nextItems = normalizeBundleItems(prev.bundle_items).map((item) => (
        Number(item.product_id) === productId
          ? { ...item, qty: Math.max(1, Number(qty || 1)) }
          : item
      ));
      return {
        ...prev,
        bundle_items: nextItems,
        bundle_product_ids: nextItems.map((item) => item.product_id),
      };
    });
  };

  const handleGenerateVoucherCode = () => {
    setForm((prev) => ({ ...prev, code: generateVoucherCode() }));
  };

  const saveProgram = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.type === 'voucher' ? form.code : '',
        bundle_items: form.type === 'bundle' ? normalizeBundleItems(form.bundle_items) : [],
        bundle_product_ids: form.type === 'bundle' ? normalizeBundleItems(form.bundle_items) : [],
        start_at: form.validity_mode === 'date_range' ? form.start_at || null : null,
        end_at: form.validity_mode === 'date_range' ? form.end_at || null : null,
      };
      delete payload.validity_mode;
      if (editing) await updateDiscountProgram(editing.id, payload);
      else await createDiscountProgram(payload);
      resetForm();
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Program voucher dan diskon gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProgramStatus = async (program) => {
    const nextStatus = program.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`${nextStatus === 'active' ? 'Aktifkan' : 'Nonaktifkan'} ${program.name}?`)) return;
    await updateDiscountProgram(program.id, {
      ...program,
      status: nextStatus,
      bundle_items: getProgramBundleItems(program),
      bundle_product_ids: getProgramBundleItems(program),
      start_at: program.start_at || null,
      end_at: program.end_at || null,
    });
    await load();
  };

  const removeProgram = async (program) => {
    if (!window.confirm(`Hapus permanen ${program.name}? Histori klaim program ini juga akan ikut terhapus.`)) return;
    await hardDeleteDiscountProgram(program.id);
    await load();
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">Marketing Discount</p>
            <h1 className="mt-2 text-3xl font-black text-white">Vocher & Diskon</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Atur reward review pelanggan, kode voucher sosial media, dan paket bundle menu yang otomatis terbaca di kasir dan pemesanan meja.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Program aktif</p>
              <p className="mt-2 text-3xl font-black text-white">{stats.active}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/25 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Distribusi diskon</p>
              <p className="mt-2 text-3xl font-black text-emerald-400">{formatCurrency(stats.distributed)}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Total klaim</p>
              <p className="mt-2 text-3xl font-black text-orange-400">{stats.used}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <form onSubmit={saveProgram} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-white">{editing ? 'Edit Program' : 'Buat Program'}</h2>
                {editing && (
                  <button type="button" onClick={resetForm} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200">
                    Batal edit
                  </button>
                )}
              </div>

              <label className="block text-sm font-semibold text-slate-300">
                Nama program
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" required />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-slate-300">
                  Jenis
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500">
                    <option value="voucher">Kode Voucher</option>
                    <option value="bundle">Paket Bundle</option>
                    <option value="review_reward">Reward Review</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-300">
                  Status
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-300">Masa berlaku</p>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${selectedState.className}`}>
                    {selectedState.label}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, validity_mode: 'quota_only', start_at: '', end_at: '' })}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold ${form.validity_mode === 'quota_only' ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-slate-700 text-slate-400'}`}
                  >
                    Tidak expired
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, validity_mode: 'date_range' })}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold ${form.validity_mode === 'date_range' ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-slate-700 text-slate-400'}`}
                  >
                    Pakai expired
                  </button>
                </div>
                {form.validity_mode === 'date_range' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-slate-400">
                      Mulai aktif
                      <input
                        type="datetime-local"
                        value={form.start_at}
                        onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-400">
                      Expired pada
                      <input
                        type="datetime-local"
                        value={form.end_at}
                        onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-orange-500"
                      />
                    </label>
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Program tidak punya tanggal expired dan tetap aktif sampai kuota total habis atau dinonaktifkan manual.
                  </p>
                )}
              </div>

              {form.type === 'voucher' && (
                <label className="block text-sm font-semibold text-slate-300">
                  Kode voucher
                  <div className="mt-1 flex gap-2">
                    <input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 13) })}
                      maxLength={13}
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-black uppercase tracking-[0.16em] text-white outline-none focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateVoucherCode}
                      className="shrink-0 rounded-xl border border-orange-500/35 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-300 transition hover:bg-orange-500/20"
                    >
                      Generate
                    </button>
                  </div>
                  <span className="mt-1 block text-xs font-medium text-slate-500">Kode voucher 13 karakter, huruf besar dan angka.</span>
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-slate-300">
                  Tipe diskon
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500">
                    <option value="percent">Persen</option>
                    <option value="fixed">Rupiah</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-300">
                  Nilai
                  <input type="number" min="0" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-slate-300">
                  Klaim / No. HP
                  <input type="number" min="0" value={form.usage_limit_per_phone} onChange={(e) => setForm({ ...form, usage_limit_per_phone: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
                </label>
                <label className="block text-sm font-semibold text-slate-300">
                  Kuota total
                  <input type="number" min="0" value={form.total_usage_limit} onChange={(e) => setForm({ ...form, total_usage_limit: e.target.value })} placeholder="Tanpa batas" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
                </label>
              </div>

              {form.type === 'review_reward' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold text-slate-300">
                    Min. rating layanan
                    <input type="number" min="1" max="5" value={form.min_service_rating} onChange={(e) => setForm({ ...form, min_service_rating: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-300">
                    Min. rating menu
                    <input type="number" min="1" max="5" value={form.min_menu_rating} onChange={(e) => setForm({ ...form, min_menu_rating: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
                  </label>
                </div>
              )}

              {form.type === 'bundle' && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-300">Menu paket bundle</p>
                    <button
                      type="button"
                      onClick={toggleAllBundleProducts}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-orange-300 hover:border-orange-500"
                    >
                      {allBundleSelected ? 'Hapus semua' : 'Pilih semua'}
                    </button>
                  </div>
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-3">
                    {products.map((product) => {
                      const selectedItem = form.bundle_items.find((item) => Number(item.product_id) === Number(product.id));
                      const checked = Boolean(selectedItem);
                      return (
                        <div key={product.id} className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 rounded-lg bg-slate-950/40 px-2 py-2 text-sm text-slate-300">
                          <label className="flex min-w-0 items-center gap-2">
                            <input type="checkbox" checked={checked} onChange={() => toggleBundleProduct(product.id)} />
                            <span className="truncate">{product.name}</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selectedItem?.qty || 1}
                            onChange={(e) => updateBundleQty(product.id, e.target.value)}
                            disabled={!checked}
                            aria-label={`Qty minimum ${product.name}`}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Qty adalah minimum porsi tiap menu yang harus ada di pesanan agar paket bundle bisa diklaim.</p>
                </div>
              )}

              <label className="block text-sm font-semibold text-slate-300">
                Catatan
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-orange-500" />
              </label>

              <button disabled={saving} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-400 disabled:opacity-50">
                {saving ? 'Menyimpan...' : editing ? 'Update Program' : 'Simpan Program'}
              </button>
            </form>

            <section className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h2 className="text-xl font-black text-white">Daftar Program</h2>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setTypeFilter(filter.key)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-black transition ${
                      typeFilter === filter.key
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-950/30'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-orange-500/60 hover:text-orange-300'
                    }`}
                  >
                    {filter.label}
                    <span className={`ml-2 rounded-full px-2 py-0.5 ${
                      typeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {loading && <p className="rounded-xl bg-slate-900 p-5 text-slate-400">Memuat data...</p>}
                {!loading && programs.length === 0 && <p className="rounded-xl bg-slate-900 p-5 text-slate-400">Belum ada program diskon.</p>}
                {!loading && programs.length > 0 && filteredPrograms.length === 0 && (
                  <p className="rounded-xl bg-slate-900 p-5 text-slate-400">Belum ada program untuk filter ini.</p>
                )}
                {filteredPrograms.map((program) => {
                  const programState = getProgramState(program);
                  const bundleItems = getProgramBundleItems(program);
                  return (
                  <article key={program.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-black text-orange-300">{typeLabel[program.type] || program.type}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${programState.className}`}>{programState.label}</span>
                          {program.code && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-black text-white">{program.code}</span>}
                        </div>
                        <h3 className="mt-2 text-lg font-black text-white">{program.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {program.discount_type === 'percent' ? `${program.discount_value}%` : formatCurrency(program.discount_value)}
                          {' '}diskon, {program.usage_limit_per_phone}x klaim per nomor HP
                        </p>
                        {program.type === 'bundle' && (
                          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/55 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                              Bundle: {bundleItems.length} menu dipilih
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {bundleItems.map((item) => (
                                <span key={item.product_id} className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                                  {productNameById.get(Number(item.product_id)) || `Menu #${item.product_id}`} x{item.qty || 1}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {program.start_at || program.end_at
                            ? `Mulai ${program.start_at ? new Date(program.start_at).toLocaleString('id-ID') : 'sekarang'}${program.end_at ? ` - sampai ${new Date(program.end_at).toLocaleString('id-ID')}` : ''}`
                            : 'Tidak expired, berhenti saat kuota habis atau dinonaktifkan'}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(program.distributed_amount)}</p>
                        <p className="text-xs text-slate-500">{program.used_count || 0} klaim</p>
                        <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                          <button onClick={() => editProgram(program)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">Edit</button>
                          <button onClick={() => toggleProgramStatus(program)} className="rounded-lg bg-yellow-500/15 px-3 py-1.5 text-xs font-bold text-yellow-200">
                            {program.status === 'active' ? 'Nonaktif' : 'Aktif'}
                          </button>
                          <button onClick={() => removeProgram(program)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-200">Hapus</button>
                        </div>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
