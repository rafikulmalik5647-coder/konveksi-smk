# 🧵 Konveksi SMKN 1 Idi — Web App (React + Vite + Supabase)

Aplikasi web modern berbasis **React + Vite** untuk sistem pemesanan seragam sekolah, seragam pramuka, baju olahraga, dan wearpack praktik resmi Konveksi SMK Negeri 1 Idi. Dilengkapi integrasi database **Supabase** dan siap langsung dideploy ke **Vercel**.

---

## 🚀 Fitur Aplikasi

1. **Katalog Produk Interaktif:**
   - Filter kategori (Semua, Seragam Sekolah, Baju Olahraga, Wearpack Praktik).
   - Tampilan stok *real-time* & harga dalam format Rupiah.
   - Tombol pesan langsung yang otomatis mengisi formulir pesanan.

2. **Form Pemesanan Online:**
   - Input nama siswa, NIS/kelas, dan nomor WhatsApp.
   - Pilihan ukuran seragam (S, M, L, XL, XXL).
   - Perhitungan total otomatis secara langsung (`harga * jumlah`).
   - Kode Invoice unik otomatis (contoh: `INV-20261018-XXXX`) dengan tombol salin kode.

3. **Lacak Status Pesanan:**
   - Pencarian status pesanan menggunakan Kode Invoice atau Nomor WhatsApp.
   - Badge status interaktif: *Menunggu Konfirmasi*, *Diproses / Dijahit*, *Siap Diambil*, *Selesai*, *Dibatalkan*.

4. **Dashboard Admin Terpadu:**
   - Panel statistik pesanan & total pendapatan konveksi.
   - Manajemen pesanan: filter status, perbarui status pengerjaan, dan hapus pesanan.
   - Tambah produk seragam atau baju olahraga baru ke katalog.
   - Keamanan akun & ganti password admin.

---

## 🗄️ Menghubungkan ke Database Supabase

Aplikasi sudah mendukung **Supabase Client (`@supabase/supabase-js`)**. Jika belum dihubungkan, aplikasi tetap dapat dijalankan secara interaktif menggunakan mode penyimpanan lokal bawaan.

### Langkah Setup Supabase:

1. Buka [Supabase](https://supabase.com) dan buat proyek baru.
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Buka file [`supabase-schema.sql`](./supabase-schema.sql) di proyek ini, salin seluruh kodenya, lalu klik **Run**.
4. Buka menu **Project Settings** -> **API** di Supabase untuk mendapatkan:
   - **Project URL**
   - **anon / public key**
5. Buka file `.env` di folder ini dan masukkan kredensial:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```

---

## 💻 Menjalankan Secara Lokal

Pastikan Anda berada di folder `konveksi-app`:

```bash
# Jalankan server pengembangan lokal (Vite)
npm run dev
```

Buka URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

---

## ☁️ Panduan Deploy ke Vercel

Proyek ini telah dilengkapi dengan [`vercel.json`](./vercel.json) sehingga sudah **100% siap deploy**:

1. **Upload ke GitHub:**
   - Buat repositori baru di GitHub dan lakukan push folder proyek ini.
2. **Deploy di Vercel:**
   - Masuk ke dashboard [Vercel](https://vercel.com).
   - Klik **Add New Project** lalu pilih repositori GitHub Anda.
   - Atur **Root Directory** ke: `konveksi-app` (jika disimpan dalam subfolder).
   - Tambahkan **Environment Variables** di Vercel:
     - `VITE_SUPABASE_URL` : URL proyek Supabase Anda
     - `VITE_SUPABASE_ANON_KEY` : Anon Public Key Supabase Anda
   - Klik **Deploy**.
3. Selesai! Web Anda akan aktif di URL `https://nama-proyek.vercel.app`.

---

## 🔐 Kredensial Admin Default
- **Username:** `admin`
- **Password:** `admin9671`
