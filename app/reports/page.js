'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getSalesReport, getBestSelling } from '@/lib/api';

export default function ReportsPage() {
  const [sales, setSales]       = useState([]);
  const [best, setBest]         = useState([]);
  const [period, setPeriod]     = useState('daily');
  const [month, setMonth]       = useState(new Date().getMonth() + 1);
  const [year, setYear]         = useState(new Date().getFullYear());

  useEffect(() => {
    getSalesReport({ period, month, year }).then(r => setSales(r.data));
    getBestSelling({ limit: 10 }).then(r => setBest(r.data));
  }, [period, month, year]);

  const totalRevenue = sales.reduce((s, r) => s + Number(r.revenue), 0);
  const totalTrx     = sales.reduce((s, r) => s + Number(r.total_trx), 0);
  const maxRevenue   = Math.max(...sales.map(s => Number(s.revenue)), 1);

  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-white text-2xl font-bold">Laporan Penjualan</h1>
          <p className="text-slate-400 text-sm mt-1">Analisis omzet dan transaksi</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {['daily','monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  period === p ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}>
                {p === 'daily' ? 'Harian' : 'Bulanan'}
              </button>
            ))}
          </div>
          {period === 'daily' && (
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          )}
          <select value={year} onChange={e => setYear(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Omzet</p>
            <p className="text-orange-400 text-2xl font-bold mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Transaksi</p>
            <p className="text-blue-400 text-2xl font-bold mt-1">{totalTrx}</p>
          </div>
        </div>

        {/* Grafik Bar */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h2 className="text-white font-bold mb-4">
            Grafik {period === 'daily' ? 'Harian' : 'Bulanan'}
          </h2>
          {sales.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-slate-500 text-sm">Belum ada data</div>
          ) : (
            <div className="flex items-end gap-1 h-44 overflow-x-auto pb-6 relative">
              {sales.map((s, i) => {
                const h = Math.max((Number(s.revenue) / maxRevenue) * 100, 2);
                const label = period === 'daily'
                  ? new Date(s.date).getDate()
                  : months[Number(s.month) - 1];
                return (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[32px] flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Rp {Number(s.revenue).toLocaleString('id-ID')}
                      <br />{s.total_trx} trx
                    </div>
                    <div
                      className="w-full bg-orange-500 hover:bg-orange-400 rounded-t transition-all"
                      style={{ height: `${h}%`, minHeight: '4px' }}
                    />
                    <span className="text-slate-500 text-xs absolute bottom-0">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabel + Produk Terlaris */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tabel data */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="text-white font-bold">Detail Data</h2>
            </div>
            <div className="overflow-y-auto max-h-72">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium px-4 py-2">
                      {period === 'daily' ? 'Tanggal' : 'Bulan'}
                    </th>
                    <th className="text-right text-slate-400 font-medium px-4 py-2">Trx</th>
                    <th className="text-right text-slate-400 font-medium px-4 py-2">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-white">
                        {period === 'daily'
                          ? new Date(s.date).toLocaleDateString('id-ID')
                          : months[Number(s.month) - 1]}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">{s.total_trx}</td>
                      <td className="px-4 py-2 text-right text-orange-400 font-medium">
                        Rp {Number(s.revenue).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={3} className="text-center text-slate-500 py-8">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Produk Terlaris */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="text-white font-bold">🏆 Produk Terlaris</h2>
            </div>
            <div className="p-4 space-y-3">
              {best.map((p, i) => {
                const maxSold = best[0]?.total_sold || 1;
                const pct = (p.total_sold / maxSold) * 100;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm">{i + 1}. {p.name}</span>
                      <span className="text-slate-400 text-xs">{p.total_sold} terjual</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {best.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">Belum ada data</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}