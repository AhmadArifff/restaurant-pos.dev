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
        actions: ['stock-tab-warehouse'],
        title: 'Subtab Stok Gudang',
        body: 'Subtab membagi gudang menjadi saldo, pemasukan, dan pengeluaran.',
        details: ['Saldo Stok menampilkan posisi stok saat ini.', 'Pemasukan mencatat pembelian bahan dan menambah saldo gudang.', 'Pengeluaran mencatat bahan yang keluar untuk menu, transaksi, atau pengajuan.', 'Role kasir hanya melihat subtab yang sesuai kewenangannya.'],
      },
      {
        selector: '[data-tour="stock-summary"]',
        actions: ['stock-tab-warehouse', 'stock-subtab-summary'],
        title: 'Saldo Stok Gudang',
        body: 'Saldo adalah hasil akhir dari semua stok masuk dikurangi stok keluar.',
        details: ['Informasi cabang memperjelas stok yang sedang dibaca.', 'Data dihitung otomatis dari pemasukan, pengeluaran, dan pengajuan yang disetujui.', 'Tidak ada input manual langsung di saldo agar audit tetap rapi.', 'Jika stok kosong, sistem menampilkan empty state.'],
      },
      {
        selector: '[data-tour="stock-summary-cards"]',
        roles: ['admin'],
        actions: ['stock-tab-warehouse', 'stock-subtab-summary'],
        title: 'Kartu Nilai Stok',
        body: 'Kartu ringkasan membantu admin membaca nilai uang dari pergerakan stok.',
        details: ['Total Nilai Masuk menghitung nilai pembelian.', 'Total Nilai Keluar menghitung nilai bahan yang dipakai atau keluar.', 'Nilai Stok Gudang membaca selisih nilai masuk dan keluar.', 'Bagian ini hanya tampil lengkap untuk admin.'],
      },
      {
        selector: '[data-tour="stock-summary-table"]',
        actions: ['stock-tab-warehouse', 'stock-subtab-summary'],
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
        actions: ['stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Pengeluaran Stok',
        body: 'Pengeluaran membaca bahan yang keluar dari gudang atau stok kasir.',
        details: ['Pengeluaran bisa berasal dari transaksi POS, pengajuan manual, atau catatan admin.', 'Tombol Catat Pengeluaran membuka form berbasis menu atau bahan.', 'Data kasir tetap dibatasi pada user dan role yang sesuai.', 'Nilai pengeluaran membantu membaca biaya produksi.'],
      },
      {
        selector: '[data-tour="stock-out-filters"]',
        actions: ['stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Filter Tanggal Pengeluaran',
        body: 'Filter tanggal memilih range data pengeluaran stok.',
        details: ['Dari adalah tanggal awal.', 'Sampai adalah tanggal akhir.', 'Tombol Cari memuat ulang data sesuai range.', 'Range dipakai agar tabel tetap ringan saat histori banyak.'],
      },
      {
        selector: '[data-tour="stock-out-pills"]',
        actions: ['stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Filter Status Pengeluaran',
        body: 'Chip status memisahkan sumber dan status pengeluaran.',
        details: ['Semua menampilkan semua data pada range.', 'Sudah Keluar atau Disetujui menunjukkan stok yang benar-benar keluar.', 'Menunggu menunjukkan pengajuan yang belum diproses admin.', 'Ditolak dan Transaksi POS membantu audit sumber pengeluaran.'],
      },
      {
        selector: '[data-tour="stock-out-table"]',
        actions: ['stock-tab-warehouse', 'stock-subtab-out'],
        title: 'Tabel Pengeluaran',
        body: 'Tabel pengeluaran menjelaskan bahan apa yang keluar, berapa nilainya, dan dari sumber mana.',
        details: ['Tanggal, Bahan Baku, Jumlah, Harga/Sat, dan Total Nilai membaca detail biaya.', 'Status Sumber membedakan transaksi, pending, approved, atau rejected.', 'Sumber Cabang dan Sumber Stok membantu melacak lokasi stok.', 'Pengaju, Status, dan Catatan menjelaskan siapa dan kenapa stok keluar.'],
      },
      {
        selector: '[data-tour="stock-requests"]',
        actions: ['stock-tab-requests'],
        title: 'Pengajuan Stok',
        body: 'Bagian ini mengelola permintaan stok dari kasir ke admin.',
        details: ['Admin melihat semua pengajuan kasir.', 'Kasir melihat pengajuan miliknya sendiri.', 'Pengajuan pending dapat diproses, ditolak, atau diajukan ulang sesuai status.', 'Item pengajuan menampilkan qty diminta, qty disetujui, harga, dan total nilai.'],
      },
      {
        selector: '[data-tour="stock-request-filters"]',
        actions: ['stock-tab-requests'],
        title: 'Filter Pengajuan',
        body: 'Filter ini menjaga daftar pengajuan tetap mudah dibaca.',
        details: ['Tanggal Dari dan Sampai memilih periode pengajuan.', 'Chip Semua, Menunggu, Disetujui, dan Ditolak memfilter status.', 'Jumlah pengajuan memberi ringkasan data yang sedang tampil.', 'Gunakan filter ini saat histori pengajuan sudah banyak.'],
      },
      {
        selector: '[data-tour="stock-request-list"]',
        actions: ['stock-tab-requests'],
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
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [stepReady, setStepReady] = useState(false);
  const [buttonPos, setButtonPos] = useState(null);
  const dragRef = useRef(null);

  const availableTutorials = useMemo(() => (
    TUTORIALS.filter((tutorial) => !tutorial.roles || tutorial.roles.includes(user?.role))
  ), [user?.role]);
  const activeTutorial = availableTutorials.find((item) => item.id === activeTutorialId);
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
    if (!activeTutorial || stepIndex < activeSteps.length) return;
    setStepIndex(Math.max(0, activeSteps.length - 1));
  }, [activeSteps.length, activeTutorial, stepIndex]);

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
      const proto = element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
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
      if (action === 'stock-demo-master-fill') {
        const suffix = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\D/g, '');
        setInputValue(document.querySelector('[data-tour="stock-master-name-field"] input'), `Bahan Tutorial ${suffix}`);
        setInputValue(document.querySelector('[data-tour="stock-master-unit-field"] select'), 'gram');
        setInputValue(document.querySelector('[data-tour="stock-master-min-field"] input'), '10');
        const timer = window.setTimeout(() => runActions(index + 1, 0), 360);
        actionTimers.push(timer);
        return;
      }

      if (action === 'stock-demo-purchase-fill') {
        const purchaseSelect = document.querySelector('[data-tour="stock-purchase-select-field"] select');
        const firstPurchaseValue = purchaseSelect
          ? Array.from(purchaseSelect.options).find((option) => option.value)?.value || ''
          : '';
        if (firstPurchaseValue) setInputValue(purchaseSelect, firstPurchaseValue);
        const purchaseInputs = document.querySelectorAll('[data-tour="stock-purchase-qty-cost-field"] input');
        setInputValue(purchaseInputs[0], '10');
        setInputValue(purchaseInputs[1], '1000');
        setInputValue(document.querySelector('[data-tour="stock-purchase-note-field"] input'), 'Pembelian stok demo tutorial');
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
          const nextValue = action === 'stock-demo-recipe-clear'
            ? ''
            : Array.from(select.options).find((option) => option.value)?.value || '';
          if (select.value !== nextValue) {
            setInputValue(select, nextValue);
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
          const nextValue = Array.from(select.options).find((option) => option.value)?.value || '';
          if (nextValue && select.value !== nextValue) {
            setInputValue(select, nextValue);
          }
        }

        const qtyInput = document.querySelector('[data-tour="stock-out-manual-qty"] input');
        if (qtyInput && qtyInput.value !== '1') {
          setInputValue(qtyInput, '1');
        }

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
    const width = typeof window === 'undefined' ? 420 : Math.min(420, window.innerWidth - 32);
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
      maxHeight: `${typeof window === 'undefined' ? 560 : Math.min(560, window.innerHeight - 32)}px`,
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

      {open && (
        <div
          className="fixed z-[60] flex flex-col overflow-hidden rounded-3xl border border-amber-500/25 bg-slate-950 shadow-2xl shadow-black/50"
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
