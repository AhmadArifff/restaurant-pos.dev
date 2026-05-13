'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/ui/AuthGuard';
import {
  getCategories, createTransaction,
  getMyStockProducts, getStockAllUsers,
} from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Cart         from '@/components/pos/Cart';
import PaymentModal from '@/components/pos/PaymentModal';
import Receipt      from '@/components/pos/Receipt';
import { useReactToPrint } from 'react-to-print';
import AdminLayout  from '@/components/layout/AdminLayout';

// ── Skeleton ──────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50 animate-pulse">
      <div className="h-28 bg-slate-700/60" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-slate-700 rounded-full w-3/4" />
        <div className="h-3 bg-slate-700/60 rounded-full w-1/2" />
        <div className="h-3 bg-slate-700/40 rounded-full w-1/3" />
      </div>
    </div>
  );
}

function CartBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1
      bg-orange-500 text-white text-xs font-black rounded-full
      flex items-center justify-center shadow-lg shadow-orange-500/40">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function PosPage() {
  const [products,        setProducts]        = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [activeCategory,  setActiveCategory]  = useState('all');
  const [search,          setSearch]          = useState('');
  const [showPayment,     setShowPayment]      = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showMobileCart,  setShowMobileCart]  = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null); // Track expanded product for details

  // Admin: sumber stok yang dipilih
  const [selectedSourceUser, setSelectedSourceUser] = useState(null);

  const { items, addItem, clearCart } = useCartStore();
  const { user, logout }              = useAuthStore();
  const router                        = useRouter();
  const receiptRef                    = useRef();

  const total     = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const isAdmin   = user?.role === 'admin';

  // ── Load data ──────────────────────────────────────────────
  const loadData = useCallback(() => {
    setLoading(true);
    // 🔄 Using getStockAllUsers for admin - awaiting /stock-requests/approved-for-pos backend implementation
    const fetchProducts = isAdmin ? getStockAllUsers : getMyStockProducts;

    Promise.all([fetchProducts(), getCategories()])
      .then(([p, c]) => {
        const prods = p.data || [];
        setProducts(prods);
        setCategories(c.data || []);

        // Admin: pilih user pertama yang punya stok sebagai default
        if (isAdmin && !selectedSourceUser && prods.length > 0) {
          const firstProduct = prods[0];
          const firstUser = firstProduct.stock_by_user?.[0];
          if (firstUser) {
            setSelectedSourceUser({
              user_id: firstUser.user_id,
              user_name: firstUser.user_name,
              role: firstUser.role,
              can_make: firstUser.can_make,
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  // Tambahkan setelah fungsi handleNoStock
  const handleKasirNoStock = (product) => {
    const ings = product.ingredients?.map(ing => ({
      stock_item_id: ing.stock_item_id,
      qty:           '',
      name:          ing.ingredient_name,
      unit:          ing.unit,
    })) || [];

    const params = new URLSearchParams({
      from:         'pos',
      product_name: product.name,
      user_id:      String(user?.id || ''),
      ingredients:  JSON.stringify(ings),
    });

    router.push(`/stock?${params.toString()}`);
  };

  const handlePrint = useReactToPrint({ contentRef: receiptRef });

  // ── Stok produk sesuai konteks ─────────────────────────────
  const getProductStock = useCallback((product) => {
    if (!isAdmin) return product.stock ?? 0;
    if (!selectedSourceUser) return 0;
    const userStock = product.stock_by_user?.find(
      u => u.user_id === selectedSourceUser.user_id
    );
    return userStock ? (Number(userStock.can_make || 0)) : 0;
  }, [isAdmin, selectedSourceUser]);

  // ── Semua user dengan stok (FILTERED: hanya yang can_make > 0) ────────────────────────────────
  const stockUsersList = isAdmin
    ? Object.values(
        products.reduce((acc, p) => {
          (p.stock_by_user || []).forEach((u) => {
            const canMake = Number(u.can_make || 0);
            if (canMake <= 0) return;
            const prev = acc[u.user_id];
            if (!prev || canMake > prev.can_make) {
              acc[u.user_id] = { ...u, can_make: canMake };
            }
          });
          return acc;
        }, {})
      )
    : [];

  // ── Add to cart ────────────────────────────────────────────
  const handleAddItem = (product) => {
    const stock  = getProductStock(product);
    const inCart = items.find(i => i.id === product.id);

    if (stock === 0) {
      if (isAdmin) handleNoStock(product);
      else         handleKasirNoStock(product); // ← tambah ini
      return;
    }

    if (inCart && inCart.qty >= stock) {
      alert(`Stok tidak cukup. Maksimal ${stock} porsi.`);
      return;
    }

    addItem({
      ...product,
      _sourceUserId: isAdmin ? selectedSourceUser?.user_id : user?.id,
    });
  };

  // ── Redirect ke form pengajuan stok ───────────────────────
  const handleNoStock = (product) => {
    const ings = product.ingredients?.map(ing => ({
      stock_item_id: ing.stock_item_id,
      qty:           '',
      name:          ing.ingredient_name,
      unit:          ing.unit,
    })) || [];

    const params = new URLSearchParams({
      from:         'pos',
      product_name: product.name,
      user_id:      String(selectedSourceUser?.user_id || user?.id || ''),
      ingredients:  JSON.stringify(ings),
    });

    router.push(`/stock?${params.toString()}`);
  };

  // ── Transaksi ──────────────────────────────────────────────
  // ✅ CHANGED: Track admin execution dan request_id yang digunakan
  const handlePayment = async (paymentMethod, tunai = 0) => {
    try {
      const sourceUserId = isAdmin
        ? (selectedSourceUser?.user_id || null)
        : null;

      const res = await createTransaction({
        payment_method: paymentMethod,
        sourceUserId: sourceUserId,
        items: items.map(i => ({ product_id: i.id, price: i.price, qty: i.qty })),
      });

      setLastTransaction({
        ...res.data,
        items,
        total,
        payment_method: paymentMethod,
        tunai,
        kembalian:  paymentMethod === 'cash' ? tunai - total : 0,
        kasir_name: isAdmin
          ? `Admin (${user?.name}) → ${selectedSourceUser?.user_name || 'Gudang'}`
          : user?.name,
        created_by_type: isAdmin ? 'admin' : 'kasir',
      });

      clearCart();
      setShowPayment(false);
      setShowMobileCart(false);
      setTimeout(() => handlePrint(), 400);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Transaksi gagal');
    }
  };

  // ── Filter produk ──────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchCat    = activeCategory === 'all' || p.category_id == activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday:'short', day:'numeric', month:'short', year:'numeric'
  });

  return (
    <AuthGuard>
      <AdminLayout noPadding>
        <div className="flex h-screen bg-slate-950 overflow-hidden">

          {/* ── MAIN PANEL ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* ── TOPBAR ── */}
            <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800
              px-4 sm:px-5 py-3 flex items-center gap-3 shrink-0 z-10 flex-wrap">

              {/* Clock */}
              <div className="flex flex-col items-center">
                <span className="text-white font-mono font-bold text-base leading-none">{timeStr}</span>
                <span className="text-slate-500 text-xs capitalize mt-0.5">{dateStr}</span>
              </div>

              <div className="flex-1" />

              {/* ── ADMIN: Pilih sumber stok ── */}
              {isAdmin && stockUsersList.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 text-xs shrink-0">Stok dari:</span>
                  {stockUsersList.map(u => {
                    const isSelected = selectedSourceUser?.user_id === u.user_id;
                    const hasStock   = Number(u.can_make || 0) > 0;
                    return (
                      <button key={u.user_id}
                        onClick={() => {
                          if (selectedSourceUser?.user_id === u.user_id) return;
                          setSelectedSourceUser({
                            user_id: u.user_id,
                            user_name: u.user_name,
                            role: u.role,
                            can_make: u.can_make,
                          });
                          clearCart();
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                          text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                            : hasStock
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                              : 'bg-slate-800/60 text-slate-600 border border-slate-700/40'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          hasStock ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div className="flex flex-col gap-0.5">
                          <span>{u.user_name}</span>
                          <span className="text-[10px] opacity-70">{u.can_make} porsi</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative hidden sm:flex items-center">
                <span className="absolute left-3 text-slate-500 pointer-events-none">
                  <SearchIcon />
                </span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="bg-slate-800 border border-slate-700 text-white text-sm
                    rounded-xl pl-9 pr-4 py-2 w-48 lg:w-56 outline-none
                    focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-500" />
              </div>

              {/* Kasir info */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30
                  flex items-center justify-center text-orange-400 text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'K'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-white text-xs font-medium leading-tight">{user?.name}</p>
                  <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
                </div>
              </div>

              <button onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                  text-slate-400 hover:text-red-400 hover:bg-red-400/10
                  border border-transparent hover:border-red-400/20 transition-all shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span className="hidden sm:inline">Keluar</span>
              </button>

              {/* Mobile cart */}
              <button onClick={() => setShowMobileCart(true)}
                className="relative lg:hidden p-2 text-slate-400 hover:text-white
                  bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all shrink-0">
                <CartIcon />
                <CartBadge count={itemCount} />
              </button>
            </header>

            {/* ── ADMIN MOBILE: source selector ── */}
            {isAdmin && stockUsersList.length > 0 && (
              <div className="sm:hidden px-4 py-2 bg-slate-900 border-b border-slate-800
                flex gap-2 overflow-x-auto scrollbar-hide items-center">
                <span className="text-slate-500 text-xs shrink-0">Stok:</span>
                {stockUsersList.map(u => {
                  const isSelected = selectedSourceUser?.user_id === u.user_id;
                  const hasStock   = Number(u.can_make || 0) > 0;
                  return (
                    <button key={u.user_id}
                      onClick={() => {
                        if (selectedSourceUser?.user_id === u.user_id) return;
                        setSelectedSourceUser({
                          user_id: u.user_id,
                          user_name: u.user_name,
                          role: u.role,
                          can_make: u.can_make,
                        });
                        clearCart();
                      }}
                      className={`shrink-0 flex flex-col gap-0.5 px-2.5 py-1.5
                        rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : hasStock
                            ? 'bg-slate-700 text-slate-300 border border-slate-600'
                            : 'bg-slate-800/60 text-slate-600 border border-slate-700/40'
                      }`}>
                      <span className="text-xs">{u.user_name}</span>
                      <span className="text-[10px] opacity-70">{u.can_make} porsi</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── MOBILE SEARCH ── */}
            <div className="sm:hidden px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-500 pointer-events-none">
                  <SearchIcon />
                </span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm
                    rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50
                    placeholder:text-slate-500" />
              </div>
            </div>

            {/* ── CATEGORY FILTER ── */}
            <div className="flex gap-2 px-4 sm:px-5 py-3 overflow-x-auto scrollbar-hide
              bg-slate-900/50 border-b border-slate-800/50 shrink-0">
              <button onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap
                  shrink-0 transition-all ${
                  activeCategory === 'all'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}>
                Semua
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap
                    shrink-0 transition-all ${
                    activeCategory === cat.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* ── PRODUCT GRID ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
              {!loading && (
                <p className="text-slate-600 text-xs mb-3">
                  {filtered.length} menu tersedia
                  {search && ` · "${search}"`}
                  {/* ✅ CHANGED: Tampilkan pengajuan dari kasir bukan stok */}
                  {isAdmin && selectedSourceUser && (
                    <span className="text-orange-400/70">
                      {' '}· pengajuan dari {selectedSourceUser.user_name}
                    </span>
                  )}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {loading
                  ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                  : filtered.length === 0
                    ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-4">🔍</div>
                        <p className="text-slate-400 font-medium">Menu tidak ditemukan</p>
                      </div>
                    )
                    : filtered.map(product => {
                      const stock    = getProductStock(product);
                      const inCart   = items.find(i => i.id === product.id);
                      const soldOut  = stock === 0;
                      const lowStock = stock > 0 && stock <= 3;
                      const selectedUserStock = isAdmin && selectedSourceUser
                        ? product.stock_by_user?.find(
                            (u) => u.user_id === selectedSourceUser.user_id
                          )
                        : null;
                      const ingredientStockMap = (selectedUserStock?.ingredients || []).reduce((acc, ing) => {
                        acc[ing.stock_item_id] = ing;
                        return acc;
                      }, {});

                      return (
                        <button key={product.id}
                          onClick={() => handleAddItem(product)}
                          className={`relative bg-slate-800/80 rounded-2xl text-left
                            border overflow-hidden transition-all duration-200 group
                            ${soldOut
                              ? 'border-slate-700/50 cursor-pointer'
                              : inCart
                                ? 'border-orange-500/60 shadow-lg shadow-orange-500/10'
                                : 'border-slate-700/60 hover:border-orange-500/40 active:scale-95'
                            }`}>

                          {/* In-cart badge */}
                          {inCart && (
                            <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-orange-500
                              rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg">
                              {inCart.qty}
                            </div>
                          )}

                          {/* Sold out overlay */}
                          {/* Sold out overlay — ganti bagian ini */}
                          {soldOut && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center
                              justify-center bg-slate-900/75 backdrop-blur-sm gap-1.5">
                              <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Stok Habis
                              </span>

                              {/* Admin: ajukan stok */}
                              {isAdmin && (
                                <span className="text-orange-400 text-[10px] font-semibold
                                  bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30
                                  flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 5v14M5 12h14"/>
                                  </svg>
                                  Ajukan Stok
                                </span>
                              )}

                              {/* Kasir: ajukan pengeluaran ke admin */}
                              {!isAdmin && (
                                <span className="text-orange-400 text-[10px] font-semibold
                                  bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30
                                  flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 5v14M5 12h14"/>
                                  </svg>
                                  Ajukan Stok
                                </span>
                              )}
                            </div>
                          )}

                          {/* Gambar */}
                          <div className="relative w-full h-28 bg-slate-700/60 overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','')}${product.image_url}`}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img src="/images/assets/logo.png" alt="Logo"
                                  className="w-12 h-12 object-contain opacity-30" />
                              </div>
                            )}
                            {product.category_name && (
                              <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80
                                text-slate-300 text-xs px-2 py-0.5 rounded-lg">
                                {product.category_name}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <p className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">
                              {product.name}
                            </p>
                            <p className="text-orange-400 font-bold text-sm">
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </p>

                            {/* Stok indicator */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                soldOut ? 'bg-red-500' : lowStock ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                              {/* Stok indicator — ganti baris teks soldOut */}
                              <span className={`text-xs ${
                                soldOut ? 'text-red-400' : lowStock ? 'text-yellow-400' : 'text-slate-500'
                              }`}>
                                {soldOut
                                  ? (isAdmin ? 'Tap untuk ajukan' : 'Tap untuk minta stok') // ← update kasir
                                  : `${stock} porsi`
                                }
                              </span>
                            </div>

                            {/* Admin: Expandable kasir info + ingredients */}
                            {isAdmin && selectedSourceUser && (
                              <div className="mt-2 space-y-1">
                                {/* Header - Always visible - Expandable Div */}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedProductId(
                                      expandedProductId === product.id ? null : product.id
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setExpandedProductId(
                                        expandedProductId === product.id ? null : product.id
                                      );
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  className="w-full text-left px-1.5 py-1 rounded-lg bg-slate-700/50
                                    border border-slate-600/40 text-slate-400 text-[10px]
                                    hover:bg-slate-700/70 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 flex-1">
                                      <span className="text-blue-400 font-semibold">👤</span>
                                      <span>{selectedSourceUser.user_name}</span>
                                      <span className="text-amber-400 font-bold">
                                        {stock} porsi
                                      </span>
                                    </div>
                                    <svg className={`w-3 h-3 transition-transform shrink-0 pointer-events-none ${
                                      expandedProductId === product.id ? 'rotate-180' : ''
                                    }`} fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedProductId === product.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-1.5 py-1.5 rounded-lg bg-slate-800/60
                                    border border-slate-600/30 text-[9px] text-slate-300 space-y-1.5 animate-in fade-in duration-200">
                                    
                                    {/* Ingredients Requested */}
                                    {product.ingredients?.length > 0 && (
                                      <div>
                                        <div className="text-amber-400 font-semibold mb-0.5 flex items-center gap-1">
                                          <span>📦</span> Bahan yang Dibutuhkan
                                        </div>
                                        <div className="space-y-0.5 pl-4">
                                          {product.ingredients.map((ing, idx) => {
                                            const availableQty = Number(
                                              ingredientStockMap[ing.stock_item_id]?.available_qty || 0
                                            );
                                            const requiredPerPortion = Number(ing.qty || 1);
                                            const canMakePortion = Math.floor(availableQty / requiredPerPortion);
                                            const statusColor = availableQty === 0 
                                              ? 'text-red-400' 
                                              : canMakePortion <= 3 
                                              ? 'text-yellow-400' 
                                              : 'text-green-400';
                                            
                                            return (
                                              <div key={idx} className="flex justify-between items-start gap-2">
                                                <span className="text-slate-300">
                                                  {ing.ingredient_name}
                                                </span>
                                                <span className={`font-semibold whitespace-nowrap ${statusColor}`}>
                                                  {availableQty} {ing.unit}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Stock Availability Summary */}
                                    <div className="pt-0.5 border-t border-slate-600/40">
                                      <div className="text-blue-400 font-semibold mb-0.5 flex items-center gap-1">
                                        <span>📊</span> Ketersediaan
                                      </div>
                                      <div className="space-y-0.5 pl-4">
                                        <div className="flex justify-between">
                                          <span>Dari Pengajuan:</span>
                                          <span className="text-green-400 font-semibold">
                                            {(() => {
                                              const firstIng = product.ingredients?.[0];
                                              if (!firstIng) return '0';
                                              const firstAvailable = Number(
                                                ingredientStockMap[firstIng.stock_item_id]?.available_qty || 0
                                              );
                                              return `${firstAvailable} ${firstIng.unit || ''}`;
                                            })()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Komponen Resep:</span>
                                          <span className="text-orange-400 font-semibold">
                                            {product.ingredients?.length || 0} bahan
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-600/30 pt-0.5 mt-0.5">
                                          <span className="font-semibold">Bisa Buat:</span>
                                          <span className="text-amber-400 font-bold">
                                            {stock} porsi
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Request Status */}
                                    <div className="pt-0.5 text-[8px] italic text-slate-500 flex items-center gap-1">
                                      <span className="text-green-400 text-xs">OK</span>
                                      <span>Stok dihitung dari pengajuan yang disetujui</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                }
              </div>
              <div className="h-4 lg:hidden" />
            </div>

            {/* ── MOBILE BOTTOM BAR ── */}
            {itemCount > 0 && (
              <div className="lg:hidden shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-3">
                <button onClick={() => setShowMobileCart(true)}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold
                    rounded-2xl px-4 py-3.5 flex items-center justify-between
                    shadow-xl shadow-orange-500/30 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-sm font-black">
                      {itemCount}
                    </div>
                    <span className="text-sm">Lihat Pesanan</span>
                  </div>
                  <span className="font-black">Rp {total.toLocaleString('id-ID')}</span>
                </button>
              </div>
            )}
          </div>

          {/* ── DESKTOP CART ── */}
          <div className="hidden lg:flex">
            <Cart onCheckout={() => setShowPayment(true)} />
          </div>

          {/* ── MOBILE CART DRAWER ── */}
          {showMobileCart && (
            <>
              <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
                onClick={() => setShowMobileCart(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900
                rounded-t-3xl border-t border-slate-700 max-h-[85vh] flex flex-col animate-slide-up">
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
                  <h3 className="text-white font-bold text-base">Pesanan</h3>
                  <button onClick={() => setShowMobileCart(false)}
                    className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Cart onCheckout={() => { setShowMobileCart(false); setShowPayment(true); }} mobile />
                </div>
              </div>
            </>
          )}

          {showPayment && (
            <PaymentModal total={total} itemCount={itemCount}
              onPay={handlePayment} onClose={() => setShowPayment(false)} />
          )}

          <div className="hidden">
            <Receipt ref={receiptRef} transaction={lastTransaction} />
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.32,0.72,0,1); }
        `}</style>
      </AdminLayout>
    </AuthGuard>
  );
}
