<?php
/**
 * File       : admin.php
 * Deskripsi  : Halaman Login & Dashboard Admin Konveksi SMK Negeri 1 Idi
 * Proyek     : Sistem Pemesanan Seragam Sekolah & Baju Olahraga - Konveksi SMK Negeri 1 Idi
 * Programmer : Rafikul Malik (Kelompok 3)
 */

declare(strict_types=1);
require_once __DIR__ . '/koneksi.php';

$pesan_sukses = '';
$pesan_error  = '';

// 1. Proses Logout Admin
if (($_GET['aksi'] ?? '') === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

// 2. Proses Login Admin (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['aksi'] ?? '') === 'login') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $pesan_error = 'Token keamanan tidak valid. Silakan coba lagi.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = (string) ($_POST['password'] ?? '');

        if ($username === '' || $password === '') {
            $pesan_error = 'Username dan password wajib diisi.';
        } else {
            $stmt = $pdo->prepare('SELECT id, username, password_hash, nama_lengkap FROM admins WHERE username = :username LIMIT 1');
            $stmt->execute([':username' => $username]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int) $admin['id'];
                $_SESSION['admin_nama'] = $admin['nama_lengkap'];
                $_SESSION['admin_username'] = $admin['username'];
                $_SESSION['admin_logged_in'] = true;
                header('Location: admin.php');
                exit;
            } else {
                $pesan_error = 'Username atau password salah.';
            }
        }
    }
}

$is_logged_in = !empty($_SESSION['admin_id']);

// 3. Proses Aksi Admin (Update Status, Tambah Produk, Hapus Pesanan)
if ($is_logged_in && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $pesan_error = 'Token keamanan CSRF tidak valid.';
    } else {
        $aksi = $_POST['aksi'] ?? '';

        if ($aksi === 'update_status') {
            $order_id     = filter_input(INPUT_POST, 'order_id', FILTER_VALIDATE_INT);
            $status_baru  = trim($_POST['status_pesanan'] ?? '');
            $status_valid = [
                'Menunggu Konfirmasi',
                'Diproses / Dijahit',
                'Siap Diambil',
                'Selesai',
                'Dibatalkan',
            ];

            if ($order_id && in_array($status_baru, $status_valid, true)) {
                $stmtUpd = $pdo->prepare('UPDATE orders SET status_pesanan = :status WHERE id = :id');
                $stmtUpd->execute([
                    ':status' => $status_baru,
                    ':id'     => $order_id,
                ]);
                $pesan_sukses = 'Status pesanan berhasil diperbarui menjadi "' . $status_baru . '".';
            } else {
                $pesan_error = 'Data perubahan status pesanan tidak valid.';
            }
        } elseif ($aksi === 'tambah_produk') {
            $kode_produk = strtoupper(trim($_POST['kode_produk'] ?? ''));
            $nama_produk = trim($_POST['nama_produk'] ?? '');
            $kategori    = trim($_POST['kategori'] ?? 'Seragam Sekolah');
            $deskripsi   = trim($_POST['deskripsi'] ?? '');
            $harga       = filter_input(INPUT_POST, 'harga', FILTER_VALIDATE_INT);
            $stok        = filter_input(INPUT_POST, 'stok', FILTER_VALIDATE_INT);

            $kategori_valid = ['Seragam Sekolah', 'Baju Olahraga', 'Wearpack Praktik'];

            if ($kode_produk === '' || $nama_produk === '' || !$harga || $harga < 1000 || $stok === false || $stok < 0) {
                $pesan_error = 'Harap isi seluruh data produk dengan benar.';
            } elseif (!in_array($kategori, $kategori_valid, true)) {
                $pesan_error = 'Kategori produk tidak valid.';
            } else {
                try {
                    $stmtAdd = $pdo->prepare('
                        INSERT INTO products (kode_produk, nama_produk, kategori, deskripsi, harga, stok, status_aktif)
                        VALUES (:kode, :nama, :kategori, :deskripsi, :harga, :stok, 1)
                    ');
                    $stmtAdd->execute([
                        ':kode'      => $kode_produk,
                        ':nama'      => $nama_produk,
                        ':kategori'  => $kategori,
                        ':deskripsi' => $deskripsi,
                        ':harga'     => $harga,
                        ':stok'      => $stok,
                    ]);
                    $pesan_sukses = 'Produk "' . $nama_produk . '" berhasil ditambahkan ke katalog.';
                } catch (PDOException $e) {
                    $pesan_error = 'Gagal menambah produk (Kode Produk mungkin sudah digunakan).';
                }
            }
        } elseif ($aksi === 'hapus_pesanan') {
            $order_id = filter_input(INPUT_POST, 'order_id', FILTER_VALIDATE_INT);
            if ($order_id) {
                $stmtDel = $pdo->prepare('DELETE FROM orders WHERE id = :id');
                $stmtDel->execute([':id' => $order_id]);
                $pesan_sukses = 'Data pesanan berhasil dihapus.';
            }
        } elseif ($aksi === 'ganti_password') {
            $password_lama       = (string) ($_POST['password_lama'] ?? '');
            $password_baru       = (string) ($_POST['password_baru'] ?? '');
            $password_konfirmasi = (string) ($_POST['password_konfirmasi'] ?? '');

            if ($password_lama === '' || $password_baru === '' || $password_konfirmasi === '') {
                $pesan_error = 'Semua field ganti password wajib diisi.';
            } elseif (strlen($password_baru) < 6) {
                $pesan_error = 'Password baru minimal 6 karakter.';
            } elseif ($password_baru !== $password_konfirmasi) {
                $pesan_error = 'Konfirmasi password baru tidak cocok.';
            } else {
                $stmtAdmin = $pdo->prepare('SELECT id, password_hash FROM admins WHERE id = :id LIMIT 1');
                $stmtAdmin->execute([':id' => $_SESSION['admin_id']]);
                $currentAdmin = $stmtAdmin->fetch();

                if (!$currentAdmin || !password_verify($password_lama, $currentAdmin['password_hash'])) {
                    $pesan_error = 'Password saat ini tidak sesuai.';
                } else {
                    $newHash = password_hash($password_baru, PASSWORD_BCRYPT);
                    $stmtUpdPass = $pdo->prepare('UPDATE admins SET password_hash = :hash WHERE id = :id');
                    $stmtUpdPass->execute([
                        ':hash' => $newHash,
                        ':id'   => $_SESSION['admin_id'],
                    ]);
                    $pesan_sukses = 'Password admin berhasil diperbarui.';
                }
            }
        }
    }
}

// 4. Ambil Data Statistik & Daftar Pesanan
$statistik = [
    'total_pesanan' => 0,
    'menunggu'      => 0,
    'diproses'      => 0,
    'siap_diambil'  => 0,
    'pendapatan'    => 0,
];
$daftar_pesanan = [];

if ($is_logged_in) {
    $stmtStat = $pdo->query("
        SELECT
            COUNT(*) AS total_pesanan,
            SUM(CASE WHEN status_pesanan = 'Menunggu Konfirmasi' THEN 1 ELSE 0 END) AS menunggu,
            SUM(CASE WHEN status_pesanan = 'Diproses / Dijahit' THEN 1 ELSE 0 END) AS diproses,
            SUM(CASE WHEN status_pesanan = 'Siap Diambil' THEN 1 ELSE 0 END) AS siap_diambil,
            SUM(CASE WHEN status_pesanan != 'Dibatalkan' THEN total_harga ELSE 0 END) AS pendapatan
        FROM orders
    ");
    $statistik = $stmtStat->fetch() ?: $statistik;

    $filter_status = trim($_GET['status'] ?? '');
    if ($filter_status !== '') {
        $stmtOrders = $pdo->prepare('
            SELECT o.*, p.nama_produk, p.kode_produk
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.status_pesanan = :status
            ORDER BY o.created_at DESC
        ');
        $stmtOrders->execute([':status' => $filter_status]);
    } else {
        $stmtOrders = $pdo->query('
            SELECT o.*, p.nama_produk, p.kode_produk
            FROM orders o
            JOIN products p ON o.product_id = p.id
            ORDER BY o.created_at DESC
        ');
    }
    $daftar_pesanan = $stmtOrders->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Konveksi SMK Negeri 1 Idi</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="alternate icon" type="image/x-icon" href="favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen">

<?php if (!$is_logged_in): ?>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div class="text-center mb-6">
                <span class="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Panel Pengelola Konveksi
                </span>
                <h1 class="text-2xl font-extrabold text-slate-900">Login Admin</h1>
                <p class="text-xs text-slate-500 mt-1">Konveksi SMK Negeri 1 Idi</p>
            </div>

            <?php if ($pesan_error !== ''): ?>
                <div class="mb-4 bg-red-50 border border-red-300 text-red-700 text-xs font-medium p-3 rounded-lg">
                    <?= e($pesan_error) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="admin.php" class="space-y-4">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="aksi" value="login">

                <div>
                    <label class="block text-xs font-bold uppercase text-slate-600 mb-1" for="username">Username</label>
                    <input type="text" id="username" name="username" required autofocus
                           value="<?= e($_POST['username'] ?? '') ?>"
                           placeholder="admin"
                           class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-600 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase text-slate-600 mb-1" for="password">Password</label>
                    <div class="relative">
                        <input type="password" id="password" name="password" required
                               placeholder="••••••••"
                               class="w-full rounded-lg border border-slate-300 pl-3.5 pr-10 py-2.5 text-sm focus:border-indigo-600 focus:outline-none">
                        <button type="button" id="toggleLoginPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" aria-label="Lihat / sembunyikan password">
                            <svg id="eyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <svg id="eyeOffIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <button type="submit"
                        class="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-lg shadow transition">
                    Masuk ke Dashboard
                </button>
            </form>

            <div class="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                <a href="index.php" class="text-indigo-600 hover:underline font-semibold">&larr; Ke Halaman Utama</a>
            </div>
        </div>
    </div>

<?php else: ?>
    <header class="bg-slate-900 text-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-lg font-bold">Dashboard Admin &mdash; Konveksi SMKN 1 Idi</h1>
                        <span class="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">Resmi</span>
                    </div>
                    <p class="text-xs text-slate-400">Selamat datang, <?= e($_SESSION['admin_nama'] ?? 'Admin') ?></p>
                </div>
            </div>
            <div class="flex items-center gap-3 text-sm">
                <a href="index.php" class="text-slate-300 hover:text-white transition">Lihat Katalog Publik</a>
                <a href="admin.php?aksi=logout" class="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition">
                    Logout
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <?php if ($pesan_sukses !== ''): ?>
            <div class="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-lg text-emerald-800 text-sm font-medium">
                <?= e($pesan_sukses) ?>
            </div>
        <?php endif; ?>

        <?php if ($pesan_error !== ''): ?>
            <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg text-red-800 text-sm font-medium">
                <?= e($pesan_error) ?>
            </div>
        <?php endif; ?>

        <section class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p class="text-xs font-semibold uppercase text-slate-500">Total Pesanan</p>
                <p class="text-2xl font-extrabold text-slate-900 mt-1"><?= (int) $statistik['total_pesanan'] ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <p class="text-xs font-semibold uppercase text-amber-700">Menunggu Konfirmasi</p>
                <p class="text-2xl font-extrabold text-amber-600 mt-1"><?= (int) $statistik['menunggu'] ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                <p class="text-xs font-semibold uppercase text-blue-700">Diproses / Dijahit</p>
                <p class="text-2xl font-extrabold text-blue-600 mt-1"><?= (int) $statistik['diproses'] ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                <p class="text-xs font-semibold uppercase text-purple-700">Siap Diambil</p>
                <p class="text-2xl font-extrabold text-purple-600 mt-1"><?= (int) $statistik['siap_diambil'] ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm">
                <p class="text-xs font-semibold uppercase text-emerald-700">Total Nilai Pesanan</p>
                <p class="text-xl font-extrabold text-emerald-700 mt-1"><?= rupiah((int) $statistik['pendapatan']) ?></p>
            </div>
        </section>

        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Daftar Pesanan Seragam &amp; Baju Olahraga</h2>
                    <p class="text-xs text-slate-500">Kelola status pengerjaan konveksi dan rekap pesanan siswa.</p>
                </div>

                <form method="GET" action="admin.php" class="flex items-center gap-2 text-xs">
                    <select name="status" class="rounded-lg border border-slate-300 px-3 py-1.5 bg-white">
                        <option value="">-- Semua Status --</option>
                        <?php
                        $opsi_status = ['Menunggu Konfirmasi', 'Diproses / Dijahit', 'Siap Diambil', 'Selesai', 'Dibatalkan'];
                        foreach ($opsi_status as $st):
                        ?>
                            <option value="<?= e($st) ?>" <?= ($filter_status === $st) ? 'selected' : '' ?>><?= e($st) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <button type="submit" class="bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold">Filter</button>
                </form>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                        <tr>
                            <th class="py-3 px-4">Kode &amp; Tanggal</th>
                            <th class="py-3 px-4">Pemesan / Kelas</th>
                            <th class="py-3 px-4">Produk</th>
                            <th class="py-3 px-4">Ukuran &amp; Jml</th>
                            <th class="py-3 px-4">Total Harga</th>
                            <th class="py-3 px-4">Status Saat Ini</th>
                            <th class="py-3 px-4">Ubah Status / Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <?php if (empty($daftar_pesanan)): ?>
                            <tr>
                                <td colspan="7" class="py-8 text-center text-slate-500">Belum ada data pesanan.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($daftar_pesanan as $o): ?>
                                <tr class="hover:bg-slate-50/80">
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        <div class="font-mono font-bold text-indigo-700"><?= e($o['kode_pesanan']) ?></div>
                                        <div class="text-slate-400"><?= e($o['created_at']) ?></div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-900"><?= e($o['nama_pemesan']) ?></div>
                                        <div class="text-slate-500"><?= e($o['nis_kelas']) ?> &bull; <?= e($o['no_hp']) ?></div>
                                        <?php if (!empty($o['catatan'])): ?>
                                            <div class="text-amber-700 italic mt-0.5">Catatan: <?= e($o['catatan']) ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="py-3 px-4 font-medium text-slate-800">
                                        <?= e($o['nama_produk']) ?>
                                    </td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        <span class="font-bold bg-slate-100 px-2 py-0.5 rounded"><?= e($o['ukuran']) ?></span>
                                        &times; <?= (int) $o['jumlah'] ?> pcs
                                    </td>
                                    <td class="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                                        <?= rupiah((int) $o['total_harga']) ?>
                                    </td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        <span class="px-2.5 py-1 rounded-full font-semibold border <?= badge_status($o['status_pesanan']) ?>">
                                            <?= e($o['status_pesanan']) ?>
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 whitespace-nowrap">
                                        <div class="flex items-center gap-2">
                                            <form method="POST" action="admin.php" class="flex items-center gap-1">
                                                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                                                <input type="hidden" name="aksi" value="update_status">
                                                <input type="hidden" name="order_id" value="<?= (int) $o['id'] ?>">
                                                <select name="status_pesanan" class="rounded border border-slate-300 px-2 py-1 text-xs bg-white">
                                                    <?php foreach ($opsi_status as $st): ?>
                                                        <option value="<?= e($st) ?>" <?= ($o['status_pesanan'] === $st) ? 'selected' : '' ?>>
                                                            <?= e($st) ?>
                                                        </option>
                                                    <?php endforeach; ?>
                                                </select>
                                                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded font-semibold">
                                                    Simpan
                                                </button>
                                            </form>

                                            <form method="POST" action="admin.php" onsubmit="return confirm('Hapus data pesanan ini?');">
                                                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                                                <input type="hidden" name="aksi" value="hapus_pesanan">
                                                <input type="hidden" name="order_id" value="<?= (int) $o['id'] ?>">
                                                <button type="submit" class="text-red-600 hover:text-red-800 font-semibold px-2 py-1">
                                                    Hapus
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-1">Tambah Produk Seragam / Baju Olahraga Baru</h2>
            <p class="text-xs text-slate-500 mb-4">Tambahkan item baru ke katalog Konveksi SMK Negeri 1 Idi.</p>

            <form method="POST" action="admin.php" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="aksi" value="tambah_produk">

                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Kode Produk *</label>
                    <input type="text" name="kode_produk" required maxlength="20" placeholder="Contoh: SRG-004"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Nama Produk *</label>
                    <input type="text" name="nama_produk" required maxlength="120" placeholder="Contoh: Jas Almamater SMKN 1 Idi"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Kategori *</label>
                    <select name="kategori" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                        <option value="Seragam Sekolah">Seragam Sekolah</option>
                        <option value="Baju Olahraga">Baju Olahraga</option>
                        <option value="Wearpack Praktik">Wearpack Praktik</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Harga (Rp) *</label>
                    <input type="number" name="harga" required min="1000" placeholder="150000"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Stok Awal (Pcs) *</label>
                    <input type="number" name="stok" required min="0" placeholder="100"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Deskripsi Singkat *</label>
                    <input type="text" name="deskripsi" required placeholder="Bahan drill halus + bordir logo"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                </div>
                <div class="sm:col-span-2 lg:col-span-3">
                    <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-sm shadow transition">
                        + Tambah Produk ke Katalog
                    </button>
                </div>
            </form>
        </section>

        <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-1">Keamanan Akun &amp; Ganti Password Admin</h2>
            <p class="text-xs text-slate-500 mb-4">Perbarui password akun admin secara berkala untuk menjaga keamanan data sistem konveksi.</p>

            <form method="POST" action="admin.php" class="grid sm:grid-cols-3 gap-4">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="aksi" value="ganti_password">

                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Password Saat Ini *</label>
                    <input type="password" name="password_lama" required placeholder="••••••••"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Password Baru *</label>
                    <input type="password" name="password_baru" required minlength="6" placeholder="Minimal 6 karakter"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Konfirmasi Password Baru *</label>
                    <input type="password" name="password_konfirmasi" required minlength="6" placeholder="Ulangi password baru"
                           class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none">
                </div>
                <div class="sm:col-span-3">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg text-sm shadow transition">
                        Simpan Password Baru
                    </button>
                </div>
            </form>
        </section>

    </main>
<?php endif; ?>

<script>
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', function () {
            const passInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            const eyeOffIcon = document.getElementById('eyeOffIcon');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeIcon.classList.add('hidden');
                eyeOffIcon.classList.remove('hidden');
            } else {
                passInput.type = 'password';
                eyeIcon.classList.remove('hidden');
                eyeOffIcon.classList.add('hidden');
            }
        });
    }
</script>

</body>
</html>