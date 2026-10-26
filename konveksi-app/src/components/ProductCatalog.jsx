import React, { useState } from 'react';
import { rupiah } from '../utils/helpers';
import { CheckCircle2, AlertTriangle, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function ProductCatalog({ products, onSelectProduct }) {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Seragam Sekolah', 'Baju Olahraga', 'Wearpack Praktik'];

  const filtered = activeCategory === 'Semua'
    ? products
    : products.filter(p => p.kategori === activeCategory);

  return (
    <section id="katalog" className="py-18 bg-slate-50/70 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-2.5 border border-indigo-200/70 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Katalog Konveksi Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Seragam &amp; Baju Olahraga
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Seluruh seragam diproduksi langsung dengan standar bahan kuat, adem, dan jahitan presisi oleh tim Konveksi SMK Negeri 1 Idi.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4.5 py-2.5 rounded-2xl transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100/80 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/90 rounded-3xl border border-dashed border-slate-300 p-8 text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">Belum ada produk untuk kategori ini.</p>
            <p className="text-xs text-slate-400">Silakan pilih kategori lainnya pada filter di atas.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {filtered.map(product => {
              const isAvailable = Number(product.stok) > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white/95 rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-indigo-300/80"
                >
                  <div className="p-6 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-xl border border-indigo-200/70 shadow-xs">
                        {product.kode_produk}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {product.kategori}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {product.nama_produk}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {product.deskripsi || 'Seragam sekolah berkualitas standar resmi konveksi SMKN 1 Idi.'}
                    </p>
                  </div>

                  <div className="p-6 pt-3.5 bg-gradient-to-b from-slate-50/60 to-slate-100/60 border-t border-slate-100 space-y-3.5 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Harga Satuan</span>
                        <span className="text-lg font-black text-indigo-700">{rupiah(product.harga)}</span>
                      </div>
                      <div>
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Stok: {product.stok}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200/80">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            Habis
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={!isAvailable}
                      onClick={() => onSelectProduct(product)}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 shadow-sm ${
                        isAvailable
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Pesan Produk Ini</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
