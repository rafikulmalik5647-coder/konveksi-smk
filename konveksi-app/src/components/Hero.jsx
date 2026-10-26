import React from 'react';
import { ShoppingBag, Search, Sparkles, CheckCircle2, Clock, Award, ShieldCheck } from 'lucide-react';

export default function Hero({ onExploreCatalog, onTrackOrder }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-18 lg:py-24 border-b border-indigo-900/40">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-indigo-200 text-xs font-semibold backdrop-blur-md shadow-inner transition-colors duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>Unit Produksi &amp; Konveksi Resmi SMK Negeri 1 Idi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              Pesan Seragam Sekolah &amp; <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
                Baju Olahraga Berkualitas
              </span>
            </h1>

            <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-xl font-normal">
              Platform resmi pemesanan seragam harian, seragam pramuka, kaos olahraga, dan wearpack praktik. 
              Dikerjakan presisi dengan jahitan rapi, bahan berstandar sekolah, dan progres yang dapat dipantau online.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <a
                href="#katalog"
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-amber-400/25 hover:shadow-xl hover:shadow-amber-400/35 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                <span>Pilih Seragam Sekarang</span>
              </a>
              <a
                href="#cek-status"
                onClick={onTrackOrder}
                className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 hover:border-white/40 px-6 py-3.5 rounded-2xl font-bold text-sm backdrop-blur-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
              >
                <Search className="w-4 h-4 text-indigo-200" />
                <span>Lacak Status Pesanan</span>
              </a>
            </div>

            {/* Value Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-indigo-200/90 font-medium">Jahitan Kuat &amp; Rapi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xs text-indigo-200/90 font-medium">Tracking Real-time</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs text-indigo-200/90 font-medium">Standar Resmi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Card with Glassmorphism */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 border border-white/15 shadow-2xl relative space-y-5 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Layanan Konveksi Sekolah
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                  Menerima Pesanan
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-between group">
                  <div>
                    <p className="text-xs text-indigo-300 font-semibold">Seragam Sekolah</p>
                    <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Putih Abu &amp; Pramuka Penegak</p>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">Mulai Rp 125.000</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-between group">
                  <div>
                    <p className="text-xs text-sky-300 font-semibold">Baju Olahraga</p>
                    <p className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">Kaos &amp; Celana Training Sekolah</p>
                  </div>
                  <span className="text-xs font-black text-sky-300 bg-sky-400/10 px-2.5 py-1 rounded-xl border border-sky-400/20">Mulai Rp 110.000</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-between group">
                  <div>
                    <p className="text-xs text-amber-300 font-semibold">Wearpack Praktik</p>
                    <p className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">Jurusan TKJ, TKRO &amp; Lainnya</p>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">Mulai Rp 165.000</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-800/60 text-xs text-indigo-200/90 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="leading-relaxed">Setiap pesanan seragam dilengkapi bordir resmi nama dan badge logo SMKN 1 Idi.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
