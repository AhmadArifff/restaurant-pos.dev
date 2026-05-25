'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/ui/AuthGuard';
import QRCodeCard from '@/components/customer/QRCodeCard';
import {
  createDiningTable,
  deleteDiningTable,
  getCustomerOrders,
  getManagedDiningTables,
  updateCustomerOrderStatus,
  updateDiningTable,
} from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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
  ready: 'Siap Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const statusActions = [
  { status: 'accepted', label: 'Terima', color: 'bg-blue-500 hover:bg-blue-400' },
  { status: 'preparing', label: 'Siapkan', color: 'bg-yellow-500 hover:bg-yellow-400' },
  { status: 'ready', label: 'Siap', color: 'bg-emerald-500 hover:bg-emerald-400' },
  { status: 'completed', label: 'Selesai', color: 'bg-orange-500 hover:bg-orange-400' },
  { status: 'cancelled', label: 'Batal', color: 'bg-red-500 hover:bg-red-400' },
];

const formatRp = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

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

  const load = async () => {
    setLoading(true);
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        getCustomerOrders(status === 'all' ? {} : { status }),
        isAdmin ? getManagedDiningTables() : Promise.resolve({ data: [] }),
      ]);
      setOrders(ordersRes.data || []);
      setTables(tablesRes.data || []);
      setSelectedTable((prev) => prev || tablesRes.data?.[0] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [status, isAdmin]);

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
      await updateCustomerOrderStatus(order.id, { status: nextStatus });
      await load();
    } catch (err) {
      const validation = err.response?.data?.validation_errors;
      const detail = validation?.length
        ? `\n\n${validation.map((item) => `${item.item_name}: tersedia ${item.available}, butuh ${item.needed}`).join('\n')}`
        : '';
      alert(`${err.response?.data?.message || 'Gagal update status'}${detail}`);
    }
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
              {['all', 'pending', 'accepted', 'preparing', 'ready', 'completed'].map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition ${
                    status === item ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item === 'all' ? 'Semua' : statusLabels[item]}
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
              {loading && <p className="rounded-2xl bg-slate-800 p-4 text-slate-400">Memuat pesanan...</p>}
              {!loading && orders.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-800/50 p-10 text-center text-slate-400">
                  Belum ada pesanan meja untuk filter ini.
                </div>
              )}
              {orders.map((order) => (
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
                        <p className="text-xs text-emerald-300">Diskon {formatRp(order.discount_amount)}</p>
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
                      {order.note && <p className="mt-3 text-xs italic text-slate-500">Catatan: {order.note}</p>}
                      {order.service_review && (
                        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                          Rating layanan: {order.service_review.service_rating}/5
                          {order.service_review.service_comment ? ` - ${order.service_review.service_comment}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 lg:w-44 lg:flex-col">
                      {statusActions.map((action) => (
                        <button
                          key={action.status}
                          onClick={() => changeStatus(order, action.status)}
                          disabled={order.status === action.status || order.status === 'completed' || order.status === 'cancelled'}
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
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
