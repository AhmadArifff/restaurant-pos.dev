# Restaurant POS Frontend

Frontend aplikasi Restaurant POS untuk operasional kasir, admin, manajemen stok, laporan bisnis, landing page, login page, dan AI assistant. Project ini menggunakan Next.js App Router dan terhubung ke backend `restaurant-pos-backend` melalui REST API.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Zustand untuk state management dan persist auth/cart/settings
- Axios untuk HTTP client dan auth interceptor
- Framer Motion untuk animasi dashboard/report
- React Bits style component untuk Fuzzy Text dan Electric Border
- next-pwa untuk service worker dan dukungan install aplikasi
- react-to-print untuk kebutuhan cetak/print UI

## Fitur Utama

### Public Website

- Landing page restoran dengan section dinamis.
- Konten landing page dapat diatur dari admin panel.
- Section yang tersedia: header, hero, about, bestsellers, menu tabs, experience, gallery, testimonials, locations, CTA, floating button, marquee, dan footer.
- Runtime branding untuk logo, favicon, warna, dan metadata dari database settings.
- Halaman 404 custom dengan animasi Fuzzy Text.

### Authentication

- Login user admin dan kasir.
- Auth token disimpan melalui Zustand persist.
- Axios interceptor otomatis mengirim Bearer token.
- Auto logout/redirect ketika token tidak valid.

### Admin Dashboard

- Dashboard ringkasan operasional.
- Sidebar admin dengan akses ke POS, riwayat POS, dashboard, produk, stok, laporan, tim kasir, landing page, login page, pengaturan, dan install aplikasi.
- Floating AI assistant untuk admin.

### POS Kasir

- Menu kasir untuk transaksi penjualan.
- Keranjang belanja dan kalkulasi total.
- Modal pembayaran.
- Receipt/struk transaksi.
- Riwayat POS dan detail transaksi.

### Produk dan Kategori

- CRUD produk.
- Upload gambar produk.
- Manajemen kategori.
- Konfigurasi bahan/recipe per produk untuk perhitungan HPP dan stok.

### Stok dan Inventory

- Manajemen bahan baku atau stock items.
- Stok masuk, stok keluar manual, dan histori stok.
- Main stock untuk pembelian, pemakaian, dan saldo stok utama.
- Pengajuan stok oleh kasir dan approval oleh admin.
- Stock badge untuk status stok rendah.

### Tim Kasir

- Manajemen user admin/kasir.
- Data user aktif.
- Monitoring aktivitas dan performa kasir.

### Laporan Bisnis

- Ringkasan omzet, transaksi, margin, HPP, dan profit.
- Line chart omzet dan margin dengan animasi smooth.
- Analisis produk, stok rendah, payment mix, dan performa karyawan.
- Export laporan PDF profesional melalui backend.
- Laporan mendukung periode harian, 7 hari, 30 hari, yearly, dan custom range.

### AI Assistant

- Chat AI untuk pertanyaan bisnis berbasis data POS.
- Pilihan model AI dari backend OpenRouter.
- Session context untuk percakapan.
- UI chat dengan animated interactive logo dan Electric Border.
- Mendukung pertanyaan revenue, stok, profit, produk terlaris, dan rekomendasi bisnis.

### Settings Admin

- Landing Page Settings untuk konfigurasi semua section landing page.
- Login Page Settings untuk konfigurasi teks, gambar, dan elemen tampilan login page.
- Website settings untuk branding, favicon, logo, dan konfigurasi visual.

### PWA

- Manifest aplikasi.
- Service worker registration.
- Tombol install aplikasi.

## Struktur Folder Penting

```text
app/                         Halaman Next.js App Router
app/admin/ai-chat/            Halaman AI assistant admin
app/admin/landing-page-settings/  Setting landing page
app/admin/login-page-settings/    Setting login page
app/login/                    Login page
app/pos/                      POS kasir dan riwayat
app/reports/                  Dashboard laporan bisnis
components/admin/             Komponen admin panel dan settings
components/landing/           Section landing page publik
components/pos/               Komponen POS, cart, payment, receipt
components/ui/                UI reusable, PWA, runtime theme, chat button
lib/                          Axios, API wrapper, asset URL, helper
store/                        Zustand stores
public/                       Static assets, manifest, service worker
```

## Persiapan Environment

Buat file `.env.local` di root frontend.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Untuk production, sesuaikan value dengan URL backend production.

```env
NEXT_PUBLIC_API_URL=https://domain-backend-anda.com/api
```

## Cara Install dan Menjalankan

Pastikan backend sudah berjalan lebih dulu di port yang sesuai `NEXT_PUBLIC_API_URL`.

```bash
npm install
npm run dev
```

Buka aplikasi di:

```text
http://localhost:3000
```

Build production:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## Workflow Sistem

1. User membuka landing page publik.
2. Admin atau kasir login melalui `/login`.
3. Sistem menyimpan token dan role user.
4. Admin masuk ke dashboard untuk mengelola produk, stok, user, laporan, landing page, login page, dan settings.
5. Kasir menggunakan menu POS untuk membuat transaksi.
6. Transaksi mengurangi stok berdasarkan konfigurasi produk dan bahan.
7. Kasir dapat mengajukan stok jika butuh supply.
8. Admin menyetujui atau menolak pengajuan stok.
9. Admin memantau laporan bisnis dan mengekspor PDF untuk evaluasi owner/investor.
10. Admin dapat memakai AI assistant untuk analisis cepat berdasarkan data bisnis.

## Integrasi Backend

Frontend memakai API backend melalui `lib/axios.js` dan wrapper endpoint di `lib/api.js`.

Endpoint utama yang digunakan:

- `/auth`
- `/products`
- `/categories`
- `/transactions`
- `/stock-items`
- `/main-stock`
- `/stock-requests`
- `/reports`
- `/attendance`
- `/settings`
- `/ai-chat`

## Role dan Akses

- Admin: akses seluruh menu admin, user, stok, laporan, settings, AI assistant.
- Kasir: akses POS, stok yang relevan, transaksi, dan fitur operasional sesuai guard backend/frontend.

## Catatan Development

- Jangan commit file `.env.local` atau secret API.
- Pastikan backend dan database aktif sebelum mengetes halaman admin.
- Jika favicon/logo berubah dari admin settings, runtime theme akan memperbarui link icon di browser.
- Untuk perubahan UI besar, jalankan `npm run build` sebelum push.

## Deployment

Rekomendasi deployment frontend:

1. Set environment variable `NEXT_PUBLIC_API_URL` di platform hosting.
2. Jalankan build command `npm run build`.
3. Jalankan start command `npm run start` atau gunakan platform Next.js seperti Vercel.

## Commit Format

Project ini menggunakan format commit historis seperti:

```text
V.1.1.10 solve menu POS menu riwayat POS and chart analiys
```

Gunakan versi berikutnya dan deskripsi singkat, contoh:

```text
V.1.1.11 add README documentation and improve assistant report settings
```
