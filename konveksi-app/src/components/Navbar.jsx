import React from 'react';
import { Scissors, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

export default function Navbar({ onOpenAdminLogin, isAdmin, onToggleAdminView, showAdminDashboard }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-indigo-900/40 text-white shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300">
            <Scissors className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Konveksi SMKN 1 Idi
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-xs">
                Resmi
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium hidden sm:block">
              Unit Produksi &amp; Jasa Tata Busana SMKN 1 Idi
            </p>
          </div>
        </a>

        {/* Database Status Indicator & Nav Links */}
        <div className="flex items-center gap-3 sm:gap-4 text-sm font-semibold">
          {/* Supabase Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-white/5 border border-white/10 text-indigo-200 backdrop-blur-md shadow-inner">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-indigo-300 font-medium">Database:</span>
            <span className={isConfigured ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
              {isConfigured ? 'Supabase Live' : 'Supabase Ready'}
            </span>
          </div>

          {!showAdminDashboard ? (
            <>
              <nav className="hidden md:flex items-center gap-1.5 text-indigo-100">
                <a
                  href="#katalog"
                  className="px-3.5 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Katalog Produk
                </a>
                <a
                  href="#pesan"
                  className="px-3.5 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Form Pemesanan
                </a>
                <a
                  href="#cek-status"
                  className="px-3.5 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Cek Status
                </a>
              </nav>

              {isAdmin ? (
                <button
                  onClick={onToggleAdminView}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Buka Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 active:bg-white/25 px-4 py-2.5 rounded-2xl border border-white/20 hover:border-white/40 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Admin Panel</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onToggleAdminView}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border border-white/20 hover:border-white/40 backdrop-blur-xl hover:-translate-y-0.5"
            >
              <span>&larr; Kembali ke Katalog Publik</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
