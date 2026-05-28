'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/ui/AuthGuard';
import {
  createDiscountProgram,
  deleteDiscountProgram,
  getDiscountPrograms,
  getProducts,
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
  bundle_product_ids: [],
  status: 'active',
  note: '',
};

const typeLabel = {
  review_reward: 'Reward Review',
  voucher: 'Kode Voucher',
  bundle: 'Paket Bundle',
};

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function DiscountsPage() {
  const [programs, setPrograms] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    const active = programs.filter((item) => item.status === 'active').length;
    const distributed = programs.reduce((sum, item) => sum + Number(item.distributed_amount || 0), 0);
    const used = programs.reduce((sum, item) => sum + Number(item.used_count || 0), 0);
    return { active, distributed, used };
  }, [programs]);

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
      bundle_product_ids: Array.isArray(program.bundle_product_ids) ? program.bundle_product_ids : [],
      note: program.note || '',
    });
  };

  const toggleBundleProduct = (id) => {
    setForm((prev) => {
      const exists = prev.bundle_product_ids.includes(id);
      return {
        ...prev,
        bundle_product_ids: exists
          ? prev.bundle_product_ids.filter((item) => item !== id)
          : [...prev.bundle_product_ids, id],
      };
    });
  };

  const saveProgram = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.type === 'voucher' ? form.code : '',
        bundle_product_ids: form.type === 'bundle' ? form.bundle_product_ids : [],
      };
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

  const disableProgram = async (program) => {
    if (!window.confirm(`Nonaktifkan ${program.name}?`)) return;
    await deleteDiscountProgram(program.id);
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

              {form.type === 'voucher' && (
                <label className="block text-sm font-semibold text-slate-300">
                  Kode voucher
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-black uppercase text-white outline-none focus:border-orange-500" required />
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
                  <p className="mb-2 text-sm font-semibold text-slate-300">Menu paket bundle</p>
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-3">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={form.bundle_product_ids.includes(product.id)} onChange={() => toggleBundleProduct(product.id)} />
                        <span>{product.name}</span>
                      </label>
                    ))}
                  </div>
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
              <div className="mt-4 space-y-3">
                {loading && <p className="rounded-xl bg-slate-900 p-5 text-slate-400">Memuat data...</p>}
                {!loading && programs.length === 0 && <p className="rounded-xl bg-slate-900 p-5 text-slate-400">Belum ada program diskon.</p>}
                {programs.map((program) => (
                  <article key={program.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[11px] font-black text-orange-300">{typeLabel[program.type] || program.type}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${program.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{program.status}</span>
                          {program.code && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-black text-white">{program.code}</span>}
                        </div>
                        <h3 className="mt-2 text-lg font-black text-white">{program.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {program.discount_type === 'percent' ? `${program.discount_value}%` : formatCurrency(program.discount_value)}
                          {' '}diskon, {program.usage_limit_per_phone}x klaim per nomor HP
                        </p>
                        {program.type === 'bundle' && (
                          <p className="mt-1 text-xs text-slate-500">
                            Bundle: {program.bundle_product_ids?.length || 0} menu dipilih
                          </p>
                        )}
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(program.distributed_amount)}</p>
                        <p className="text-xs text-slate-500">{program.used_count || 0} klaim</p>
                        <div className="mt-3 flex gap-2 md:justify-end">
                          <button onClick={() => editProgram(program)} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">Edit</button>
                          <button onClick={() => disableProgram(program)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-200">Nonaktif</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
