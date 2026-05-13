'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/ui/AuthGuard';
import { getTransactions } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/components/layout/AdminLayout';

export default function TransactionHistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  // Set default date range to today
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setDateFrom(dateStr);
    setDateTo(dateStr);
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const params = {
        limit: 1000,
        ...filters,
      };
      const res = await getTransactions(params);
      setTransactions(res.data || []);
      setAppliedFilters(filters);
    } catch (err) {
      console.error('Error loading transactions:', err);
      alert('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter
  const handleApplyFilter = () => {
    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search;
    loadTransactions(filters);
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setSearch('');
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setDateFrom(dateStr);
    setDateTo(dateStr);
    loadTransactions({
      dateFrom: dateStr,
      dateTo: dateStr,
    });
  };

  // Initial load
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadTransactions({ dateFrom, dateTo });
    }
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get transaction creator info
  const getCreatorInfo = (tx) => {
    const isAdmin = tx.creator_role === 'admin';
    if (isAdmin) {
      if (tx.source_user_id) {
        return {
          label: `Admin (${tx.creator_name}) → ${tx.source_user_name}`,
          type: 'admin-on-behalf',
          color: 'bg-orange-100 text-orange-800',
          icon: '👤📊',
        };
      } else {
        return {
          label: `Admin (${tx.creator_name})`,
          type: 'admin-direct',
          color: 'bg-blue-100 text-blue-800',
          icon: '👨‍💼',
        };
      }
    } else {
      return {
        label: `${tx.creator_name}`,
        type: 'kasir-self',
        color: 'bg-green-100 text-green-800',
        icon: '👤',
      };
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">📊 Riwayat Transaksi POS</h1>
            <p className="text-slate-400">Pantau semua transaksi dengan detail kasir/admin yang melakukan</p>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">🔍 Filter & Cari</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                    text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                    text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cari (Invoice, Kasir, Admin)
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik untuk mencari..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                    text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 items-end">
                <button
                  onClick={handleApplyFilter}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold 
                    rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔎 Cari
                </button>
                <button
                  onClick={handleResetFilter}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold 
                    rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↻ Reset
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Total Transaksi</p>
              <p className="text-2xl font-black text-white">{transactions.length}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Total Penjualan</p>
              <p className="text-2xl font-black text-orange-400">
                {formatCurrency(transactions.reduce((s, t) => s + Number(t.total_price), 0))}
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Rata-rata per Transaksi</p>
              <p className="text-2xl font-black text-green-400">
                {transactions.length > 0
                  ? formatCurrency(transactions.reduce((s, t) => s + Number(t.total_price), 0) / transactions.length)
                  : 'Rp 0'}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <p className="animate-pulse">⏳ Memuat data...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>📭 Tidak ada transaksi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Pembuat / Kasir
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                        Pembayaran
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transactions.map((tx, idx) => {
                      const creatorInfo = getCreatorInfo(tx);
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-700/50 transition border-b border-slate-700"
                        >
                          <td className="px-4 py-3 font-mono text-sm text-slate-300">
                            {tx.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {formatDateTime(tx.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${creatorInfo.color}`}>
                              {creatorInfo.icon} {creatorInfo.label}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {creatorInfo.type === 'admin-on-behalf' && (
                              <span className="inline-block px-2 py-1 bg-orange-900/30 text-orange-300 text-xs rounded font-semibold">
                                Admin (Atas nama Kasir)
                              </span>
                            )}
                            {creatorInfo.type === 'admin-direct' && (
                              <span className="inline-block px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded font-semibold">
                                Admin (Langsung)
                              </span>
                            )}
                            {creatorInfo.type === 'kasir-self' && (
                              <span className="inline-block px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded font-semibold">
                                Kasir (Sendiri)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300 capitalize">
                            {tx.payment_method === 'cash' && '💵 Tunai'}
                            {tx.payment_method === 'qris' && '📱 QRIS'}
                            {tx.payment_method === 'transfer' && '🏦 Transfer'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-orange-400 text-right">
                            {formatCurrency(tx.total_price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 text-sm">
            <p>
              <strong>ℹ️ Informasi:</strong> Tabel ini menampilkan semua transaksi POS dengan detail siapa yang melakukan transaksi. 
              Data tidak dapat diubah (read-only). Gunakan filter tanggal dan pencarian untuk menemukan transaksi tertentu.
            </p>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
