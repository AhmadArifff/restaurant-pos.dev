'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const TUTORIALS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    route: '/dashboard',
    roles: ['admin'],
    description: 'Pelajari ringkasan omzet, margin, transaksi, stok, diskon, chart, dan performa staf.',
    steps: [
      {
        selector: '[data-tour="dashboard-header"]',
        title: 'Dashboard sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di dashboard ini, header, filter tanggal, kartu statistik, chart, dan panel staf adalah komponen yang digabung menjadi satu halaman kerja.',
        details: ['Judul menunjukkan halaman aktif.', 'Tanggal hari ini memberi konteks waktu kerja.', 'Range dashboard mengontrol bulan dan tahun data yang sedang dilihat.', 'Indikator sinkronisasi muncul saat data sedang diperbarui.'],
      },
      {
        selector: '[data-tour="dashboard-today-stats"]',
        title: 'Kartu Hari Ini',
        body: 'Bagian ini membaca kondisi operasional hari ini secara cepat.',
        details: ['Omzet Hari Ini menampilkan pendapatan cabang hari ini.', 'Margin Keuntungan menampilkan estimasi profit dari transaksi.', 'Transaksi Hari Ini menunjukkan jumlah transaksi dan rata-rata nilai transaksi.', 'Stok Menipis memberi sinyal bahan baku yang perlu diawasi.', 'Distribusi Diskon menunjukkan total potongan yang sudah dipakai pelanggan.'],
      },
      {
        selector: '[data-tour="dashboard-month-stats"]',
        title: 'Kartu Bulanan',
        body: 'Kartu bulanan mengikuti bulan dari range dashboard. Gunakan ini untuk membaca performa dalam periode berjalan.',
        details: ['Omzet bulan menampilkan total pendapatan bulan terpilih.', 'Margin bulan membaca keuntungan bulan berjalan.', 'Transaksi bulan membantu melihat volume penjualan.', 'Diskon review bulan menunjukkan pengaruh program diskon pada periode itu.'],
      },
      {
        selector: '[data-tour="dashboard-year-stats"]',
        title: 'Kartu Tahunan',
        body: 'Bagian tahunan memberi gambaran besar performa bisnis selama tahun yang dipilih.',
        details: ['Omzet tahun menggabungkan semua bulan.', 'Margin tahun membantu evaluasi profit jangka panjang.', 'Transaksi tahun menunjukkan volume order tahunan.', 'Diskon review tahun membantu melihat total distribusi promo.'],
      },
      {
        selector: '[data-tour="dashboard-month-chart"]',
        title: 'Grafik Bulan Terpilih',
        body: 'Chart ini memvisualkan data harian pada bulan yang sedang dipilih.',
        details: ['Tab Omzet & Margin membandingkan pendapatan dan profit.', 'Tab Per Produk menampilkan penjualan tiap menu.', 'Chip warna dapat dipakai untuk menyalakan atau menyembunyikan seri data.', 'Hover titik chart untuk membaca detail nilai per tanggal.'],
      },
      {
        selector: '[data-tour="dashboard-year-chart"]',
        title: 'Grafik Tahunan',
        body: 'Chart tahunan membantu melihat pola naik turun bisnis antar bulan.',
        details: ['Gunakan tab Omzet & Margin untuk evaluasi revenue tahunan.', 'Gunakan tab Per Produk untuk melihat menu yang dominan sepanjang tahun.', 'Sumbu bulan membantu menemukan musim ramai atau sepi.'],
      },
      {
        selector: '[data-tour="dashboard-best-selling"]',
        title: 'Produk Terlaris',
        body: 'Panel ini mengurutkan menu yang paling kuat performanya.',
        details: ['Tab Terjual mengurutkan berdasarkan jumlah porsi.', 'Tab Margin mengurutkan berdasarkan keuntungan.', 'Filter Semua, Bulan, dan Tahun mengubah cakupan pembacaan.', 'Progress bar menunjukkan dominasi produk dibanding produk lain.'],
      },
      {
        selector: '[data-tour="dashboard-low-stock"]',
        title: 'Bahan Baku Menipis',
        body: 'Panel stok menipis membantu mencegah menu tidak bisa dijual.',
        details: ['Status Habis berarti bahan tidak tersedia.', 'Status Menipis berarti stok mendekati minimum.', 'Estimasi porsi menunjukkan menu apa saja yang terdampak bahan tersebut.', 'Bagian ini penting untuk keputusan pengajuan atau pengeluaran stok.'],
      },
      {
        selector: '[data-tour="dashboard-schedule"]',
        title: 'Informasi Jadwal & Kehadiran',
        body: 'Bagian ini menghubungkan aktivitas staf, kehadiran, dan performa kerja.',
        details: ['Karyawan aktif menunjukkan siapa yang sedang online.', 'Grafik kehadiran merangkum hari hadir per minggu.', 'Filter chip staf membantu fokus pada orang tertentu.', 'Data ini menjadi dasar membaca jadwal operasional.'],
      },
      {
        selector: '[data-tour="dashboard-staff-performance"]',
        title: 'Performa Penjualan Karyawan',
        body: 'Panel ini menampilkan kontribusi transaksi, omzet, margin, dan produk per karyawan.',
        details: ['Summary card menunjukkan kontribusi tiap staf.', 'Tab Omzet & Margin membaca nilai penjualan.', 'Tab Transaksi membaca volume order.', 'Tab Per Produk membaca menu yang dijual tiap staf.'],
      },
    ],
  },
  {
    id: 'schedule-info',
    title: 'Informasi Jadwal',
    route: '/dashboard',
    roles: ['admin'],
    description: 'Fokus pada area karyawan aktif, grafik kehadiran, dan performa staf di dashboard.',
    steps: [
      {
        selector: '[data-tour="dashboard-schedule"]',
        title: 'Pusat Informasi Jadwal',
        body: 'Tutorial ini fokus pada informasi jadwal yang saat ini berada di halaman dashboard.',
        details: ['Area ini muncul saat ada data staf aktif atau data kehadiran.', 'Periode mengikuti range dashboard.', 'Gunakan bagian ini untuk membaca aktivitas operasional tim.'],
      },
      {
        selector: '[data-tour="dashboard-active-users"]',
        title: 'Karyawan Aktif Hari Ini',
        body: 'Kartu karyawan aktif memperlihatkan staf yang sedang online di sistem.',
        details: ['Nama dan role membantu mengenali staf.', 'Durasi online menunjukkan lama aktivitas hari ini.', 'Tanggal hadir memberi konteks absensi hari berjalan.'],
      },
      {
        selector: '[data-tour="dashboard-attendance-chart"]',
        title: 'Grafik Kehadiran',
        body: 'Grafik kehadiran memadatkan data absensi menjadi visual mingguan.',
        details: ['Chip nama staf dapat dipakai sebagai filter.', 'Garis chart menunjukkan jumlah hari hadir per minggu.', 'Hover chart untuk membaca detail tanggal hadir.'],
      },
      {
        selector: '[data-tour="dashboard-staff-performance"]',
        title: 'Hubungan Jadwal dan Performa',
        body: 'Setelah melihat kehadiran, bandingkan dengan performa penjualan karyawan.',
        details: ['Total transaksi menunjukkan aktivitas kerja.', 'Omzet dan margin membantu membaca kontribusi bisnis.', 'Tab chart memecah performa ke transaksi dan produk.'],
      },
    ],
  },
];

function getStorageKey(user) {
  return `pos-tutorial-launcher-seen-v1-${user?.id || user?.email || user?.name || 'guest'}`;
}

export default function FloatingTutorialButton() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTutorialId, setActiveTutorialId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState(null);

  const availableTutorials = useMemo(() => (
    TUTORIALS.filter((tutorial) => !tutorial.roles || tutorial.roles.includes(user?.role))
  ), [user?.role]);
  const activeTutorial = availableTutorials.find((item) => item.id === activeTutorialId);
  const activeStep = activeTutorial?.steps?.[stepIndex];

  useEffect(() => {
    if (!user) return;
    const key = getStorageKey(user);
    if (typeof window === 'undefined' || window.localStorage.getItem(key)) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(key, '1');
    }, 900);
    return () => window.clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!activeStep?.selector || !open) {
      setHighlight(null);
      return undefined;
    }

    let cancelled = false;
    const updateHighlight = () => {
      const element = document.querySelector(activeStep.selector);
      if (!element) {
        setHighlight(null);
        return;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      window.setTimeout(() => {
        if (cancelled) return;
        const rect = element.getBoundingClientRect();
        setHighlight({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }, 280);
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [activeStep, open, pathname]);

  if (!user || availableTutorials.length === 0) return null;

  const startTutorial = (tutorial) => {
    setActiveTutorialId(tutorial.id);
    setStepIndex(0);
    setOpen(true);
    if (pathname !== tutorial.route) router.push(tutorial.route);
  };

  const closeTutorial = () => {
    setOpen(false);
    setHighlight(null);
  };

  const finishTutorial = () => {
    setActiveTutorialId(null);
    setStepIndex(0);
    setHighlight(null);
    setOpen(true);
  };

  const goNext = () => {
    if (!activeTutorial) return;
    if (stepIndex >= activeTutorial.steps.length - 1) {
      finishTutorial();
      return;
    }
    setStepIndex((value) => value + 1);
  };

  const goBack = () => {
    setStepIndex((value) => Math.max(0, value - 1));
  };

  return (
    <>
      {open && activeTutorial && highlight && (
        <div
          className="pointer-events-none fixed z-[58] rounded-3xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.62),0_0_34px_rgba(251,191,36,0.38)] transition-all duration-300"
          style={{
            top: `${Math.max(highlight.top, 12)}px`,
            left: `${Math.max(highlight.left, 12)}px`,
            width: `${highlight.width}px`,
            height: `${highlight.height}px`,
          }}
        />
      )}

      {open && (
        <div className="fixed bottom-24 right-4 z-[60] w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-amber-500/25 bg-slate-950 shadow-2xl shadow-black/50 sm:right-24">
          <div className="border-b border-white/10 bg-gradient-to-br from-amber-500/18 to-slate-900 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-300">Tutorial Assistant</p>
                <h2 className="mt-1 text-lg font-black text-white">
                  {activeTutorial ? activeTutorial.title : 'Pilih Tutorial'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTutorial}
                className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 text-sm font-black text-slate-300 transition hover:border-amber-400 hover:text-amber-200"
                aria-label="Tutup tutorial"
              >
                X
              </button>
            </div>
          </div>

          {activeTutorial && activeStep ? (
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-200">
                  Step {stepIndex + 1}/{activeTutorial.steps.length}
                </span>
                <button
                  type="button"
                  onClick={finishTutorial}
                  className="text-xs font-bold text-slate-400 transition hover:text-amber-200"
                >
                  Pilih tutorial lain
                </button>
              </div>

              <h3 className="text-xl font-black text-white">{activeStep.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activeStep.body}</p>

              {activeStep.details?.length > 0 && (
                <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  {activeStep.details.map((detail) => (
                    <div key={detail} className="flex gap-2 text-sm leading-5 text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-slate-200 transition hover:border-amber-400/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-[1.4] rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                >
                  {stepIndex >= activeTutorial.steps.length - 1 ? 'Selesai' : 'Lanjut'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <p className="text-sm leading-6 text-slate-300">
                Pilih halaman yang ingin dipandu. Setelah satu tutorial selesai, pilihan ini akan muncul lagi supaya Anda bisa lanjut ke menu lain.
              </p>
              <div className="mt-4 space-y-3">
                {availableTutorials.map((tutorial) => (
                  <button
                    key={tutorial.id}
                    type="button"
                    onClick={() => startTutorial(tutorial)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-amber-400/50 hover:bg-amber-500/10"
                  >
                    <span className="block text-base font-black text-white">{tutorial.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-400">{tutorial.description}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={closeTutorial}
                className="mt-4 w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-amber-400/50 hover:text-amber-200"
              >
                Sembunyikan dulu
              </button>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-6 right-24 z-50 h-16 w-16 sm:right-28">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-16 w-16 place-items-center rounded-full border border-amber-300/35 bg-gradient-to-br from-amber-400 to-orange-700 text-sm font-black text-slate-950 shadow-xl shadow-amber-950/35 transition hover:-translate-y-0.5 hover:shadow-amber-700/30"
          aria-label={open ? 'Tutup tutorial assistant' : 'Buka tutorial assistant'}
          aria-expanded={open}
          title={open ? 'Tutup tutorial' : 'Buka tutorial'}
        >
          {open ? 'X' : 'TUTOR'}
        </button>
      </div>
    </>
  );
}
