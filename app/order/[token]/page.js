'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createCustomerOrder,
  getCustomerMenu,
  getCustomerOrder,
  getDiningTableByToken,
  submitCustomerOrderReview,
} from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assetUrl';

const statusSteps = [
  { key: 'pending', label: 'Menunggu Kasir', desc: 'Pesanan sudah masuk ke dashboard kasir.' },
  { key: 'accepted', label: 'Diterima', desc: 'Kasir/admin sudah menerima pesanan.' },
  { key: 'preparing', label: 'Sedang Disiapkan', desc: 'Menu sedang dibuat oleh tim.' },
  { key: 'ready', label: 'Siap Diantar', desc: 'Pesanan siap disajikan ke meja.' },
  { key: 'completed', label: 'Selesai', desc: 'Pesanan selesai. Silakan beri review.' },
];

const formatRp = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function CustomerOrderPage() {
  const params = useParams();
  const token = params?.token;
  const storageKey = token ? `customer-order-${token}` : '';

  const [table, setTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [order, setOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({ service_rating: 5, service_comment: '', items: {} });
  const [discountAlert, setDiscountAlert] = useState(null);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const load = async () => {
      const savedOrderCode = storageKey ? localStorage.getItem(storageKey) : null;
      const tableRes = await getDiningTableByToken(token);
      const menuRes = await getCustomerMenu({ branch_id: tableRes.data?.branch_id });
      const orderRes = savedOrderCode ? await getCustomerOrder(savedOrderCode).catch(() => null) : null;
      if (!mounted) return;
      setTable(tableRes.data);
      setProducts(menuRes.data || []);
      if (orderRes?.data) setOrder(orderRes.data);
      setLoading(false);
    };

    load().catch(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [token, storageKey]);

  useEffect(() => {
    if (!order?.order_code || order.status === 'completed' || order.status === 'cancelled') return;

    const interval = window.setInterval(() => {
      getCustomerOrder(order.order_code)
        .then((res) => setOrder(res.data))
        .catch(() => {});
    }, 6000);

    return () => window.clearInterval(interval);
  }, [order?.order_code, order?.status]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      if (product.category_id) map.set(String(product.category_id), product.category_name || 'Menu');
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = products.filter((product) =>
    activeCategory === 'all' || String(product.category_id) === String(activeCategory)
  );

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product) => {
    if (Number(product.stock || 0) <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= Number(product.stock || 0)) return prev;
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1, note: '' }];
    });
  };

  const changeQty = (productId, delta) => {
    setCart((prev) => prev
      .map((item) => item.id === productId ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
      .filter((item) => item.qty > 0));
  };

  const submitOrder = async () => {
    if (!cart.length) return alert('Pilih menu terlebih dahulu');
    setSubmitting(true);
    try {
      const res = await createCustomerOrder({
        table_token: token,
        customer_name: customerName,
        customer_phone: customerPhone,
        note,
        items: cart.map((item) => ({ product_id: item.id, qty: item.qty, note: item.note || null })),
      });
      const nextOrder = res.data.data;
      setOrder(nextOrder);
      setCart([]);
      if (storageKey) localStorage.setItem(storageKey, nextOrder.order_code);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async () => {
    const itemReviews = (order?.items || []).map((item) => ({
      order_item_id: item.id,
      rating: Number(review.items[item.id]?.rating || 5),
      comment: review.items[item.id]?.comment || '',
    }));

    try {
      const res = await submitCustomerOrderReview(order.order_code, {
        service_rating: Number(review.service_rating || 5),
        service_comment: review.service_comment,
        items: itemReviews,
      });
      setOrder(res.data.data);
      setDiscountAlert(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim review');
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0A06] text-[#C9A84C]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C]" />
      </main>
    );
  }

  if (!table) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0A06] p-6 text-center text-[#F5EDD8]">
        <div>
          <h1 className="font-serif text-4xl font-black">QR meja tidak aktif</h1>
          <p className="mt-3 text-[#EDE0C4]/70">Silakan pilih meja lain atau hubungi kasir.</p>
          <Link href="/order" className="mt-6 inline-flex rounded-2xl bg-[#C9A84C] px-5 py-3 font-bold text-[#0D0A06]">Pilih Meja</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0A06] text-[#F5EDD8]">
      <header className="sticky top-0 z-40 border-b border-[#C9A84C]/15 bg-[#0D0A06]/92 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">Sultan Kebab</p>
            <h1 className="text-xl font-black">Meja {table.table_number}</h1>
          </div>
          <Link href="/order" className="rounded-full border border-[#C9A84C]/35 px-4 py-2 text-sm text-[#C9A84C]">Ganti Meja</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-5 rounded-[2rem] border border-[#C9A84C]/18 bg-[#1A1409] p-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">Pesan langsung dari meja</p>
            <h2 className="mt-2 font-serif text-3xl font-black">Pilih menu favorit Anda</h2>
            <p className="mt-2 text-sm leading-7 text-[#EDE0C4]/70">
              Pesanan akan masuk ke kasir, lalu statusnya bisa Anda pantau dari halaman ini.
            </p>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeCategory === 'all' ? 'bg-[#C9A84C] text-[#0D0A06]' : 'bg-[#1A1409] text-[#EDE0C4]'}`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeCategory === category.id ? 'bg-[#C9A84C] text-[#0D0A06]' : 'bg-[#1A1409] text-[#EDE0C4]'}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const soldOut = Number(product.stock || 0) <= 0;
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                  className="overflow-hidden rounded-[1.6rem] border border-[#C9A84C]/16 bg-[#1A1409]"
                >
                  <div className="h-44 overflow-hidden bg-[#241C0E]">
                    {product.image_url ? (
                      <img src={resolveAssetUrl(product.image_url)} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-5xl">K</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#EDE0C4]/58">{product.category_name || 'Menu'}</p>
                      </div>
                      <strong className="text-[#C9A84C]">{formatRp(product.price)}</strong>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${soldOut ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                        {soldOut ? 'Stok habis' : `${product.stock} porsi tersedia`}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={soldOut}
                        className="rounded-xl bg-[#C9A84C] px-4 py-2 text-sm font-black text-[#0D0A06] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <AnimatePresence mode="wait">
            {order ? (
              <motion.div
                key="order-status"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                className="rounded-[2rem] border border-[#C9A84C]/20 bg-[#1A1409] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">Riwayat Pesanan</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black">{order.order_code}</h2>
                  <span className="rounded-full bg-[#C9A84C]/15 px-3 py-1 text-xs font-black uppercase text-[#C9A84C]">{order.status}</span>
                </div>

                <div className="mt-5 space-y-3">
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.findIndex((item) => item.key === order.status);
                    const active = index <= currentIndex;
                    return (
                      <div key={step.key} className="flex gap-3">
                        <span className={`mt-1 h-4 w-4 rounded-full border ${active ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#C9A84C]/25'}`} />
                        <div>
                          <p className={`font-bold ${active ? 'text-[#F5EDD8]' : 'text-[#EDE0C4]/45'}`}>{step.label}</p>
                          <p className="text-xs leading-5 text-[#EDE0C4]/55">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-3xl bg-[#241C0E] p-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 border-b border-[#C9A84C]/10 py-2 last:border-0">
                      <span className="text-sm">{item.product_name} x{item.qty}</span>
                      <strong className="text-sm text-[#C9A84C]">{formatRp(item.subtotal)}</strong>
                    </div>
                  ))}
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Total</span>
                    <strong>{formatRp(order.final_total || order.subtotal)}</strong>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div className="mt-1 flex justify-between text-xs text-emerald-300">
                      <span>Diskon review {order.discount_rate}%</span>
                      <strong>-{formatRp(order.discount_amount)}</strong>
                    </div>
                  )}
                </div>

                {order.status === 'completed' && !order.reviewed_at && (
                  <div className="mt-5 rounded-3xl border border-[#C9A84C]/20 bg-[#0D0A06]/55 p-4">
                    <p className="font-black text-[#C9A84C]">Review semua menu dan dapatkan diskon 5%</p>
                    <label className="mt-4 block text-sm font-bold">Rating pelayanan</label>
                    <select
                      value={review.service_rating}
                      onChange={(e) => setReview((prev) => ({ ...prev, service_rating: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-[#C9A84C]/20 bg-[#1A1409] px-3 py-2 text-[#F5EDD8]"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} bintang</option>)}
                    </select>
                    <textarea
                      value={review.service_comment}
                      onChange={(e) => setReview((prev) => ({ ...prev, service_comment: e.target.value }))}
                      placeholder="Masukan untuk pelayanan..."
                      className="mt-3 w-full rounded-xl border border-[#C9A84C]/20 bg-[#1A1409] px-3 py-2 text-sm text-[#F5EDD8] outline-none"
                    />
                    <div className="mt-3 space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-[#241C0E] p-3">
                          <p className="text-sm font-bold">{item.product_name}</p>
                          <select
                            value={review.items[item.id]?.rating || 5}
                            onChange={(e) => setReview((prev) => ({
                              ...prev,
                              items: { ...prev.items, [item.id]: { ...prev.items[item.id], rating: e.target.value } },
                            }))}
                            className="mt-2 w-full rounded-xl border border-[#C9A84C]/20 bg-[#1A1409] px-3 py-2 text-sm"
                          >
                            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} bintang</option>)}
                          </select>
                          <input
                            value={review.items[item.id]?.comment || ''}
                            onChange={(e) => setReview((prev) => ({
                              ...prev,
                              items: { ...prev.items, [item.id]: { ...prev.items[item.id], comment: e.target.value } },
                            }))}
                            placeholder="Komentar menu ini..."
                            className="mt-2 w-full rounded-xl border border-[#C9A84C]/20 bg-[#1A1409] px-3 py-2 text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <button onClick={submitReview} className="mt-4 w-full rounded-2xl bg-[#C9A84C] py-3 font-black text-[#0D0A06]">
                      Kirim Review dan Ambil Diskon
                    </button>
                  </div>
                )}

                {discountAlert && (
                  <div className="mt-5 rounded-3xl border border-emerald-400/25 bg-emerald-500/12 p-4 text-sm text-emerald-100">
                    Diskon 5% berhasil diterapkan. Potongan: {formatRp(discountAlert.discount_amount)}.
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                className="rounded-[2rem] border border-[#C9A84C]/20 bg-[#1A1409] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C9A84C]">Keranjang Meja {table.table_number}</p>
                <h2 className="mt-2 text-2xl font-black">{itemCount} item</h2>

                <div className="mt-5 space-y-3">
                  {cart.length === 0 && <p className="rounded-3xl bg-[#241C0E] p-5 text-sm text-[#EDE0C4]/65">Belum ada menu dipilih.</p>}
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-3xl bg-[#241C0E] p-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-sm text-[#C9A84C]">{formatRp(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(item.id, -1)} className="h-8 w-8 rounded-full bg-[#1A1409] font-black">-</button>
                          <span className="w-6 text-center font-black">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="h-8 w-8 rounded-full bg-[#C9A84C] font-black text-[#0D0A06]">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama pelanggan (opsional)" className="w-full rounded-2xl border border-[#C9A84C]/20 bg-[#0D0A06] px-4 py-3 outline-none" />
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="No. HP (opsional)" className="w-full rounded-2xl border border-[#C9A84C]/20 bg-[#0D0A06] px-4 py-3 outline-none" />
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan pesanan..." className="w-full rounded-2xl border border-[#C9A84C]/20 bg-[#0D0A06] px-4 py-3 outline-none" />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#C9A84C]/15 pt-4">
                  <span className="text-sm text-[#EDE0C4]/70">Total</span>
                  <strong className="text-2xl text-[#C9A84C]">{formatRp(total)}</strong>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={submitting || !cart.length}
                  className="mt-4 w-full rounded-2xl bg-[#C9A84C] py-3 font-black uppercase tracking-[0.16em] text-[#0D0A06] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pesanan'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </main>
  );
}
