'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, getCategories, getWebsiteSettings } from '@/lib/api';
import BranchCard from '@/components/ui/BranchCard';
import branchesData from '@/data/branches.json';
import { resolveAssetUrl } from '@/lib/assetUrl';

// Default mock data untuk landing page ketika user belum login
const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Kebab Daging Sapi', price: 35000, category_id: 1, category_name: 'Kebab Sapi', stock: 10 },
  { id: 2, name: 'Kebab Daging Ayam', price: 30000, category_id: 2, category_name: 'Kebab Ayam', stock: 8 },
  { id: 3, name: 'Kebab Daging Kambing', price: 40000, category_id: 3, category_name: 'Kebab Kambing', stock: 5 },
  { id: 4, name: 'Kebab Keju Sapi', price: 45000, category_id: 1, category_name: 'Kebab Sapi', stock: 7 },
  { id: 5, name: 'Kebab Pedas Ayam', price: 32000, category_id: 2, category_name: 'Kebab Ayam', stock: 12 },
  { id: 6, name: 'Kebab Mix Plate', price: 55000, category_id: 4, category_name: 'Special', stock: 6 },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Kebab Sapi' },
  { id: 2, name: 'Kebab Ayam' },
  { id: 3, name: 'Kebab Kambing' },
  { id: 4, name: 'Special' },
];

export default function LandingPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [filteredProducts, setFilteredProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    store_name: 'Kebab POS',
    logo_url: '/images/branding/default-logo.svg',
    primary_color: '#f97316',
    store_description: 'Nikmati kelezatan kebab autentik dengan bahan-bahan pilihan terbaik. Tersedia di berbagai cabang!',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings (public endpoint)
        const settingsRes = await getWebsiteSettings();
        const settingsData = settingsRes.data || settingsRes;
        setSettings({
          store_name: settingsData.store_name || 'Kebab POS',
          logo_url: resolveAssetUrl(settingsData.logo_url, '/images/branding/default-logo.svg'),
          primary_color: settingsData.primary_color || '#f97316',
          store_description: settingsData.store_description || 'Nikmati kelezatan kebab autentik dengan bahan-bahan pilihan terbaik. Tersedia di berbagai cabang!',
        });
        
        // Coba fetch dari API
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        
        // Jika berhasil, gunakan data dari API
        const productsData = productsRes.data || productsRes;
        const categoriesData = categoriesRes.data || categoriesRes;
        
        setProducts(productsData);
        setCategories(categoriesData);
        setFilteredProducts(productsData);
      } catch (err) {
        // Jika error (401, network error, etc), gunakan default data
        console.log('Using default landing page data', err?.message);
        setProducts(DEFAULT_PRODUCTS);
        setCategories(DEFAULT_CATEGORIES);
        setFilteredProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category_id === categoryId)
      );
    }
  };

  // Get top 6 best sellers (berdasarkan ada/tidak ada stok, atau bisa ditambah rating)
  const bestSellers = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ============ NAVBAR ============ */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: settings.primary_color }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAssetUrl(settings.logo_url, '/images/assets/logo.png')}
                alt="Logo"
                className="w-full h-full object-contain rounded-full p-1"
                onError={(e) => {
                  e.currentTarget.src = '/images/assets/logo.png';
                }}
              />
            </div>
            <span className="font-bold text-lg" style={{ color: settings.primary_color }}>
              {settings.store_name}
            </span>
          </div>
          <Link
            href="/login"
            className="text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: settings.primary_color }}
            onMouseEnter={e => e.target.style.opacity = '0.8'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Login / Admin
          </Link>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative text-white py-20" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                {settings.store_name} Lezat & Berkualitas
              </h1>
              <p className="text-xl mb-6" style={{ opacity: 0.95 }}>
                {settings.store_description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="text-white px-8 py-3 rounded-lg font-bold transition-opacity inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'white', color: settings.primary_color }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  Pesan Sekarang →
                </Link>
                <a
                  href="#menu"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
                  onMouseEnter={e => e.target.style.color = settings.primary_color}
                  onMouseLeave={e => e.target.style.color = 'white'}
                >
                  Lihat Menu →
                </a>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-9xl">🍖</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: settings.primary_color }}>4</div>
              <p className="text-gray-600">Cabang Tersedia</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: settings.primary_color }}>50+</div>
              <p className="text-gray-600">Menu Pilihan</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: settings.primary_color }}>10,000+</div>
              <p className="text-gray-600">Pelanggan Puas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: settings.primary_color }}>⭐ 4.8</div>
              <p className="text-gray-600">Rating Pelanggan</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BEST SELLERS ============ */}
      {!loading && bestSellers.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              ⭐ Best Sellers
            </h2>
            <p className="text-gray-600 mb-8">Menu favorit pelanggan kami</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden hover:-translate-y-1"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${settings.primary_color}66 0%, ${settings.primary_color} 100%)` }}>
                    <span className="text-6xl">🍖</span>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Best
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.category_name || 'Menu'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color: settings.primary_color }}>
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ MENU BY CATEGORY ============ */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Menu Lengkap</h2>

          {!loading && (
            <>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 mb-10 pb-4 border-b">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors`}
                  style={{
                    backgroundColor: selectedCategory === null ? settings.primary_color : '#e5e7eb',
                    color: selectedCategory === null ? 'white' : '#1f2937',
                  }}
                >
                  Semua Menu
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors`}
                    style={{
                      backgroundColor: selectedCategory === cat.id ? settings.primary_color : '#e5e7eb',
                      color: selectedCategory === cat.id ? 'white' : '#1f2937',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden hover:-translate-y-1"
                    >
                      <div className="h-40 bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${settings.primary_color}80 0%, ${settings.primary_color} 100%)` }}>
                        <span className="text-5xl">🍖</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category_name || 'Menu'}</p>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xl font-bold" style={{ color: settings.primary_color }}>
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Kategori ini tidak ada produk</p>
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat menu...</p>
            </div>
          )}
        </div>
      </section>

      {/* ============ BRANCHES / LOCATIONS ============ */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            📍 Lokasi Kami
          </h2>
          <p className="text-gray-600 mb-8">Tersedia di 4 cabang strategis di Jakarta dan sekitarnya</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {branchesData.branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="text-white py-16" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Mencoba Kelezatan Kami?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ opacity: 0.9 }}>
            Bergabunglah dengan ribuan pelanggan puas kami dan nikmati pengalaman kuliner terbaik!
          </p>
          <Link
            href="/login"
            className="inline-block text-white px-10 py-4 rounded-lg font-bold text-lg transition-opacity"
            style={{ backgroundColor: 'white', color: settings.primary_color }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Login & Pesan Sekarang
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Kebab Bang Han</h3>
              <p className="text-sm">
                Menyediakan kebab berkualitas tinggi dengan bahan-bahan terbaik sejak 2020.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Navigasi</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="#menu" className="hover:text-white">Menu</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:+621234567890" className="hover:text-white">+62 123-456-7890</a></li>
                <li><a href="mailto:info@banghan.com" className="hover:text-white">info@banghan.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Jam Operasional</h4>
              <p className="text-sm">Senin - Minggu</p>
              <p className="text-sm font-semibold">10:00 - 23:00</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Kebab Bang Han. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
