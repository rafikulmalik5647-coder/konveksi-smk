import React, { useState, useEffect } from 'react';
import { rupiah, generateInvoiceCode } from '../utils/helpers';
import { ShoppingCart, CheckCircle, AlertCircle, Copy, Check, MessageSquare } from 'lucide-react';

export default function OrderForm({ products, selectedProduct, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    nama_pemesan: '',
    nis_kelas: '',
    no_hp: '',
    product_id: '',
    ukuran: 'L',
    jumlah: 1,
    catatan: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Set selected product jika dioper dari katalog
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, product_id: String(selectedProduct.id) }));
    } else if (products.length > 0 && !formData.product_id) {
      setFormData(prev => ({ ...prev, product_id: String(products[0].id) }));
    }
  }, [selectedProduct, products]);

  const currentProduct = products.find(p => String(p.id) === String(formData.product_id));
  const estimatedTotal = (currentProduct ? Number(currentProduct.harga) : 0) * (Number(formData.jumlah) || 1);

  const ukuranList = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_pemesan.trim() || formData.nama_pemesan.trim().length < 3) {
      setErrorMsg('Nama pemesan wajib diisi minimal 3 karakter.');
      return;
    }
    if (!formData.nis_kelas.trim()) {
      setErrorMsg('Kelas / Jurusan wajib diisi (contoh: X TKJ 1).');
      return;
    }
    const cleanHp = formData.no_hp.replace(/[^0-9+]/g, '');
    if (cleanHp.length < 9 || cleanHp.length > 16) {
      setErrorMsg('Nomor WhatsApp / HP tidak valid.');
      return;
    }
    if (!formData.product_id) {
      setErrorMsg('Silakan pilih produk seragam atau baju olahraga.');
      return;
    }
    if (!currentProduct) {
      setErrorMsg('Produk yang dipilih tidak ditemukan.');
      return;
    }
    const qty = Number(formData.jumlah);
    if (!qty || qty < 1 || qty > 100) {
      setErrorMsg('Jumlah pesanan harus antara 1 sampai 100 pcs.');
      return;
    }
    if (qty > Number(currentProduct.stok)) {
      setErrorMsg(`Stok untuk "${currentProduct.nama_produk}" tersisa ${currentProduct.stok} pcs.`);
      return;
    }

    setLoading(true);

    const invoiceCode = generateInvoiceCode();
    const orderPayload = {
      kode_pesanan: invoiceCode,
      nama_pemesan: formData.nama_pemesan.trim(),
      nis_kelas: formData.nis_kelas.trim(),
      no_hp: cleanHp,
      product_id: currentProduct.id,
      nama_produk: currentProduct.nama_produk,
      ukuran: formData.ukuran,
      jumlah: qty,
      total_harga: estimatedTotal,
      catatan: formData.catatan.trim()
    };

    const res = await onOrderSuccess(orderPayload);
    setLoading(false);

    if (res.success) {
      setSuccessOrder({
        ...orderPayload,
        created_at: new Date().toISOString()
      });
      // Reset form
      setFormData(prev => ({
        ...prev,
        nama_pemesan: '',
        nis_kelas: '',
        no_hp: '',
        jumlah: 1,
        catatan: ''
      }));
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan saat memproses pesanan.');
    }
  };

  const copyInvoice = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="pesan" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-indigo-100">
            Pemesanan Online
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Form Pemesanan Seragam &amp; Baju Olahraga
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Isi data lengkap Anda untuk memesan seragam. Setelah memesan, Anda akan mendapatkan kode pesanan untuk melacak progres pengerjaan konveksi.
          </p>
        </div>

        {/* Success Modal / Card */}
        {successOrder && (
          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl shadow-lg relative animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-emerald-900">Pesanan Berhasil Dibuat!</h3>
                <p className="text-xs text-emerald-800">
                  Simpan kode pesanan berikut untuk mengecek status pesanan atau konfirmasi ke pihak konveksi:
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="font-mono text-base font-extrabold text-emerald-950 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-sm">
                    {successOrder.kode_pesanan}
                  </span>
                  <button
                    onClick={() => copyInvoice(successOrder.kode_pesanan)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-200/60 hover:bg-emerald-200 px-3 py-2 rounded-lg transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
                <div className="text-xs text-emerald-700 pt-2 border-t border-emerald-200/80">
                  Item: <strong>{successOrder.nama_produk}</strong> ({successOrder.ukuran}) &bull; {successOrder.jumlah} pcs &bull; Total: <strong>{rupiah(successOrder.total_harga)}</strong>
                </div>
              </div>
              <button
                onClick={() => setSuccessOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-slate-50/80 rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            
            {/* Nama Pemesan */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nama Lengkap Siswa / Pemesan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizki"
                value={formData.nama_pemesan}
                onChange={e => setFormData({ ...formData, nama_pemesan: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* NIS / Kelas */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                NIS / Kelas &amp; Jurusan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: X TKJ 1 / NIS: 2026001"
                value={formData.nis_kelas}
                onChange={e => setFormData({ ...formData, nis_kelas: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nomor WhatsApp / HP Aktif *
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 081234567890"
                value={formData.no_hp}
                onChange={e => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Digunakan untuk informasi konfirmasi seragam siap diambil.</span>
            </div>

            {/* Pilihan Produk */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Pilih Produk Seragam *
              </label>
              <select
                required
                value={formData.product_id}
                onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="">-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={Number(p.stok) <= 0}>
                    {p.nama_produk} ({rupiah(p.harga)}) {Number(p.stok) <= 0 ? '- [Habis]' : `[Stok: ${p.stok}]`}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilihan Ukuran */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                Ukuran Seragam *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ukuranList.map(u => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setFormData({ ...formData, ukuran: u })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      formData.ukuran === u
                        ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah Pesanan */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Jumlah Pesanan (Pcs) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.jumlah}
                onChange={e => setFormData({ ...formData, jumlah: Math.max(1, parseInt(e.target.value || '1', 10)) })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Lengan panjang / ukuran khusus lingkar dada"
              value={formData.catatan}
              onChange={e => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Estimasi Biaya & Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold block">Total Estimasi Pembayaran:</span>
              <span className="text-2xl font-black text-indigo-700">{rupiah(estimatedTotal)}</span>
              {currentProduct && (
                <span className="text-xs text-slate-500 block">
                  ({rupiah(currentProduct.harga)} &times; {formData.jumlah} pcs)
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !currentProduct || Number(currentProduct.stok) <= 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/30 transition hover:-translate-y-0.5 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{loading ? 'Memproses Pesanan...' : 'Kirim Pesanan Sekarang'}</span>
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
