<?php
/**
 * File       : index.php
 * Deskripsi  : Halaman Pelanggan (Katalog Produk, Form Pemesanan Online, & Cek Status Pesanan)
 * Proyek     : Sistem Pemesanan Seragam Sekolah & Baju Olahraga - Konveksi SMK Negeri 1 Idi
 * Programmer : Rafikul Malik (Kelompok 3)
 */

declare(strict_types=1);
require_once __DIR__ . '/koneksi.php';

$pesan_sukses      = '';
$pesan_error       = '';
$kode_pesanan_baru = '';

// 1. Proses Form Pemesanan Online (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['aksi'] ?? '') === 'buat_pesanan') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $pesan_error = 'Sesi keamanan tidak valid. Silakan muat ulang halaman dan coba lagi.';
    } else {
        $nama_pemesan = trim($_POST['nama_pemesan'] ?? '');
        $nis_kelas    = trim($_POST['nis_kelas'] ?? '');
        $no_hp        = preg_replace('/[^0-9+]/', '', trim($_POST['no_hp'] ?? ''));
        $product_id   = filter_input(INPUT_POST, 'product_id', FILTER_VALIDATE_INT);
        $ukuran       = trim($_POST['ukuran'] ?? '');
        $jumlah       = filter_input(INPUT_POST, 'jumlah', FILTER_VALIDATE_INT);
        $catatan      = trim($_POST['catatan'] ?? '');

        $ukuran_valid = ['S', 'M', 'L', 'XL', 'XXL'];

        if ($nama_pemesan === '' || mb_strlen($nama_pemesan) < 3) {
            $pesan_error = 'Nama pemesan wajib diisi minimal 3 karakter.';
        } elseif ($nis_kelas === '') {
            $pesan_error = 'Kelas / Jurusan wajib diisi (contoh: X TKJ 1).';
        } elseif (strlen($no_hp) < 9 || strlen($no_hp) > 16) {
            $pesan_error = 'Nomor WhatsApp / HP tidak valid.';
        } elseif (!$product_id || $product_id <= 0) {
            $pesan_error = 'Silakan pilih produk seragam atau baju olahraga.';
        } elseif (!in_array($ukuran, $ukuran_valid, true)) {
            $pesan_error = 'Ukuran yang dipilih tidak valid.';
        } elseif (!$jumlah || $jumlah < 1 || $jumlah > 100) {
            $pesan_error = 'Jumlah pesanan harus antara 1 sampai 100 pcs.';
        } else {
            try {
                $pdo->beginTransaction();

                $stmtProduk = $pdo->prepare('SELECT id, nama_produk, harga, stok FROM products WHERE id = :id AND status_aktif = 1 FOR UPDATE');
                $stmtProduk->execute([':id' => $product_id]);
                $produk = $stmtProduk->fetch();

                if (!$produk) {
                    $pdo->rollBack();
                    $pesan_error = 'Produk tidak ditemukan atau sedang tidak aktif.';
                } elseif ((int) $produk['stok'] < $jumlah) {
                    $pdo->rollBack();
                    $pesan_error = 'Stok untuk produk "' . e($produk['nama_produk']) . '" tersisa ' . (int) $produk['stok'] . ' pcs.';
                } else {
                    $total_harga  = (int) $produk['harga'] * $jumlah;
                    $kode_pesanan = 'INV-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));

                    $stmtInsert = $pdo->prepare('
                        INSERT INTO orders (kode_pesanan, nama_pemesan, nis_kelas, no_hp, product_id, ukuran, jumlah, total_harga, catatan)
                        VALUES (:kode_pesanan, :nama_pemesan, :nis_kelas, :no_hp, :product_id, :ukuran, :jumlah, :total_harga, :catatan)
                    ');
                    $stmtInsert->execute([
                        ':kode_pesanan' => $kode_pesanan,
                        ':nama_pemesan' => $nama_pemesan,
                        ':nis_kelas'    => $nis_kelas,
                        ':no_hp'        => $no_hp,
                        ':product_id'   => $product_id,
                        ':ukuran'       => $ukuran,
                        ':jumlah'       => $jumlah,
                        ':total_harga'  => $total_harga,
                        ':catatan'      => $catatan !== '' ? $catatan : null,
                    ]);

                    $stmtUpdateStok = $pdo->prepare('UPDATE products SET stok = stok - :jumlah WHERE id = :id');
                    $stmtUpdateStok->execute([
                        ':jumlah' => $jumlah,
                        ':id'     => $product_id,
                    ]);

                    $pdo->commit();
                    $kode_pesanan_baru = $kode_pesanan;
                    $pesan_sukses      = 'Pesanan berhasil dibuat! Simpan Kode Pesanan Anda untuk mengecek progres jahitan di konveksi.';
                }
            } catch (PDOException $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log('Order Creation Error: ' . $e->getMessage());
                $pesan_error = 'Terjadi kesalahan saat menyimpan pesanan. Silakan coba kembali.';
            }
        }
    }
}

// 2. Ambil Katalog Produk Aktif
$stmtKatalog   = $pdo->query('SELECT id, kode_produk, nama_produk, kategori, deskripsi, harga, stok FROM products WHERE status_aktif = 1 ORDER BY kategori ASC, nama_produk ASC');
$daftar_produk = $stmtKatalog->fetchAll();

// 3. Pencarian / Cek Status Pesanan (GET)
$keyword_cari = trim($_GET['cari'] ?? '');
$hasil_cari   = [];

if ($keyword_cari !== '') {
    $stmtCari = $pdo->prepare('
        SELECT o.*, p.nama_produk, p.kategori
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.kode_pesanan = :kode OR o.no_hp = :hp
        ORDER BY o.created_at DESC
        LIMIT 10
    ');
    $stmtCari->execute([
        ':kode' => $keyword_cari,
        ':hp'   => $keyword_cari,
    ]);
    $hasil_cari = $stmtCari->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konveksi SMK Negeri 1 Idi - Pemesanan Seragam &amp; Baju Olahraga</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="alternate icon" type="image/x-icon" href="favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col">

    <header class="bg-indigo-900 text-white shadow-md sticky top-0 z-30">
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-xl font-bold tracking-tight">Konveksi SMK Negeri 1 Idi</h1>
                        <span class="bg-indigo-700/60 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">Resmi</span>
                    </div>
                    <p class="text-xs text-indigo-200">Sistem Pemesanan Seragam Sekolah &amp; Baju Olahraga Berbasis Web</p>
                </div>
            </div>
            <nav class="flex items-center gap-4 text-sm font-medium">
                <a href="#katalog" class="hover:text-indigo-200 transition">Katalog Produk</a>
                <a href="#pesan" class="hover:text-indigo-200 transition">Form Pemesanan</a>
                <a href="#cek-status" class="hover:text-indigo-200 transition">Cek Pesanan</a>
            </nav>
        </div>
    </header>

    <section class="bg-gradient-to-r from-indigo-800 to-blue-700 text-white py-12">
        <div class="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
                <span class="inline-block bg-indigo-600/80 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-indigo-400">
                    Unit Produksi &amp; Konveksi Resmi Sekolah
                </span>
                <h2 class="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                    Pesan Seragam Sekolah &amp; Baju Olahraga Lebih Mudah
                </h2>
                <p class="text-indigo-100 text-sm md:text-base mb-6 leading-relaxed">
                    Pilih jenis seragam, tentukan ukuran yang pas, dan pantau status pengerjaan jahitan secara online di Konveksi SMK Negeri 1 Idi.
                </p>
                <div class="flex flex-wrap gap-3">
                    <a href="#pesan" class="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-lg shadow transition">
                        Pesan Sekarang
                    </a>
                    <a href="#cek-status" class="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg border border-white/30 transition">
                        Lacak Status Pesanan
                    </a>
                </div>
            </div>

            <div class="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
                <h3 class="font-bold text-base mb-3 text-amber-300">Panduan Ukuran Standar Konveksi (cm)</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left text-white">
                        <thead class="border-b border-white/20 text-indigo-100">
                            <tr>
                                <th class="py-2 pr-3">Ukuran</th>
                                <th class="py-2 px-3">Lebar Dada</th>
                                <th class="py-2 px-3">Panjang Baju</th>
                                <th class="py-2 pl-3">Panjang Celana/Rok</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/10">
                            <tr><td class="py-2 font-bold">S</td><td class="px-3">48 cm</td><td class="px-3">64 cm</td><td class="pl-3">90 cm</td></tr>
                            <tr><td class="py-2 font-bold">M</td><td class="px-3">50 cm</td><td class="px-3">67 cm</td><td class="pl-3">93 cm</td></tr>
                            <tr><td class="py-2 font-bold">L</td><td class="px-3">53 cm</td><td class="px-3">70 cm</td><td class="pl-3">96 cm</td></tr>
                            <tr><td class="py-2 font-bold">XL</td><td class="px-3">56 cm</td><td class="px-3">73 cm</td><td class="pl-3">99 cm</td></tr>
                            <tr><td class="py-2 font-bold">XXL</td><td class="px-3">59 cm</td><td class="px-3">76 cm</td><td class="pl-3">102 cm</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <main class="max-w-6xl mx-auto px-4 py-10 space-y-14 flex-1">

        <?php if ($pesan_sukses !== ''): ?>
            <div class="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-lg shadow-sm">
                <h3 class="text-emerald-900 font-bold text-base"><?= e($pesan_sukses) ?></h3>
                <p class="text-emerald-800 text-sm mt-1">
                    Kode Pesanan Anda: <span class="font-mono font-extrabold bg-emerald-200 px-2.5 py-0.5 rounded"><?= e($kode_pesanan_baru) ?></span>
                </p>
                <p class="text-xs text-emerald-700 mt-2">
                    Tunjukkan kode pesanan ini kepada petugas Konveksi SMK Negeri 1 Idi saat melakukan pembayaran atau pengambilan seragam.
                </p>
            </div>
        <?php endif; ?>

        <?php if ($pesan_error !== ''): ?>
            <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg shadow-sm text-red-800 text-sm font-medium">
                <?= e($pesan_error) ?>
            </div>
        <?php endif; ?>

        <!-- Katalog Produk -->
        <section id="katalog">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-slate-900">Katalog Seragam &amp; Baju Olahraga</h2>
                <p class="text-sm text-slate-600">Daftar produk resmi yang diproduksi oleh Konveksi SMK Negeri 1 Idi.</p>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($daftar_produk as $p): ?>
                    <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-3">
                                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <?= e($p['kategori']) ?>
                                </span>
                                <span class="text-xs font-mono text-slate-400"><?= e($p['kode_produk']) ?></span>
                            </div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2"><?= e($p['nama_produk']) ?></h3>
                            <p class="text-sm text-slate-600 leading-relaxed mb-4"><?= e($p['deskripsi']) ?></p>
                        </div>
                        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <p class="text-xs text-slate-500">Harga per Setelan/Pcs</p>
                                <p class="text-lg font-extrabold text-indigo-700"><?= rupiah((int) $p['harga']) ?></p>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-medium <?= (int) $p['stok'] > 0 ? 'text-emerald-600' : 'text-red-600' ?>">
                                    Stok: <?= (int) $p['stok'] ?> pcs
                                </span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <!-- Form Pemesanan & Cek Status Pesanan -->
        <section id="pesan" class="grid lg:grid-cols-12 gap-8 items-start">

            <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 class="text-xl font-bold text-slate-900 mb-1">Formulir Pemesanan Online</h2>
                <p class="text-sm text-slate-600 mb-6">Lengkapi data siswa dan detail ukuran seragam yang ingin dipesan.</p>

                <form method="POST" action="#pesan" class="space-y-4" id="formPemesanan">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="aksi" value="buat_pesanan">

                    <div class="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="nama_pemesan">Nama Lengkap Siswa / Pemesan *</label>
                            <input type="text" id="nama_pemesan" name="nama_pemesan" required maxlength="100"
                                   placeholder="Contoh: Muhammad Rizki"
                                   class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="nis_kelas">Kelas &amp; Jurusan / NIS *</label>
                            <input type="text" id="nis_kelas" name="nis_kelas" required maxlength="60"
                                   placeholder="Contoh: X TKJ 1 / 2026012"
                                   class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="no_hp">Nomor WhatsApp / HP Aktif *</label>
                        <input type="tel" id="no_hp" name="no_hp" required maxlength="16"
                               placeholder="Contoh: 081234567890"
                               class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="product_id">Pilih Produk Seragam / Baju Olahraga *</label>
                        <select id="product_id" name="product_id" required
                                class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none bg-white">
                            <option value="" data-harga="0">-- Pilih Produk --</option>
                            <?php foreach ($daftar_produk as $p): ?>
                                <?php if ((int) $p['stok'] > 0): ?>
                                    <option value="<?= (int) $p['id'] ?>" data-harga="<?= (int) $p['harga'] ?>">
                                        [<?= e($p['kategori']) ?>] <?= e($p['nama_produk']) ?> — <?= rupiah((int) $p['harga']) ?> (Stok: <?= (int) $p['stok'] ?>)
                                    </option>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="ukuran">Pilih Ukuran *</label>
                            <select id="ukuran" name="ukuran" required
                                    class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none bg-white">
                                <option value="S">S (Small)</option>
                                <option value="M" selected>M (Medium)</option>
                                <option value="L">L (Large)</option>
                                <option value="XL">XL (Extra Large)</option>
                                <option value="XXL">XXL (Double XL)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="jumlah">Jumlah Pesanan (Pcs/Setel) *</label>
                            <input type="number" id="jumlah" name="jumlah" required min="1" max="100" value="1"
                                   class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-600 mb-1" for="catatan">Catatan Tambahan (Opsional)</label>
                        <input type="text" id="catatan" name="catatan" maxlength="255"
                               placeholder="Contoh: Lengan panjang (muslimah) / celana panjang"
                               class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                    </div>

                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
                        <span class="text-sm font-semibold text-indigo-900">Estimasi Total Pembayaran:</span>
                        <span id="estimasiTotal" class="text-xl font-extrabold text-indigo-700">Rp 0</span>
                    </div>

                    <button type="submit"
                            class="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 px-5 rounded-lg shadow transition">
                        Kirim Pesanan Sekarang
                    </button>
                </form>
            </div>

            <div id="cek-status" class="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 class="text-xl font-bold text-slate-900 mb-1">Cek Status Pesanan</h2>
                <p class="text-sm text-slate-600 mb-4">Masukkan Kode Pesanan (misal: <code class="bg-slate-100 px-1 rounded">INV-20261016-1001</code>) atau Nomor HP Anda.</p>

                <form method="GET" action="#cek-status" class="flex gap-2 mb-6">
                    <input type="text" name="cari" value="<?= e($keyword_cari) ?>" required
                           placeholder="Kode Pesanan atau No. HP..."
                           class="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                    <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
                        Cari
                    </button>
                </form>

                <?php if ($keyword_cari !== ''): ?>
                    <?php if (empty($hasil_cari)): ?>
                        <div class="text-center py-6 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                            Data pesanan dengan kata kunci <strong>"<?= e($keyword_cari) ?>"</strong> tidak ditemukan.
                        </div>
                    <?php else: ?>
                        <div class="space-y-3">
                            <?php foreach ($hasil_cari as $row): ?>
                                <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
                                    <div class="flex items-center justify-between gap-2 mb-2">
                                        <span class="font-mono text-xs font-bold text-indigo-700"><?= e($row['kode_pesanan']) ?></span>
                                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full border <?= badge_status($row['status_pesanan']) ?>">
                                            <?= e($row['status_pesanan']) ?>
                                        </span>
                                    </div>
                                    <p class="font-bold text-sm text-slate-900"><?= e($row['nama_produk']) ?></p>
                                    <p class="text-xs text-slate-600 mt-0.5">
                                        Pemesan: <strong><?= e($row['nama_pemesan']) ?></strong> (<?= e($row['nis_kelas']) ?>)
                                    </p>
                                    <div class="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                                        <span>Ukuran: <strong><?= e($row['ukuran']) ?></strong> &times; <?= (int) $row['jumlah'] ?> pcs</span>
                                        <span class="font-bold text-slate-900"><?= rupiah((int) $row['total_harga']) ?></span>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>
            </div>

        </section>
    </main>

    <footer class="bg-slate-900 text-slate-400 text-xs py-6 mt-12">
        <div class="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
            <p>&copy; <?= date('Y') ?> Konveksi SMK Negeri 1 Idi — Kelompok 1 (Ridha Maharani, Abu, Rafikul Malik).</p>
            <p>Dikembangkan dengan PHP Native (PDO Prepared Statements) &amp; MySQL.</p>
        </div>
    </footer>

    <script>
        const selectProduk = document.getElementById('product_id');
        const inputJumlah  = document.getElementById('jumlah');
        const labelTotal   = document.getElementById('estimasiTotal');

        function hitungTotal() {
            const selectedOption = selectProduk.options[selectProduk.selectedIndex];
            const harga = parseInt(selectedOption.getAttribute('data-harga') || '0', 10);
            const jumlah = parseInt(inputJumlah.value || '0', 10);
            const total = (harga > 0 && jumlah > 0) ? harga * jumlah : 0;
            labelTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
        }

        selectProduk.addEventListener('change', hitungTotal);
        inputJumlah.addEventListener('input', hitungTotal);
    </script>
</body>
</html>