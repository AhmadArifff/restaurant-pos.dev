'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPublicBranches, getPublicDiningTables } from '@/lib/api';
import QRCodeCard from '@/components/customer/QRCodeCard';

const getOrderUrl = (token) => {
  if (typeof window === 'undefined') return `/order/${token}`;
  return `${window.location.origin}/order/${token}`;
};

export default function SelectDiningTablePage() {
  const [tables, setTables] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBranches()
      .then((res) => {
        const rows = res.data || [];
        setBranches(rows);
        setSelectedBranch(rows[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBranch?.id) return;
    setLoading(true);
    getPublicDiningTables({ branch_id: selectedBranch.id })
      .then((res) => {
        const rows = res.data || [];
        setTables(rows);
        setSelected(rows[0] || null);
      })
      .finally(() => setLoading(false));
  }, [selectedBranch?.id]);

  const selectedUrl = useMemo(() => selected ? getOrderUrl(selected.qr_token) : '', [selected]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0D0A06] text-[#F5EDD8]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(201,168,76,0.22),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(139,26,26,0.22),transparent_32%)]" />
      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="flex flex-col justify-center">
          <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#C9A84C]/30 px-4 py-2 text-sm text-[#C9A84C] hover:bg-[#C9A84C]/10">
            Kembali ke Landing Page
          </Link>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C9A84C]">Self Order Table</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-black leading-tight md:text-6xl">
              Pilih meja, scan QR, lalu pesan menu dari tempat duduk Anda.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#EDE0C4]/75">
              Setiap meja punya QR unik. Pelanggan bisa membuka menu, mengirim pesanan, memantau status, lalu memberi review untuk mendapat potongan 5%.
            </p>
          </motion.div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">Pilih Cabang</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {branches.map((branch) => {
                const active = Number(selectedBranch?.id) === Number(branch.id);
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      active
                        ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#F5EDD8]'
                        : 'border-[#C9A84C]/18 bg-[#1A1409]/70 text-[#EDE0C4]/75 hover:border-[#C9A84C]/60'
                    }`}
                  >
                    <strong className="block text-lg">{branch.name}</strong>
                    <span className="mt-1 block text-xs opacity-70">{branch.area || branch.address || 'Cabang aktif'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {loading
              ? [...Array(8)].map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-3xl border border-[#C9A84C]/10 bg-[#1A1409]" />
                ))
              : tables.map((table, index) => {
                  const active = selected?.id === table.id;
                  return (
                    <motion.button
                      key={table.id}
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.035 }}
                      onClick={() => setSelected(table)}
                      className={`group rounded-3xl border p-5 text-left transition ${
                        active
                          ? 'border-[#C9A84C] bg-[#C9A84C] text-[#0D0A06] shadow-xl shadow-[#C9A84C]/20'
                          : 'border-[#C9A84C]/18 bg-[#1A1409]/88 text-[#F5EDD8] hover:-translate-y-1 hover:border-[#C9A84C]/60'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.24em] opacity-70">Meja</span>
                      <strong className="mt-2 block text-4xl font-black">{table.table_number}</strong>
                      <span className="mt-3 block text-sm opacity-75">{table.table_name || `${table.capacity} kursi tersedia`}</span>
                    </motion.button>
                  );
                })}
          </div>

          {!loading && tables.length === 0 && (
            <div className="mt-8 rounded-3xl border border-red-400/25 bg-red-500/10 p-5 text-red-100">
              Belum ada meja aktif. Admin perlu membuat meja QR dulu di menu Pesanan Meja.
            </div>
          )}
        </div>

        <aside className="flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-[2rem] border border-[#C9A84C]/22 bg-[#1A1409]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur"
          >
            {selected ? (
              <>
                <div className="mb-5 rounded-3xl bg-[#241C0E] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">QR Aktif</p>
                  <h2 className="mt-2 text-3xl font-black">Meja {selected.table_number}</h2>
                  <p className="mt-2 text-sm text-[#EDE0C4]/70">{selectedBranch?.name || selected.table_name || 'Siap menerima pesanan pelanggan.'}</p>
                </div>
                <QRCodeCard value={selectedUrl} />
                <Link
                  href={`/order/${selected.qr_token}`}
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#C9A84C] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#0D0A06] transition hover:bg-[#E8C96A]"
                >
                  Lanjut Pesan
                </Link>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#C9A84C]/30 p-8 text-center text-[#EDE0C4]/65">
                Pilih salah satu meja untuk menampilkan QR.
              </div>
            )}
          </motion.div>
        </aside>
      </section>
    </main>
  );
}
