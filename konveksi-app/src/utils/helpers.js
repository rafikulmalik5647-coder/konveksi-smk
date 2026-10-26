/**
 * Format angka ke format Rupiah (Contoh: Rp 125.000)
 */
export function rupiah(nominal) {
  return 'Rp ' + Number(nominal || 0).toLocaleString('id-ID');
}

/**
 * Kembalikan class styling badge status Tailwind
 */
export function badgeStatus(status) {
  switch (status) {
    case 'Menunggu Konfirmasi':
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Menunggu Konfirmasi'
      };
    case 'Diproses / Dijahit':
      return {
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
        label: 'Diproses / Dijahit'
      };
    case 'Siap Diambil':
      return {
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        dot: 'bg-purple-500',
        label: 'Siap Diambil'
      };
    case 'Selesai':
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        label: 'Selesai'
      };
    case 'Dibatalkan':
      return {
        bg: 'bg-red-100 text-red-800 border-red-300',
        dot: 'bg-red-500',
        label: 'Dibatalkan'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-400',
        label: status || 'Unknown'
      };
  }
}

/**
 * Menghasilkan kode invoice acak (Contoh: INV-20261018-A8F3)
 */
export function generateInvoiceCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `INV-${dateStr}-${randomHex}`;
}

/**
 * Format timestamp menjadi tanggal lokal Indonesia
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
