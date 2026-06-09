'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
        title: 'Karyawan Aktif & Kehadiran',
        body: 'Bagian ini menghubungkan aktivitas staf, kehadiran, dan performa kerja.',
        details: ['Karyawan aktif menunjukkan siapa yang sedang online.', 'Grafik kehadiran merangkum hari hadir per minggu.', 'Filter chip staf membantu fokus pada orang tertentu.', 'Data ini menjadi dasar membaca aktivitas operasional tim.'],
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
    id: 'stock',
    title: 'Stok',
    route: '/stock',
    roles: ['admin', 'kasir'],
    description: 'Pelajari bahan baku, stok gudang, pemasukan, pengeluaran, pengajuan, dan form stok.',
    steps: [
      {
        selector: '[data-tour="stock-header"]',
        title: 'Menu Stok sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu stok ini, header, tab, tabel, filter, kartu ringkasan, dan modal form adalah komponen yang digabung menjadi satu alur manajemen persediaan.',
        details: ['Judul halaman berubah mengikuti role admin atau kasir.', 'Admin melihat master bahan baku, stok gudang, dan pengajuan kasir.', 'Kasir melihat stok gudang serta pengajuan miliknya sendiri.', 'Semua data tetap mengikuti role dan cabang yang sedang login.'],
      },
      {
        selector: '[data-tour="stock-tabs"]',
        title: 'Tab Utama Stok',
        body: 'Tab utama menentukan area kerja stok yang sedang dibuka.',
        details: ['Bahan Baku berisi master ingredient atau condiment untuk resep produk.', 'Stok Gudang membaca saldo, pemasukan, dan pengeluaran stok.', 'Pengajuan Kasir atau Pengajuan Saya menampilkan status request stok.', 'Label Sinkronisasi stok muncul saat data sedang diperbarui tanpa menutup halaman.'],
      },
      {
        selector: '[data-tour="stock-master"]',
        roles: ['admin'],
        actions: ['stock-tab-master'],
        title: 'Master Bahan Baku',
        body: 'Bagian ini adalah daftar ingredient dasar, bukan menu siap jual. Satu produk bisa memakai beberapa bahan dari daftar ini.',
        details: ['Nama bahan dipakai di resep produk.', 'Satuan menentukan perhitungan qty seperti gram, ml, pcs, atau porsi.', 'Minimal stok menjadi batas alert menipis.', 'Stok saat ini dan harga dihitung dari transaksi stok gudang.'],
      },
      {
        selector: '[data-tour="stock-master-actions"]',
        roles: ['admin'],
        actions: ['stock-tab-master'],
        title: 'Aksi Bahan Baku',
        body: 'Kontrol di kanan atas dipakai untuk membaca tren harga dan menambah master bahan.',
        details: ['Dropdown tahun mengubah periode tren harga.', 'Tombol Tambah Bahan membuka form bahan baku.', 'Jumlah bahan baku memberi ringkasan total master yang tersedia.', 'Catatan kecil mengingatkan stok ditambah dari tab Catat Pembelian.'],
      },
      {
        selector: '[data-tour="stock-master-trends"]',
        roles: ['admin'],
        actions: ['stock-tab-master'],
        title: 'Tren Harga Bahan',
        body: 'Kartu tren membantu membaca perubahan harga beli bahan baku.',
        details: ['Kolom tahun membandingkan harga pertama dan terakhir pada tahun terpilih.', 'Kolom All membandingkan harga sepanjang histori pembelian.', 'Indikator naik, turun, atau stabil membantu keputusan pembelian.', 'Jumlah pembelian menunjukkan banyaknya data historis yang dipakai.'],
      },
      {
        selector: '[data-tour="stock-master-table"]',
        roles: ['admin'],
        actions: ['stock-tab-master'],
        title: 'Tabel Bahan Baku',
        body: 'Tabel ini menggabungkan master bahan, stok terkini, harga rata-rata, dan aksi edit/hapus.',
        details: ['Kolom Nama Bahan dan Satuan menjelaskan identitas bahan.', 'Min. Stok dipakai untuk status Aman, Menipis, atau Habis.', 'Harga/Satuan menampilkan average cost dan harga terakhir.', 'Tombol Edit mengubah master, tombol Hapus meminta konfirmasi modal.'],
      },
      {
        selector: '[data-tour="stock-warehouse-tabs"]',
        actions: ['stock-close-master-modal', 'stock-tab-warehouse'],
        title: 'Subtab Stok Gudang',
        body: 'Subtab membagi gudang menjadi saldo, pemasukan, dan pengeluaran.',
        details: ['Saldo Stok menampilkan posisi stok saat ini.', 'Pemasukan mencatat pembelian bahan dan menambah saldo gudang.', 'Pengeluaran mencatat bahan yang keluar untuk menu, transaksi, atau pengajuan.', 'Role kasir hanya melihat subtab yang sesuai kewenangannya.'],
      },
      {
        selector: '[data-tour="stock-summary"]',
        actions: ['stock-close-master-modal', 'stock-tab-warehouse', 'stock-subtab-summary'],
        title: 'Saldo Stok Gudang',
        body: 'Saldo adalah hasil akhir dari semua stok masuk dikurangi stok keluar.',
        details: ['Informasi cabang memperjelas stok yang sedang dibaca.', 'Data dihitung otomatis dari pemasukan, pengeluaran, dan pengajuan yang disetujui.', 'Tidak ada input manual langsung di saldo agar audit tetap rapi.', 'Jika stok kosong, sistem menampilkan empty state.'],
      },
      {
        selector: '[data-tour="stock-summary-cards"]',
        roles: ['admin'],
        actions: ['stock-close-master-modal', 'stock-tab-warehouse', 'stock-subtab-summary'],
        title: 'Kartu Nilai Stok',
        body: 'Kartu ringkasan membantu admin membaca nilai uang dari pergerakan stok.',
        details: ['Total Nilai Masuk menghitung nilai pembelian.', 'Total Nilai Keluar menghitung nilai bahan yang dipakai atau keluar.', 'Nilai Stok Gudang membaca selisih nilai masuk dan keluar.', 'Bagian ini hanya tampil lengkap untuk admin.'],
      },
      {
        selector: '[data-tour="stock-summary-table"]',
        actions: ['stock-close-master-modal', 'stock-tab-warehouse', 'stock-subtab-summary'],
        title: 'Tabel Saldo',
        body: 'Tabel saldo menampilkan kondisi tiap bahan secara operasional.',
        details: ['Total Masuk dan Total Keluar memakai satuan bahan masing-masing.', 'Saldo Stok menunjukkan qty aktual yang tersisa.', 'Status Habis, Menipis, dan Aman membantu prioritas pengadaan.', 'Nilai rupiah di dalam kurung membantu membaca dampak biaya.'],
      },
      {
        selector: '[data-tour="stock-in"]',
        roles: ['admin'],
        actions: ['stock-tab-warehouse', 'stock-subtab-in'],
        title: 'Pemasukan Stok',
        body: 'Pemasukan dipakai untuk mencatat bahan yang dibeli atau masuk ke gudang.',
        details: ['Data pemasukan menambah saldo stok gudang.', 'Catat Pembelian membuka modal input beberapa bahan sekaligus.', 'Edit dan hapus pembelian tetap memicu perhitungan ulang saldo.', 'Harga pembelian menjadi dasar moving average bahan.'],
      },
      {
        selector: '[data-tour="stock-in-filters"]',
        roles: ['admin'],
        actions: ['stock-tab-warehouse', 'stock-subtab-in'],
        title: 'Filter Pemasukan',
        body: 'Filter pemasukan membantu mempersempit data pembelian.',
        details: ['Bulan dan tahun memilih periode pembelian.', 'Chip bahan baku memfilter data ke item tertentu.', 'Badge angka menunjukkan jumlah data per bahan.', 'Filter Semua mengembalikan daftar penuh pada periode itu.'],
      },
      {
        selector: '[data-tour="stock-in-table"]',
        roles: ['admin'],
        actions: ['stock-tab-warehouse', 'stock-subtab-in'],
        title: 'Tabel Pemasukan',
        body: 'Tabel ini adalah audit trail pembelian stok.',
        details: ['Tanggal menunjukkan kapan pembelian dicatat.', 'Jumlah dan Harga/Satuan membentuk Total Biaya.', 'Harga Avg membantu membandingkan pembelian terhadap rata-rata.', 'Dicatat Oleh dan Catatan memberi konteks operasional.'],
      },
      {
        selector: '[data-tour="stock-out"]',
        actions: ['stock-close-purchase-modal', 'stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Pengeluaran Stok',
        body: 'Pengeluaran membaca bahan yang keluar dari gudang atau stok kasir.',
        details: ['Pengeluaran bisa berasal dari transaksi POS, pengajuan manual, atau catatan admin.', 'Tombol Catat Pengeluaran membuka form berbasis menu atau bahan.', 'Data kasir tetap dibatasi pada user dan role yang sesuai.', 'Nilai pengeluaran membantu membaca biaya produksi.'],
      },
      {
        selector: '[data-tour="stock-out-filters"]',
        actions: ['stock-close-purchase-modal', 'stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Filter Tanggal Pengeluaran',
        body: 'Filter tanggal memilih range data pengeluaran stok.',
        details: ['Dari adalah tanggal awal.', 'Sampai adalah tanggal akhir.', 'Tombol Cari memuat ulang data sesuai range.', 'Range dipakai agar tabel tetap ringan saat histori banyak.'],
      },
      {
        selector: '[data-tour="stock-out-pills"]',
        actions: ['stock-close-purchase-modal', 'stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Filter Status Pengeluaran',
        body: 'Chip status memisahkan sumber dan status pengeluaran.',
        details: ['Semua menampilkan semua data pada range.', 'Sudah Keluar atau Disetujui menunjukkan stok yang benar-benar keluar.', 'Menunggu menunjukkan pengajuan yang belum diproses admin.', 'Ditolak dan Transaksi POS membantu audit sumber pengeluaran.'],
      },
      {
        selector: '[data-tour="stock-out-table"]',
        actions: ['stock-close-purchase-modal', 'stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Tabel Pengeluaran',
        body: 'Tabel pengeluaran menjelaskan bahan apa yang keluar, berapa nilainya, dan dari sumber mana.',
        details: ['Tanggal, Bahan Baku, Jumlah, Harga/Sat, dan Total Nilai membaca detail biaya.', 'Status Sumber membedakan transaksi, pending, approved, atau rejected.', 'Sumber Cabang dan Sumber Stok membantu melacak lokasi stok.', 'Pengaju, Status, dan Catatan menjelaskan siapa dan kenapa stok keluar.'],
      },
      {
        selector: '[data-tour="stock-requests"]',
        actions: ['stock-close-out-modal', 'stock-tab-requests'],
        title: 'Pengajuan Stok',
        body: 'Bagian ini mengelola permintaan stok dari kasir ke admin.',
        details: ['Admin melihat semua pengajuan kasir.', 'Kasir melihat pengajuan miliknya sendiri.', 'Pengajuan pending dapat diproses, ditolak, atau diajukan ulang sesuai status.', 'Item pengajuan menampilkan qty diminta, qty disetujui, harga, dan total nilai.'],
      },
      {
        selector: '[data-tour="stock-request-filters"]',
        actions: ['stock-close-out-modal', 'stock-tab-requests'],
        title: 'Filter Pengajuan',
        body: 'Filter ini menjaga daftar pengajuan tetap mudah dibaca.',
        details: ['Tanggal Dari dan Sampai memilih periode pengajuan.', 'Chip Semua, Menunggu, Disetujui, dan Ditolak memfilter status.', 'Jumlah pengajuan memberi ringkasan data yang sedang tampil.', 'Gunakan filter ini saat histori pengajuan sudah banyak.'],
      },
      {
        selector: '[data-tour="stock-request-list"]',
        actions: ['stock-close-out-modal', 'stock-tab-requests'],
        title: 'Kartu Pengajuan',
        body: 'Setiap kartu pengajuan adalah satu request stok beserta item bahan di dalamnya.',
        details: ['Header kartu menunjukkan nama kasir, tanggal, dan status.', 'Tombol Proses membuka modal approve untuk pengajuan pending.', 'Tombol Ajukan Ulang muncul pada pengajuan yang ditolak.', 'Tabel item menampilkan bahan, qty diajukan, qty disetujui, harga, dan total.'],
      },
      {
        selector: '[data-tour="stock-master-modal"]',
        roles: ['admin'],
        actions: ['stock-tab-master', 'stock-open-master-modal'],
        title: 'Buka Form Bahan Baku',
        body: 'Step ini membuka modal tambah atau edit bahan baku. Modal ini dipakai untuk mendaftarkan ingredient dasar yang nanti dipakai resep produk.',
        details: ['Form ini hanya mengatur master bahan.', 'Penambahan saldo stok tetap dilakukan lewat Catat Pembelian.', 'Tombol X atau Batal menutup modal tanpa menyimpan.', 'Simpan aktif ketika field wajib sudah valid.'],
      },
      {
        selector: '[data-tour="stock-master-name-field"]',
        roles: ['admin'],
        actions: ['stock-demo-master-fill'],
        title: 'Nama Bahan',
        body: 'Field ini adalah nama ingredient yang akan dipakai di tabel stok dan resep produk.',
        details: ['Wajib diisi.', 'Gunakan nama bahan yang mudah dikenali tim dapur.', 'Contoh: Daging Cincang Bumbu, Saus Tahini, Cup Minuman.', 'Nama ini akan muncul di stok gudang, produk, dan pengajuan.'],
      },
      {
        selector: '[data-tour="stock-master-unit-field"]',
        roles: ['admin'],
        actions: ['stock-demo-master-fill'],
        title: 'Satuan Bahan',
        body: 'Dropdown satuan menentukan cara sistem menghitung qty bahan.',
        details: ['Pilih gram, ml, pcs, porsi, atau satuan lain sesuai bahan.', 'Satuan ini ikut tampil di saldo, pemasukan, pengeluaran, dan resep.', 'Satuan yang salah akan membuat perhitungan HPP dan stok sulit dibaca.', 'Ubah satuan dengan hati-hati jika bahan sudah punya histori.'],
      },
      {
        selector: '[data-tour="stock-master-min-field"]',
        roles: ['admin'],
        actions: ['stock-demo-master-fill'],
        title: 'Minimal Stok Alert',
        body: 'Field ini menjadi batas stok menipis untuk bahan tersebut.',
        details: ['Opsional, tapi disarankan diisi.', 'Jika saldo stok sama atau di bawah batas ini, status menjadi Menipis.', 'Jika stok 0, status menjadi Habis.', 'Nilai ini membantu dashboard dan tabel stok memberi peringatan lebih cepat.'],
      },
      {
        selector: '[data-tour="stock-master-actions-field"]',
        roles: ['admin'],
        actions: ['stock-demo-master-fill'],
        title: 'Aksi Simpan Bahan',
        body: 'Bagian bawah modal menentukan apakah perubahan dibatalkan atau disimpan.',
        details: ['Batal menutup modal dan membuang perubahan form.', 'Simpan membuat bahan baru.', 'Update menyimpan perubahan saat mode edit.', 'Saat proses berjalan, tombol menampilkan status menyimpan.'],
      },
      {
        selector: '[data-tour="stock-master-save-button"]',
        roles: ['admin'],
        actions: ['stock-demo-master-fill'],
        title: 'Simpan Bahan ke Database',
        body: 'Tombol ini menjalankan submit asli form bahan baku. Saat user klik Simpan, data dikirim ke backend lalu disimpan di database Supabase.',
        details: ['Tutorial sudah mengisi data demo pada field di atas.', 'Klik Simpan jika ingin benar-benar membuat bahan demo.', 'Setelah sukses, bahan muncul di tabel Bahan Baku.', 'Jika batal, data demo tidak dikirim ke database.'],
      },
      {
        selector: '[data-tour="stock-purchase-modal"]',
        roles: ['admin'],
        actions: ['stock-close-master-modal', 'stock-tab-warehouse', 'stock-subtab-in', 'stock-open-purchase-modal'],
        title: 'Buka Form Catat Pembelian',
        body: 'Step ini membuka modal pembelian stok. Alur ini dipakai saat gudang menerima bahan baru dari supplier atau pembelian manual.',
        details: ['Setiap item pembelian menambah saldo stok gudang.', 'Harga per satuan menjadi dasar perhitungan biaya rata-rata.', 'Satu modal bisa menyimpan beberapa bahan sekaligus.', 'Data pembelian akan muncul di tab Pemasukan.'],
      },
      {
        selector: '[data-tour="stock-purchase-item"]',
        roles: ['admin'],
        title: 'Item Pembelian',
        body: 'Satu kartu item mewakili satu bahan yang masuk ke gudang.',
        details: ['Label Item 1, Item 2, dan seterusnya membantu membedakan baris.', 'Jika ada lebih dari satu item, tombol Hapus menghapus baris tersebut.', 'Setiap item wajib memilih bahan, jumlah, dan harga satuan.', 'Isi semua baris sebelum klik Simpan Pembelian.'],
      },
      {
        selector: '[data-tour="stock-purchase-select-field"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Pilih Bahan Pembelian',
        body: 'Dropdown ini memilih bahan baku yang stoknya akan bertambah.',
        details: ['Daftar bahan berasal dari Master Bahan Baku.', 'Pilih satu bahan per baris item.', 'Nama dan satuan bahan akan menentukan label jumlah.', 'Jika bahan belum ada, tambahkan dulu di tab Bahan Baku.'],
      },
      {
        selector: '[data-tour="stock-purchase-qty-cost-field"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Jumlah dan Harga Pembelian',
        body: 'Dua input ini menentukan berapa stok yang masuk dan berapa harga satuannya.',
        details: ['Jumlah memakai satuan bahan yang dipilih.', 'Harga/Satuan diisi dalam Rupiah.', 'Sistem menghitung subtotal dari jumlah dikali harga.', 'Nilai ini mempengaruhi average cost bahan.'],
      },
      {
        selector: '[data-tour="stock-purchase-subtotal"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Subtotal Item',
        body: 'Subtotal muncul otomatis setelah jumlah dan harga diisi.',
        details: ['Subtotal = jumlah x harga per satuan.', 'Gunakan ini untuk cek cepat apakah input pembelian sudah benar.', 'Jika jumlah atau harga kosong, subtotal belum muncul.', 'Subtotal setiap item digabung ke Total Pembelian.'],
      },
      {
        selector: '[data-tour="stock-purchase-add-item"]',
        roles: ['admin'],
        title: 'Tambah Bahan Lain',
        body: 'Tombol ini menambah baris item pembelian baru.',
        details: ['Dipakai saat satu nota pembelian berisi banyak bahan.', 'Setiap baris tetap punya bahan, jumlah, dan harga sendiri.', 'Baris tambahan bisa dihapus jika tidak diperlukan.', 'Ini membuat pencatatan supplier lebih cepat.'],
      },
      {
        selector: '[data-tour="stock-purchase-note-field"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Catatan Pembelian',
        body: 'Catatan opsional dipakai untuk konteks pembelian.',
        details: ['Contoh: nama supplier, nomor nota, atau lokasi pembelian.', 'Catatan tampil di histori pemasukan.', 'Tidak wajib, tapi berguna untuk audit.', 'Jangan isi data sensitif yang tidak perlu.'],
      },
      {
        selector: '[data-tour="stock-purchase-total"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Total Pembelian',
        body: 'Kartu ini merangkum semua item pembelian sebelum disimpan.',
        details: ['Jumlah item membaca baris bahan yang dipilih.', 'Nominal total menjumlahkan semua subtotal.', 'Gunakan total ini untuk cocokkan dengan nota pembelian.', 'Jika total belum sesuai, cek kembali jumlah dan harga setiap item.'],
      },
      {
        selector: '[data-tour="stock-purchase-actions"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Aksi Simpan Pembelian',
        body: 'Bagian ini menyelesaikan proses pencatatan stok masuk.',
        details: ['Batal menutup modal tanpa menyimpan.', 'Simpan Pembelian menambah stok gudang.', 'Saat loading, tombol menampilkan status menyimpan.', 'Setelah sukses, saldo dan histori pemasukan diperbarui.'],
      },
      {
        selector: '[data-tour="stock-purchase-save-button"]',
        roles: ['admin'],
        actions: ['stock-demo-purchase-fill'],
        title: 'Simpan Pembelian ke Database',
        body: 'Tombol ini menjalankan submit pembelian asli. Saat diklik, stok gudang bertambah dan histori pemasukan tersimpan di Supabase.',
        details: ['Tutorial sudah memilih bahan, qty, harga, dan catatan demo.', 'Klik Simpan Pembelian untuk menyimpan contoh transaksi stok masuk.', 'Setelah sukses, data muncul di Pemasukan dan Saldo Stok.', 'Jika tidak ingin membuat data demo, klik Batal.'],
      },
      {
        selector: '[data-tour="stock-out-modal"]',
        actions: ['stock-close-purchase-modal', 'stock-tab-warehouse', 'stock-subtab-out', 'stock-open-out-modal'],
        title: 'Buka Form Pengeluaran atau Pengajuan',
        body: 'Step ini membuka modal pengeluaran stok. Admin memakainya untuk mencatat pengeluaran ke kasir, sedangkan kasir memakainya untuk mengajukan stok cabang.',
        details: ['Form bisa memakai resep menu otomatis.', 'Form juga bisa memakai bahan manual jika tidak memilih menu.', 'Qty divalidasi terhadap stok bahan yang tersedia.', 'Hasil akhirnya masuk ke pengeluaran atau pengajuan sesuai role.'],
      },
      {
        selector: '[data-tour="stock-out-user-field"]',
        roles: ['admin'],
        actions: ['stock-demo-out-user'],
        title: 'Pilih Kasir atau Pengguna',
        body: 'Admin memilih kasir yang menerima atau terkait dengan pengeluaran stok.',
        details: ['Wajib dipilih untuk pengeluaran admin.', 'Nama kasir akan muncul sebagai konteks stok keluar.', 'Ini membantu audit siapa yang memakai stok.', 'Kasir tidak melihat field ini karena sistem memakai user login.'],
      },
      {
        selector: '[data-tour="stock-out-user-info"]',
        roles: ['kasir'],
        title: 'Informasi Pengaju',
        body: 'Untuk kasir, sistem otomatis membuat pengajuan atas nama user yang sedang login.',
        details: ['Kasir tidak perlu memilih user.', 'Status pengajuan menunggu persetujuan admin.', 'Nama kasir menjadi sumber audit pengajuan.', 'Setelah dikirim, data tampil di tab Pengajuan Saya.'],
      },
      {
        selector: '[data-tour="stock-recipe-picker"]',
        title: 'Pilih Menu dari Resep',
        body: 'Bagian ini adalah mode otomatis. User memilih menu dan qty porsi, lalu sistem menghitung bahan yang dibutuhkan berdasarkan resep produk.',
        details: ['Bisa memilih satu atau beberapa menu.', 'Cocok untuk membuat stok menu berdasarkan bahan resep.', 'Jika tidak memilih menu, user bisa pakai input bahan manual.', 'Mode resep membantu mengurangi salah hitung ingredient.'],
      },
      {
        selector: '[data-tour="stock-recipe-menu-select"]',
        title: 'Dropdown Menu Pesanan',
        body: 'Dropdown ini memilih produk/menu yang resepnya akan dihitung.',
        details: ['Daftar menu berasal dari data produk yang punya bahan resep.', 'Angka bahan menunjukkan jumlah ingredient pada menu tersebut.', 'Menu yang sudah dipilih tidak bisa dipilih ulang di baris lain.', 'Pilih Manual jika ingin input bahan satu per satu.'],
      },
      {
        selector: '[data-tour="stock-recipe-menu-qty"]',
        title: 'Qty Menu',
        body: 'Input qty menentukan berapa porsi menu yang ingin dibuat atau diajukan.',
        details: ['Sistem mengalikan semua bahan resep dengan qty menu.', 'Qty otomatis dibatasi oleh stok bahan yang tersedia.', 'Teks maksimal porsi membantu user tidak over stok.', 'Jika bahan tidak cukup, sistem memberi informasi bahwa stok belum cukup.'],
      },
      {
        selector: '[data-tour="stock-recipe-add"]',
        title: 'Tambah Menu',
        body: 'Tombol ini menambah baris menu lain dalam satu pengeluaran atau pengajuan.',
        details: ['Dipakai saat ingin membuat beberapa menu sekaligus.', 'Setiap menu punya qty sendiri.', 'Sistem akan menggabungkan bahan yang sama dari beberapa menu.', 'Tombol nonaktif jika semua menu resep sudah dipilih.'],
      },
      {
        selector: '[data-tour="stock-recipe-note"]',
        actions: ['stock-demo-recipe-first'],
        title: 'Catatan Resep Terkunci',
        body: 'Informasi ini menegaskan bahwa bahan baku mengikuti resep produk.',
        details: ['User tidak mengubah bahan satu per satu saat mode menu dipakai.', 'Ubah menu atau qty untuk menghitung ulang bahan.', 'Ini menjaga konsistensi HPP dan stok.', 'Jika resep salah, perbaiki dari data produk.'],
      },
      {
        selector: '[data-tour="stock-recipe-summary"]',
        actions: ['stock-demo-recipe-first'],
        title: 'Ringkasan Bahan Resep',
        body: 'Ringkasan ini menunjukkan bahan apa saja yang otomatis dibutuhkan dari menu dan qty yang dipilih.',
        details: ['Setiap baris menampilkan nama bahan, qty, stok gudang, harga satuan, dan nilai.', 'Bahan yang sama dari beberapa menu digabung.', 'Bagian ini hanya preview dan tidak bisa dipilih manual.', 'Total nilai di bawah membaca estimasi biaya bahan.'],
      },
      {
        selector: '[data-tour="stock-out-manual-list"]',
        actions: ['stock-demo-recipe-clear'],
        title: 'Mode Bahan Manual',
        body: 'Jika user tidak memilih menu, form menampilkan item bahan manual.',
        details: ['Dipakai untuk pengeluaran bahan yang tidak berasal dari resep menu.', 'Setiap item wajib memilih bahan dan qty.', 'Mode ini tetap menghitung nilai pengeluaran dari harga bahan.', 'Bisa menambah banyak bahan dalam satu submit.'],
      },
      {
        selector: '[data-tour="stock-out-manual-select"]',
        actions: ['stock-demo-recipe-clear'],
        title: 'Pilih Bahan Manual',
        body: 'Dropdown ini memilih bahan baku yang akan dikeluarkan atau diajukan.',
        details: ['Admin melihat bahan dengan stok tersedia.', 'Kasir melihat bahan dari saldo gudang yang bisa diajukan.', 'Setelah bahan dipilih, sistem menampilkan stok dan harga.', 'Jika bahan tidak ada, cek master bahan dan saldo stok.'],
      },
      {
        selector: '[data-tour="stock-out-stock-price-info"]',
        actions: ['stock-demo-manual-first'],
        title: 'Info Stok dan Harga',
        body: 'Kartu kecil ini memberi konteks stok gudang dan harga satuan bahan.',
        details: ['Stok Gudang menunjukkan sisa bahan saat ini.', 'Harga per satuan menjadi dasar nilai pengeluaran atau pengajuan.', 'Jika harga belum ada, bahan perlu riwayat pembelian.', 'Info ini membantu user mengisi qty yang realistis.'],
      },
      {
        selector: '[data-tour="stock-out-manual-qty"]',
        actions: ['stock-demo-manual-first'],
        title: 'Qty Bahan Manual',
        body: 'Input qty menentukan jumlah bahan yang ingin dikeluarkan atau diajukan.',
        details: ['Qty wajib lebih dari 0.', 'Admin tidak boleh melebihi stok gudang.', 'Validasi memberi peringatan jika over stok.', 'Kasir juga memakai qty ini sebagai jumlah yang diminta ke admin.'],
      },
      {
        selector: '[data-tour="stock-out-manual-note"]',
        actions: ['stock-demo-manual-first'],
        title: 'Catatan Item',
        body: 'Catatan item menjelaskan alasan penggunaan bahan.',
        details: ['Contoh: stok untuk Adana Kebab Platter.', 'Catatan membantu admin memahami pengajuan kasir.', 'Catatan juga berguna untuk audit pengeluaran.', 'Field ini opsional.'],
      },
      {
        selector: '[data-tour="stock-out-item-preview"]',
        actions: ['stock-demo-manual-first'],
        title: 'Preview Nilai Item',
        body: 'Preview ini menghitung nilai satu item bahan.',
        details: ['Rumusnya qty dikali harga satuan.', 'Jika over stok, preview berubah menjadi peringatan.', 'Nilai valid akan masuk ke total pengeluaran atau pengajuan.', 'Gunakan preview untuk cek sebelum submit.'],
      },
      {
        selector: '[data-tour="stock-out-add-item"]',
        title: 'Tambah Bahan Lain',
        body: 'Tombol ini menambah baris bahan manual.',
        details: ['Dipakai saat satu pengeluaran memakai banyak bahan.', 'Setiap baris bisa dihapus jika tidak diperlukan.', 'Tombol ini tersembunyi saat mode resep menu aktif.', 'Mode resep sudah menghitung semua bahan dari menu otomatis.'],
      },
      {
        selector: '[data-tour="stock-out-total"]',
        actions: ['stock-demo-manual-first'],
        title: 'Total Nilai',
        body: 'Kartu total merangkum seluruh bahan yang akan dikirim.',
        details: ['Menampilkan jumlah item valid.', 'Menampilkan total nilai Rupiah.', 'Item yang over stok tidak ikut dihitung sebagai valid.', 'Gunakan total untuk memastikan pengeluaran atau pengajuan sudah masuk akal.'],
      },
      {
        selector: '[data-tour="stock-out-actions"]',
        actions: ['stock-demo-manual-first', 'stock-demo-out-user'],
        title: 'Aksi Submit Form',
        body: 'Bagian akhir form menentukan apakah user membatalkan atau mengirim data.',
        details: ['Batal menutup modal dan mengosongkan draft form.', 'Admin memakai Simpan Pengeluaran.', 'Kasir memakai Kirim Pengajuan.', 'Setelah sukses, sistem menampilkan modal konfirmasi dan memuat ulang data terkait.'],
      },
      {
        selector: '[data-tour="stock-out-save-button"]',
        actions: ['stock-demo-manual-first', 'stock-demo-out-user'],
        title: 'Submit Pengeluaran atau Pengajuan ke Database',
        body: 'Tombol ini menjalankan submit asli. Admin menyimpan pengeluaran stok, sedangkan kasir mengirim pengajuan stok untuk disetujui admin.',
        details: ['Tutorial sudah mengisi contoh bahan dan qty.', 'Admin perlu memilih kasir terlebih dahulu.', 'Klik tombol ini jika ingin menyimpan demo ke Supabase.', 'Setelah sukses, data masuk ke Pengeluaran atau Pengajuan sesuai role.'],
      },
    ],
  },
  {
    id: 'products',
    title: 'Produk',
    route: '/products',
    roles: ['admin', 'kasir'],
    description: 'Pelajari daftar menu, filter kategori, kartu stok, form gambar, kategori, resep, HPP, dan simpan produk.',
    steps: [
      {
        selector: '[data-tour="product-header"]',
        title: 'Menu Produk sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu produk ini, header, filter, kartu produk, modal form, upload gambar, resep, dan preview HPP digabung menjadi workflow pengelolaan menu.',
        details: ['Judul menunjukkan total produk terdaftar.', 'Sinkronisasi produk muncul saat data sedang refresh.', 'Tombol Tambah Produk membuka modal input menu baru.', 'Role tetap mengikuti akses halaman yang sedang login.'],
      },
      {
        selector: '[data-tour="product-actions"]',
        title: 'Aksi Produk',
        body: 'Bagian ini berisi status refresh dan aksi utama untuk membuat produk.',
        details: ['Sinkronisasi produk tidak menutup halaman saat data di-refresh.', 'Tambah Produk membuka form kosong.', 'Form produk menyimpan data ke backend dan database.', 'Gunakan aksi ini setelah master bahan dan kategori sudah tersedia.'],
      },
      {
        selector: '[data-tour="product-filters"]',
        title: 'Filter dan Cari Produk',
        body: 'Filter membantu mencari produk ketika daftar menu sudah banyak.',
        details: ['Kolom pencarian membaca nama produk.', 'Dropdown kategori membatasi daftar pada kategori tertentu.', 'Filter tidak mengubah data database, hanya tampilan daftar.', 'Gunakan ini sebelum edit agar produk cepat ditemukan.'],
      },
      {
        selector: '[data-tour="product-grid"]',
        title: 'Grid Produk',
        body: 'Grid ini menampilkan semua produk yang lolos filter.',
        details: ['Layout responsif mengikuti ukuran layar.', 'Saat data awal belum siap, skeleton loader tampil lebih dulu.', 'Setiap kartu membawa gambar, harga, kategori, resep, stok, dan aksi.', 'Data stok membantu membaca apakah menu siap dijual.'],
      },
      {
        selector: '[data-tour="product-card"]',
        title: 'Kartu Produk',
        body: 'Kartu produk adalah ringkasan satu menu siap jual.',
        details: ['Gambar membantu kasir dan pelanggan mengenali menu.', 'Nama dan harga menjadi data utama transaksi.', 'Kategori menghubungkan produk dengan filter dan landing page.', 'Badge resep memberi gambaran bahan baku yang dipakai.'],
      },
      {
        selector: '[data-tour="product-card-stock"]',
        title: 'Estimasi Stok Produk',
        body: 'Bagian stok membaca berapa porsi menu yang bisa dibuat dari bahan resep.',
        details: ['Admin melihat akumulasi stok dari kasir bila datanya tersedia.', 'Kasir melihat stok yang tersedia untuk dirinya.', 'Status habis atau menipis membantu keputusan ajukan stok.', 'Angka stok berasal dari bahan baku, bukan input manual produk.'],
      },
      {
        selector: '[data-tour="product-card-actions"]',
        title: 'Edit dan Hapus Produk',
        body: 'Aksi kartu dipakai untuk memperbarui atau menghapus menu.',
        details: ['Edit membuka modal dengan data produk yang sudah ada.', 'Hapus memakai konfirmasi modal agar tidak salah hapus.', 'Aksi ini tidak mengubah transaksi lama yang sudah tercatat.', 'Perubahan produk memengaruhi menu pelanggan dan kasir setelah refresh.'],
      },
      {
        selector: '[data-tour="product-modal"]',
        actions: ['product-open-form'],
        title: 'Buka Form Produk',
        body: 'Step ini membuka modal tambah produk. Form ini adalah tempat menggabungkan data gambar, harga, kategori, dan resep bahan baku.',
        details: ['Modal bisa dipakai untuk tambah atau edit produk.', 'Batal menutup modal tanpa menyimpan.', 'Submit menyimpan produk ke database.', 'Tutorial berikutnya akan mengisi contoh data agar alurnya jelas.'],
      },
      {
        selector: '[data-tour="product-image-field"]',
        actions: ['product-demo-basic-fill'],
        title: 'Gambar Produk',
        body: 'Bagian gambar menentukan visual produk di admin, kasir, order pelanggan, dan landing page jika data dipakai di sana.',
        details: ['Bisa upload file gambar valid.', 'Bisa pakai URL asset online atau embed.', 'Preview berubah otomatis setelah file atau URL diisi.', 'Validasi file mencegah ekstensi gambar yang tidak didukung.'],
      },
      {
        selector: '[data-tour="product-image-url-field"]',
        actions: ['product-demo-basic-fill'],
        title: 'URL Asset Online',
        body: 'Input ini cocok untuk gambar produk yang berasal dari link online.',
        details: ['Tutorial mengisi contoh URL gambar online.', 'Jika upload file dipakai, URL akan dikosongkan.', 'URL online tidak perlu disimpan ke bucket Supabase.', 'Gunakan gambar yang jelas agar tampilan menu tidak kosong.'],
      },
      {
        selector: '[data-tour="product-basic-fields"]',
        actions: ['product-demo-basic-fill'],
        title: 'Nama dan Harga Produk',
        body: 'Nama dan harga adalah data dasar yang dipakai transaksi.',
        details: ['Nama produk wajib diisi.', 'Harga wajib angka dan menjadi harga jual.', 'Harga akan divalidasi terhadap estimasi HPP.', 'Tutorial mengisi harga tinggi agar valid saat bahan demo dipilih.'],
      },
      {
        selector: '[data-tour="product-category-field"]',
        actions: ['product-demo-basic-fill'],
        title: 'Kategori Produk',
        body: 'Kategori mengelompokkan produk untuk filter admin, kasir, order pelanggan, dan landing page.',
        details: ['Dropdown berasal dari data kategori.', 'Pilih kategori yang paling sesuai dengan menu.', 'Jika kategori kosong, produk tetap tersimpan tapi filter/landing page bisa kurang rapi.', 'Kategori membantu customer scan menu lebih cepat.'],
      },
      {
        selector: '[data-tour="product-recipe-section"]',
        title: 'Bahan Baku Resep',
        body: 'Resep menghubungkan produk dengan bahan baku. Satu menu bisa memakai beberapa ingredient atau condiment.',
        details: ['Resep dipakai untuk hitung HPP.', 'Resep juga dipakai untuk estimasi stok porsi.', 'Qty bahan mengikuti satuan master bahan.', 'Jika resep salah, stok dan biaya produksi ikut salah.'],
      },
      {
        selector: '[data-tour="product-add-ingredient"]',
        title: 'Tambah Bahan Resep',
        body: 'Tombol ini menambah baris bahan ke resep produk.',
        details: ['Gunakan untuk memasukkan semua bahan yang dibutuhkan menu.', 'Setiap baris memilih satu bahan dan qty.', 'Bahan yang sama sebaiknya tidak dobel agar HPP bersih.', 'Tutorial akan menambah satu baris bahan demo.'],
      },
      {
        selector: '[data-tour="product-ingredient-row"]',
        actions: ['product-add-ingredient'],
        title: 'Baris Bahan',
        body: 'Baris ini adalah satu komponen resep: bahan, qty, satuan, dan tombol hapus.',
        details: ['Select memilih bahan baku dari master stok.', 'Input qty menentukan jumlah bahan per satu produk.', 'Satuan tampil otomatis dari bahan yang dipilih.', 'Tombol X menghapus baris dari resep.'],
      },
      {
        selector: '[data-tour="product-ingredient-select"]',
        actions: ['product-demo-ingredient-fill'],
        title: 'Pilih Bahan',
        body: 'Dropdown bahan mengambil data master bahan baku.',
        details: ['Tutorial memilih bahan pertama yang tersedia.', 'Bahan harus sudah dibuat di menu Stok.', 'Nama bahan akan muncul di badge produk dan ringkasan HPP.', 'Pilih bahan yang benar-benar dipakai membuat menu.'],
      },
      {
        selector: '[data-tour="product-ingredient-qty"]',
        actions: ['product-demo-ingredient-fill'],
        title: 'Qty Resep',
        body: 'Qty adalah kebutuhan bahan untuk membuat satu porsi produk.',
        details: ['Qty bisa desimal untuk gram atau ml.', 'Qty harus lebih dari 0.', 'Nilai ini dipakai untuk menghitung HPP dan stok bisa dibuat.', 'Jika qty terlalu besar, stok produk terlihat cepat habis.'],
      },
      {
        selector: '[data-tour="product-hpp-preview"]',
        actions: ['product-demo-ingredient-fill'],
        title: 'Estimasi HPP',
        body: 'Preview HPP menghitung biaya produksi dari bahan yang dipilih.',
        details: ['Setiap bahan dihitung qty dikali harga rata-rata.', 'Total HPP dibandingkan dengan harga jual.', 'Margin menunjukkan selisih harga jual dan biaya produksi.', 'Simpan produk dinonaktifkan jika harga jual di bawah HPP.'],
      },
      {
        selector: '[data-tour="product-form-actions"]',
        actions: ['product-demo-basic-fill', 'product-demo-ingredient-fill'],
        title: 'Aksi Form Produk',
        body: 'Bagian bawah form menentukan apakah draft dibatalkan atau disimpan.',
        details: ['Batal menutup modal tanpa mengirim data.', 'Simpan mengirim produk ke backend.', 'Jika sedang edit, tombol menyimpan perubahan produk.', 'Pastikan gambar, kategori, dan resep sudah benar sebelum simpan.'],
      },
      {
        selector: '[data-tour="product-save-button"]',
        actions: ['product-demo-basic-fill', 'product-demo-ingredient-fill'],
        title: 'Simpan Produk ke Database',
        body: 'Tombol ini menjalankan submit asli. Jika user klik Simpan, data produk, gambar atau URL, kategori, dan resep dikirim ke backend lalu disimpan di Supabase.',
        details: ['Tutorial hanya menyiapkan contoh input.', 'Klik Simpan hanya jika ingin membuat produk demo.', 'Setelah sukses, daftar produk akan refresh.', 'Jika batal, data demo tidak masuk database.'],
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    route: '/payment',
    roles: ['admin'],
    description: 'Pelajari metode QRIS dan transfer manual, preview kartu, instruksi, timer pembayaran, upload QRIS, status, edit, nonaktif, dan hapus.',
    steps: [
      {
        selector: '[data-tour="payment-header"]',
        title: 'Menu Payment sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu payment ini, header, statistik, alur pelanggan, kartu metode, preview payment card, dan form input digabung menjadi sistem pembayaran manual.',
        details: ['Admin mengatur QRIS dan transfer tanpa payment gateway.', 'Metode aktif akan tampil di halaman order pelanggan.', 'Timer pembayaran berasal dari field batas waktu.', 'Status metode menentukan apakah bisa dipilih pelanggan.'],
      },
      {
        selector: '[data-tour="payment-stats"]',
        title: 'Statistik Payment',
        body: 'Kartu statistik membaca kondisi metode pembayaran.',
        details: ['Aktif menunjukkan metode yang bisa dipakai pelanggan.', 'Total menunjukkan seluruh metode termasuk nonaktif.', 'Sinkronisasi payment tampil saat data sedang refresh.', 'Ringkasan ini membantu admin cepat melihat konfigurasi.'],
      },
      {
        selector: '[data-tour="payment-flow"]',
        title: 'Alur Pembayaran Pelanggan',
        body: 'Panel ini menjelaskan flow manual QRIS dan transfer agar admin memahami dampaknya ke halaman order.',
        details: ['QRIS menampilkan QR statis, nominal, timer, dan upload bukti.', 'Transfer menampilkan kartu rekening, copy rekening, copy nominal, dan upload bukti.', 'Setelah bukti dikirim, pelanggan menunggu verifikasi admin atau kasir.', 'Tidak ada payment gateway, jadi verifikasi tetap manual.'],
      },
      {
        selector: '[data-tour="payment-list"]',
        title: 'Daftar Metode Pembayaran',
        body: 'Daftar ini menampilkan semua metode yang sudah dibuat.',
        details: ['Metode tampil sebagai kartu per item.', 'Status aktif/nonaktif mudah terlihat.', 'Instruksi pembayaran tampil agar bisa dicek sebelum dipakai pelanggan.', 'Jika daftar kosong, buat metode baru dari form kanan.'],
      },
      {
        selector: '[data-tour="payment-card"]',
        title: 'Kartu Data Payment',
        body: 'Kartu ini adalah ringkasan konfigurasi satu metode pembayaran.',
        details: ['Badge tipe membedakan QRIS dan transfer.', 'Badge status menunjukkan aktif atau nonaktif.', 'Batas waktu ditampilkan dalam menit.', 'Provider, nomor, dan a/n penerima harus jelas agar pelanggan tidak salah bayar.'],
      },
      {
        selector: '[data-tour="payment-card-preview"]',
        title: 'Preview Kartu Pelanggan',
        body: 'Preview menunjukkan bagaimana metode terlihat di halaman order.',
        details: ['QRIS tampil seperti scan payment card.', 'Transfer tampil seperti kartu rekening.', 'Desain preview membantu admin menilai tampilan sebelum pelanggan melihatnya.', 'QR hanya tampil jika gambar QRIS sudah tersedia.'],
      },
      {
        selector: '[data-tour="payment-card-actions"]',
        title: 'Aksi Metode Payment',
        body: 'Aksi kartu dipakai untuk mengelola metode yang sudah ada.',
        details: ['Edit memuat data ke form kanan.', 'Nonaktif menyembunyikan metode dari pilihan pelanggan.', 'Hapus menghapus permanen dengan konfirmasi modal.', 'Aksi ini tidak mengubah bukti pembayaran transaksi yang sudah masuk.'],
      },
      {
        selector: '[data-tour="payment-form"]',
        title: 'Form Payment',
        body: 'Form ini membuat atau mengedit metode pembayaran.',
        details: ['Mode Tambah membuat metode baru.', 'Mode Edit memperbarui metode yang dipilih.', 'Preview di atas form berubah mengikuti input.', 'Setiap perubahan baru tersimpan setelah tombol Simpan atau Update diklik.'],
      },
      {
        selector: '[data-tour="payment-preview-card"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Live Preview Payment Card',
        body: 'Kartu preview bergerak mengikuti input form, sehingga admin bisa melihat hasil sebelum disimpan.',
        details: ['Nama, provider, rekening, dan QR preview berasal dari form.', 'QRIS memakai tampilan scan QR.', 'Transfer memakai tampilan rekening.', 'Preview ini membantu menjaga tampilan profesional di halaman order.'],
      },
      {
        selector: '[data-tour="payment-type-status-field"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Tipe dan Status',
        body: 'Dropdown tipe menentukan alur pembayaran, sedangkan status menentukan ketersediaan metode.',
        details: ['QRIS menampilkan upload gambar QR.', 'Transfer menampilkan kartu rekening tanpa upload QR.', 'Aktif membuat metode bisa dipilih pelanggan.', 'Nonaktif menyimpan data tapi tidak ditawarkan ke pelanggan.'],
      },
      {
        selector: '[data-tour="payment-name-field"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Nama Metode',
        body: 'Nama metode adalah label yang dibaca admin dan pelanggan.',
        details: ['Contoh: QRIS, QRIS BCA, Transfer Bank.', 'Gunakan nama singkat dan jelas.', 'Nama tampil di daftar payment dan halaman order.', 'Tutorial mengisi contoh QRIS Tutorial.'],
      },
      {
        selector: '[data-tour="payment-key-field"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Kode Metode',
        body: 'Kode metode adalah identifier internal untuk membedakan payment method.',
        details: ['Gunakan huruf kecil dan tanda hubung bila perlu.', 'Kode sebaiknya unik.', 'Kode membantu backend membaca metode secara stabil.', 'Kosong boleh, tapi disarankan diisi.'],
      },
      {
        selector: '[data-tour="payment-provider-field"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Provider atau Bank',
        body: 'Provider menjelaskan jaringan pembayaran atau bank tujuan.',
        details: ['Untuk QRIS bisa diisi QRIS, GoPay, atau penyedia QR.', 'Untuk transfer bisa diisi nama bank.', 'Provider tampil pada kartu payment.', 'Isi yang jelas mengurangi kebingungan pelanggan.'],
      },
      {
        selector: '[data-tour="payment-account-fields"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Nama Penerima dan Nomor Akun',
        body: 'Field ini menjadi tujuan pembayaran pelanggan.',
        details: ['Nama penerima tampil sebagai a/n.', 'Nomor akun bisa nomor QRIS, rekening, atau identitas pembayaran.', 'Di halaman order pelanggan bisa copy nomor akun.', 'Pastikan tidak ada typo sebelum menyimpan.'],
      },
      {
        selector: '[data-tour="payment-timeout-sort-fields"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Batas Waktu dan Urutan',
        body: 'Batas waktu menentukan countdown pembayaran, sedangkan urutan menentukan prioritas tampil.',
        details: ['Timeout 15 berarti pelanggan punya 15 menit membayar.', 'Jika waktu habis, sistem bisa membatalkan pesanan sesuai logic order.', 'Sort order membantu metode utama tampil lebih atas.', 'Gunakan angka kecil untuk metode prioritas.'],
      },
      {
        selector: '[data-tour="payment-instructions-field"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Instruksi Pembayaran',
        body: 'Instruksi ini tampil ke pelanggan sebagai tata cara bayar.',
        details: ['QRIS: scan QR, bayar nominal tepat, upload bukti.', 'Transfer: copy rekening, transfer nominal tepat, upload struk.', 'Tulis singkat dan tidak ambigu.', 'Instruksi yang jelas mengurangi pertanyaan ke kasir.'],
      },
      {
        selector: '[data-tour="payment-qris-upload"]',
        actions: ['payment-demo-qris-fill'],
        title: 'Upload QRIS',
        body: 'Bagian ini hanya muncul untuk tipe QRIS.',
        details: ['Upload gambar QR toko yang valid.', 'File divalidasi sebagai gambar.', 'Preview kartu berubah setelah QR dipilih.', 'Jika tidak ada QR, pelanggan tidak punya gambar untuk discan.'],
      },
      {
        selector: '[data-tour="payment-transfer-note"]',
        actions: ['payment-demo-transfer-fill'],
        title: 'Mode Transfer Bank',
        body: 'Saat tipe diganti ke Transfer, form QR hilang dan pelanggan hanya melihat kartu rekening.',
        details: ['Transfer tidak memakai upload gambar.', 'Pelanggan mendapat tombol copy rekening dan copy nominal.', 'Pelanggan tetap upload struk pembayaran.', 'Tutorial mengganti form ke contoh transfer untuk menunjukkan perbedaannya.'],
      },
      {
        selector: '[data-tour="payment-form-actions"]',
        actions: ['payment-demo-transfer-fill'],
        title: 'Aksi Form Payment',
        body: 'Bagian bawah form menentukan apakah metode payment disimpan atau batal edit.',
        details: ['Simpan membuat payment baru.', 'Update menyimpan perubahan saat edit.', 'Batal muncul saat mode edit.', 'Setelah sukses, daftar payment refresh tanpa pindah halaman.'],
      },
      {
        selector: '[data-tour="payment-save-button"]',
        actions: ['payment-demo-transfer-fill'],
        title: 'Simpan Payment ke Database',
        body: 'Tombol ini menjalankan submit asli. Jika user klik Simpan, metode payment dikirim ke backend lalu disimpan di Supabase.',
        details: ['Tutorial hanya menyiapkan contoh input.', 'Klik Simpan hanya jika ingin membuat payment demo.', 'Metode aktif akan muncul pada halaman order pelanggan.', 'Jika batal atau tidak klik Simpan, contoh input tidak masuk database.'],
      },
    ],
  },
  {
    id: 'discounts',
    title: 'Vocher & Diskon',
    route: '/discounts',
    roles: ['admin'],
    description: 'Pelajari reward review, kode voucher, paket bundle, kuota klaim, masa berlaku, distribusi diskon, dan aksi program.',
    steps: [
      {
        selector: '[data-tour="discount-header"]',
        title: 'Vocher & Diskon sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu diskon ini, header, kartu statistik, form program, filter, kartu program, dan aksi edit/nonaktif/hapus digabung menjadi workflow marketing.',
        details: ['Reward Review dipakai setelah pelanggan memberi review.', 'Kode Voucher dipakai dari sosial media atau input kasir.', 'Paket Bundle otomatis membaca kombinasi menu di cart.', 'Semua program tetap mengikuti kuota, status, dan masa berlaku.'],
      },
      {
        selector: '[data-tour="discount-stats"]',
        title: 'Kartu Ringkasan Diskon',
        body: 'Kartu ini membaca kondisi program diskon secara cepat.',
        details: ['Program aktif menunjukkan promo yang masih bisa dipakai.', 'Distribusi diskon menunjukkan nilai potongan yang sudah keluar.', 'Total klaim membaca jumlah penggunaan program.', 'Ringkasan ini membantu admin menilai promo yang sedang berjalan.'],
      },
      {
        selector: '[data-tour="discount-form"]',
        title: 'Form Buat Program',
        body: 'Form ini dipakai untuk membuat atau mengedit program diskon.',
        details: ['Mode Buat Program membuat data baru.', 'Mode Edit memuat data program lama ke form.', 'Data hanya tersimpan setelah tombol Simpan atau Update diklik.', 'Tutorial akan menyiapkan contoh data tanpa submit otomatis.'],
      },
      {
        selector: '[data-tour="discount-name-field"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Nama Program',
        body: 'Nama program membantu admin dan kasir memahami promo yang sedang digunakan.',
        details: ['Gunakan nama jelas seperti Reward Review Pelanggan atau Promo Sosial Media.', 'Nama tampil di daftar program dan detail potongan.', 'Tutorial mengisi nama demo voucher.', 'Nama tidak harus sama dengan kode voucher.'],
      },
      {
        selector: '[data-tour="discount-type-status-field"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Jenis dan Status',
        body: 'Jenis menentukan logic klaim diskon, sedangkan status menentukan apakah program bisa dipakai.',
        details: ['Kode Voucher butuh kode 13 karakter.', 'Paket Bundle butuh daftar menu dan qty minimum.', 'Reward Review butuh rating layanan dan menu.', 'Status nonaktif menyimpan program tapi tidak bisa diklaim.'],
      },
      {
        selector: '[data-tour="discount-validity-field"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Masa Berlaku',
        body: 'Masa berlaku mengontrol apakah program aktif berdasarkan tanggal atau hanya sampai kuota habis.',
        details: ['Tidak expired berarti program aktif sampai kuota habis atau dinonaktifkan.', 'Pakai expired membutuhkan mulai aktif dan expired pada.', 'Status Terjadwal, Expired, atau Kuota Habis dihitung otomatis.', 'Tanggal ditampilkan kembali di daftar program.'],
      },
      {
        selector: '[data-tour="discount-voucher-code-field"]',
        actions: ['discount-demo-voucher-fill', 'discount-generate-code'],
        title: 'Kode Voucher',
        body: 'Field ini hanya muncul untuk jenis Kode Voucher.',
        details: ['Kode dibatasi huruf besar dan angka.', 'Panjang kode maksimal 13 karakter.', 'Tombol Generate membuat kode acak yang siap dipakai.', 'Kode ini bisa diketik di kasir atau halaman order pelanggan.'],
      },
      {
        selector: '[data-tour="discount-value-fields"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Tipe dan Nilai Diskon',
        body: 'Bagian ini menentukan besaran potongan.',
        details: ['Persen menghitung potongan dari dasar transaksi yang valid.', 'Rupiah memberi potongan nominal tetap.', 'Nilai harus diisi realistis supaya margin tidak bocor.', 'Untuk bundle, potongan hanya berlaku pada menu paket yang memenuhi syarat.'],
      },
      {
        selector: '[data-tour="discount-usage-fields"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Limit Klaim',
        body: 'Limit klaim mencegah satu pelanggan memakai promo berlebihan.',
        details: ['Klaim / No. HP menentukan batas per nomor pelanggan.', 'Kuota total membatasi jumlah klaim semua pelanggan.', 'Kosong pada kuota total berarti tanpa batas total.', 'Pemakaian tampil dalam format klaim terpakai/kuota.'],
      },
      {
        selector: '[data-tour="discount-review-fields"]',
        actions: ['discount-demo-review-fill'],
        title: 'Rule Reward Review',
        body: 'Field ini muncul untuk program Reward Review.',
        details: ['Min. rating layanan menentukan rating pelayanan minimal.', 'Min. rating menu menentukan rating per menu minimal.', 'Voucher review sebaiknya dipakai untuk pesanan berikutnya, bukan memotong pesanan yang sudah dibayar.', 'Rule ini membantu reward review tetap adil.'],
      },
      {
        selector: '[data-tour="discount-bundle-section"]',
        actions: ['discount-demo-bundle-fill'],
        title: 'Paket Bundle',
        body: 'Bagian bundle menentukan menu apa saja yang wajib ada agar diskon paket bisa diklaim.',
        details: ['Pilih menu yang menjadi syarat bundle.', 'Qty kanan adalah minimum porsi tiap menu.', 'Diskon bundle hanya menghitung menu yang masuk paket.', 'Pilih semua bisa digunakan jika promo berlaku untuk semua menu.'],
      },
      {
        selector: '[data-tour="discount-bundle-row"]',
        actions: ['discount-demo-bundle-fill'],
        title: 'Baris Menu Bundle',
        body: 'Setiap baris adalah satu menu dalam syarat paket bundle.',
        details: ['Checkbox memilih menu masuk paket.', 'Input qty menentukan minimal porsi.', 'Nama menu berasal dari data produk.', 'Jangan memilih menu yang stoknya sering habis untuk promo utama.'],
      },
      {
        selector: '[data-tour="discount-note-field"]',
        title: 'Catatan Program',
        body: 'Catatan menjelaskan tujuan atau aturan tambahan promo.',
        details: ['Catatan membantu admin lain memahami konteks promo.', 'Catatan dapat menjelaskan campaign sosial media.', 'Untuk reward review, catatan bisa menjelaskan alur klaim voucher.', 'Field ini opsional.'],
      },
      {
        selector: '[data-tour="discount-save-button"]',
        actions: ['discount-demo-voucher-fill'],
        title: 'Simpan Program ke Database',
        body: 'Tombol ini menjalankan submit asli. Jika user klik Simpan, program diskon dikirim ke backend lalu disimpan di Supabase.',
        details: ['Tutorial hanya menyiapkan contoh input.', 'Klik Simpan hanya jika ingin membuat program demo.', 'Setelah sukses, daftar program refresh.', 'Jika batal atau tidak klik Simpan, contoh input tidak masuk database.'],
      },
      {
        selector: '[data-tour="discount-list"]',
        title: 'Daftar Program',
        body: 'Daftar ini menampilkan semua program diskon yang sudah dibuat.',
        details: ['Program dikelompokkan berdasarkan filter tipe.', 'Setiap kartu menampilkan status, diskon, masa berlaku, distribusi, klaim, dan aksi.', 'Data refresh tanpa menutup halaman saat sinkronisasi.', 'Kartu kosong muncul bila filter tidak punya hasil.'],
      },
      {
        selector: '[data-tour="discount-date-filter"]',
        title: 'Filter Range Masa Berlaku',
        body: 'Filter tanggal membantu mencari promo berdasarkan periode aktif.',
        details: ['Klik tanggal awal lalu tanggal akhir seperti range booking.', 'Program tanpa expired tetap ditampilkan karena aktif sampai kuota habis.', 'Filter ini tidak mengubah data database.', 'Gunakan filter saat histori promo sudah banyak.'],
      },
      {
        selector: '[data-tour="discount-type-filters"]',
        title: 'Filter Jenis Program',
        body: 'Chip filter membagi program berdasarkan jenis.',
        details: ['Semua menampilkan seluruh program.', 'Reward Review hanya menampilkan reward review.', 'Kode Voucher hanya menampilkan voucher sosial media.', 'Paket Bundle hanya menampilkan bundle menu.'],
      },
      {
        selector: '[data-tour="discount-program-card"]',
        title: 'Kartu Program',
        body: 'Kartu program merangkum satu promo dan statusnya.',
        details: ['Badge jenis menjelaskan tipe program.', 'Badge status bisa Aktif, Nonaktif, Terjadwal, Expired, atau Kuota Habis.', 'Untuk bundle, daftar menu dan qty ditampilkan di kartu.', 'Masa berlaku menjelaskan kapan promo bisa dipakai.'],
      },
      {
        selector: '[data-tour="discount-program-result"]',
        title: 'Distribusi dan Klaim',
        body: 'Bagian kanan kartu membaca hasil pemakaian promo.',
        details: ['Distribusi diskon menunjukkan total rupiah potongan.', 'Klaim menampilkan jumlah terpakai dan kuota total jika ada.', 'Angka ini membantu evaluasi promo yang boros atau efektif.', 'Jika 0 klaim berarti promo belum dipakai.'],
      },
      {
        selector: '[data-tour="discount-program-actions"]',
        title: 'Aksi Program',
        body: 'Aksi kartu dipakai untuk mengelola program yang sudah ada.',
        details: ['Edit memuat data ke form kiri.', 'Nonaktif/Aktif mengubah ketersediaan promo.', 'Hapus memakai konfirmasi modal dan menghapus permanen.', 'Aksi ini tidak otomatis menghapus transaksi yang sudah memakai diskon.'],
      },
    ],
  },
  {
    id: 'pos',
    title: 'Kasir',
    route: '/pos',
    roles: ['admin', 'kasir'],
    description: 'Pelajari pencarian menu, sumber stok, kategori, kartu produk, keranjang, voucher, dan proses pembayaran kasir.',
    steps: [
      {
        selector: '[data-tour="pos-topbar"]',
        title: 'Kasir sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu kasir ini, topbar, filter stok, pencarian, kartu produk, keranjang, dan modal pembayaran digabung menjadi alur transaksi.',
        details: ['Topbar membaca waktu kerja dan kasir aktif.', 'Admin dapat memilih sumber stok kasir.', 'Pencarian membantu menemukan menu cepat.', 'Pendapatan hari ini memberi ringkasan transaksi cabang aktif.'],
      },
      {
        selector: '[data-tour="pos-clock"]',
        title: 'Jam Operasional',
        body: 'Jam dan tanggal membantu kasir memastikan transaksi dicatat pada hari kerja yang benar.',
        details: ['Jam berjalan realtime.', 'Tanggal mengikuti zona waktu lokal.', 'Informasi ini membantu mencocokkan struk dan audit harian.', 'Kasir tidak perlu input tanggal manual.'],
      },
      {
        selector: '[data-tour="pos-source-selector"]',
        roles: ['admin'],
        title: 'Sumber Stok Kasir',
        body: 'Admin bisa membuat transaksi atas nama kasir atau sumber stok tertentu.',
        details: ['Chip aktif menunjukkan stok siapa yang sedang dipakai.', 'Jumlah porsi membantu memilih kasir yang masih punya ready stock.', 'Saat sumber stok diganti, keranjang dikosongkan agar stok tidak tercampur.', 'Kasir biasa memakai stok miliknya sendiri.'],
      },
      {
        selector: '[data-tour="pos-search"]',
        actions: ['pos-demo-search'],
        title: 'Cari Menu',
        body: 'Search mempercepat kasir menemukan menu saat pelanggan memesan banyak item.',
        details: ['Bisa mencari nama produk.', 'Hasil produk langsung difilter.', 'Tutorial menjaga filter tetap kosong agar semua menu real tetap terlihat.', 'Kosongkan search untuk kembali menampilkan semua menu.'],
      },
      {
        selector: '[data-tour="pos-today-revenue"]',
        title: 'Pendapatan Hari Ini',
        body: 'Kartu ini membaca omzet dan jumlah transaksi hari ini pada cabang aktif.',
        details: ['Omzet dihitung dari transaksi yang sudah diproses.', 'Jumlah transaksi membantu membaca traffic hari ini.', 'Kartu ini refresh bersama data kasir.', 'Admin dan kasir dapat memantau performa cepat tanpa pindah dashboard.'],
      },
      {
        selector: '[data-tour="pos-category-filter"]',
        title: 'Filter Kategori',
        body: 'Kategori memecah menu menjadi kelompok makanan dan minuman.',
        details: ['Semua menampilkan seluruh produk.', 'Klik kategori untuk mempersempit grid.', 'Filter ini bekerja bersama search.', 'Kategori berasal dari data produk yang dikelola admin.'],
      },
      {
        selector: '[data-tour="pos-product-count"]',
        title: 'Jumlah Menu Tampil',
        body: 'Bagian ini memberi konteks berapa menu yang sedang tersedia pada filter saat ini.',
        details: ['Angka berubah mengikuti search dan kategori.', 'Jika admin memilih sumber stok, nama sumber ikut muncul.', 'Label sinkronisasi muncul saat data refresh.', 'Ini membantu membaca apakah filter terlalu sempit.'],
      },
      {
        selector: '[data-tour="pos-bundle-hints"]',
        title: 'Saran Paket Bundle',
        body: 'Panel bundle memberi sinyal promo paket yang bisa diklaim dari menu kasir.',
        details: ['Jika syarat belum lengkap, sistem menampilkan menu yang perlu ditambahkan.', 'Jika ada menu habis, bundle ditandai belum bisa diklaim.', 'Jika lengkap, diskon dicek otomatis di pembayaran.', 'Kasir bisa memakai panel ini untuk menawarkan upsell ke pelanggan.'],
      },
      {
        selector: '[data-tour="pos-product-grid"]',
        title: 'Grid Produk',
        body: 'Grid produk adalah area utama kasir memilih menu.',
        details: ['Produk diurutkan berdasarkan stok yang bisa dijual.', 'Kartu menampilkan gambar, kategori, harga, dan status stok.', 'Produk habis bisa diarahkan ke pengajuan stok.', 'Grid memakai skeleton saat data awal dimuat.'],
      },
      {
        selector: '[data-tour="pos-product-card"]',
        actions: ['pos-demo-add-first-product'],
        title: 'Kartu Produk',
        body: 'Satu kartu produk adalah komponen reusable untuk satu menu.',
        details: ['Klik kartu produk untuk menambahkan ke keranjang jika stok tersedia.', 'Tutorial mencoba menambahkan produk pertama yang stoknya tersedia.', 'Badge dalam keranjang muncul saat produk sudah dipilih.', 'Stok rendah dan habis diberi warna berbeda.', 'Admin dapat melihat detail bahan saat kartu diperluas.'],
      },
      {
        selector: '[data-tour="pos-cart"]',
        title: 'Keranjang Pesanan',
        body: 'Keranjang menyimpan daftar menu sebelum transaksi diproses.',
        details: ['Item akan bertambah ketika produk diklik.', 'Qty bisa dinaikkan atau dikurangi sesuai batas stok.', 'Total berubah otomatis dari harga dan qty.', 'Keranjang dikosongkan setelah transaksi sukses.'],
      },
      {
        selector: '[data-tour="pos-cart-items"]',
        title: 'Item Keranjang',
        body: 'Bagian item menunjukkan menu yang sedang dibeli pelanggan.',
        details: ['Nama menu tampil per baris.', 'Harga mengikuti qty.', 'Maks porsi menjaga kasir tidak menjual melebihi stok.', 'Tombol minus dapat mengurangi qty atau menghapus item.'],
      },
      {
        selector: '[data-tour="pos-cart-total"]',
        title: 'Total Keranjang',
        body: 'Total adalah subtotal sebelum pembayaran dan pengecekan voucher di modal bayar.',
        details: ['Nilai berubah realtime.', 'Total ini akan menjadi dasar perhitungan diskon.', 'Voucher dan bundle dihitung di modal pembayaran.', 'Kasir bisa mengecek total sebelum lanjut bayar.'],
      },
      {
        selector: '[data-tour="pos-cart-checkout"]',
        title: 'Tombol Bayar',
        body: 'Tombol Bayar membuka modal pembayaran jika keranjang berisi item.',
        details: ['Tombol nonaktif saat keranjang kosong.', 'Saat diklik, kasir memilih metode bayar.', 'Modal pembayaran juga mengecek voucher dan bundle.', 'Transaksi baru disimpan setelah tombol Proses & Cetak Struk ditekan.'],
      },
      {
        selector: '[data-tour="pos-payment-modal"]',
        actions: ['pos-open-payment-modal'],
        title: 'Modal Pembayaran',
        body: 'Modal pembayaran muncul setelah kasir menekan Bayar. Jika belum ada item, step ini menjelaskan alurnya tanpa membuka transaksi.',
        details: ['Modal menampilkan total tagihan.', 'Kasir dapat memilih meja pelanggan untuk QR status publik.', 'Voucher dan diskon dicek sebelum transaksi disimpan.', 'Metode bayar menentukan input yang diperlukan.'],
      },
      {
        selector: '[data-tour="pos-payment-discount"]',
        actions: ['pos-open-payment-modal'],
        title: 'Voucher dan Diskon',
        body: 'Bagian ini membaca nomor HP, kode voucher, reward review, dan bundle yang berlaku.',
        details: ['Nomor HP menjadi batas klaim diskon.', 'Kode voucher bisa diisi manual.', 'Bundle aktif dicek dari item keranjang.', 'Preview menjelaskan scope potongan agar kasir tidak salah paham.'],
      },
      {
        selector: '[data-tour="pos-payment-methods"]',
        title: 'Metode Bayar',
        body: 'Kasir memilih tunai, QRIS, atau transfer sesuai cara pelanggan membayar.',
        details: ['Tunai membuka pecahan uang dan kembalian.', 'QRIS dan transfer memberi catatan konfirmasi manual.', 'Metode yang dipilih ikut tersimpan di transaksi.', 'Data ini tampil di riwayat POS.'],
      },
      {
        selector: '[data-tour="pos-payment-actions"]',
        title: 'Proses Transaksi',
        body: 'Bagian bawah modal menentukan transaksi dibatalkan atau diproses.',
        details: ['Batal menutup modal tanpa menyimpan.', 'Proses & Cetak Struk menyimpan transaksi ke backend.', 'Saat sukses, stok berkurang dan struk siap dicetak.', 'Jika gagal, modal pesan produksi menampilkan error ramah tanpa exception teknis.'],
      },
    ],
  },
  {
    id: 'customer-orders',
    title: 'Pesanan Meja',
    route: '/customer-orders',
    roles: ['admin', 'kasir'],
    description: 'Pelajari filter order meja, batch approve, kartu pesanan, bukti bayar, review, dan QR meja pelanggan.',
    steps: [
      {
        selector: '[data-tour="customer-orders-header"]',
        title: 'Pesanan Meja sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di menu pesanan meja ini, header, filter, batch action, kartu order, payment proof, dan QR meja digabung menjadi workflow pelayanan pelanggan.',
        details: ['Halaman ini memantau order dari QR meja.', 'Default data berfokus pada pesanan hari ini agar load cepat.', 'Admin dan kasir bisa mengubah status sesuai alur dapur.', 'Admin juga mengelola QR meja di sidebar.'],
      },
      {
        selector: '[data-tour="customer-orders-status-filters"]',
        title: 'Filter Status Pesanan',
        body: 'Chip status membantu tim fokus pada tahap order tertentu.',
        details: ['Semua menampilkan seluruh status pada range tanggal.', 'Menunggu berarti order baru masuk.', 'Diterima, Disiapkan, dan Siap Diantar mengikuti proses dapur.', 'Selesai dan Dibatalkan menjadi status final.'],
      },
      {
        selector: '[data-tour="customer-orders-date-filter"]',
        title: 'Range Tanggal',
        body: 'Kalender range memilih periode pesanan meja yang ingin dilihat.',
        details: ['Klik tanggal pertama sebagai awal range.', 'Klik tanggal kedua sebagai akhir range.', 'Default hari ini menjaga performa tetap ringan.', 'Range panjang dipakai hanya saat audit atau pencarian histori.'],
      },
      {
        selector: '[data-tour="customer-orders-search"]',
        actions: ['customer-orders-demo-search'],
        title: 'Cari Pesanan',
        body: 'Search membantu menemukan order tertentu saat pesanan meja sedang banyak.',
        details: ['Bisa cari kode order.', 'Bisa cari nama pelanggan.', 'Bisa cari nomor HP.', 'Bisa cari nomor meja. Tutorial mengisi contoh ORD.'],
      },
      {
        selector: '[data-tour="customer-orders-batch-panel"]',
        title: 'Panel Batch Status',
        body: 'Panel batch mempercepat approve beberapa pesanan sekaligus.',
        details: ['Jika ada checkbox dipilih, aksi hanya memproses pilihan itu.', 'Jika tidak ada pilihan, tombol memproses semua order yang eligible pada tampilan.', 'Setiap tombol menunjukkan jumlah order yang bisa diproses.', 'Selesai dan batal tidak bisa dipilih lagi.'],
      },
      {
        selector: '[data-tour="customer-orders-select-all"]',
        title: 'Pilih Semua Tampilan',
        body: 'Tombol ini memilih semua pesanan yang masih bisa diproses pada tampilan saat ini.',
        details: ['Pesanan completed dan cancelled tidak ikut dipilih.', 'Gunakan ini untuk approve semua order yang sedang tampil.', 'Klik lagi untuk membatalkan pilihan.', 'Jumlah pesanan terpilih langsung terlihat di panel.'],
      },
      {
        selector: '[data-tour="customer-orders-batch-actions"]',
        title: 'Aksi Batch',
        body: 'Aksi batch menjalankan perubahan status banyak order dalam satu proses.',
        details: ['Diterima memindahkan order baru ke tahap kasir menerima.', 'Disiapkan memberi sinyal dapur mulai membuat menu.', 'Siap Diantar memberi sinyal pesanan siap disajikan.', 'Selesai menutup order dan membuka alur review pelanggan.'],
      },
      {
        selector: '[data-tour="customer-orders-stats"]',
        title: 'Statistik Pesanan',
        body: 'Kartu statistik memberi ringkasan order meja pada filter aktif.',
        details: ['Total Order membaca jumlah order.', 'Order Aktif membaca order yang belum final.', 'Selesai membaca order completed.', 'Nilai Order menjumlahkan nilai final dari data yang tampil.'],
      },
      {
        selector: '[data-tour="customer-orders-list"]',
        title: 'Daftar Pesanan',
        body: 'Daftar ini adalah pusat kerja untuk memantau pesanan pelanggan meja.',
        details: ['Setiap kartu adalah satu order dari pelanggan.', 'Skeleton tampil saat data pertama kali dimuat.', 'Empty state tampil jika tidak ada order sesuai filter.', 'Data refresh ringan menjaga UI tetap smooth.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-card"]',
        title: 'Kartu Order',
        body: 'Kartu order merangkum meja, status, pelanggan, total, item, pembayaran, review, dan aksi status.',
        details: ['Step detail memakai data dummy agar tutorial tetap jalan walau belum ada order asli.', 'Kode order adalah identitas utama pesanan.', 'Nama dan nomor HP membantu validasi pelanggan.', 'Badge status dan diskon mempercepat pembacaan.', 'Kartu tetap bisa dibaca walau order punya banyak item.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-status-badges"]',
        title: 'Badge Status dan Diskon',
        body: 'Badge memberi ringkasan visual di bagian atas kartu.',
        details: ['Badge meja menunjukkan nomor meja.', 'Badge status menunjukkan tahap order.', 'Badge diskon menunjukkan paket bundle, kode voucher, atau reward review.', 'Review selesai tampil bila pelanggan sudah memberi ulasan.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-total"]',
        title: 'Total dan Potongan',
        body: 'Bagian total menampilkan nilai akhir dan rincian diskon yang dipakai.',
        details: ['Total pesanan memakai final_total jika ada.', 'Setiap komponen diskon ditampilkan dengan nilai potongan.', 'Paket bundle, voucher, dan reward review dibedakan labelnya.', 'Informasi ini membantu kasir menjawab pertanyaan pelanggan.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-items"]',
        title: 'Item Pesanan',
        body: 'Item pesanan menunjukkan menu, qty, subtotal, catatan, rating menu, dan detail diskon.',
        details: ['Setiap item menampilkan nama produk dan qty.', 'Subtotal item membantu cek ulang pesanan.', 'Diskon terpakai memiliki panel detail sendiri.', 'Rating menu tampil setelah pelanggan review.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-payment"]',
        title: 'Pembayaran Pelanggan',
        body: 'Panel pembayaran menunjukkan metode, status bukti, deadline, dan catatan pembayaran.',
        details: ['Menunggu bukti berarti pelanggan belum upload.', 'Bukti dikirim berarti kasir/admin perlu verifikasi.', 'Terkonfirmasi berarti pembayaran sudah disetujui.', 'Deadline membantu membaca apakah pembayaran melewati batas waktu.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-status-actions"]',
        title: 'Aksi Status per Order',
        body: 'Tombol status di tiap kartu dipakai untuk memproses satu order secara manual.',
        details: ['Aksi yang tidak eligible akan nonaktif.', 'Batalkan membuka alur pembatalan dan pengembalian stok jika berlaku.', 'Selesai menutup order agar tidak bisa dipilih lagi.', 'Gunakan batch action untuk banyak order sekaligus.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-select"]',
        title: 'Checkbox Order',
        body: 'Checkbox menentukan order mana yang masuk ke aksi batch.',
        details: ['Pilih order yang ingin diproses bersama.', 'Order selesai dan dibatalkan diberi label Final.', 'Checkbox membantu approve sebagian, bukan semua.', 'Ini mengurangi kesalahan saat order sedang ramai.'],
      },
      {
        selector: '[data-tour="customer-orders-table-form"]',
        roles: ['admin'],
        title: 'Form Meja QR',
        body: 'Admin memakai form ini untuk menambah atau mengedit meja yang bisa dipakai pelanggan self order.',
        details: ['Nomor meja wajib unik dan jelas.', 'Nama area membantu membedakan lokasi meja.', 'Kapasitas dan status membantu operasional.', 'Catatan meja memberi konteks tambahan.'],
      },
      {
        selector: '[data-tour="customer-orders-table-list"]',
        roles: ['admin'],
        title: 'Daftar QR Meja',
        body: 'Daftar ini menampilkan meja yang bisa dipilih untuk membuat QR self order.',
        details: ['Klik meja untuk melihat QR publiknya.', 'Status aktif, maintenance, dan nonaktif menentukan ketersediaan meja.', 'Cabang meja ditampilkan agar tidak tertukar.', 'Meja aktif/session pelanggan lain tetap dikunci oleh backend.'],
      },
      {
        selector: '[data-tour="customer-orders-qr-preview"]',
        roles: ['admin'],
        title: 'Preview QR Meja',
        body: 'QR ini dipakai pelanggan membuka halaman order meja langsung dari tempat duduk.',
        details: ['QR berisi token unik meja.', 'Edit memuat data meja ke form.', 'Nonaktif menonaktifkan meja dari daftar order.', 'Jangan mengganti QR saat meja sedang dipakai pelanggan.'],
      },
      {
        selector: '[data-tour="customer-orders-demo-proof-modal"]',
        title: 'Modal Bukti Pembayaran',
        body: 'Jika pelanggan upload bukti pembayaran, kasir atau admin membukanya dalam modal ini.',
        details: ['Gambar bukti tampil langsung di modal.', 'PDF diberi tombol buka file.', 'Modal menjaga user tetap di halaman pesanan.', 'Verifikasi dilakukan dari status pembayaran/order, bukan dari tab baru.'],
      },
    ],
  },
  {
    id: 'pos-history',
    title: 'Riwayat POS',
    route: '/pos/history',
    roles: ['admin'],
    description: 'Pelajari filter range, pencarian invoice, statistik omzet, distribusi diskon, tabel transaksi, void stok, dan analitik riwayat POS.',
    steps: [
      {
        selector: '[data-tour="pos-history-header"]',
        title: 'Riwayat POS sebagai kumpulan komponen',
        body: 'React components adalah building block utama aplikasi React: bagian kecil yang mandiri dan bisa dipakai ulang, mirip Lego. Di riwayat POS ini, header, filter, statistik, tabel, aksi void, dan grafik analitik digabung menjadi halaman audit transaksi.',
        details: ['Halaman ini default membaca transaksi hari ini.', 'Admin bisa memfilter range tanggal.', 'Data menampilkan kasir/admin pembuat transaksi.', 'Riwayat dipakai untuk audit, bukan edit transaksi biasa.'],
      },
      {
        selector: '[data-tour="pos-history-filters"]',
        title: 'Filter dan Cari',
        body: 'Panel filter mempersempit data agar halaman tetap ringan saat transaksi banyak.',
        details: ['Range transaksi memakai satu kalender tanggal awal dan akhir.', 'Search mencari invoice, kasir, atau admin.', 'Cari menerapkan filter.', 'Reset mengembalikan range ke hari ini.'],
      },
      {
        selector: '[data-tour="pos-history-date-filter"]',
        title: 'Range Transaksi',
        body: 'Date range memilih periode transaksi yang ingin diaudit.',
        details: ['Klik tanggal pertama sebagai awal range.', 'Klik tanggal kedua sebagai akhir range.', 'Filter ini mengurangi jumlah data yang dimuat dari backend.', 'Default hari ini menjaga load awal tetap cepat.'],
      },
      {
        selector: '[data-tour="pos-history-search"]',
        actions: ['pos-history-demo-search'],
        title: 'Pencarian Invoice atau Kasir',
        body: 'Search membantu menemukan transaksi tertentu.',
        details: ['Bisa ketik nomor invoice.', 'Bisa ketik nama kasir atau admin.', 'Tutorial mengisi contoh kata ORD.', 'Klik Cari untuk memuat data sesuai pencarian.'],
      },
      {
        selector: '[data-tour="pos-history-filter-actions"]',
        actions: ['pos-history-demo-search'],
        title: 'Tombol Cari dan Reset',
        body: 'Aksi filter menentukan data yang ditampilkan.',
        details: ['Cari mengirim parameter tanggal dan search ke backend.', 'Reset mengosongkan search dan kembali ke hari ini.', 'Saat loading, tombol dinonaktifkan untuk mencegah request dobel.', 'Status sinkronisasi muncul saat refresh berjalan.'],
      },
      {
        selector: '[data-tour="pos-history-monthly-stats"]',
        title: 'Statistik per Bulan',
        body: 'Kartu bulanan muncul bila range berisi data transaksi.',
        details: ['Omzet bulanan menampilkan total penjualan.', 'Margin memakai estimasi 35%.', 'Jumlah transaksi membantu membaca volume.', 'Kartu ini memudahkan evaluasi periode panjang.'],
      },
      {
        selector: '[data-tour="pos-history-summary"]',
        title: 'Ringkasan Total',
        body: 'Ringkasan total membaca performa dari transaksi yang sedang tampil.',
        details: ['Total transaksi membaca jumlah row.', 'Total penjualan membaca omzet.', 'Total margin membaca estimasi profit.', 'Total distribusi diskon membaca semua potongan pelanggan.'],
      },
      {
        selector: '[data-tour="pos-history-discount-summary"]',
        title: 'Distribusi Diskon',
        body: 'Kartu ini khusus membaca dampak voucher, bundle, dan reward review pada transaksi POS.',
        details: ['Total distribusi diskon adalah rupiah potongan.', 'Rata-rata persen menghitung rata-rata diskon transaksi yang memakai promo.', 'Jumlah transaksi menunjukkan berapa transaksi memakai diskon.', 'Bagian ini membantu menilai campaign promo.'],
      },
      {
        selector: '[data-tour="pos-history-table"]',
        title: 'Tabel Transaksi',
        body: 'Tabel adalah audit trail utama riwayat POS.',
        details: ['Kolom invoice adalah identitas transaksi.', 'Waktu menunjukkan kapan transaksi dibuat.', 'Pembuat/Kasir menjelaskan aktor transaksi.', 'Total dan Diskon menunjukkan nilai transaksi.'],
      },
      {
        selector: '[data-tour="pos-history-row"]',
        title: 'Baris Transaksi',
        body: 'Satu baris adalah satu transaksi POS.',
        details: ['Admin langsung berarti transaksi dibuat admin.', 'Admin atas nama kasir berarti admin mencatat untuk kasir tertentu.', 'Kasir sendiri berarti kasir membuat transaksinya.', 'Metode pembayaran membantu audit tunai, QRIS, atau transfer.'],
      },
      {
        selector: '[data-tour="pos-history-row-discount"]',
        title: 'Diskon per Transaksi',
        body: 'Kolom diskon membaca potongan yang digunakan di transaksi tersebut.',
        details: ['Jika ada promo, nilai rupiah tampil hijau.', 'Jika tidak ada promo, kolom berisi tanda strip.', 'Nilai ini ikut masuk ke total distribusi diskon.', 'Detail jenis diskon berasal dari data transaksi dan program terkait.'],
      },
      {
        selector: '[data-tour="pos-history-delete-action"]',
        title: 'Hapus & Kembalikan Stok',
        body: 'Tombol ini dipakai untuk void transaksi dengan alasan, lalu stok bahan dikembalikan.',
        details: ['Gunakan hanya untuk transaksi salah, batal, atau duplikat.', 'Aksi ini membuka modal alasan.', 'Tidak boleh langsung hapus tanpa alasan audit.', 'Stok dikembalikan sesuai item transaksi oleh backend.'],
      },
      {
        selector: '[data-tour="pos-history-delete-modal"]',
        actions: ['pos-history-open-delete-modal'],
        title: 'Modal Void Transaksi',
        body: 'Modal ini muncul sebelum transaksi dihapus dan stok dikembalikan.',
        details: ['Invoice yang akan divoid ditampilkan di modal.', 'Peringatan menjelaskan aksi dicatat sebagai void.', 'User harus mengisi alasan yang jelas.', 'Tutorial hanya membuka modal, tidak menekan tombol konfirmasi.'],
      },
      {
        selector: '[data-tour="pos-history-delete-reason"]',
        actions: ['pos-history-demo-delete-reason'],
        title: 'Alasan Void',
        body: 'Alasan wajib diisi agar audit operasional jelas.',
        details: ['Contoh: salah input pembayaran.', 'Contoh lain: pesanan batal atau transaksi duplikat.', 'Tutorial mengisi alasan contoh.', 'Tombol konfirmasi aktif setelah alasan tidak kosong.'],
      },
      {
        selector: '[data-tour="pos-history-delete-modal-actions"]',
        actions: ['pos-history-demo-delete-reason'],
        title: 'Aksi Modal Void',
        body: 'Bagian bawah modal menentukan batal atau eksekusi void.',
        details: ['Batal menutup modal tanpa perubahan.', 'Ya, Hapus & Kembalikan Stok menjalankan aksi permanen.', 'Klik tombol merah hanya jika benar-benar ingin void.', 'Setelah sukses, tabel refresh dan stok kembali.'],
      },
      {
        selector: '[data-tour="pos-history-payment-analysis"]',
        actions: ['pos-history-close-delete-modal'],
        title: 'Analisis Metode Pembayaran',
        body: 'Panel ini membaca kontribusi tunai, QRIS, dan transfer.',
        details: ['Setiap kartu menampilkan jumlah transaksi dan total omzet.', 'Progress bar menunjukkan kontribusi dari total omzet.', 'Hover memberi rasa interaktif untuk dashboard audit.', 'Analisis ini membantu keputusan metode bayar utama.'],
      },
      {
        selector: '[data-tour="pos-history-hourly-chart"]',
        title: 'Tren Transaksi Harian',
        body: 'Grafik jam membaca kapan transaksi paling ramai.',
        details: ['Bar per jam menunjukkan jumlah transaksi.', 'Jam puncak membantu manajemen shift.', 'Rata-rata per jam membaca ritme operasional.', 'Range membantu memahami sebaran traffic harian.'],
      },
      {
        selector: '[data-tour="pos-history-daily-chart"]',
        title: 'Tren Omzet Harian',
        body: 'Grafik harian membaca pergerakan revenue dalam range filter.',
        details: ['Bar hijau berarti di atas rata-rata.', 'Bar amber berarti di bawah rata-rata.', 'Hari terbaik membantu membaca puncak omzet.', 'Rata-rata harian membantu evaluasi periode.'],
      },
      {
        selector: '[data-tour="pos-history-footer-info"]',
        title: 'Catatan Audit',
        body: 'Footer mengingatkan bahwa riwayat POS adalah data audit read-only.',
        details: ['Data transaksi tidak diedit langsung dari tabel.', 'Filter dipakai untuk mencari transaksi.', 'Void punya modal alasan khusus.', 'Catatan ini menjaga user memahami batasan halaman.'],
      },
    ],
  },
];

function getStorageKey(user) {
  return `pos-tutorial-launcher-seen-v1-${user?.id || user?.email || user?.name || 'guest'}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const STOCK_STEP_ORDER = [
  '[data-tour="stock-header"]',
  '[data-tour="stock-tabs"]',
  '[data-tour="stock-master"]',
  '[data-tour="stock-master-actions"]',
  '[data-tour="stock-master-trends"]',
  '[data-tour="stock-master-table"]',
  '[data-tour="stock-master-modal"]',
  '[data-tour="stock-master-name-field"]',
  '[data-tour="stock-master-unit-field"]',
  '[data-tour="stock-master-min-field"]',
  '[data-tour="stock-master-actions-field"]',
  '[data-tour="stock-master-save-button"]',
  '[data-tour="stock-warehouse-tabs"]',
  '[data-tour="stock-summary"]',
  '[data-tour="stock-summary-cards"]',
  '[data-tour="stock-summary-table"]',
  '[data-tour="stock-in"]',
  '[data-tour="stock-in-filters"]',
  '[data-tour="stock-in-table"]',
  '[data-tour="stock-purchase-modal"]',
  '[data-tour="stock-purchase-item"]',
  '[data-tour="stock-purchase-select-field"]',
  '[data-tour="stock-purchase-qty-cost-field"]',
  '[data-tour="stock-purchase-subtotal"]',
  '[data-tour="stock-purchase-add-item"]',
  '[data-tour="stock-purchase-note-field"]',
  '[data-tour="stock-purchase-total"]',
  '[data-tour="stock-purchase-actions"]',
  '[data-tour="stock-purchase-save-button"]',
  '[data-tour="stock-out"]',
  '[data-tour="stock-out-filters"]',
  '[data-tour="stock-out-pills"]',
  '[data-tour="stock-out-table"]',
  '[data-tour="stock-out-modal"]',
  '[data-tour="stock-out-user-field"]',
  '[data-tour="stock-out-user-info"]',
  '[data-tour="stock-recipe-picker"]',
  '[data-tour="stock-recipe-menu-select"]',
  '[data-tour="stock-recipe-menu-qty"]',
  '[data-tour="stock-recipe-add"]',
  '[data-tour="stock-recipe-note"]',
  '[data-tour="stock-recipe-summary"]',
  '[data-tour="stock-out-manual-list"]',
  '[data-tour="stock-out-manual-select"]',
  '[data-tour="stock-out-stock-price-info"]',
  '[data-tour="stock-out-manual-qty"]',
  '[data-tour="stock-out-manual-note"]',
  '[data-tour="stock-out-item-preview"]',
  '[data-tour="stock-out-add-item"]',
  '[data-tour="stock-out-total"]',
  '[data-tour="stock-out-actions"]',
  '[data-tour="stock-out-save-button"]',
  '[data-tour="stock-requests"]',
  '[data-tour="stock-request-filters"]',
  '[data-tour="stock-request-list"]',
];

function getStockStepOrder(selector) {
  const index = STOCK_STEP_ORDER.indexOf(selector);
  return index === -1 ? STOCK_STEP_ORDER.length : index;
}

export default function FloatingTutorialButton() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTutorialId, setActiveTutorialId] = useState(null);
  const [pendingTutorialId, setPendingTutorialId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [stepReady, setStepReady] = useState(false);
  const [buttonPos, setButtonPos] = useState(null);
  const dragRef = useRef(null);

  const availableTutorials = useMemo(() => (
    TUTORIALS.filter((tutorial) => !tutorial.roles || tutorial.roles.includes(user?.role))
  ), [user?.role]);
  const activeTutorial = availableTutorials.find((item) => item.id === activeTutorialId);
  const pendingTutorial = availableTutorials.find((item) => item.id === pendingTutorialId);
  const activeSteps = useMemo(() => (
    (activeTutorial?.steps || [])
      .filter((step) => !step.roles || step.roles.includes(user?.role))
      .map((step, index) => ({ ...step, _originalIndex: index }))
      .sort((a, b) => {
        if (activeTutorial?.id !== 'stock') return a._originalIndex - b._originalIndex;
        const orderDiff = getStockStepOrder(a.selector) - getStockStepOrder(b.selector);
        return orderDiff || a._originalIndex - b._originalIndex;
      })
  ), [activeTutorial, user?.role]);
  const activeStep = activeSteps[stepIndex];

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = document.documentElement;
    if (open && activeTutorialId) {
      root.dataset.tutorialId = activeTutorialId;
      root.dataset.tutorialStep = String(stepIndex + 1);
      root.dataset.tutorialDemo = 'true';
    } else {
      delete root.dataset.tutorialId;
      delete root.dataset.tutorialStep;
      delete root.dataset.tutorialDemo;
    }
    return () => {
      delete root.dataset.tutorialId;
      delete root.dataset.tutorialStep;
      delete root.dataset.tutorialDemo;
    };
  }, [activeTutorialId, open, stepIndex]);

  useEffect(() => {
    if (!activeTutorial || stepIndex < activeSteps.length) return;
    setStepIndex(Math.max(0, activeSteps.length - 1));
  }, [activeSteps.length, activeTutorial, stepIndex]);

  useEffect(() => {
    if (!pendingTutorial) return undefined;
    if (pathname !== pendingTutorial.route) return undefined;

    const timer = window.setTimeout(() => {
      setActiveTutorialId(pendingTutorial.id);
      setPendingTutorialId(null);
      setStepIndex(0);
      setHighlight(null);
      setOpen(true);
    }, 560);

    return () => window.clearTimeout(timer);
  }, [pathname, pendingTutorial]);

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
    if (typeof window === 'undefined') return undefined;
    const storageKey = 'pos-tutorial-button-position-v1';
    const setSafePosition = () => {
      const fallback = {
        x: window.innerWidth - 176,
        y: window.innerHeight - 88,
      };
      let saved = null;
      try {
        saved = JSON.parse(window.localStorage.getItem(storageKey));
      } catch {
        saved = null;
      }
      const source = saved || fallback;
      setButtonPos({
        x: clamp(Number(source.x || fallback.x), 12, window.innerWidth - 76),
        y: clamp(Number(source.y || fallback.y), 12, window.innerHeight - 76),
      });
    };

    setSafePosition();
    window.addEventListener('resize', setSafePosition);
    return () => window.removeEventListener('resize', setSafePosition);
  }, []);

  useEffect(() => {
    if (!activeStep?.selector || !open) {
      setHighlight(null);
      setStepReady(false);
      return undefined;
    }

    let cancelled = false;
    let retryTimer = null;
    const actionTimers = [];
    setStepReady(false);

    const updateHighlight = () => {
      const element = document.querySelector(activeStep.selector);
      if (!element) {
        setHighlight(null);
        return false;
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
        setStepReady(true);
      }, 280);
      return true;
    };

    const setInputValue = (element, value) => {
      if (!element) return;
      const proto = element.tagName === 'SELECT'
        ? window.HTMLSelectElement.prototype
        : element.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const stockTutorialDummy = {
      masterName: 'Daging Cincang Bumbu Tutorial',
      fallbackStockKeywords: ['Daging Cincang Bumbu', 'Daging', 'Kebab'],
      unit: 'gram',
      minStock: '5000',
      purchaseQty: '2500',
      purchaseCost: '78',
      purchaseNote: 'Pembelian bahan demo untuk Adana Kebab Platter',
      recipeMenuKeywords: ['Adana Kebab Platter', 'Adana', 'Kebab'],
      recipeQty: '2',
      manualQty: '160',
      manualNote: 'Stok untuk Adana Kebab Platter demo tutorial',
    };

    const findOptionByText = (select, keywords = []) => {
      if (!select) return null;
      const options = Array.from(select.options || []).filter((option) => option.value);
      return options.find((option) => {
        const label = `${option.textContent || ''} ${option.value || ''}`.toLowerCase();
        return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
      }) || options[0] || null;
    };

    const pollTarget = (attempt = 0) => {
      if (cancelled) return;
      const found = updateHighlight();
      if (!found && attempt < 32) {
        retryTimer = window.setTimeout(() => pollTarget(attempt + 1), 180);
        return;
      }
      if (!found) setStepReady(true);
    };

    const runActions = (index = 0, attempt = 0) => {
      if (cancelled) return;
      const actions = activeStep.actions || [];
      if (index >= actions.length) {
        retryTimer = window.setTimeout(() => pollTarget(), 220);
        return;
      }

      const action = actions[index];
      if (action === 'product-demo-basic-fill') {
        const suffix = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\D/g, '');
        setInputValue(document.querySelector('[data-tour="product-name-field"] input'), `Produk Tutorial ${suffix}`);
        setInputValue(document.querySelector('[data-tour="product-price-field"] input'), '999999');
        setInputValue(
          document.querySelector('[data-tour="product-image-url-field"] input'),
          'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=900&q=80'
        );
        const categorySelect = document.querySelector('[data-tour="product-category-field"] select');
        const firstCategoryValue = categorySelect
          ? Array.from(categorySelect.options).find((option) => option.value)?.value || ''
          : '';
        if (firstCategoryValue) setInputValue(categorySelect, firstCategoryValue);
        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'product-add-ingredient') {
        const ingredientRow = document.querySelector('[data-tour="product-ingredient-row"]');
        const addIngredientButton = document.querySelector('[data-tour-action="product-add-ingredient"]');
        if (!ingredientRow && addIngredientButton) {
          addIngredientButton.click();
        }
        const timer = window.setTimeout(() => runActions(index + 1, 0), 420);
        actionTimers.push(timer);
        return;
      }

      if (action === 'product-demo-ingredient-fill') {
        let ingredientRow = document.querySelector('[data-tour="product-ingredient-row"]');
        const addIngredientButton = document.querySelector('[data-tour-action="product-add-ingredient"]');
        if (!ingredientRow && addIngredientButton) {
          addIngredientButton.click();
          const timer = window.setTimeout(() => runActions(index, attempt), 360);
          actionTimers.push(timer);
          return;
        }

        ingredientRow = document.querySelector('[data-tour="product-ingredient-row"]');
        const ingredientSelect = ingredientRow?.querySelector('[data-tour="product-ingredient-select"]') || document.querySelector('[data-tour="product-ingredient-select"]');
        const firstIngredientValue = ingredientSelect
          ? Array.from(ingredientSelect.options).find((option) => option.value)?.value || ''
          : '';
        if (firstIngredientValue) setInputValue(ingredientSelect, firstIngredientValue);
        const qtyInput = ingredientRow?.querySelector('[data-tour="product-ingredient-qty"]') || document.querySelector('[data-tour="product-ingredient-qty"]');
        setInputValue(qtyInput, '1');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'payment-demo-qris-fill' || action === 'payment-demo-transfer-fill') {
        const isTransfer = action === 'payment-demo-transfer-fill';
        const typeStatusSelects = document.querySelectorAll('[data-tour="payment-type-status-field"] select');
        setInputValue(typeStatusSelects[0], isTransfer ? 'transfer' : 'qris');
        setInputValue(typeStatusSelects[1], 'active');
        const suffix = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\D/g, '');
        setInputValue(document.querySelector('[data-tour="payment-name-field"]'), isTransfer ? `Transfer Tutorial ${suffix}` : `QRIS Tutorial ${suffix}`);
        setInputValue(document.querySelector('[data-tour="payment-key-field"]'), isTransfer ? `transfer-tutorial-${suffix}` : `qris-tutorial-${suffix}`);
        setInputValue(document.querySelector('[data-tour="payment-provider-field"]'), isTransfer ? 'Bank' : 'QRIS');
        const accountInputs = document.querySelectorAll('[data-tour="payment-account-fields"] input');
        setInputValue(accountInputs[0], 'Sultan Kebab');
        setInputValue(accountInputs[1], isTransfer ? '123123112327' : '0895353025503');
        const timeoutInputs = document.querySelectorAll('[data-tour="payment-timeout-sort-fields"] input');
        setInputValue(timeoutInputs[0], '15');
        setInputValue(timeoutInputs[1], isTransfer ? '2' : '1');
        setInputValue(
          document.querySelector('[data-tour="payment-instructions-field"]'),
          isTransfer
            ? 'Transfer sesuai total bayar, lalu upload bukti pembayaran.'
            : 'Scan QRIS, pastikan nominal sesuai total bayar, lalu upload bukti pembayaran.'
        );
        const timer = window.setTimeout(() => runActions(index + 1, 0), 620);
        actionTimers.push(timer);
        return;
      }

      if (action === 'discount-demo-voucher-fill' || action === 'discount-demo-review-fill' || action === 'discount-demo-bundle-fill') {
        const isReview = action === 'discount-demo-review-fill';
        const isBundle = action === 'discount-demo-bundle-fill';
        const suffix = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\D/g, '');
        const typeStatusSelects = document.querySelectorAll('[data-tour="discount-type-status-field"] select');
        setInputValue(typeStatusSelects[0], isReview ? 'review_reward' : isBundle ? 'bundle' : 'voucher');
        setInputValue(typeStatusSelects[1], 'active');
        setInputValue(
          document.querySelector('[data-tour="discount-name-field"] input'),
          isReview ? `Reward Review Tutorial ${suffix}` : isBundle ? `Bundle Tutorial ${suffix}` : `Voucher Tutorial ${suffix}`
        );
        const valueInputs = document.querySelectorAll('[data-tour="discount-value-fields"] input, [data-tour="discount-value-fields"] select');
        setInputValue(valueInputs[0], 'percent');
        setInputValue(valueInputs[1], isBundle ? '10' : '5');
        const usageInputs = document.querySelectorAll('[data-tour="discount-usage-fields"] input');
        setInputValue(usageInputs[0], '1');
        setInputValue(usageInputs[1], isBundle ? '5' : '10');
        setInputValue(
          document.querySelector('[data-tour="discount-note-field"] textarea'),
          isReview ? 'Reward review demo tutorial.' : isBundle ? 'Paket bundle demo tutorial.' : 'Kode voucher demo tutorial.'
        );

        if (!isReview && !isBundle) {
          const codeInput = document.querySelector('[data-tour="discount-voucher-code-field"] input');
          if (codeInput && !codeInput.value) {
            const generator = document.querySelector('[data-tour-action="discount-generate-code"]');
            generator?.click();
          }
        }

        if (isReview) {
          const reviewInputs = document.querySelectorAll('[data-tour="discount-review-fields"] input');
          setInputValue(reviewInputs[0], '4');
          setInputValue(reviewInputs[1], '4');
        }

        if (isBundle) {
          const bundleRows = document.querySelectorAll('[data-tour="discount-bundle-row"]');
          if (bundleRows.length === 0 && attempt < 24) {
            const timer = window.setTimeout(() => runActions(index, attempt + 1), 180);
            actionTimers.push(timer);
            return;
          }
          Array.from(bundleRows).slice(0, 2).forEach((row, rowIndex) => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            const qty = row.querySelector('input[type="number"]');
            if (checkbox && !checkbox.checked) checkbox.click();
            setInputValue(qty, rowIndex + 1);
          });
        }

        const timer = window.setTimeout(() => runActions(index + 1, 0), isBundle ? 720 : 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-history-demo-search') {
        setInputValue(document.querySelector('[data-tour="pos-history-search"] input'), 'ORD');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-demo-search') {
        const searchInput = document.querySelector('[data-tour="pos-search"] input')
          || document.querySelector('[data-tour="pos-mobile-search"] input');
        setInputValue(searchInput, '');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-demo-add-first-product') {
        if (window.__POS_TUTORIAL__?.ensureDemoOrder) {
          window.__POS_TUTORIAL__.ensureDemoOrder();
          const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
          actionTimers.push(timer);
          return;
        }
        const availableCard = document.querySelector('[data-tour="pos-product-card"][data-soldout="false"] button');
        if (!availableCard && attempt < 24) {
          if (attempt === 0) {
            const searchInput = document.querySelector('[data-tour="pos-search"] input')
              || document.querySelector('[data-tour="pos-mobile-search"] input');
            setInputValue(searchInput, '');
            document.querySelector('[data-tour="pos-category-filter"] button')?.click();
          }
          const timer = window.setTimeout(() => runActions(index, attempt + 1), 160);
          actionTimers.push(timer);
          return;
        }
        availableCard?.click();
        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-open-payment-modal') {
        if (document.querySelector('[data-tour="pos-payment-modal"]')) {
          const timer = window.setTimeout(() => runActions(index + 1, 0), 220);
          actionTimers.push(timer);
          return;
        }
        if (window.__POS_TUTORIAL__?.openPayment) {
          Promise.resolve(window.__POS_TUTORIAL__.openPayment()).finally(() => {
            const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
            actionTimers.push(timer);
          });
          return;
        }
        const checkoutButton = document.querySelector('[data-tour="pos-cart-checkout"]');
        if (checkoutButton && !checkoutButton.disabled) {
          checkoutButton.click();
        }
        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'customer-orders-demo-search') {
        setInputValue(document.querySelector('[data-tour="customer-orders-search"] input'), 'ORD');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-history-open-delete-modal') {
        const trigger = document.querySelector('[data-tour-action="pos-history-open-delete-modal"]');
        if (trigger) {
          trigger.click();
        }
        const timer = window.setTimeout(() => runActions(index + 1, 0), 420);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-history-demo-delete-reason') {
        setInputValue(document.querySelector('[data-tour="pos-history-delete-reason"] textarea'), 'Demo tutorial: transaksi salah input.');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'pos-history-close-delete-modal') {
        const cancelButton = document.querySelector('[data-tour="pos-history-delete-modal-actions"] button');
        cancelButton?.click();
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-master-fill') {
        setInputValue(document.querySelector('[data-tour="stock-master-name-field"] input'), stockTutorialDummy.masterName);
        setInputValue(document.querySelector('[data-tour="stock-master-unit-field"] select'), stockTutorialDummy.unit);
        setInputValue(document.querySelector('[data-tour="stock-master-min-field"] input'), stockTutorialDummy.minStock);
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-purchase-fill') {
        const purchaseSelect = document.querySelector('[data-tour="stock-purchase-select-field"] select');
        if ((!purchaseSelect || !Array.from(purchaseSelect.options || []).some((option) => option.value)) && attempt < 24) {
          const timer = window.setTimeout(() => runActions(index, attempt + 1), 160);
          actionTimers.push(timer);
          return;
        }
        const purchaseOption = findOptionByText(purchaseSelect, [
          stockTutorialDummy.masterName,
          ...stockTutorialDummy.fallbackStockKeywords,
        ]);
        if (purchaseOption?.value && purchaseSelect.value !== purchaseOption.value) {
          setInputValue(purchaseSelect, purchaseOption.value);
        }
        const purchaseInputs = document.querySelectorAll('[data-tour="stock-purchase-qty-cost-field"] input');
        setInputValue(purchaseInputs[0], stockTutorialDummy.purchaseQty);
        setInputValue(purchaseInputs[1], stockTutorialDummy.purchaseCost);
        setInputValue(document.querySelector('[data-tour="stock-purchase-note-field"] input'), stockTutorialDummy.purchaseNote);
        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-out-user') {
        const userSelect = document.querySelector('[data-tour="stock-out-user-field"] select');
        const firstUserValue = userSelect
          ? Array.from(userSelect.options).find((option) => option.value)?.value || ''
          : '';
        if (firstUserValue) setInputValue(userSelect, firstUserValue);
        const timer = window.setTimeout(() => runActions(index + 1, 0), 320);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-recipe-first' || action === 'stock-demo-recipe-clear') {
        const select = document.querySelector('[data-tour="stock-recipe-menu-select"] select');
        if (!select && attempt < 24) {
          const timer = window.setTimeout(() => runActions(index, attempt + 1), 160);
          actionTimers.push(timer);
          return;
        }

        if (select) {
          const recipeOption = findOptionByText(select, stockTutorialDummy.recipeMenuKeywords);
          const nextValue = action === 'stock-demo-recipe-clear'
            ? ''
            : recipeOption?.value || '';
          if (select.value !== nextValue) {
            setInputValue(select, nextValue);
          }
        }

        if (action === 'stock-demo-recipe-first') {
          const qtyInput = document.querySelector('[data-tour="stock-recipe-menu-qty"] input');
          if (qtyInput && qtyInput.value !== stockTutorialDummy.recipeQty) {
            setInputValue(qtyInput, stockTutorialDummy.recipeQty);
          }
        }

        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-manual-first') {
        const select = document.querySelector('[data-tour="stock-out-manual-select"] select');
        if (!select && attempt < 24) {
          const timer = window.setTimeout(() => runActions(index, attempt + 1), 160);
          actionTimers.push(timer);
          return;
        }

        if (select) {
          const manualOption = findOptionByText(select, [
            stockTutorialDummy.masterName,
            ...stockTutorialDummy.fallbackStockKeywords,
          ]);
          const nextValue = manualOption?.value || '';
          if (nextValue && select.value !== nextValue) {
            setInputValue(select, nextValue);
          }
        }

        const qtyInput = document.querySelector('[data-tour="stock-out-manual-qty"] input');
        if (qtyInput && qtyInput.value !== stockTutorialDummy.manualQty) {
          setInputValue(qtyInput, stockTutorialDummy.manualQty);
        }
        setInputValue(
          document.querySelector('[data-tour="stock-out-manual-note"] input, [data-tour="stock-out-manual-note"] textarea'),
          stockTutorialDummy.manualNote
        );

        const timer = window.setTimeout(() => runActions(index + 1, 0), 520);
        actionTimers.push(timer);
        return;
      }

      const trigger = document.querySelector(`[data-tour-action="${action}"]`);
      if (trigger) {
        trigger.click();
        const timer = window.setTimeout(() => runActions(index + 1, 0), 340);
        actionTimers.push(timer);
        return;
      }

      if (action.startsWith('stock-close-')) {
        runActions(index + 1, 0);
        return;
      }

      if (attempt < 24) {
        const timer = window.setTimeout(() => runActions(index, attempt + 1), 160);
        actionTimers.push(timer);
        return;
      }

      runActions(index + 1, 0);
    };

    runActions();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);
    return () => {
      cancelled = true;
      actionTimers.forEach((timer) => window.clearTimeout(timer));
      if (retryTimer) window.clearTimeout(retryTimer);
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [activeStep, open, pathname]);

  if (!user || availableTutorials.length === 0) return null;

  const getPanelStyle = () => {
    const isTutorialChooser = !activeTutorial;
    const width = typeof window === 'undefined'
      ? (isTutorialChooser ? 960 : 420)
      : Math.min(isTutorialChooser ? 960 : 420, window.innerWidth - 32);
    if (activeTutorial && highlight && typeof window !== 'undefined') {
      const gap = 18;
      const preferredHeight = Math.min(560, window.innerHeight - 32);
      const spaceBelow = window.innerHeight - (highlight.top + highlight.height) - 16;
      const spaceAbove = highlight.top - 16;
      const rightLeft = highlight.left + highlight.width + gap;
      const leftLeft = highlight.left - width - gap;
      const canUseRight = rightLeft + width <= window.innerWidth - 16;
      const verticalTop = spaceBelow >= Math.min(360, preferredHeight)
        ? highlight.top + highlight.height + gap
        : spaceAbove >= Math.min(360, preferredHeight)
          ? highlight.top - preferredHeight - gap
          : highlight.top;
      return {
        top: `${clamp(verticalTop, 16, Math.max(16, window.innerHeight - preferredHeight - 16))}px`,
        left: `${canUseRight ? rightLeft : clamp(leftLeft, 16, window.innerWidth - width - 16)}px`,
        width: `${width}px`,
        maxHeight: `${preferredHeight}px`,
      };
    }

    return {
      top: '50%',
      left: '50%',
      width: `${width}px`,
      maxHeight: `${typeof window === 'undefined' ? 680 : Math.min(isTutorialChooser ? 720 : 560, window.innerHeight - 32)}px`,
      transform: 'translate(-50%, -50%)',
    };
  };

  const handlePointerDown = (event) => {
    if (!buttonPos) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: buttonPos.x,
      originY: buttonPos.y,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || typeof window === 'undefined') return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    setButtonPos({
      x: clamp(drag.originX + dx, 12, window.innerWidth - 76),
      y: clamp(drag.originY + dy, 12, window.innerHeight - 76),
    });
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (typeof window !== 'undefined') {
      const next = {
        x: clamp(drag.originX + event.clientX - drag.startX, 12, window.innerWidth - 76),
        y: clamp(drag.originY + event.clientY - drag.startY, 12, window.innerHeight - 76),
      };
      setButtonPos(next);
      window.localStorage.setItem('pos-tutorial-button-position-v1', JSON.stringify(next));
    }
  };

  const startTutorial = (tutorial) => {
    setActiveTutorialId(null);
    setPendingTutorialId(tutorial.id);
    setStepIndex(0);
    setHighlight(null);
    setOpen(true);
    if (pathname !== tutorial.route) {
      router.push(tutorial.route);
    }
  };

  const closeTutorial = () => {
    setOpen(false);
    setHighlight(null);
    setPendingTutorialId(null);
  };

  const finishTutorial = () => {
    setActiveTutorialId(null);
    setPendingTutorialId(null);
    setStepIndex(0);
    setHighlight(null);
    setOpen(true);
  };

  const goNext = () => {
    if (!activeTutorial) return;
    if (stepIndex >= activeSteps.length - 1) {
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

      {open && !activeTutorial && (
        <div className="fixed inset-0 z-[59] bg-slate-950/70 backdrop-blur-sm" />
      )}

      {open && (
        <div
          className={`fixed z-[60] flex flex-col overflow-hidden border border-amber-500/25 bg-slate-950 shadow-2xl shadow-black/50 ${
            activeTutorial ? 'rounded-3xl' : 'rounded-[2rem]'
          }`}
          style={getPanelStyle()}
        >
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
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-200">
                    Step {stepIndex + 1}/{activeSteps.length}
                  </span>
                  {!stepReady && (
                    <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
                      Menyiapkan tampilan...
                    </span>
                  )}
                </div>
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
              </div>

              <div className="border-t border-white/10 bg-slate-950/95 p-5 pt-3">
              <div className="flex gap-2">
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
                  disabled={!stepReady}
                  className="flex-[1.4] rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-55"
                >
                  {stepIndex >= activeSteps.length - 1 ? 'Selesai' : 'Lanjut'}
                </button>
              </div>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Pilih Tutorial</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Mau dipandu menu apa?</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Pilih halaman yang ingin dipandu. Sistem akan pindah halaman dulu, menunggu tampilan siap, lalu tutorial dimulai otomatis dari step pertama.
                  </p>
                </div>
                {pendingTutorial && (
                  <div className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-100">
                    Menyiapkan {pendingTutorial.title}...
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableTutorials.map((tutorial) => (
                  <button
                    key={tutorial.id}
                    type="button"
                    onClick={() => startTutorial(tutorial)}
                    disabled={Boolean(pendingTutorialId)}
                    className="group min-h-40 w-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.015] p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-amber-500/10 disabled:cursor-wait disabled:opacity-55"
                  >
                    <span className="inline-flex rounded-full bg-amber-400/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">
                      Tutorial
                    </span>
                    <span className="mt-4 block text-xl font-black text-white transition group-hover:text-amber-100">{tutorial.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-400">{tutorial.description}</span>
                    <span className="mt-5 inline-flex text-sm font-black text-amber-300">
                      Mulai panduan
                    </span>
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

      <div
        className="fixed z-50 h-16 w-16"
        style={{
          left: `${buttonPos?.x ?? 24}px`,
          top: `${buttonPos?.y ?? 24}px`,
          touchAction: 'none',
        }}
      >
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => {
            if (dragRef.current?.moved) {
              dragRef.current = null;
              return;
            }
            dragRef.current = null;
            setOpen((value) => !value);
          }}
          className="grid h-16 w-16 cursor-grab place-items-center rounded-full border border-amber-300/35 bg-gradient-to-br from-amber-400 to-orange-700 text-sm font-black text-slate-950 shadow-xl shadow-amber-950/35 transition hover:-translate-y-0.5 hover:shadow-amber-700/30 active:cursor-grabbing"
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
