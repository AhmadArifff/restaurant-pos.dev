'use client';
import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getProducts, getCategories, deleteProduct, getStockItems } from '@/lib/api';
import api from '@/lib/axios';
import { resolveAssetUrl } from '@/lib/assetUrl';
// Di app/pos/page.js atau wherever kasir lihat produk
import { getMyStockProducts } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getStockByKasir } from '@/lib/api';

const emptyForm = { name: '', price: '', category_id: '', ingredients: [] };

export default function ProductsPage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editing, setEditing]       = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setPreview]  = useState(null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);
  const fileRef = useRef();
  const { user } = useAuthStore();

  useEffect(() => {
    // Kasir pakai my-stock, admin pakai semua
    const fetchFn = user?.role === 'kasir' ? getMyStockProducts : getProducts;
    fetchFn().then(r => setProducts(r.data));
  }, [user]);

  // Tambah state baru
  const [stockByKasir, setStockByKasir]   = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const toggleKasir = (id) =>
  setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const load = () => getProducts().then(r => setProducts(r.data));

  useEffect(() => {
    load();
    getCategories().then(r => setCategories(r.data));
    getStockItems().then(r => setStockItems(r.data));
    // Tambahkan ini — hanya untuk admin
    if (user?.role !== 'kasir') {
      getStockByKasir().then(r => setStockByKasir(r.data));
    }
  }, []);

  const openAdd = () => {
    setForm(emptyForm); setEditing(null);
    setImageFile(null); setPreview(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, price: p.price,
      category_id: p.category_id || '',
      ingredients: p.ingredients || [],
    });
    setEditing(p.id);
    setPreview(p.image_url ? resolveAssetUrl(p.image_url) : null);
    setImageFile(null);
    setModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const addIngredient = () => {
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { stock_item_id: '', qty: 1 }] }));
  };

  const updateIngredient = (idx, key, val) => {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => i === idx ? { ...ing, [key]: val } : ing)
    }));
  };

  const removeIngredient = (idx) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('category_id', form.category_id);
      fd.append('ingredients', JSON.stringify(form.ingredients.filter(i => i.stock_item_id)));
      if (imageFile) fd.append('image', imageFile);

      if (editing) await api.put(`/products/${editing}`, fd);
      else         await api.post('/products', fd);

      await load();
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    try { await deleteProduct(id); await load(); }
    catch (err) { alert(err.response?.data?.message || 'Gagal menghapus'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const getAdminCanMake = (product) => {
    const perKasir = stockByKasir?.[product.id];
    if (!Array.isArray(perKasir) || perKasir.length === 0) {
      return Number(product.stock || 0);
    }
    return perKasir.reduce((sum, row) => sum + Number(row.can_make || 0), 0);
  };

  // Hitung HPP (Harga Pokok Produksi) dari ingredients yang dipilih
  // const hitungHPP = (ingredients, stockItems) => {
  //   return ingredients.reduce((total, ing) => {
  //     const item = stockItems.find(s => s.id == ing.stock_item_id);
  //     if (!item) return total;
  //     const ppu = item.stock > 0
  //       ? Number(item.total_price) / item.stock : 0;
  //     return total + (ppu * Number(ing.qty));
  //   }, 0);
  // };

  // GANTI fungsi hitungHPP ini:
  const hitungHPP = (ingredients, stockItems) => {
    return ingredients.reduce((total, ing) => {
      const item = stockItems.find(s => s.id == ing.stock_item_id);
      if (!item || !ing.stock_item_id) return total;

      // ✅ Pakai price_per_unit (moving average dari recalcStockItem)
      // bukan total_price/stock yang tidak akurat
      const ppu = Number(item.price_per_unit || 0);
      const qty = parseFloat(ing.qty) || 0;
      return total + (ppu * qty);
    }, 0);
  };

  const hpp = hitungHPP(form.ingredients, stockItems);
  const hargaValid = !form.price || Number(form.price) >= hpp;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Produk</h1>
            <p className="text-slate-400 text-sm mt-1">{products.length} produk terdaftar</p>
          </div>
          <button onClick={openAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
            + Tambah Produk
          </button>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 border border-slate-700"/>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Gambar */}
              <div className="w-full h-32 bg-slate-700 flex items-center justify-center overflow-hidden">
                {p.image_url
                  ? <img src={resolveAssetUrl(p.image_url)} alt={p.name}
                      className="w-full h-full object-cover"/>
                  : <span className="text-4xl">🌯</span>
                }
              </div>
              <div className="p-3">
                <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                <p className="text-orange-400 font-bold text-sm mt-0.5">
                  Rp {Number(p.price).toLocaleString('id-ID')}
                </p>
                <p className="text-slate-400 text-xs mt-1">{p.category_name || '-'}</p>

                {/* Ingredients badge */}
                {p.ingredients?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.ingredients.slice(0, 3).map((ing, i) => (
                      <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-lg">
                        {ing.ingredient_name} ×{ing.qty}
                      </span>
                    ))}
                    {p.ingredients.length > 3 && (
                      <span className="text-slate-500 text-xs">+{p.ingredients.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stok estimasi */}
                {/* <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {p.stock === 0 ? '⚠ Habis' : `Bisa buat: ${p.stock}`}
                  </span>
                </div> */}
                {/* Di card produk, ganti bagian stok */}
                <div className="mt-2">
                  {user?.role === 'kasir' ? (
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-bold ${
                        p.stock === 0 ? 'text-red-400' :
                        p.stock <= 3  ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {p.stock === 0 ? '⚠ Stok habis' : `Stok kamu: ${p.stock}`}
                      </span>
                      {p.stock === 0 && (
                        <span className="text-slate-600 text-xs">Ajukan stok ke admin</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Total bisa buat dari akumulasi per kasir + tombol expand */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          getAdminCanMake(p) === 0 ? 'text-red-400' :
                          getAdminCanMake(p) <= 5  ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {getAdminCanMake(p) === 0 ? '⚠ Habis' : `Bisa buat: ${getAdminCanMake(p)}`}
                        </span>

                        {stockByKasir[p.id]?.length > 0 && (
                          <button
                            onClick={() => toggleKasir(p.id)}
                            className="text-slate-500 hover:text-orange-400 text-[10px] border border-slate-700 hover:border-orange-500 rounded-md px-1.5 py-0.5 transition-colors flex items-center gap-1"
                          >
                            <span className={`inline-block transition-transform duration-150 ${
                              expandedCards[p.id] ? 'rotate-90' : ''
                            }`}>▶</span>
                            per kasir
                          </button>
                        )}
                      </div>

                      {/* Breakdown stok per kasir */}
                      {expandedCards[p.id] && (
                        <div className="mt-1.5 rounded-lg border border-slate-700 overflow-hidden">
                          {stockByKasir[p.id].map(k => (
                            <div key={k.kasir_id}
                              className="flex justify-between items-center px-2 py-1
                                        border-b border-slate-800 last:border-b-0
                                        bg-slate-900 text-xs">
                              <span className="text-slate-400 truncate">{k.kasir_name}</span>
                              <span className={`font-bold ml-2 shrink-0 ${
                                k.can_make === 0 ? 'text-red-400' :
                                k.can_make <= 3  ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {k.can_make === 0 ? '—' : k.can_make}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-blue-400 text-xs font-medium py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-red-400 text-xs font-medium py-1.5 rounded-lg transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah/Edit Produk */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 my-4">
            <h2 className="text-white font-bold text-xl mb-5">
              {editing ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Upload Gambar */}
              <div>
                <label className="text-slate-400 text-sm">Gambar Produk</label>
                <div
                  onClick={() => fileRef.current.click()}
                  className="mt-1 w-full h-36 bg-slate-700 rounded-xl border-2 border-dashed border-slate-600 hover:border-orange-500 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover"/>
                    : <div className="text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <p className="text-slate-400 text-sm">Klik untuk upload gambar</p>
                        <p className="text-slate-500 text-xs">JPG, PNG, WEBP maks 2MB</p>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleImage} className="hidden"/>
              </div>

              {/* Nama & Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Nama Produk</label>
                  <input value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required placeholder="Kebab Original"
                    className="w-full mt-1 bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Harga (Rp)</label>
                  <input type="number" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    required placeholder="15000"
                    className="w-full mt-1 bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"/>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="text-slate-400 text-sm">Kategori</label>
                <select value={form.category_id}
                  onChange={e => setForm({...form, category_id: e.target.value})}
                  className="w-full mt-1 bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Ingredients / Resep */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-400 text-sm">Bahan Baku (Resep)</label>
                  <button type="button" onClick={addIngredient}
                    className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                    + Tambah Bahan
                  </button>
                </div>
                <div className="space-y-2">
                  {form.ingredients.map((ing, idx) => {
                    // Cari item yang dipilih untuk ambil satuannya
                    const selectedStock = stockItems.find(s => s.id == ing.stock_item_id);

                    return (
                      <div key={idx} className="flex gap-2 items-center">

                        {/* Pilih bahan */}
                        <select
                          value={ing.stock_item_id}
                          onChange={e => updateIngredient(idx, 'stock_item_id', e.target.value)}
                          className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">-- Pilih Bahan --</option>
                          {stockItems.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.unit})
                            </option>
                          ))}
                        </select>

                        {/* Input qty — pakai desimal step 0.01 */}
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={ing.qty}
                          onChange={e => updateIngredient(idx, 'qty', e.target.value)}
                          className="w-20 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="1"
                        />

                        {/* Satuan dari stock item — bukan hardcode pcs */}
                        <span className="text-slate-400 text-xs w-10 shrink-0 text-left">
                          {selectedStock ? selectedStock.unit : '—'}
                        </span>

                        {/* Tombol hapus */}
                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className="text-red-400 hover:text-red-300 text-lg leading-none transition-colors shrink-0"
                        >×</button>
                      </div>
                    );
                  })}
                  {/* {form.ingredients.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-3 bg-slate-700/50 rounded-xl">
                      Belum ada bahan — klik "+ Tambah Bahan" untuk menambahkan resep
                    </p>
                  )} */}
                  {/* Preview HPP & Validasi Harga */}
                  {form.ingredients.length > 0 && (
                    <div className={`rounded-xl p-4 border ${
                      hargaValid
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <p className="text-slate-300 text-sm font-semibold mb-2">
                        Estimasi Biaya Produksi (HPP)
                      </p>

                      {/* Rincian per bahan */}
                      <div className="space-y-1 mb-3">
                        {form.ingredients.map((ing, idx) => {
                          const item = stockItems.find(s => s.id == ing.stock_item_id);
                          if (!item || !ing.stock_item_id) return null;
                          // const ppu      = item.stock > 0 ? Number(item.total_price) / item.stock : 0;
                          const ppu = Number(item.price_per_unit || 0);
                          const subtotal = ppu * Number(ing.qty);
                          return (
                            <div key={idx} className="flex justify-between text-xs text-slate-400">
                              <span>{item.name} × {ing.qty} {item.unit}</span>
                              <span>Rp {Math.round(subtotal).toLocaleString('id-ID')}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total HPP */}
                      <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                        <span className="text-sm text-slate-300 font-semibold">Total HPP</span>
                        <span className="text-blue-400 font-bold">
                          Rp {Math.round(hpp).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Margin kalau harga sudah diisi */}
                      {form.price && Number(form.price) > 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-slate-400">Margin keuntungan</span>
                          <span className={`text-xs font-bold ${
                            Number(form.price) >= hpp ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {Number(form.price) >= hpp
                              ? `+Rp ${Math.round(Number(form.price) - hpp).toLocaleString('id-ID')} (${Math.round(((Number(form.price) - hpp) / hpp) * 100)}%)`
                              : `⚠ Rugi Rp ${Math.round(hpp - Number(form.price)).toLocaleString('id-ID')}`
                            }
                          </span>
                        </div>
                      )}

                      {/* Warning kalau harga kurang dari HPP */}
                      {!hargaValid && form.price && (
                        <div className="mt-2 text-red-400 text-xs font-semibold">
                          ⚠ Harga jual tidak boleh kurang dari HPP (Rp {Math.round(hpp).toLocaleString('id-ID')})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 transition-colors">
                  Batal
                </button>
                {/* <button type="submit" disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl py-3 transition-colors">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button> */}
                <button
                  type="submit"
                  disabled={loading || !hargaValid}
                  title={!hargaValid ? `Harga minimal Rp ${Math.round(hpp).toLocaleString('id-ID')}` : ''}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition-colors"
                >
                  {loading ? 'Menyimpan...' : !hargaValid ? `Min. Rp ${Math.round(hpp).toLocaleString('id-ID')}` : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
