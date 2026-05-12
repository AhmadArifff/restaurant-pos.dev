'use client';
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import SuccessModal from '@/components/stock/SuccessModal';
import {
  getStockItems, createStockItem, updateStockItem, deleteStockItem,
  getMainStockSummary, getMainStockMonthly, getMainStockDaily,
  addStockPurchase, getAllStockRequests, getMyStockRequests,
  submitStockRequest, deleteStockRequest, approveStockRequest,
  updateStockPurchase, deleteStockPurchase, addManualStockOut,
  getUsers,resubmitStockRequest
} from '@/lib/api';
// Di AdminStockPage — tambah useEffect untuk baca query params dari POS
import { useSearchParams } from 'next/navigation';
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun',
                'Jul','Agu','Sep','Okt','Nov','Des'];

const UNIT_GROUPS = [
  { label: 'Bahan Utama',  units: ['Kilogram','Gram','Kiloan','Butir','Buah','Ikat','Lembar','Pak','Kaleng'] },
  { label: 'Saus & Bumbu', units: ['Liter','Botol','Pouch','Sachet','Blok'] },
  { label: 'Packaging',    units: ['Pcs','Lusin'] },
];
// Format qty — tampilkan desimal hanya jika perlu
function fmtQty(val) {
  const n = Number(val || 0);
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
}
// ── Shared UI ─────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
               : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}>
      {children}
    </button>
  );
}

function SubTab({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        active ? 'bg-orange-500 text-white'
               : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
      }`}>
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', label: '⏳ Menunggu'  },
    approved: { cls: 'bg-green-500/15  text-green-400  border-green-500/20',  label: '✓ Disetujui' },
    rejected: { cls: 'bg-red-500/15    text-red-400    border-red-500/20',    label: '✕ Ditolak'   },
  };
  const s = map[status] || map.pending;
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${s.cls}`}>{s.label}</span>;
}

const thC = 'text-left text-slate-500 text-xs font-semibold px-4 py-3 whitespace-nowrap';
const tdC = 'px-4 py-3 text-sm';
const trC = (i) => `border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${i%2?'bg-slate-700/10':''}`;

function EmptyState({ icon = '📋', title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-slate-400 font-medium">{title}</p>
      {sub && <p className="text-slate-600 text-sm mt-1">{sub}</p>}
    </div>
  );
}

// ── ADMIN VIEW ────────────────────────────────────────────────
function AdminStockPage({ successModal, setSuccessModal }) {
  const [tab,     setTab]     = useState('master');
  const [mainTab, setMainTab] = useState('summary');

  // Master
  const [stockItems,  setStockItems]  = useState([]);
  const [showForm,    setShowForm]    = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [formData,    setFormData]    = useState({ name:'', unit:'Pcs', min_stock:'' });
  const [formLoading, setFormLoading] = useState(false);

  // Gudang
  const [summary,  setSummary]  = useState([]);
  const [monthly,  setMonthly]  = useState([]);
  const [daily,    setDaily]    = useState([]);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear,  setSelYear]  = useState(new Date().getFullYear());
  const [selDate,  setSelDate]  = useState(new Date().toISOString().split('T')[0]);

  // ✅ FIX: pindahkan selDateTo ke SINI, sebelum loadDaily
  const [selDateTo, setSelDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Pembelian
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchItems,   setPurchItems]   = useState([{ stock_item_id:'', qty:'', cost_per_unit:'' }]);
  const [purchNote,    setPurchNote]    = useState('');
  const [purchLoading, setPurchLoading] = useState(false);

  // Pengajuan
  const [requests,     setRequests]     = useState([]);
  const [reqDate,      setReqDate]      = useState(new Date().toISOString().split('T')[0]);
  const [reqStatus,    setReqStatus]    = useState('pending');
  const [approveModal, setApproveModal] = useState(null);
  const [approveItems, setApproveItems] = useState([]);

  // Tambah setelah state existing di AdminStockPage
  const [editPurchase,  setEditPurchase]  = useState(null); // { id, item }
  const [reqDateFrom,   setReqDateFrom]   = useState('');
  const [reqDateTo,     setReqDateTo]     = useState('');
  // Filter: hanya bahan yang punya stok dari main_stock (bukan stock_items.stock)
  // Gunakan summary yang sudah di-load
  const availableForOut = summary.filter(s => Number(s.current_stock) > 0);
  const [users,      setUsers]      = useState([]);
  const [outUserId,  setOutUserId]  = useState('');

  // Tambah state di AdminStockPage (setelah state daily)
  const [outTypeFilter, setOutTypeFilter] = useState('all');

  // // Update loadDaily — tambah type_filter
  // const loadDaily = useCallback(() =>
  //   getMainStockDaily({
  //     date_from:   selDate,
  //     date_to:     selDateTo || selDate,
  //     type_filter: outTypeFilter !== 'all' ? outTypeFilter : undefined,
  //   }).then(r => setDaily(Array.isArray(r.data) ? r.data : [])),
  //   [selDate, selDateTo, outTypeFilter]);

  // ✅ FIX: sekarang selDateTo sudah dideklarasikan sebelumnya — tidak ada error
  const loadDaily = useCallback(() =>
    getMainStockDaily({
      date_from:   selDate,
      date_to:     selDateTo || selDate,
      type_filter: outTypeFilter !== 'all' ? outTypeFilter : undefined,
    }).then(r => setDaily(Array.isArray(r.data) ? r.data : [])),
    [selDate, selDateTo, outTypeFilter]);

  // Tambah useEffect reload saat filter berubah
  useEffect(() => {
    if (tab === 'main' && mainTab === 'out') loadDaily();
  }, [outTypeFilter]);

  // Definisi filter — sama untuk admin & kasir
  const OUT_FILTERS = [
    { val: 'all',         label: 'Semua'          },
    { val: 'approved',    label: '✓ Sudah Keluar' },
    { val: 'pending',     label: '⏳ Menunggu'     },
    { val: 'rejected',    label: '✕ Ditolak'       },
    { val: 'transaction', label: '🧾 Transaksi POS'},
    { val: 'manual',      label: '📋 Manual Kasir' },
  ];

  // Warna badge per status
  function TypeBadge({ type, status }) {
    if (type === 'transaction') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
        🧾 Transaksi
      </span>
    );
    if (type === 'pending_out' && status === 'pending') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
        📋 Menunggu
      </span>
    );
    if (type === 'pending_out' && status === 'rejected') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
        📋 Ditolak
      </span>
    );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
        📦 Keluar
      </span>
    );
  }

  // Di AdminStockPage, merge stockItems dengan summary untuk tampilkan stok yang akurat
  const stockItemsWithSummary = stockItems.map(item => {
    const sum = summary.find(s => s.id === item.id);
    return {
      ...item,
      display_stock:     sum ? Number(sum.current_stock)  : Number(item.stock),
      display_price_per: sum && Number(sum.total_in) > 0
        ? Math.round(Number(sum.total_cost_in) / Number(sum.total_in))
        : Number(item.price_per_unit || 0),
    };
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const fromPos     = searchParams.get('from') === 'pos';
    const ingredients = searchParams.get('ingredients');
    const userId      = searchParams.get('user_id');
    const productName = searchParams.get('product_name');

    if (fromPos && ingredients) {
      try {
        const parsedIngs = JSON.parse(ingredients);
        // Auto-fill form pengeluaran
        setTab('main');
        setMainTab('out');
        setShowOutForm(true);
        setOutItems(parsedIngs.map(ing => ({
          stock_item_id: String(ing.stock_item_id),
          qty: '',
          note: `Stok untuk ${productName || 'produk'}`,
        })));
        if (userId) setOutUserId(userId);
      } catch (_) {}
    }
  }, [searchParams]);

  // Load users saat component mount
  useEffect(() => {
    getUsers().then(r => setUsers(r.data)).catch(() => {});
  }, []);
  // Ganti reqDate dengan range
  const [reqDateFrom2,  setReqDateFrom2]  = useState(new Date().toISOString().split('T')[0]);
  const [reqDateTo2,    setReqDateTo2]    = useState(new Date().toISOString().split('T')[0]);

  // Form pengeluaran manual
  const [showOutForm,   setShowOutForm]   = useState(false);
  const [outItems,      setOutItems]      = useState([{ stock_item_id:'', qty:'', note:'' }]);
  const [outLoading,    setOutLoading]    = useState(false);

  // const [selDateTo, setSelDateTo] = useState(new Date().toISOString().split('T')[0]);

  const loadRequests = useCallback(() =>
  getAllStockRequests({
    date_from: reqDateFrom2 || undefined,
    date_to:   reqDateTo2   || undefined,
    status:    reqStatus    || undefined,
  }).then(r => setRequests(r.data)),
  [reqDateFrom2, reqDateTo2, reqStatus]);
  // const loadDaily = useCallback(() =>
  // getMainStockDaily({ date_from: selDate, date_to: selDateTo || selDate })
  //   .then(r => setDaily(r.data)), [selDate, selDateTo]);

  const loadMaster   = useCallback(() => getStockItems().then(r => setStockItems(r.data)), []);
  // const loadSummary  = useCallback(() => getMainStockSummary().then(r => setSummary(r.data)), []);
  // Di KasirStockPage — loadSummary sudah ada catch, pastikan seperti ini:
  const loadSummary = useCallback(() =>
    getMainStockSummary()
      .then(r => setSummary(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        console.error('Summary error:', err.response?.status, err.response?.data);
        setSummary([]);
      }), []);
  const loadMonthly  = useCallback(() =>
    getMainStockMonthly({ month: selMonth, year: selYear }).then(r => setMonthly(r.data)),
    [selMonth, selYear]);
  // const loadDaily    = useCallback(() =>
  //   getMainStockDaily({ date: selDate }).then(r => setDaily(r.data)), [selDate]);
  // const loadRequests = useCallback(() =>
  //   getAllStockRequests({ date: reqDate || undefined, status: reqStatus || undefined })
  //     .then(r => setRequests(r.data)), [reqDate, reqStatus]);

  useEffect(() => { loadMaster(); loadSummary(); }, []);
  // useEffect(() => { if (tab==='main') { loadMonthly(); loadDaily(); } }, [tab, selMonth, selYear, selDate]);
  const [filterItemId, setFilterItemId] = useState(null); // null = semua
  // Ganti useEffect ini
  // useEffect(() => {
  //   if (tab === 'main') {
  //     loadMonthly();
  //     loadDaily();
  //     setFilterItemId(null); // reset filter bahan saat ganti bulan/tahun
  //   }
  // }, [tab, selMonth, selYear, selDate]);

  // Di AdminStockPage — useEffect yang sudah ada, tambah chain:
  useEffect(() => {
    if (tab === 'main') {
      loadMonthly();
      // FIX: load summary dulu, baru daily
      loadSummary().then(() => loadDaily());
      setFilterItemId(null);
    }
  }, [tab, selMonth, selYear, selDate]);

  // FIX: tambah useEffect untuk outTypeFilter di admin
  useEffect(() => {
    if (tab === 'main' && mainTab === 'out') {
      loadDaily();
    }
  }, [outTypeFilter, mainTab]);
  useEffect(() => { if (tab==='requests') loadRequests(); }, [tab, reqDate, reqStatus]);

  const resetForm = () => { setShowForm(false); setEditId(null); setFormData({ name:'', unit:'Pcs', min_stock:'' }); };

  const handleSaveMaster = async () => {
    if (!formData.name.trim()) return alert('Nama bahan wajib diisi');
    setFormLoading(true);
    try {
      const payload = { name: formData.name.trim(), unit: formData.unit, min_stock: Number(formData.min_stock)||0, stock:0, total_price:0 };
      if (editId) await updateStockItem(editId, payload);
      else        await createStockItem(payload);
      resetForm(); loadMaster();
    } catch(e) { alert(e.response?.data?.message || 'Gagal'); }
    finally { setFormLoading(false); }
  };

  const handlePurchase = async () => {
    const valid = purchItems.every(i => i.stock_item_id && Number(i.qty)>0 && Number(i.cost_per_unit)>0);
    if (!valid) return alert('Lengkapi semua item (bahan, jumlah, harga/satuan)');
    setPurchLoading(true);
    try {
      await addStockPurchase({
        items: purchItems.map(i => ({
          stock_item_id: Number(i.stock_item_id),
          qty:           Number(i.qty),
          cost_per_unit: Number(i.cost_per_unit),
        })),
        note: purchNote,
      });
      setShowPurchase(false);
      setPurchItems([{ stock_item_id:'', qty:'', cost_per_unit:'' }]);
      setPurchNote('');
      loadSummary(); loadMaster(); loadMonthly();
    } catch(e) { alert(e.response?.data?.message || 'Gagal'); }
    finally { setPurchLoading(false); }
  };

  const handleApprove = async (action) => {
    try {
      await approveStockRequest(approveModal.id, {
        action,
        approved_items: approveItems.map(i => ({
          request_item_id: i.id,
          qty_approved: Number(i.qty_approved ?? i.qty_requested),
        })),
      });
      setApproveModal(null);
      loadRequests(); loadSummary(); loadMaster();
    } catch(e) { alert(e.response?.data?.message || 'Gagal'); }
  };

  const totalIn  = summary.reduce((s,r) => s + Number(r.total_cost_in),  0);
  const totalOut = summary.reduce((s,r) => s + Number(r.total_cost_out), 0);
  const inData   = monthly.filter(r => r.type==='in');
  // const outData  = daily.length > 0 ? daily : monthly.filter(r => r.type==='out');
  const outData = daily;

  return (
    <>
      <div className="flex flex-wrap gap-2 bg-slate-800/50 rounded-2xl p-1.5 w-fit mb-5">
        <TabBtn active={tab==='master'}   onClick={() => setTab('master')}>   📦 Bahan Baku</TabBtn>
        <TabBtn active={tab==='main'}     onClick={() => setTab('main')}>     🏪 Stok Gudang</TabBtn>
        <TabBtn active={tab==='requests'} onClick={() => setTab('requests')}> 📋 Pengajuan Kasir</TabBtn>
      </div>

      {/* ── BAHAN BAKU ── */}
      {tab==='master' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-semibold">{stockItems.length} bahan baku</p>
              <p className="text-slate-600 text-xs mt-0.5">Stok & harga dikelola di Stok Gudang → Catat Pembelian</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold
                px-4 py-2 rounded-xl transition-all shadow-lg shadow-orange-500/25">
              + Tambah Bahan
            </button>
          </div>

          {stockItems.length === 0
            ? <div className="bg-slate-800/60 rounded-2xl border border-slate-700/40 py-12">
                <EmptyState icon="📦" title="Belum ada bahan baku" sub="Tambahkan bahan baku terlebih dahulu" />
              </div>
            : (
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/50">
                        {['Nama Bahan','Satuan','Min. Stok','Stok Saat Ini','Harga/Satuan','Status','Aksi'].map(h => (
                          <th key={h} className={thC}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stockItemsWithSummary.map((item, i) => (
                        <tr key={item.id} className={trC(i)}>
                          <td className={`${tdC} text-white font-semibold`}>{item.name}</td>
                          <td className={`${tdC} text-slate-400`}>{item.unit}</td>
                          <td className={`${tdC} text-slate-400`}>{item.min_stock} {item.unit}</td>
                          <td className={tdC}>
                            <span className={
                              item.display_stock === 0              ? 'text-red-400 font-bold' :
                              item.display_stock <= item.min_stock  ? 'text-yellow-400 font-bold'
                                                                    : 'text-white font-bold'
                            }>
                              {item.display_stock} {item.unit}
                            </span>
                          </td>
                          <td className={`${tdC} text-slate-300`}>
                            {item.display_price_per > 0
                              ? `Rp ${item.display_price_per.toLocaleString('id-ID')}`
                              : <span className="text-slate-600 text-xs">Belum ada pembelian</span>
                            }
                          </td>
                          <td className={tdC}>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              item.display_stock === 0             ? 'bg-red-500/15 text-red-400' :
                              item.display_stock <= item.min_stock ? 'bg-yellow-500/15 text-yellow-400' :
                                                                    'bg-green-500/15 text-green-400'
                            }`}>
                              {item.display_stock === 0 ? 'Habis' :
                              item.display_stock <= item.min_stock ? 'Menipis' : 'Aman'}
                            </span>
                          </td>
                          <td className={tdC}>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                setEditId(item.id);
                                setFormData({ name:item.name, unit:item.unit||'Pcs', min_stock:item.min_stock });
                                setShowForm(true);
                              }} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all">
                                Edit
                              </button>
                              <button onClick={async () => {
                                if (!confirm(`Hapus "${item.name}"?`)) return;
                                await deleteStockItem(item.id);
                                loadMaster(); loadSummary();
                              }} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        </div>
      )}

      {/* ── STOK GUDANG ── */}
      {tab==='main' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SubTab active={mainTab==='summary'} onClick={() => setMainTab('summary')}>📊 Saldo Stok</SubTab>
            <SubTab active={mainTab==='in'}      onClick={() => setMainTab('in')}>📥 Pemasukan</SubTab>
            <SubTab active={mainTab==='out'}     onClick={() => setMainTab('out')}>📤 Pengeluaran</SubTab>
            {mainTab === 'in' && (
              <button onClick={() => setShowPurchase(true)}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold
                  bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                + Catat Pembelian
              </button>
            )}
          </div>

          {/* Saldo */}
          {mainTab==='summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label:'Total Nilai Masuk',  val:`Rp ${totalIn.toLocaleString('id-ID')}`,          color:'text-blue-400',  bg:'bg-blue-500'  },
                  { label:'Total Nilai Keluar', val:`Rp ${totalOut.toLocaleString('id-ID')}`,          color:'text-red-400',   bg:'bg-red-500'   },
                  { label:'Nilai Stok Gudang',  val:`Rp ${(totalIn-totalOut).toLocaleString('id-ID')}`,color:'text-green-400', bg:'bg-green-500' },
                ].map((s,i) => (
                  <div key={i} className="relative bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-10 ${s.bg}`}/>
                    <p className="text-slate-500 text-xs relative">{s.label}</p>
                    <p className={`text-xl font-black mt-1 relative ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex gap-2.5">
                <span className="text-blue-400 shrink-0">ℹ</span>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Data saldo dihitung otomatis dari semua pemasukan dan pengeluaran (via pengajuan kasir yang disetujui).
                  Tidak ada input manual di halaman ini.
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/30">
                        {['Bahan Baku','Satuan','Total Masuk','Total Keluar','Saldo Stok','Status'].map(h => <th key={h} className={thC}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.length===0
                        ? <tr><td colSpan={6}><EmptyState title="Belum ada data stok" sub="Catat pembelian di tab Pemasukan" /></td></tr>
                        : summary.map((row,i) => {
                          const cur = Number(row.current_stock);
                          return (
                            <tr key={row.id} className={trC(i)}>
                              <td className={`${tdC} text-white font-semibold`}>{row.name}</td>
                              <td className={`${tdC} text-slate-400`}>{row.unit}</td>
                              <td className={tdC}>
                                <span className="text-blue-400 font-semibold">{fmtQty(row.total_in)}</span>
                                <span className="text-slate-600 text-xs ml-1.5">(Rp {Number(row.total_cost_in).toLocaleString('id-ID')})</span>
                              </td>
                              <td className={tdC}>
                                <span className="text-red-400 font-semibold">{fmtQty(row.total_out)}</span>
                                <span className="text-slate-600 text-xs ml-1.5">(Rp {Number(row.total_cost_out).toLocaleString('id-ID')})</span>
                              </td>
                              <td className={tdC}>
                                <span className={`font-bold ${cur===0?'text-red-400':cur<=row.min_stock?'text-yellow-400':'text-white'}`}>
                                  {fmtQty(cur)} {row.unit}
                                </span>
                              </td>
                              <td className={tdC}>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  cur===0?'bg-red-500/15 text-red-400':cur<=row.min_stock?'bg-yellow-500/15 text-yellow-400':'bg-green-500/15 text-green-400'
                                }`}>
                                  {cur===0?'Habis':cur<=row.min_stock?'Menipis':'Aman'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pemasukan */}
          {mainTab === 'in' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <select value={selMonth} onChange={e => { setSelMonth(Number(e.target.value)); setFilterItemId(null); }}
                  className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none">
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                <select value={selYear} onChange={e => { setSelYear(Number(e.target.value)); setFilterItemId(null); }}
                  className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none">
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* ── Tab filter bahan baku ── */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterItemId(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterItemId === null
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-700/60 text-slate-400 border border-slate-600/60 hover:text-white hover:border-slate-500'
                    }`}>
                    Semua
                    <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                      filterItemId === null ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {inData.length}
                    </span>
                  </button>

                  {[...new Map(inData.map(r => [r.item_name, r.item_name])).values()].map(name => {
                    const count    = inData.filter(r => r.item_name === name).length;
                    const isActive = filterItemId === name;
                    return (
                      <button key={name} onClick={() => setFilterItemId(isActive ? null : name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                            : 'bg-slate-700/60 text-slate-400 border border-slate-600/60 hover:text-white hover:border-slate-500'
                        }`}>
                        {name}
                        <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/30">
                        {['Tanggal','Bahan Baku','Jumlah','Harga/Satuan','Total Biaya','Harga Avg','Catatan','Dicatat Oleh','Aksi'].map(h => (
                          <th key={h} className={thC}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = filterItemId
                          ? inData.filter(r => r.item_name === filterItemId)
                          : inData;
                        if (filtered.length === 0)
                          return <tr><td colSpan={9}><EmptyState title="Belum ada pemasukan bulan ini" /></td></tr>;
                        return filtered.map((row, i) => (
                          <tr key={row.id} className={trC(i)}>
                            <td className={`${tdC} text-slate-400 text-xs whitespace-nowrap`}>
                              {new Date(row.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                            </td>
                            <td className={`${tdC} text-white font-medium`}>{row.item_name}</td>
                            <td className={`${tdC} text-blue-400 font-semibold`}>{fmtQty(row.qty)} {row.unit}</td>
                            <td className={`${tdC} text-slate-300`}>Rp {Number(row.cost_per_unit).toLocaleString('id-ID')}</td>
                            <td className={`${tdC} text-green-400 font-bold`}>Rp {Number(row.total_cost).toLocaleString('id-ID')}</td>
                            <td className={`${tdC} text-xs`}>
                              {(() => {
                                const s = summary.find(sm => sm.name === row.item_name);
                                if (!s || !Number(s.price_per_unit)) return <span className="text-slate-600">—</span>;
                                const isHigher = Number(row.cost_per_unit) > Number(s.price_per_unit);
                                const isLower  = Number(row.cost_per_unit) < Number(s.price_per_unit);
                                return (
                                  <div>
                                    <span className="text-slate-300">Rp {Number(s.price_per_unit).toLocaleString('id-ID')}</span>
                                    {isHigher && <span className="text-red-400 text-xs ml-1">↑ Naik</span>}
                                    {isLower  && <span className="text-green-400 text-xs ml-1">↓ Turun</span>}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className={`${tdC} text-slate-500 text-xs`}>{row.note || '—'}</td>
                            <td className={`${tdC} text-slate-400 text-xs`}>{row.created_by_name}</td>
                            <td className={tdC}>
                              <div className="flex gap-2">
                                <button onClick={() => setEditPurchase(row)}
                                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all">
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Hapus data pembelian ${row.item_name}?`)) return;
                                    try {
                                      await deleteStockPurchase(row.id);
                                      loadMonthly(); loadSummary(); loadMaster();
                                    } catch(e) { alert(e.response?.data?.message || 'Gagal menghapus'); }
                                  }}
                                  className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pengeluaran */}
          {mainTab === 'out' && (
            <div className="space-y-3">
              {/* Filter date + tombol */}
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-500 text-xs">Dari:</span>
                  <input type="date" value={selDate}
                    onChange={e => setSelDate(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
                  <span className="text-slate-500 text-xs">Sampai:</span>
                  <input type="date" value={selDateTo || selDate}
                    onChange={e => setSelDateTo(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
                  <button onClick={() => loadDaily()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-slate-300
                      hover:bg-slate-600 hover:text-white border border-slate-600 transition-all">
                    🔍 Cari
                  </button>
                </div>
                <button onClick={() => setShowOutForm(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold
                    bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                  + Catat Pengeluaran
                </button>
              </div>

              {/* ── Filter pills ── */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {OUT_FILTERS.map(f => (
                  <button key={f.val}
                    onClick={() => setOutTypeFilter(f.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      outTypeFilter === f.val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-700/60 text-slate-400 border border-slate-600/60 hover:text-white hover:border-slate-500'
                    }`}>
                    {f.label}
                  </button>
                ))}
                <span className="text-slate-600 text-xs ml-1">{outData.length} data</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex gap-2.5">
                <span className="text-yellow-400 shrink-0">ℹ</span>
                <p className="text-slate-500 text-xs">
                  Termasuk pengeluaran otomatis dari transaksi POS dan pengajuan manual kasir.
                </p>
              </div>

              {/* Tabel */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/30">
                        {['Tanggal','Bahan Baku','Jumlah','Harga/Sat','Total Nilai','Sumber','Pengaju','Status','Catatan'].map(h => (
                          <th key={h} className={thC}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outData.length === 0
                        ? <tr><td colSpan={9}><EmptyState title="Tidak ada data pengeluaran" /></td></tr>
                        : outData.map((row, i) => {
                          const isPending  = row.type === 'pending_out' && row.request_status === 'pending';
                          const isRejected = row.type === 'pending_out' && row.request_status === 'rejected';
                          const isTx       = row.type === 'transaction';
                          const isApproved = !isPending && !isRejected;

                          return (
                            <tr key={`${row.id}-${i}`} className={trC(i)}>
                              <td className={`${tdC} text-slate-400 text-xs whitespace-nowrap`}>
                                {new Date(row.created_at).toLocaleDateString('id-ID', {
                                  day:'numeric', month:'short', year:'numeric'
                                })}
                              </td>
                              <td className={`${tdC} text-white font-medium`}>{row.item_name}</td>
                              <td className={`${tdC} font-semibold ${isApproved ? 'text-red-400' : 'text-slate-400'}`}>
                                {fmtQty(row.qty)} {row.unit}
                              </td>
                              <td className={`${tdC} text-slate-300`}>
                                Rp {Number(row.cost_per_unit).toLocaleString('id-ID')}
                              </td>
                              <td className={`${tdC} font-bold ${isApproved ? 'text-red-400' : 'text-slate-500'}`}>
                                Rp {Number(row.total_cost).toLocaleString('id-ID')}
                              </td>

                              {/* Kolom Sumber */}
                              <td className={tdC}>
                                <TypeBadge type={row.type} status={row.request_status} />
                              </td>

                              {/* Kolom Pengaju */}
                              <td className={tdC}>
                                {row.admin_name ? (
                                  <div className="space-y-0.5">
                                    <p className="text-xs flex items-center gap-1">
                                      <span className="text-blue-400/80 text-[10px] font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">ADM</span>
                                      <span className="text-slate-400">{row.admin_name}</span>
                                    </p>
                                    <p className="text-white text-xs font-semibold flex items-center gap-1">
                                      <span className="text-slate-600">→</span>
                                      {row.target_user_name}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <p className="text-white text-xs font-semibold">
                                      {row.target_user_name || row.created_by_name}
                                    </p>
                                    {row.approver_name && (
                                      <p className="text-slate-600 text-xs">
                                        ✓ <span className="text-slate-500">{row.approver_name}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Kolom Status */}
                              <td className={tdC}>
                                {isTx && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                                    ✓ Terjual
                                  </span>
                                )}
                                {!isTx && isApproved && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                                    ✓ Disetujui
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                                    ⏳ Menunggu
                                  </span>
                                )}
                                {isRejected && (
                                  <div className="space-y-1">
                                    <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/20 block w-fit">
                                      ✕ Ditolak
                                    </span>
                                    <button onClick={() => { setTab('requests'); setReqStatus('rejected'); }}
                                      className="text-xs text-orange-400 hover:text-orange-300 underline">
                                      Ajukan ulang →
                                    </button>
                                  </div>
                                )}
                              </td>

                              <td className={`${tdC} text-slate-500 text-xs`}>{row.note || '—'}</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PENGAJUAN KASIR ── */}
      {tab==='requests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-slate-500 text-xs">Dari:</span>
            <input type="date" value={reqDateFrom2}
              onChange={e => setReqDateFrom2(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
            <span className="text-slate-500 text-xs">Sampai:</span>
            <input type="date" value={reqDateTo2}
              onChange={e => setReqDateTo2(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
            <select value={reqStatus} onChange={e => setReqStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none">
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
            <span className="text-slate-600 text-xs">{requests.length} pengajuan</span>
          </div>

          {requests.length===0
            ? <div className="bg-slate-800/60 rounded-2xl border border-slate-700/40 py-12">
                <EmptyState icon="📋" title="Tidak ada pengajuan" sub="Kasir belum mengajukan stok" />
              </div>
            : requests.map(req => (
              <div key={req.id} className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-slate-700/40">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold">
                        {req.user_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="text-white font-bold text-sm">{req.user_name}</p>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 ml-10">
                      {new Date(req.date).toLocaleDateString('id-ID', {
                        weekday:'long', day:'numeric', month:'long', year:'numeric'
                      })}
                    </p>
                    {req.created_by_admin_name && (
                      <p className="text-blue-400/70 text-xs mt-0.5 ml-10">
                        📝 Dibuat oleh: <span className="text-blue-400">{req.created_by_admin_name}</span>
                      </p>
                    )}
                    {req.approved_by_name && (
                      <p className="text-slate-600 text-xs mt-0.5 ml-10">
                        Diproses: <span className="text-slate-400">{req.approved_by_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Tombol aksi sesuai status */}
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {/* Pending → bisa diproses approve */}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => {
                          setApproveModal(req);
                          setApproveItems(req.items.map(i => ({ ...i, qty_approved: i.qty_requested })));
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold
                          bg-orange-500/20 text-orange-400 border border-orange-500/30
                          hover:bg-orange-500/30 transition-all">
                        Proses →
                      </button>
                    )}

                    {/* Rejected → bisa diajukan ulang oleh admin */}
                    {req.status === 'rejected' && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Ajukan ulang pengajuan ${req.user_name}?`)) return;
                          try {
                            await resubmitStockRequest(req.id);
                            loadRequests();
                          } catch(e) {
                            alert(e.response?.data?.message || 'Gagal mengajukan ulang');
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold
                          bg-blue-500/20 text-blue-400 border border-blue-500/30
                          hover:bg-blue-500/30 transition-all">
                        🔄 Ajukan Ulang
                      </button>
                    )}
                  </div>
                </div>

                {/* Items table with approved values */}
                {req.items?.length > 0 && (
                  <div className="overflow-x-auto px-4 py-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700/40">
                          {['Bahan','Diajukan','Disetujui','Harga/Sat','Nilai Diajukan','Nilai Disetujui'].map(h => (
                            <th key={h} className="text-left text-slate-600 py-1.5 pr-4 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {req.items.map(item => (
                          <tr key={item.id} className="border-b border-slate-700/20">
                            <td className="py-1.5 pr-4 text-slate-300 font-medium">
                              {item.item_name} <span className="text-slate-600">({item.unit})</span>
                            </td>
                            <td className="py-1.5 pr-4 text-slate-400">{Number(item.qty_requested).toFixed(2)}</td>
                            <td className="py-1.5 pr-4">
                              {item.qty_approved != null
                                ? <span className="text-green-400 font-semibold">{Number(item.qty_approved).toFixed(2)}</span>
                                : <span className="text-slate-700">—</span>}
                            </td>
                            <td className="py-1.5 pr-4 text-slate-400">
                              Rp {Number(item.cost_per_unit).toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5 text-orange-400">
                              Rp {(Number(item.qty_requested) * Number(item.cost_per_unit)).toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5">
                              {item.qty_approved != null
                                ? <span className="text-green-400 font-semibold">
                                    Rp {(Number(item.qty_approved) * Number(item.cost_per_unit)).toLocaleString('id-ID')}
                                  </span>
                                : <span className="text-slate-700">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="pt-2 text-slate-600 text-xs font-semibold">Total</td>
                          <td className="pt-2 text-orange-400 font-bold">
                            Rp {req.items.reduce((s, i) =>
                              s + Number(i.qty_requested) * Number(i.cost_per_unit), 0
                            ).toLocaleString('id-ID')}
                          </td>
                          <td className="pt-2 text-green-400 font-bold">
                            Rp {req.items.reduce((s, i) =>
                              s + (Number(i.qty_approved || 0) * Number(i.cost_per_unit)), 0
                            ).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* ══ MODAL: TAMBAH/EDIT BAHAN BAKU ══ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{editId?'Edit':'Tambah'} Bahan Baku</h2>
              <button onClick={resetForm} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-700">✕</button>
            </div>
            {!editId && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
                <p className="text-blue-400 text-xs">💡 Hanya daftarkan nama & satuan. Tambah stok via <strong>Stok Gudang → Catat Pembelian</strong>.</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Nama Bahan <span className="text-red-400">*</span></label>
                <input value={formData.name} onChange={e => setFormData(p=>({...p,name:e.target.value}))}
                  placeholder="contoh: Slice Beef, Cup, Saus Sambal..."
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 border border-slate-600 placeholder:text-slate-500" />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Satuan <span className="text-red-400">*</span></label>
                <select value={formData.unit} onChange={e => setFormData(p=>({...p,unit:e.target.value}))}
                  className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 border border-slate-600">
                  {UNIT_GROUPS.map(g => (
                    <optgroup key={g.label} label={`── ${g.label} ──`}>
                      {g.units.map(u => <option key={u} value={u}>{u}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Min. Stok Alert <span className="text-slate-600 text-xs">(opsional)</span></label>
                <div className="relative">
                  <input type="number" min="0" value={formData.min_stock}
                    onChange={e => setFormData(p=>({...p,min_stock:e.target.value}))}
                    placeholder="0"
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-orange-500 border border-slate-600" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">{formData.unit}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 text-sm font-semibold">Batal</button>
                <button onClick={handleSaveMaster} disabled={formLoading||!formData.name.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm">
                  {formLoading?'Menyimpan...':editId?'Update':'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: CATAT PEMBELIAN ══ */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/60">
              <div>
                <h3 className="text-white font-bold">📥 Catat Pembelian Stok</h3>
                <p className="text-slate-500 text-xs mt-0.5">Stok gudang akan bertambah otomatis</p>
              </div>
              <button onClick={() => setShowPurchase(false)} className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-700 transition-colors">✕</button>
            </div>
            <div className="p-5 space-y-3">
              {purchItems.map((item, i) => (
                <div key={i} className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Item {i+1}</span>
                    {purchItems.length>1 && (
                      <button onClick={() => setPurchItems(p => p.filter((_,j) => j!==i))}
                        className="text-red-400 hover:text-red-300 text-xs">Hapus</button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-500 text-xs mb-1 block">Pilih Bahan Baku</label>
                      <select value={item.stock_item_id}
                        onChange={e => setPurchItems(p => p.map((x,j) => j===i?{...x,stock_item_id:e.target.value}:x))}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50">
                        <option value="">-- Pilih bahan --</option>
                        {stockItems.map(si => <option key={si.id} value={si.id}>{si.name} ({si.unit})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">
                          Jumlah {item.stock_item_id ? `(${stockItems.find(s=>s.id==item.stock_item_id)?.unit||''})` : ''}
                        </label>
                        <input type="number" min="0" value={item.qty} placeholder="0"
                          onChange={e => setPurchItems(p => p.map((x,j) => j===i?{...x,qty:e.target.value}:x))}
                          className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600" />
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">Harga / Satuan (Rp)</label>
                        <input type="number" min="0" value={item.cost_per_unit} placeholder="0"
                          onChange={e => setPurchItems(p => p.map((x,j) => j===i?{...x,cost_per_unit:e.target.value}:x))}
                          className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600" />
                      </div>
                    </div>
                    {Number(item.qty)>0 && Number(item.cost_per_unit)>0 && (
                      <div className="bg-orange-500/10 rounded-lg px-3 py-2 flex justify-between">
                        <span className="text-slate-500 text-xs">Subtotal</span>
                        <span className="text-orange-400 text-xs font-bold">
                          Rp {(Number(item.qty)*Number(item.cost_per_unit)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => setPurchItems(p => [...p,{stock_item_id:'',qty:'',cost_per_unit:''}])}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-500 text-sm transition-all">
                + Tambah Bahan Lain
              </button>
              <div>
                <label className="text-slate-500 text-xs mb-1 block">Catatan (opsional)</label>
                <input value={purchNote} onChange={e => setPurchNote(e.target.value)}
                  placeholder="contoh: Pembelian dari pasar..."
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600" />
              </div>
              <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600/40 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs">Total Pembelian</p>
                  <p className="text-slate-600 text-xs">{purchItems.filter(i=>i.stock_item_id).length} item</p>
                </div>
                <p className="text-white font-black text-xl">
                  Rp {purchItems.reduce((s,i) => s+(Number(i.qty)*Number(i.cost_per_unit)||0),0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setShowPurchase(false)}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-semibold">Batal</button>
              <button onClick={handlePurchase} disabled={purchLoading}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold disabled:opacity-50">
                {purchLoading?'Menyimpan...':'💾 Simpan Pembelian'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: EDIT PEMBELIAN ══ */}
      {editPurchase && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/60">
              <div>
                <h3 className="text-white font-bold">✏️ Edit Pembelian</h3>
                <p className="text-slate-500 text-xs mt-0.5">{editPurchase.item_name}</p>
              </div>
              <button onClick={() => setEditPurchase(null)}
                className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-700">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Jumlah ({editPurchase.unit})</label>
                <input type="number" min="0"
                  defaultValue={fmtQty(editPurchase.qty)}
                  id="edit-qty"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3
                    outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Harga / Satuan (Rp)</label>
                <input type="number" min="0"
                  defaultValue={fmtQty(editPurchase.cost_per_unit)}
                  id="edit-cost"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3
                    outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Catatan (opsional)</label>
                <input type="text"
                  defaultValue={editPurchase.note || ''}
                  id="edit-note"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3
                    outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600"
                  placeholder="Catatan pembelian..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setEditPurchase(null)}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-semibold">
                Batal
              </button>
              <button
                onClick={async () => {
                  const qty  = Number(document.getElementById('edit-qty').value);
                  const cost = Number(document.getElementById('edit-cost').value);
                  const note = document.getElementById('edit-note').value;
                  if (!qty || !cost) return alert('Jumlah dan harga wajib diisi');
                  try {
                    await updateStockPurchase(editPurchase.id, { qty, cost_per_unit: cost, note });
                    setEditPurchase(null);
                    loadMonthly(); loadSummary(); loadMaster();
                  } catch(e) { alert(e.response?.data?.message || 'Gagal'); }
                }}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: CATAT PENGELUARAN MANUAL ══ */}
      {showOutForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/60">
              <div>
                <h3 className="text-white font-bold">📤 Catat Pengeluaran Stok</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Hanya bahan yang ada di gudang · Tidak boleh melebihi stok tersedia
                </p>
              </div>
              <button onClick={() => {
                // Ganti pesan sukses setelah submit
                setShowOutForm(false);
                setOutItems([{ stock_item_id:'', qty:'', note:'' }]);
                setOutUserId('');
                // Redirect ke tab pengajuan supaya admin bisa lihat & approve
                setTab('requests');
                loadRequests();
                setSuccessModal({
                  isOpen: true,
                  title: 'Pengeluaran Tercatat',
                  message: 'Pengajuan pengeluaran berhasil dibuat. Silakan approve di tab Pengajuan Kasir.',
                  requestType: 'withdrawal',
                });
              }}
                className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-700 transition-colors">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* ── Pilih kasir (hanya admin) ── */}
              <div>
                <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                  Kasir / Pengguna <span className="text-red-400">*</span>
                </label>
                <select
                  value={outUserId}
                  onChange={e => setOutUserId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm
                    rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50">
                  <option value="">-- Pilih kasir --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Items ── */}
              <div className="space-y-3">
                {outItems.map((item, i) => {
                  const si      = summary.find(s => s.id == item.stock_item_id);
                  const maxStok = si ? Number(si.current_stock) : 0;
                  // Pakai latest_cost_per_unit kalau price_per_unit belum diupdate
                  // const harga   = Number(si?.latest_cost_per_unit || si?.price_per_unit || 0);
                  // SESUDAH — selalu pakai moving average
                  const harga = Number(si?.price_per_unit || 0);
                  const isOver  = si && Number(item.qty) > maxStok;
                  const nilaiOut = Number(item.qty) * harga;

                  return (
                    <div key={i} className={`rounded-xl p-4 border transition-colors ${
                      isOver ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-700/40 border-slate-600/40'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                          Item {i + 1}
                        </span>
                        {outItems.length > 1 && (
                          <button onClick={() => setOutItems(p => p.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-300 text-xs transition-colors">
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Pilih bahan */}
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Pilih Bahan Baku</label>
                          <select
                            value={item.stock_item_id}
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, stock_item_id: e.target.value, qty: '' } : x
                            ))}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-sm
                              rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50">
                            <option value="">-- Pilih bahan yang tersedia --</option>
                            {summary
                              .filter(s => Number(s.current_stock) > 0)
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.unit}) · Stok: {fmtQty(s.current_stock)}
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        {/* Info stok tersedia */}
                        {si && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-700/60 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-500 mb-0.5">Stok Gudang</p>
                              <p className={`font-semibold ${maxStok <= 0 ? 'text-red-400' : 'text-white'}`}>
                                {fmtQty(maxStok)} {si.unit}
                              </p>
                            </div>
                            <div className="bg-slate-700/60 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-500 mb-0.5">Harga / {si.unit}</p>
                              <p className="text-white font-semibold">
                                {harga > 0
                                  ? `Rp ${harga.toLocaleString('id-ID')}`
                                  : <span className="text-slate-600">Belum ada</span>
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Input jumlah */}
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">
                            Jumlah {si ? `(max ${fmtQty(maxStok)} ${si.unit})` : ''}
                          </label>
                          <input
                            type="number" min="1" max={maxStok || undefined}
                            value={item.qty} placeholder="0"
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, qty: e.target.value } : x
                            ))}
                            className={`w-full bg-slate-700 border text-white text-sm
                              rounded-xl px-3 py-2.5 outline-none focus:ring-2
                              placeholder:text-slate-600 transition-colors ${
                              isOver
                                ? 'border-red-500/60 focus:ring-red-500/50'
                                : 'border-slate-600 focus:ring-orange-500/50'
                            }`}
                          />
                          {isOver && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              ⚠ Melebihi stok gudang ({maxStok.toFixed(2)} {si.unit})
                            </p>
                          )}
                        </div>

                        {/* Catatan */}
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Catatan (opsional)</label>
                          <input
                            type="text" value={item.note || ''} placeholder="keterangan pengeluaran..."
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, note: e.target.value } : x
                            ))}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-sm
                              rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/50
                              placeholder:text-slate-600"
                          />
                        </div>

                        {/* Preview nilai item ini */}
                        {si && Number(item.qty) > 0 && (
                          <div className={`rounded-lg px-3 py-2 flex justify-between text-xs ${
                            isOver ? 'bg-red-500/10 border border-red-500/20' : 'bg-orange-500/10 border border-orange-500/20'
                          }`}>
                            <span className="text-slate-500">
                              {item.qty} × Rp {harga.toLocaleString('id-ID')}
                            </span>
                            <span className={`font-bold ${isOver ? 'text-red-400' : 'text-orange-400'}`}>
                              {isOver ? '⚠ Over stok' : `Rp ${nilaiOut.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tambah bahan */}
              <button
                onClick={() => setOutItems(p => [...p, { stock_item_id:'', qty:'', note:'' }])}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-600
                  text-slate-500 hover:text-slate-300 hover:border-slate-500 text-sm transition-all">
                + Tambah Bahan Lain
              </button>

              {/* Ringkasan total */}
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/40 space-y-2">
                {/* Per item */}
                {outItems.filter(it => it.stock_item_id && Number(it.qty) > 0).map((it, i) => {
                  const s    = summary.find(st => st.id == it.stock_item_id);
                  const h    = Number(s?.latest_cost_per_unit || s?.price_per_unit || 0);
                  const over = s && Number(it.qty) > Number(s.current_stock);
                  if (!s) return null;
                  return (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-500">{s.name} × {it.qty} {s.unit}</span>
                      <span className={over ? 'text-red-400' : 'text-slate-400'}>
                        {over ? '⚠ Over' : `Rp ${(Number(it.qty) * h).toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  );
                })}

                {/* Garis total */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-600/60">
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">Total Nilai Pengeluaran</p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {outItems.filter(i => i.stock_item_id && Number(i.qty) > 0).length} item
                    </p>
                  </div>
                  <p className="text-red-400 font-black text-xl">
                    Rp {outItems.reduce((s, it) => {
                      const si   = summary.find(st => st.id == it.stock_item_id);
                      const h    = Number(si?.latest_cost_per_unit || si?.price_per_unit || 0);
                      const over = si && Number(it.qty) > Number(si.current_stock);
                      if (over || !si) return s;
                      return s + (Number(it.qty) * h);
                    }, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => {
                   // Ganti pesan sukses setelah submit
                    setShowOutForm(false);
                    setOutItems([{ stock_item_id:'', qty:'', note:'' }]);
                    setOutUserId('');
                    // Redirect ke tab pengajuan supaya admin bisa lihat & approve
                    setTab('requests');
                    loadRequests();
                    setSuccessModal({
                      isOpen: true,
                      title: 'Pengeluaran Tercatat',
                      message: 'Pengajuan pengeluaran berhasil dibuat. Silakan approve di tab Pengajuan Kasir.',
                      requestType: 'withdrawal',
                    });
                }}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300
                  hover:bg-slate-600 text-sm font-semibold transition-colors">
                Batal
              </button>
              <button
                onClick={async () => {
                  if (!outUserId) return alert('Pilih kasir terlebih dahulu');
                  const valid = outItems.every(i => i.stock_item_id && Number(i.qty) > 0);
                  if (!valid) return alert('Lengkapi semua item (pilih bahan dan isi jumlah)');
                  const overStock = outItems.some(item => {
                    const si = summary.find(s => s.id == item.stock_item_id);
                    return si && Number(item.qty) > Number(si.current_stock);
                  });
                  if (overStock) return alert('Ada item yang melebihi stok gudang');
                  setOutLoading(true);
                  try {
                    await addManualStockOut({
                      user_id: Number(outUserId),
                      items: outItems.map(i => ({
                        stock_item_id: Number(i.stock_item_id),
                        qty:           Number(i.qty),
                        note:          i.note || '',
                      })),
                    });
                     // Ganti pesan sukses setelah submit
                    setShowOutForm(false);
                    setOutItems([{ stock_item_id:'', qty:'', note:'' }]);
                    setOutUserId('');
                    // Redirect ke tab pengajuan supaya admin bisa lihat & approve
                    setTab('requests');
                    loadRequests();
                    setSuccessModal({
                      isOpen: true,
                      title: 'Pengeluaran Tercatat',
                      message: 'Pengajuan pengeluaran berhasil dibuat. Silakan approve di tab Pengajuan Kasir.',
                      requestType: 'withdrawal',
                    });
                    loadDaily(); loadSummary(); loadMaster(); loadRequests();
                  } catch(e) {
                    setSuccessModal({
                      isOpen: true,
                      title: 'Terjadi Kesalahan',
                      message: e.response?.data?.message || 'Gagal menyimpan pengeluaran',
                      requestType: 'withdrawal',
                    });
                  } finally { setOutLoading(false); }
                }}
                disabled={
                  outLoading ||
                  !outUserId ||
                  outItems.some(item => {
                    const si = summary.find(s => s.id == item.stock_item_id);
                    return si && Number(item.qty) > Number(si.current_stock);
                  })
                }
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white
                  text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {outLoading ? 'Menyimpan...' : '📤 Simpan Pengeluaran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: APPROVE PENGAJUAN ══ */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-700/60">
              <h3 className="text-white font-bold text-base">Proses Pengajuan Stok</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center
                  text-orange-400 text-sm font-bold shrink-0">
                  {approveModal.user_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{approveModal.user_name}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(approveModal.date).toLocaleDateString('id-ID', {
                      weekday:'long', day:'numeric', month:'long', year:'numeric'
                    })}
                  </p>
                </div>
              </div>
              {approveModal.note && (
                <p className="text-slate-500 text-xs mt-2 italic ml-10">"{approveModal.note}"</p>
              )}
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                Detail Barang yang Diajukan
              </p>

              {approveItems.map((item, i) => {
                const stockInfo = summary.find(s => s.id === item.stock_item_id);
                const maxQty = stockInfo ? Number(stockInfo.current_stock) : 0;
                const isOver = Number(item.qty_approved) > maxQty;

                return (
                  <div key={item.id} className={`rounded-xl p-3 border ${
                    isOver ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-700/40 border-slate-600/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-semibold">{item.item_name}</span>
                      <span className="text-slate-500 text-xs bg-slate-700 px-2 py-0.5 rounded-lg">
                        {item.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="bg-slate-700/60 rounded-lg px-2 py-2">
                        <p className="text-slate-500 mb-0.5">Diajukan</p>
                        <p className="text-white font-bold">{fmtQty(item.qty_requested)} {item.unit}</p>
                      </div>
                      <div className="bg-slate-700/60 rounded-lg px-2 py-2">
                        <p className="text-slate-500 mb-0.5">Stok Gudang</p>
                        <p className={`font-bold ${maxQty <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {fmtQty(maxQty)} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Qty Disetujui</p>
                        <input
                          type="number" min="0" max={maxQty}
                          value={fmtQty(item.qty_approved) } placeholder="0"
                          onChange={e => setApproveItems(p => p.map((x,j) =>
                            j===i ? { ...x, qty_approved: e.target.value } : x
                          ))}
                          className={`w-full bg-slate-700 border text-white text-sm rounded-lg px-2 py-1.5
                            outline-none focus:ring-2 ${
                            isOver
                              ? 'border-red-500/60 focus:ring-red-500/50'
                              : 'border-slate-600 focus:ring-orange-500/50'
                          }`}
                        />
                      </div>
                    </div>

                    {isOver && (
                      <p className="text-red-400 text-xs">
                        ⚠ Melebihi stok gudang ({fmtQty(maxQty)} {item.unit})
                      </p>
                    )}

                    <div className="flex justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-700/40">
                      <span className="text-slate-500">Harga/sat</span>
                      <span className="text-slate-400">Rp {Number(item.cost_per_unit).toLocaleString('id-ID')}</span>
                      <span className="text-slate-500">Nilai disetujui</span>
                      <span className="text-orange-400 font-semibold">
                        Rp {(Number(item.qty_approved||0) * Number(item.cost_per_unit)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Ringkasan total */}
              <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total diajukan</span>
                  <span className="text-slate-300">
                    {approveItems.length} item ·
                    Rp {approveItems.reduce((s,i) =>
                      s + Number(i.qty_requested) * Number(i.cost_per_unit), 0
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-700/40">
                  <span className="text-slate-400 text-sm font-semibold">Total disetujui</span>
                  <span className="text-white font-black text-lg">
                    Rp {approveItems.reduce((s,i) =>
                      s + (Number(i.qty_approved||0) * Number(i.cost_per_unit)), 0
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setApproveModal(null)}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-semibold">
                Batal
              </button>
              <button onClick={() => handleApprove('reject')}
                className="px-5 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 text-sm font-semibold transition-colors">
                ✕ Tolak
              </button>
              <button
                onClick={() => {
                  const hasOver = approveItems.some(item => {
                    const si = summary.find(s => s.id === item.stock_item_id);
                    return Number(item.qty_approved) > Number(si?.current_stock || 0);
                  });
                  if (hasOver) return alert('Ada item yang melebihi stok gudang');
                  handleApprove('approve');
                }}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold">
                ✓ Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── KASIR VIEW ────────────────────────────────────────────────
function KasirStockPage({ successModal, setSuccessModal }) {
  const { user } = useAuthStore();
  const [tab,      setTab]      = useState('gudang');
  const [mainTab,  setMainTab]  = useState('summary');

  const [summary,   setSummary]  = useState([]);
  const [daily,     setDaily]    = useState([]);
  const [selDate,   setSelDate]  = useState(new Date().toISOString().split('T')[0]);
  const [selDateTo, setSelDateTo]= useState(new Date().toISOString().split('T')[0]);

  const [requests,    setRequests]   = useState([]);
  const [reqStatus,   setReqStatus]  = useState('');
  const [reqDateFrom, setReqDateFrom]= useState(new Date().toISOString().split('T')[0]);
  const [reqDateTo,   setReqDateTo]  = useState(new Date().toISOString().split('T')[0]);

  const [showOutForm, setShowOutForm] = useState(false);
  const [outItems,    setOutItems]    = useState([{ stock_item_id:'', qty:'', note:'' }]);
  const [outLoading,  setOutLoading]  = useState(false);

  // Di dalam function KasirStockPage(), tambah setelah state declarations:
  const searchParams = useSearchParams();

  // Ubah loadSummary agar return promise
  const loadSummary = useCallback(() =>
    getMainStockSummary()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : [];
        setSummary(data);
        return data; // ← return data agar bisa di-await
      })
      .catch(err => {
        console.error('Summary error:', err.response?.status);
        setSummary([]);
        return [];
      }), []);

  // Ganti useEffect pertama (yang loadSummary) dengan ini:
  useEffect(() => {
    const fromPos     = searchParams.get('from') === 'pos';
    const ingredients = searchParams.get('ingredients');
    const productName = searchParams.get('product_name');

    if (fromPos && ingredients) {
      // Load summary dulu, baru buka form dengan data yang sudah ada
      loadSummary().then(() => {
        try {
          const parsedIngs = JSON.parse(ingredients);
          setTab('gudang');
          setMainTab('out');
          setShowOutForm(true);
          setOutItems(parsedIngs.map(ing => ({
            stock_item_id: String(ing.stock_item_id),
            qty:           '',
            note:          `Stok untuk ${productName || 'produk'}`,
          })));
        } catch (_) {}
      });
    } else {
      loadSummary();
    }
  }, [searchParams]);

  // Filter daily hanya milik user ini
  // Di KasirStockPage — loadDaily sudah benar kirim user_id
  // const loadDaily = useCallback(() =>
  //   getMainStockDaily({
  //     date_from: selDate,
  //     date_to:   selDateTo || selDate,
  //     user_id:   user?.id,
  //   }).then(r => setDaily(Array.isArray(r.data) ? r.data : [])),
  //   [selDate, selDateTo, user?.id]);

  // Tambah state di KasirStockPage
  const [outTypeFilter, setOutTypeFilter] = useState('all');

  // Update loadDaily kasir
  const loadDaily = useCallback(() =>
    getMainStockDaily({
      date_from:   selDate,
      date_to:     selDateTo || selDate,
      user_id:     user?.id,   // kasir selalu filter by user sendiri
      type_filter: outTypeFilter !== 'all' ? outTypeFilter : undefined,
    }).then(r => setDaily(Array.isArray(r.data) ? r.data : [])),
    [selDate, selDateTo, user?.id, outTypeFilter]);

  useEffect(() => {
    if (tab === 'gudang' && mainTab === 'out') loadDaily();
  }, [outTypeFilter]);

  // Definisi filter — sama untuk admin & kasir
  const OUT_FILTERS = [
    { val: 'all',         label: 'Semua'          },
    { val: 'approved',    label: '✓ Sudah Keluar' },
    { val: 'pending',     label: '⏳ Menunggu'     },
    { val: 'rejected',    label: '✕ Ditolak'       },
    { val: 'transaction', label: '🧾 Transaksi POS'},
    { val: 'manual',      label: '📋 Manual Kasir' },
  ];

  // Warna badge per status
  function TypeBadge({ type, status }) {
    if (type === 'transaction') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
        🧾 Transaksi
      </span>
    );
    if (type === 'pending_out' && status === 'pending') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
        📋 Menunggu
      </span>
    );
    if (type === 'pending_out' && status === 'rejected') return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
        📋 Ditolak
      </span>
    );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
        📦 Keluar
      </span>
    );
  }

  const loadRequests = useCallback(() =>
    getMyStockRequests({
      status:    reqStatus   || undefined,
      date_from: reqDateFrom || undefined,
      date_to:   reqDateTo   || undefined,
    }).then(r => setRequests(r.data)),
    [reqStatus, reqDateFrom, reqDateTo]);

  // Ganti useEffect ini
  useEffect(() => { loadSummary(); }, []);
  // Di KasirStockPage useEffect pertama
  useEffect(() => {
    console.log('Loading summary for user:', user?.id, user?.role);
    loadSummary();
  }, []);
  // useEffect(() => {
  //   if (tab === 'gudang') {
  //     loadSummary(); // ← tambah ini agar summary fresh setiap masuk tab gudang
  //     loadDaily();
  //   }
  // }, [tab, selDate, selDateTo]);
  useEffect(() => {
    if (tab === 'gudang') {
      // FIX: chain — summary selesai dulu baru daily
      loadSummary().then(() => {
        if (mainTab === 'out') loadDaily();
      });
    }
  }, [tab, selDate, selDateTo]);

  // FIX: tambah useEffect untuk mainTab change
  useEffect(() => {
    if (tab === 'gudang' && mainTab === 'out') {
      loadDaily();
    }
  }, [mainTab]);
  useEffect(() => {
    if (tab === 'requests') loadRequests();
  }, [tab, reqStatus, reqDateFrom, reqDateTo]);

  // Tampilkan hanya pengeluaran yang diapprove dan milik user ini
  const outData = daily;

  return (
    <>
      <div className="flex flex-wrap gap-2 bg-slate-800/50 rounded-2xl p-1.5 w-fit mb-5">
        <TabBtn active={tab==='gudang'}   onClick={() => setTab('gudang')}>   🏪 Stok Gudang</TabBtn>
        <TabBtn active={tab==='requests'} onClick={() => setTab('requests')}> 📋 Pengajuan Saya</TabBtn>
      </div>

      {tab === 'gudang' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SubTab active={mainTab==='summary'} onClick={() => setMainTab('summary')}>📊 Saldo Stok</SubTab>
            <SubTab active={mainTab==='out'}     onClick={() => setMainTab('out')}>📤 Pengeluaran</SubTab>
          </div>

          {/* ── Saldo Stok ── */}
          {mainTab === 'summary' && (
            <div className="space-y-3">
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex gap-2.5">
                <span className="text-blue-400 shrink-0">ℹ</span>
                <p className="text-slate-500 text-xs">
                  Saldo stok gudang keseluruhan. Semua Stok dilakukan proses approve oleh admin.
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/30">
                        {['Bahan Baku','Satuan','Total Masuk','Total Keluar','Saldo Stok','Status'].map(h =>
                          <th key={h} className={thC}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.length === 0
                        ? <tr><td colSpan={6}><EmptyState title="Belum ada data stok" /></td></tr>
                        : summary.map((row, i) => {
                            const cur = Number(row.current_stock);
                            return (
                              <tr key={row.id} className={trC(i)}>
                                <td className={`${tdC} text-white font-semibold`}>{row.name}</td>
                                <td className={`${tdC} text-slate-400`}>{row.unit}</td>
                                <td className={tdC}>
                                  <span className="text-blue-400 font-semibold">{fmtQty(row.total_in)}</span>
                                  <span className="text-slate-600 text-xs ml-1.5">(Rp {Number(row.total_cost_in).toLocaleString('id-ID')})</span>
                                </td>
                                <td className={tdC}>
                                  <span className="text-red-400 font-semibold">{fmtQty(row.total_out)}</span>
                                  <span className="text-slate-600 text-xs ml-1.5">(Rp {Number(row.total_cost_out).toLocaleString('id-ID')})</span>
                                </td>
                                <td className={tdC}>
                                  <span className={`font-bold ${cur===0?'text-red-400':cur<=row.min_stock?'text-yellow-400':'text-white'}`}>
                                    {fmtQty(cur)} {row.unit}
                                  </span>
                                </td>
                                <td className={tdC}>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    cur===0?'bg-red-500/15 text-red-400':
                                    cur<=row.min_stock?'bg-yellow-500/15 text-yellow-400':
                                    'bg-green-500/15 text-green-400'
                                  }`}>
                                    {cur===0?'Habis':cur<=row.min_stock?'Menipis':'Aman'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Pengeluaran ── */}
          {mainTab === 'out' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-500 text-xs">Dari:</span>
                  <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
                  <span className="text-slate-500 text-xs">Sampai:</span>
                  <input type="date" value={selDateTo} onChange={e => setSelDateTo(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
                  <button onClick={() => loadDaily()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-slate-300
                      hover:bg-slate-600 hover:text-white border border-slate-600 transition-all">
                    🔍 Cari
                  </button>
                </div>
                <button onClick={() => setShowOutForm(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold
                    bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                  + Catat Pengeluaran
                </button>
              </div>

              {/* Filter pills kasir — tanpa 'manual' karena kasir sudah filter by user sendiri */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {[
                  { val: 'all',         label: 'Semua'           },
                  { val: 'approved',    label: '✓ Sudah Keluar'  },
                  { val: 'pending',     label: '⏳ Menunggu'      },
                  { val: 'rejected',    label: '✕ Ditolak'        },
                  { val: 'transaction', label: '🧾 Transaksi POS' },
                ].map(f => (
                  <button key={f.val}
                    onClick={() => setOutTypeFilter(f.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      outTypeFilter === f.val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-700/60 text-slate-400 border border-slate-600/60 hover:text-white hover:border-slate-500'
                    }`}>
                    {f.label}
                  </button>
                ))}
                <span className="text-slate-600 text-xs ml-1">{outData.length} data</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex gap-2.5">
                <span className="text-yellow-400 shrink-0">ℹ</span>
                <p className="text-slate-500 text-xs">
                  Pengeluaran atas nama <span className="text-white font-medium">{user?.name}</span> — termasuk dari transaksi POS dan pengajuan manual.
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60 bg-slate-800/30">
                        {['Tanggal','Bahan Baku','Jumlah','Harga/Sat','Total Nilai','Sumber','Disetujui Oleh','Status','Catatan'].map(h =>
                          <th key={h} className={thC}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {outData.length === 0
                        ? <tr><td colSpan={9}><EmptyState title="Tidak ada data pengeluaran pada periode ini" /></td></tr>
                        : outData.map((row, i) => {
                          const isPending  = row.type === 'pending_out' && row.request_status === 'pending';
                          const isRejected = row.type === 'pending_out' && row.request_status === 'rejected';
                          const isTx       = row.type === 'transaction';
                          const isApproved = !isPending && !isRejected;

                          return (
                            <tr key={`${row.id}-${i}`} className={trC(i)}>
                              <td className={`${tdC} text-slate-400 text-xs whitespace-nowrap`}>
                                {new Date(row.created_at).toLocaleDateString('id-ID', {
                                  day:'numeric', month:'short', year:'numeric'
                                })}
                              </td>
                              <td className={`${tdC} text-white font-medium`}>{row.item_name}</td>
                              <td className={`${tdC} font-semibold ${isApproved ? 'text-red-400' : 'text-slate-400'}`}>
                                {fmtQty(row.qty)} {row.unit}
                              </td>
                              <td className={`${tdC} text-slate-300`}>
                                Rp {Number(row.cost_per_unit).toLocaleString('id-ID')}
                              </td>
                              <td className={`${tdC} font-bold ${isApproved ? 'text-red-400' : 'text-slate-500'}`}>
                                Rp {Number(row.total_cost).toLocaleString('id-ID')}
                              </td>
                              <td className={tdC}>
                                <TypeBadge type={row.type} status={row.request_status} />
                              </td>
                              <td className={`${tdC} text-slate-400 text-xs`}>
                                {isTx
                                  ? <span className="text-blue-400/80">Otomatis POS</span>
                                  : row.approver_name
                                    ? <span className="text-green-400/80">{row.approver_name}</span>
                                    : <span className="text-slate-600">—</span>
                                }
                              </td>
                              <td className={tdC}>
                                {isTx && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                                    ✓ Terjual
                                  </span>
                                )}
                                {!isTx && isApproved && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                                    ✓ Disetujui
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                                    ⏳ Menunggu
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                                    ✕ Ditolak
                                  </span>
                                )}
                              </td>
                              <td className={`${tdC} text-slate-500 text-xs`}>{row.note || '—'}</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PENGAJUAN SAYA ── */}
      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-slate-500 text-xs">Dari:</span>
            <input type="date" value={reqDateFrom}
              onChange={e => setReqDateFrom(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
            <span className="text-slate-500 text-xs">Sampai:</span>
            <input type="date" value={reqDateTo}
              onChange={e => setReqDateTo(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 outline-none" />
            <div className="flex gap-1.5 flex-wrap">
              {[['','Semua'],['pending','Menunggu'],['approved','Disetujui'],['rejected','Ditolak']].map(([val,label]) => (
                <button key={val} onClick={() => setReqStatus(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    reqStatus === val
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <span className="text-slate-600 text-xs">{requests.length} pengajuan</span>
          </div>

          {requests.length === 0
            ? <div className="bg-slate-800/60 rounded-2xl border border-slate-700/40 py-12">
                <EmptyState icon="📋" title="Tidak ada pengajuan" sub="Belum ada pengajuan pengeluaran" />
              </div>
            : requests.map(req => (
              <div key={req.id} className={`bg-slate-800/80 rounded-2xl border overflow-hidden ${
                req.status==='approved' ? 'border-green-500/30' :
                req.status==='rejected' ? 'border-red-500/30' : 'border-slate-700/60'
              }`}>
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-slate-700/40">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">
                        {new Date(req.date).toLocaleDateString('id-ID', {
                          weekday:'long', day:'numeric', month:'long', year:'numeric'
                        })}
                      </p>
                      <StatusBadge status={req.status} />
                    </div>
                    {req.note && <p className="text-slate-500 text-xs mt-0.5 italic">"{req.note}"</p>}
                    {req.approved_by_name && (
                      <p className="text-slate-600 text-xs mt-0.5">
                        Diproses: <span className="text-slate-400">{req.approved_by_name}</span>
                        {req.approved_at && ` · ${new Date(req.approved_at).toLocaleString('id-ID')}`}
                      </p>
                    )}
                  </div>
                  {req.status === 'rejected' && (
                    <button
                      onClick={async () => {
                        if (!confirm('Ajukan ulang pengajuan ini?')) return;
                        try {
                          await resubmitStockRequest(req.id);
                          loadRequests();
                        } catch(e) { alert(e.response?.data?.message || 'Gagal mengajukan ulang'); }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold
                        bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                      🔄 Ajukan Ulang
                    </button>
                  )}
                </div>

                {req.items?.length > 0 && (
                  <div className="overflow-x-auto px-4 py-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700/40">
                          {['Bahan','Diajukan','Disetujui','Harga/Sat','Nilai Diajukan','Nilai Disetujui'].map(h => (
                            <th key={h} className="text-left text-slate-600 py-1.5 pr-4 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {req.items.map(item => (
                          <tr key={item.id} className="border-b border-slate-700/20">
                            <td className="py-1.5 pr-4 text-slate-300 font-medium">
                              {item.item_name} <span className="text-slate-600">({item.unit})</span>
                            </td>
                            <td className="py-1.5 pr-4 text-slate-400">{Number(item.qty_requested).toFixed(2)}</td>
                            <td className="py-1.5 pr-4">
                              {item.qty_approved != null
                                ? <span className="text-green-400 font-semibold">{Number(item.qty_approved).toFixed(2)}</span>
                                : <span className="text-slate-700">—</span>}
                            </td>
                            <td className="py-1.5 pr-4 text-slate-400">Rp {Number(item.cost_per_unit).toLocaleString('id-ID')}</td>
                            <td className="py-1.5 text-orange-400">
                              Rp {(Number(item.qty_requested) * Number(item.cost_per_unit)).toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5">
                              {item.qty_approved != null
                                ? <span className="text-green-400 font-semibold">
                                    Rp {(Number(item.qty_approved) * Number(item.cost_per_unit)).toLocaleString('id-ID')}
                                  </span>
                                : <span className="text-slate-700">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="pt-2 text-slate-600 font-semibold">Total</td>
                          <td className="pt-2 text-orange-400 font-bold">
                            Rp {req.items.reduce((s, i) =>
                              s + Number(i.qty_requested) * Number(i.cost_per_unit), 0
                            ).toLocaleString('id-ID')}
                          </td>
                          <td className="pt-2 text-green-400 font-bold">
                            Rp {req.items.reduce((s, i) =>
                              s + (Number(i.qty_approved || 0) * Number(i.cost_per_unit)), 0
                            ).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* ══ MODAL: CATAT PENGELUARAN (KASIR) ══ */}
      {showOutForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/60">
              <div>
                <h3 className="text-white font-bold">📤 Catat Pengeluaran Stok</h3>
                <p className="text-slate-500 text-xs mt-0.5">Hanya bahan yang ada di gudang · Tidak boleh melebihi stok tersedia</p>
              </div>
              <button onClick={() => { setShowOutForm(false); setOutItems([{ stock_item_id:'', qty:'', note:'' }]); }}
                className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-700 transition-colors">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-2.5">
                <span className="text-blue-400 shrink-0">ℹ</span>
                <p className="text-blue-400/80 text-xs">
                  Pengajuan akan dibuat atas nama <span className="font-semibold text-blue-400">{user?.name}</span> · Menunggu persetujuan admin
                </p>
              </div>

              <div className="space-y-3">
                {outItems.map((item, i) => {
                  const si       = summary.find(s => s.id == item.stock_item_id);
                  const maxStok  = si ? Number(si.current_stock) : 0;
                  const harga    = Number(si?.price_per_unit || 0);
                  const isOver   = si && Number(item.qty) > maxStok;
                  const nilaiOut = Number(item.qty) * harga;

                  return (
                    <div key={i} className={`rounded-xl p-4 border transition-colors ${
                      isOver ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-700/40 border-slate-600/40'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Item {i + 1}</span>
                        {outItems.length > 1 && (
                          <button onClick={() => setOutItems(p => p.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-300 text-xs">Hapus</button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Pilih Bahan Baku</label>
                          <select value={item.stock_item_id}
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, stock_item_id: e.target.value, qty: '' } : x
                            ))}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-sm
                              rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/50">
                            <option value="">-- Pilih bahan yang tersedia --</option>
                            {summary.filter(s => Number(s.current_stock) > 0).map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.unit}) · Stok: {fmtQty(s.current_stock)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {si && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-700/60 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-500 mb-0.5">Stok Gudang</p>
                              <p className={`font-semibold ${maxStok <= 0 ? 'text-red-400' : 'text-white'}`}>
                                {fmtQty(maxStok)} {si.unit}
                              </p>
                            </div>
                            <div className="bg-slate-700/60 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-500 mb-0.5">Harga / {si.unit}</p>
                              <p className="text-white font-semibold">
                                {harga > 0 ? `Rp ${harga.toLocaleString('id-ID')}` : <span className="text-slate-600">Belum ada</span>}
                              </p>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">
                            Jumlah {si ? `(max ${fmtQty(maxStok)} ${si.unit})` : ''}
                          </label>
                          <input type="number" min="1" max={maxStok || undefined}
                            value={item.qty} placeholder="0"
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, qty: e.target.value } : x
                            ))}
                            className={`w-full bg-slate-700 border text-white text-sm rounded-xl px-3 py-2.5
                              outline-none focus:ring-2 placeholder:text-slate-600 transition-colors ${
                              isOver ? 'border-red-500/60 focus:ring-red-500/50' : 'border-slate-600 focus:ring-orange-500/50'
                            }`}
                          />
                          {isOver && (
                            <p className="text-red-400 text-xs mt-1">⚠ Melebihi stok gudang ({fmtQty(maxStok)} {si.unit})</p>
                          )}
                        </div>

                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Catatan (opsional)</label>
                          <input type="text" value={item.note || ''} placeholder="keterangan pengeluaran..."
                            onChange={e => setOutItems(p => p.map((x, j) =>
                              j === i ? { ...x, note: e.target.value } : x
                            ))}
                            className="w-full bg-slate-700 border border-slate-600 text-white text-sm
                              rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-600"
                          />
                        </div>

                        {si && Number(item.qty) > 0 && (
                          <div className={`rounded-lg px-3 py-2 flex justify-between text-xs ${
                            isOver ? 'bg-red-500/10 border border-red-500/20' : 'bg-orange-500/10 border border-orange-500/20'
                          }`}>
                            <span className="text-slate-500">{item.qty} × Rp {harga.toLocaleString('id-ID')}</span>
                            <span className={`font-bold ${isOver ? 'text-red-400' : 'text-orange-400'}`}>
                              {isOver ? '⚠ Over stok' : `Rp ${nilaiOut.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setOutItems(p => [...p, { stock_item_id:'', qty:'', note:'' }])}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-600
                  text-slate-500 hover:text-slate-300 hover:border-slate-500 text-sm transition-all">
                + Tambah Bahan Lain
              </button>

              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/40 space-y-2">
                {outItems.filter(it => it.stock_item_id && Number(it.qty) > 0).map((it, i) => {
                  const s    = summary.find(st => st.id == it.stock_item_id);
                  const h    = Number(s?.price_per_unit || 0);
                  const over = s && Number(it.qty) > Number(s.current_stock);
                  if (!s) return null;
                  return (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-500">{s.name} × {it.qty} {s.unit}</span>
                      <span className={over ? 'text-red-400' : 'text-slate-400'}>
                        {over ? '⚠ Over' : `Rp ${(Number(it.qty) * h).toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t border-slate-600/60">
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">Total Nilai Pengeluaran</p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {outItems.filter(i => i.stock_item_id && Number(i.qty) > 0).length} item
                    </p>
                  </div>
                  <p className="text-red-400 font-black text-xl">
                    Rp {outItems.reduce((s, it) => {
                      const si   = summary.find(st => st.id == it.stock_item_id);
                      const h    = Number(si?.price_per_unit || 0);
                      const over = si && Number(it.qty) > Number(si.current_stock);
                      if (over || !si) return s;
                      return s + (Number(it.qty) * h);
                    }, 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => { setShowOutForm(false); setOutItems([{ stock_item_id:'', qty:'', note:'' }]); }}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-semibold">
                Batal
              </button>
              <button
                onClick={async () => {
                  const valid = outItems.every(i => i.stock_item_id && Number(i.qty) > 0);
                  if (!valid) return alert('Lengkapi semua item');
                  const overStock = outItems.some(item => {
                    const si = summary.find(s => s.id == item.stock_item_id);
                    return si && Number(item.qty) > Number(si.current_stock);
                  });
                  if (overStock) return alert('Ada item yang melebihi stok gudang');
                  setOutLoading(true);
                  try {
                    await addManualStockOut({
                      user_id: user.id,
                      items: outItems.map(i => ({
                        stock_item_id: Number(i.stock_item_id),
                        qty:           Number(i.qty),
                        note:          i.note || '',
                      })),
                    });
                    setShowOutForm(false);
                    setOutItems([{ stock_item_id:'', qty:'', note:'' }]);
                    setTab('requests');
                    loadRequests();
                    setSuccessModal({
                      isOpen: true,
                      title: 'Permintaan Stok Dikirim',
                      message: 'Pengajuan pengeluaran berhasil dibuat. Menunggu persetujuan admin.',
                      requestType: 'request',
                    });
                  } catch(e) {
                    setSuccessModal({
                      isOpen: true,
                      title: 'Terjadi Kesalahan',
                      message: e.response?.data?.message || 'Gagal menyimpan pengeluaran',
                      requestType: 'request',
                    });
                  } finally { setOutLoading(false); }
                }}
                disabled={outLoading || outItems.some(item => {
                  const si = summary.find(s => s.id == item.stock_item_id);
                  return si && Number(item.qty) > Number(si.current_stock);
                })}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white
                  text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {outLoading ? 'Menyimpan...' : '📤 Kirim Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function StockPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.role === 'admin';

  // ✅ Success Modal State — MOVED TO PARENT LEVEL
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: 'Sukses',
    message: 'Operasi berhasil dilakukan',
    requestType: 'withdrawal',
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-8 space-y-5">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">
            {isAdmin ? 'Manajemen Stok' : 'Stok Saya'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isAdmin
              ? 'Master bahan baku · Stok gudang · Pengajuan kasir'
              : 'Lihat pemasukan · Buat pengajuan stok · Pantau status'
            }
          </p>
        </div>

        {isAdmin ? <AdminStockPage successModal={successModal} setSuccessModal={setSuccessModal} /> : <KasirStockPage successModal={successModal} setSuccessModal={setSuccessModal} />}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        requestType={successModal.requestType}
      />
    </AdminLayout>
  );
}