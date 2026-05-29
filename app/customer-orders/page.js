'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/ui/AuthGuard';
import QRCodeCard from '@/components/customer/QRCodeCard';
import SectionSkeleton from '@/components/ui/SectionSkeleton';
import {
  createDiningTable,
  deleteDiningTable,
  getCustomerOrders,
  getManagedDiningTables,
  updateCustomerOrderStatus,
  updateDiningTable,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { resolveAssetUrl } from '@/lib/assetUrl';

const emptyTable = {
  table_number: '',
  table_name: '',
  capacity: 2,
  status: 'active',
  note: '',
  branch_id: '',
};

const statusLabels = {
  pending: 'Menunggu',
  accepted: 'Diterima',
  preparing: 'Disiapkan',
  ready: 'Siap Diantarkan Ke Meja',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const nextActionByStatus = {
  pending: { status: 'accepted', label: '1. Terima', color: 'bg-blue-500 hover:bg-blue-400' },
  accepted: { status: 'preparing', label: '2. Siapkan', color: 'bg-yellow-500 hover:bg-yellow-400' },
  preparing: { status: 'ready', label: '3. Siap Diantar', color: 'bg-emerald-500 hover:bg-emerald-400' },
  ready: { status: 'completed', label: '4. Selesai', color: 'bg-orange-500 hover:bg-orange-400' },
};

const statusFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'accepted', label: 'Diterima' },
  { value: 'preparing', label: 'Disiapkan' },
  { value: 'ready', label: 'Siap Diantar' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const formatRp = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

function Stars({ value = 0, size = 'text-sm' }) {
  const rating = Math.max(0, Math.min(5, Number(value || 0)));
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`} aria-label={`${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-300' : 'text-slate-600'}>
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

const getOrderUrl = (token) => {
  if (typeof window === 'undefined') return `/order/${token}`;
  return `${window.location.origin}/order/${token}`;
};

export default function CustomerOrdersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [status, setStatus] = useState('all');
  const [tableForm, setTableForm] = useState(emptyTable);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null);

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        getCustomerOrders({}),
        isAdmin ? getManagedDiningTables() : Promise.resolve({ data: [] }),
      ]);
      setOrders(ordersRes.data || []);
      setTables(tablesRes.data || []);
      setSelectedTable((prev) => prev || tablesRes.data?.[0] || null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load({ silent: true }), 5000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  const visibleOrders = useMemo(
    () => (status === 'all' ? orders : orders.filter((order) => order.status === status)),
    [orders, status]
  );

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    statusFilters.forEach((item) => {
      if (item.value !== 'all') {
        counts[item.value] = orders.filter((order) => order.status === item.value).length;
      }
    });
    return counts;
  }, [orders]);

  const stats = useMemo(() => {
    const active = orders.filter((order) => !['completed', 'cancelled'].includes(order.status)).length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.final_total || order.subtotal || 0), 0);
    return {
      total: orders.length,
      active,
      completed: orders.filter((order) => order.status === 'completed').length,
      revenue,
    };
  }, [orders]);

  const saveTable = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await updateDiningTable(editingTable.id, tableForm);
      } else {
        await createDiningTable(tableForm);
      }
      setTableForm(emptyTable);
      setEditingTable(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan meja');
    }
  };

  const editTable = (table) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number || '',
      table_name: table.table_name || '',
      capacity: table.capacity || 2,
      status: table.status || 'active',
      note: table.note || '',
      branch_id: table.branch_id || '',
    });
    setSelectedTable(table);
  };

  const removeTable = async (table) => {
    if (!confirm(`Nonaktifkan meja ${table.table_number}?`)) return;
    await deleteDiningTable(table.id);
    await load();
  };

  const changeStatus = async (order, nextStatus) => {
    try {
      const payload = { status: nextStatus };
      if (nextStatus === 'cancelled') {
        const reason = window.prompt(`Alasan pembatalan pesanan ${order.order_code}:`);
        if (!reason?.trim()) return;
        payload.cancel_reason = reason.trim();
      }
      await updateCustomerOrderStatus(order.id, payload);
      await load();
    } catch (err) {
      const validation = err.response?.data?.validation_errors;
      const detail = validation?.length
        ? `\n\n${validation
            .filter((item) => item?.item_name)
            .map((item) => `${item.item_name}: tersedia ${Number(item.available ?? item.current_balance ?? 0)} ${item.unit || ''}, butuh ${Number(item.needed ?? 0)} ${item.unit || ''}`)
            .join('\n')}`
        : '';
      alert(`${err.response?.data?.message || 'Gagal update status'}${detail}`);
    }
  };

  const getStatusActions = (order) => {
    if (['completed', 'cancelled'].includes(order.status)) return [];
    const nextAction = nextActionByStatus[order.status];
    const waitingPaymentProof = order.status === 'pending'
      && order.payment_method
      && order.payment_status !== 'paid'
      && !order.payment_proof_url;
    return [
      nextAction && waitingPaymentProof
        ? {
            ...nextAction,
            label: 'Tunggu Bukti Bayar',
            color: 'bg-slate-600',
            disabled: true,
          }
        : nextAction,
      { status: 'cancelled', label: 'Batalkan', color: 'bg-red-500 hover:bg-red-400' },
    ].filter(Boolean);
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-400">Customer Table Order</p>
              <h1 className="mt-2 text-3xl font-black text-white">Pesanan Meja dan QR Pelanggan</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Pantau order pelanggan dari QR meja, approve proses dapur, dan kelola meja yang tampil di landing page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    status === item.value ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    status === item.value ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {statusCounts[item.value] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total Order', stats.total],
              ['Order Aktif', stats.active],
              ['Selesai', stats.completed],
              ['Nilai Order', formatRp(stats.revenue)],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-4"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <strong className="mt-2 block text-2xl text-white">{value}</strong>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
            <section className="space-y-4">
              {loading && <SectionSkeleton type="orders" />}
              {!loading && visibleOrders.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-800/50 p-10 text-center text-slate-400">
                  Belum ada pesanan meja untuk filter ini.
                </div>
              )}
              {visibleOrders.map((order) => (
                <motion.article
                  key={order.id}
                  layout
                  className="rounded-3xl border border-slate-700 bg-slate-800 p-5 shadow-xl shadow-black/10"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black uppercase text-orange-300">
                          Meja {order.table_number}
                        </span>
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-black uppercase text-slate-300">
                          {statusLabels[order.status] || order.status}
                        </span>
                        {order.reviewed_at && (
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
                            Review + Diskon 5%
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-black text-white">{order.order_code}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {order.customer_name || 'Pelanggan meja'} {order.customer_phone ? `- ${order.customer_phone}` : ''}
                      </p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-slate-500">Total pesanan</p>
                      <strong className="text-2xl text-orange-400">{formatRp(order.final_total || order.subtotal)}</strong>
                      {Number(order.discount_amount || 0) > 0 && (
                        <p className="text-xs text-emerald-300">
                          {order.discount_label || 'Diskon'} {formatRp(order.discount_amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="rounded-2xl bg-slate-900/60 p-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between gap-3 border-b border-slate-700/60 py-2 text-sm last:border-0">
                          <span className="text-slate-300">{item.product_name} x{item.qty}</span>
                          <span className="font-bold text-white">{formatRp(item.subtotal)}</span>
                        </div>
                      ))}
                      {order.items?.some((item) => item.review) && (
                        <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Rating menu</p>
                          {order.items
                            ?.filter((item) => item.review)
                            .map((item) => (
                              <div key={`review-${item.id}`} className="rounded-xl bg-slate-950/45 p-2">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs font-semibold text-slate-200">{item.product_name}</span>
                                  <Stars value={item.review.rating} />
                                </div>
                                {item.review.comment && (
                                  <p className="mt-1 text-xs text-slate-400">{item.review.comment}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                      <p className="mt-3 text-xs italic text-slate-500">Catatan: {order.note || 'Tidak ada'}</p>
                      {order.payment_method && (
                        <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-100">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold">Pembayaran: {order.payment_method.name || order.payment_method_key || 'Payment'}</span>
                            <span className={`rounded-full px-2 py-1 font-black uppercase ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : order.payment_proof_url
                                  ? 'bg-yellow-500/20 text-yellow-100'
                                  : 'bg-slate-700 text-slate-300'
                            }`}>
                              {order.payment_status === 'paid' ? 'Terkonfirmasi' : order.payment_proof_url ? 'Bukti dikirim' : 'Menunggu bukti'}
                            </span>
                          </div>
                          <p className="mt-1 text-sky-100/70">
                            Deadline: {formatDateTime(order.payment_due_at)}
                          </p>
                          {order.payment_proof_url && (
                            <button
                              type="button"
                              onClick={() => setProofModal({
                                order_code: order.order_code,
                                url: resolveAssetUrl(order.payment_proof_url),
                              })}
                              className="mt-2 inline-flex font-black text-sky-200 underline"
                            >
                              Lihat bukti pembayaran
                            </button>
                          )}
                          {order.payment_proof_note && <p className="mt-1 text-sky-100/70">Catatan bayar: {order.payment_proof_note}</p>}
                        </div>
                      )}
                      {order.service_review && (
                        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold">Rating layanan</span>
                            <Stars value={order.service_review.service_rating} />
                          </div>
                          {order.service_review.service_comment && (
                            <p className="mt-1 text-emerald-100/80">{order.service_review.service_comment}</p>
                          )}
                        </div>
                      )}
                      {order.cancel_reason && (
                        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-100">
                          Alasan batal: {order.cancel_reason}
                          {order.cancelled_by_name ? ` - oleh ${order.cancelled_by_name}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 lg:w-44 lg:flex-col">
                      {getStatusActions(order).map((action) => (
                        <button
                          key={action.status}
                          onClick={() => changeStatus(order, action.status)}
                          disabled={action.disabled}
                          className={`${action.color} rounded-xl px-3 py-2 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-35`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </section>

            {isAdmin && (
              <aside className="space-y-5">
                <div className="rounded-3xl border border-slate-700 bg-slate-800 p-5">
                  <h2 className="text-xl font-black text-white">{editingTable ? 'Edit Meja' : 'Tambah Meja QR'}</h2>
                  <form onSubmit={saveTable} className="mt-4 space-y-3">
                    <input
                      value={tableForm.table_number}
                      onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                      placeholder="Nomor meja, contoh: 01"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                      required
                    />
                    <input
                      value={tableForm.table_name}
                      onChange={(e) => setTableForm({ ...tableForm, table_name: e.target.value })}
                      placeholder="Nama area, contoh: Teras"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="1"
                        value={tableForm.capacity}
                        onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                      />
                      <select
                        value={tableForm.status}
                        onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                      >
                        <option value="active">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                    <textarea
                      value={tableForm.note}
                      onChange={(e) => setTableForm({ ...tableForm, note: e.target.value })}
                      placeholder="Catatan meja..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-400">
                        {editingTable ? 'Update Meja' : 'Buat Meja'}
                      </button>
                      {editingTable && (
                        <button
                          type="button"
                          onClick={() => { setEditingTable(null); setTableForm(emptyTable); }}
                          className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-black text-white"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-slate-700 bg-slate-800 p-5">
                  <h2 className="text-xl font-black text-white">QR Meja</h2>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          selectedTable?.id === table.id ? 'border-orange-500 bg-orange-500/15' : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        <p className="text-xs text-slate-500">Meja</p>
                        <strong className="text-lg text-white">{table.table_number}</strong>
                        <p className="text-xs capitalize text-slate-400">{table.status}</p>
                        {table.branch_name && <p className="mt-1 text-[10px] text-orange-300/80">{table.branch_name}</p>}
                      </button>
                    ))}
                  </div>

                  {selectedTable && (
                    <div className="mt-5">
                      <QRCodeCard value={getOrderUrl(selectedTable.qr_token)} title={`Meja ${selectedTable.table_number}`} size={190} />
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => editTable(selectedTable)} className="flex-1 rounded-xl bg-slate-700 px-3 py-2 text-sm font-bold text-white">Edit</button>
                        <button onClick={() => removeTable(selectedTable)} className="flex-1 rounded-xl bg-red-500/80 px-3 py-2 text-sm font-bold text-white">Nonaktif</button>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
          {proofModal && (
            <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">Bukti Pembayaran</p>
                    <h3 className="mt-1 text-lg font-black text-white">{proofModal.order_code}</h3>
                  </div>
                  <button type="button" onClick={() => setProofModal(null)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-lg font-black text-white">
                    x
                  </button>
                </div>
                {String(proofModal.url).toLowerCase().includes('.pdf') ? (
                  <div className="mt-4 rounded-2xl bg-black/25 p-5 text-sm text-slate-200">
                    File bukti berupa PDF.
                    <a href={proofModal.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-sky-300 px-4 py-2 font-black text-slate-950">
                      Buka PDF
                    </a>
                  </div>
                ) : (
                  <img src={proofModal.url} alt="Bukti pembayaran" className="mt-4 max-h-[70vh] w-full rounded-2xl bg-white object-contain" />
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
