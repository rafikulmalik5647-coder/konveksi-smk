import React, { useState } from 'react';
import { rupiah, badgeStatus, formatDate } from '../utils/helpers';
import { updateOrderStatus, deleteOrder, addProduct, adminChangePassword } from '../lib/supabase';
import {
  Package, Clock, Scissors, CheckCircle, DollarSign, PlusCircle,
  KeyRound, Trash2, ArrowLeft, LogOut, Check, AlertCircle, RefreshCw
} from 'lucide-react';

export default function AdminDashboard({
  admin,
  orders,
  products,
  onRefreshData,
  onLogout,
  onBackToPublic
}) {
  const [filterStatus, setFilterStatus] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  // Form Tambah Produk
  const [newProduct, setNewProduct] = useState({
    kode_produk: '',
    nama_produk: '',
    kategori: 'Seragam Sekolah',
    deskripsi: '',
    harga: '',
    stok: ''
  });

  // Form Ganti Password
  const [passData, setPassData] = useState({
    oldPass: '',
    newPass: '',
    confirmPass: ''
  });

  const showToast = (type, message) => {
    if (type === 'success') {
      setMsgSuccess(message);
      setMsgError('');
    } else {
      setMsgError(message);
      setMsgSuccess('');
    }
    setTimeout(() => {
      setMsgSuccess('');
      setMsgError('');
    }, 4000);
  };

  // Statistik rekap
  const totalOrders = orders.length;
  const menungguCount = orders.filter(o => o.status_pesanan === 'Menunggu Konfirmasi').length;
  const diprosesCount = orders.filter(o => o.status_pesanan === 'Diproses / Dijahit').length;
  const siapCount = orders.filter(o => o.status_pesanan === 'Siap Diambil').length;
  const totalRevenue = orders
    .filter(o => o.status_pesanan !== 'Dibatalkan')
    .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);

  // Filter daftar pesanan
  const filteredOrders = filterStatus
    ? orders.filter(o => o.status_pesanan === filterStatus)
    : orders;

  const statusOptions = [
    'Menunggu Konfirmasi',
    'Diproses / Dijahit',
    'Siap Diambil',
    'Selesai',
    'Dibatalkan'
  ];

  // Handler ubah status pesanan
  const handleUpdateStatus = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      showToast('success', `Status pesanan berhasil diperbarui menjadi "${newStatus}".`);
      onRefreshData();
    } else {
      showToast('error', res.error || 'Gagal memperbarui status pesanan.');
    }
  };

  // Handler hapus pesanan
  const handleDeleteOrder = async (orderId, kode) => {
    if (window.confirm(`Yakin ingin menghapus data pesanan "${kode}"?`)) {
      const res = await deleteOrder(orderId);
      if (res.success) {
        showToast('success', `Data pesanan "${kode}" berhasil dihapus.`);
        onRefreshData();
      } else {
        showToast('error', res.error || 'Gagal menghapus data pesanan.');
      }
    }
  };

  // Handler tambah produk
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.kode_produk.trim() || !newProduct.nama_produk.trim()) {
      showToast('error', 'Kode dan nama produk wajib diisi.');
      return;
    }
    const hargaNum = Number(newProduct.harga);
    const stokNum = Number(newProduct.stok);
    if (!hargaNum || hargaNum < 1000 || stokNum < 0) {
      showToast('error', 'Harga minimal Rp 1.000 dan stok tidak boleh negatif.');
      return;
    }

    const res = await addProduct({
      ...newProduct,
      kode_produk: newProduct.kode_produk.trim().toUpperCase(),
      nama_produk: newProduct.nama_produk.trim()
    });

    if (res.success) {
      showToast('success', `Produk "${newProduct.nama_produk}" berhasil ditambahkan ke katalog.`);
      setNewProduct({
        kode_produk: '',
        nama_produk: '',
        kategori: 'Seragam Sekolah',
        deskripsi: '',
        harga: '',
        stok: ''
      });
      onRefreshData();
    } else {
      showToast('error', res.error || 'Gagal menambah produk.');
    }
  };

  // Handler ganti password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.oldPass || !passData.newPass || !passData.confirmPass) {
      showToast('error', 'Semua field ganti password wajib diisi.');
      return;
    }
    if (passData.newPass.length < 6) {
      showToast('error', 'Password baru minimal harus 6 karakter.');
      return;
    }
    if (passData.newPass !== passData.confirmPass) {
      showToast('error', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = await adminChangePassword(passData.oldPass, passData.newPass);
    if (res.success) {
      showToast('success', 'Password admin berhasil diperbarui.');
      setPassData({ oldPass: '', newPass: '', confirmPass: '' });
    } else {
      showToast('error', res.error || 'Password lama tidak sesuai.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      
      {/* Admin Header Bar */}
      <div className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Dashboard Admin &mdash; Konveksi SMKN 1 Idi
                </h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-400">Selamat datang, <strong className="text-white">{admin?.nama_lengkap || 'Admin'}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Katalog Publik</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Alerts */}
        {msgSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msgSuccess}</span>
          </div>
        )}
        {msgError && (
          <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-600 text-red-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{msgError}</span>
          </div>
        )}

        {/* 1. Statistics Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Total Pesanan</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-amber-700">Menunggu</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{menungguCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-blue-700">Diproses / Dijahit</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{diprosesCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Scissors className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-purple-700">Siap Diambil</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{siapCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Total Nilai Pesanan</p>
              <p className="text-xl font-black text-emerald-700 mt-1">{rupiah(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* 2. Orders Management Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Pesanan Seragam &amp; Baju Olahraga</h2>
              <p className="text-xs text-slate-500">Kelola status pengerjaan konveksi dan rekap pemesanan siswa.</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-500 font-semibold">Filter:</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 bg-white text-xs font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Semua Status ({totalOrders}) --</option>
                {statusOptions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                onClick={onRefreshData}
                title="Refresh Data"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Kode &amp; Tanggal</th>
                  <th className="py-3 px-4">Pemesan / Kelas</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Ukuran &amp; Jml</th>
                  <th className="py-3 px-4">Total Harga</th>
                  <th className="py-3 px-4">Status Saat Ini</th>
                  <th className="py-3 px-4">Ubah Status / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Belum ada data pesanan untuk ditampilkan.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const badge = badgeStatus(order.status_pesanan);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-indigo-700">{order.kode_pesanan}</div>
                          <div className="text-[11px] text-slate-400">{formatDate(order.created_at)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.nama_pemesan}</div>
                          <div className="text-slate-500">{order.nis_kelas} &bull; {order.no_hp}</div>
                          {order.catatan && (
                            <div className="text-amber-700 italic text-[11px] mt-0.5">Catatan: {order.catatan}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {order.nama_produk}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {order.ukuran}
                          </span>
                          {' '}&times; {order.jumlah} pcs
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                          {rupiah(order.total_harga)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                            {order.status_pesanan}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status_pesanan}
                              onChange={e => handleUpdateStatus(order.id, e.target.value)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:border-indigo-600 font-medium"
                            >
                              {statusOptions.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleDeleteOrder(order.id, order.kode_pesanan)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Section Tambah Produk Baru */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <PlusCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Tambah Produk Seragam / Baju Olahraga Baru</h2>
          </div>
          <p className="text-xs text-slate-500">Tambahkan produk baru ke katalog publik Konveksi SMK Negeri 1 Idi.</p>

          <form onSubmit={handleAddProduct} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kode Produk *</label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="Contoh: SRG-004"
                value={newProduct.kode_produk}
                onChange={e => setNewProduct({ ...newProduct, kode_produk: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Produk *</label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="Contoh: Jas Almamater SMKN 1 Idi"
                value={newProduct.nama_produk}
                onChange={e => setNewProduct({ ...newProduct, nama_produk: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kategori *</label>
              <select
                value={newProduct.kategori}
                onChange={e => setNewProduct({ ...newProduct, kategori: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white focus:border-indigo-600 focus:outline-none"
              >
                <option value="Seragam Sekolah">Seragam Sekolah</option>
                <option value="Baju Olahraga">Baju Olahraga</option>
                <option value="Wearpack Praktik">Wearpack Praktik</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Harga (Rp) *</label>
              <input
                type="number"
                required
                min={1000}
                placeholder="150000"
                value={newProduct.harga}
                onChange={e => setNewProduct({ ...newProduct, harga: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Stok Awal (Pcs) *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="100"
                value={newProduct.stok}
                onChange={e => setNewProduct({ ...newProduct, stok: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Deskripsi Singkat</label>
              <input
                type="text"
                placeholder="Bahan drill halus + bordir logo"
                value={newProduct.deskripsi}
                onChange={e => setNewProduct({ ...newProduct, deskripsi: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                + Tambah Produk ke Katalog
              </button>
            </div>
          </form>
        </section>

        {/* 4. Section Keamanan Akun & Ganti Password Admin */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Keamanan Akun &amp; Ganti Password Admin</h2>
          </div>
          <p className="text-xs text-slate-500">Perbarui password akun admin secara berkala untuk menjaga keamanan data sistem konveksi.</p>

          <form onSubmit={handleChangePassword} className="grid sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password Saat Ini *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.oldPass}
                onChange={e => setPassData({ ...passData, oldPass: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password Baru *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={passData.newPass}
                onChange={e => setPassData({ ...passData, newPass: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Konfirmasi Password Baru *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Ulangi password baru"
                value={passData.confirmPass}
                onChange={e => setPassData({ ...passData, confirmPass: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Simpan Password Baru
              </button>
            </div>
          </form>
        </section>

      </main>
    </div>
  );
}
