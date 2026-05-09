'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getMe, registerUser } from '@/lib/api';
import api from '@/lib/axios';

export default function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'kasir' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/auth/users').then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      await load();
      setModal(false);
      setForm({ name: '', email: '', password: '', role: 'kasir' });
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Manajemen Kasir</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola akun kasir</p>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
            + Tambah Kasir
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium px-4 py-3">Nama</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Role</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      u.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="text-center text-slate-500 py-10">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700">
            <h2 className="text-white font-bold text-xl mb-5">Tambah Kasir</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Nama', key: 'name', type: 'text', ph: 'Budi Santoso' },
                { label: 'Email', key: 'email', type: 'email', ph: 'budi@kebab.com' },
                { label: 'Password', key: 'password', type: 'password', ph: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-slate-400 text-sm">{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    required placeholder={f.ph}
                    className="w-full mt-1 bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-sm">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full mt-1 bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl py-3 transition-colors">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}