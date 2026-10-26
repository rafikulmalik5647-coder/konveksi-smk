import React, { useState } from 'react';
import { findOrders } from '../lib/supabase';
import { rupiah, badgeStatus, formatDate } from '../utils/helpers';
import { Search, PackageCheck, AlertCircle, Phone, Calendar, User, ShoppingBag } from 'lucide-react';

export default function CheckOrder() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    const data = await findOrders(keyword);
    setResults(data);
    setLoading(false);
  };

  return (
    <section id="cek-status" className="py-16 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-indigo-100">
            Lacak Pesanan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cek Status Pengerjaan Seragam
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Masukkan kode pesanan Anda (contoh: <code>INV-20261016-89A1</code>) atau nomor WhatsApp yang digunakan saat mendaftar.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2 mb-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="Ketik Kode Invoice / No. WhatsApp..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition"
          >
            {loading ? 'Mencari...' : 'Lacak Status'}
          </button>
        </form>

        {/* Results Container */}
        {results !== null && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hasil Pencarian: ({results.length} pesanan ditemukan)
            </h3>

            {results.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">Tidak ditemukan pesanan dengan kata kunci tersebut.</p>
                <p className="text-xs text-slate-400 mt-1">Pastikan kode invoice atau nomor WhatsApp sesuai saat Anda memesan.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map(order => {
                  const badge = badgeStatus(order.status_pesanan);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            {order.kode_pesanan}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.created_at)}
                          </span>
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{order.status_pesanan}</span>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-semibold block uppercase">Pemesan</span>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            {order.nama_pemesan}
                          </p>
                          <p className="text-slate-600">{order.nis_kelas}</p>
                          <p className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.no_hp}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 font-semibold block uppercase">Produk &amp; Ukuran</span>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                            {order.nama_produk}
                          </p>
                          <p className="text-slate-700">
                            Ukuran: <strong className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-800">{order.ukuran}</strong> &times; {order.jumlah} pcs
                          </p>
                          {order.catatan && (
                            <p className="text-amber-800 italic text-[11px]">Catatan: {order.catatan}</p>
                          )}
                        </div>

                        <div className="sm:text-right space-y-1 flex sm:flex-col justify-between sm:justify-start">
                          <span className="text-slate-400 font-semibold block uppercase">Total Biaya</span>
                          <p className="text-base font-black text-slate-900">{rupiah(order.total_harga)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
