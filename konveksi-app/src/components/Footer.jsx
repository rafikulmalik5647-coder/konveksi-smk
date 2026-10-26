import React from 'react';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Konveksi SMK Negeri 1 Idi</span>
              <p className="text-[11px] text-slate-400">Unit Usaha &amp; Produksi Seragam Sekolah Berbasis Web</p>
            </div>
          </div>

          <p className="text-center md:text-right text-[11px] text-slate-400">
            Dikembangkan dengan <strong>React + Vite</strong> &bull; Database: <strong>Supabase</strong> &bull; Deploy ready for <strong>Vercel</strong>
          </p>
        </div>

        <div className="pt-6 border-t border-slate-900 text-center text-slate-400 text-[11px]">
          &copy; {new Date().getFullYear()} Konveksi SMK Negeri 1 Idi. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
