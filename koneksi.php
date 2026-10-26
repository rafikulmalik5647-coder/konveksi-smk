<?php
/**
 * File       : koneksi.php
 * Deskripsi  : Konfigurasi koneksi PDO MySQL & fungsi keamanan (CSRF, XSS, Session)
 * Proyek     : Sistem Pemesanan Seragam Sekolah & Baju Olahraga - Konveksi SMK Negeri 1 Idi
 * Programmer : Rafikul Malik (Kelompok 3)
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'db_konveksi_smkn1_idi');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // Wajib false agar Prepared Statement murni di sisi MySQL
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

    // Inisialisasi akun Admin default otomatis jika tabel admins masih kosong
    // Username: admin | Password: admin9671
    $cekAdmin = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if ($cekAdmin === 0) {
        $stmtSeed = $pdo->prepare('INSERT INTO admins (username, password_hash, nama_lengkap) VALUES (:u, :p, :n)');
        $stmtSeed->execute([
            ':u' => 'admin',
            ':p' => password_hash('admin9671', PASSWORD_BCRYPT),
            ':n' => 'Admin Konveksi SMKN 1 Idi',
        ]);
    }
} catch (PDOException $e) {
    error_log('Database Connection Error: ' . $e->getMessage());
    die('Koneksi database gagal. Pastikan database "db_konveksi_smkn1_idi" sudah dibuat di phpMyAdmin.');
}

/**
 * Sanitasi output HTML untuk mencegah XSS (Cross-Site Scripting)
 */
function e(?string $string): string
{
    return htmlspecialchars((string) $string, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Menghasilkan token CSRF untuk form POST
 */
function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Memvalidasi token CSRF dari request POST
 */
function verify_csrf(?string $token): bool
{
    if (empty($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Memformat angka menjadi format Rupiah
 */
function rupiah(int|float $nominal): string
{
    return 'Rp ' . number_format((float) $nominal, 0, ',', '.');
}

/**
 * Mengembalikan class warna badge Tailwind sesuai status pesanan
 */
function badge_status(string $status): string
{
    return match ($status) {
        'Menunggu Konfirmasi' => 'bg-amber-100 text-amber-800 border-amber-300',
        'Diproses / Dijahit'  => 'bg-blue-100 text-blue-800 border-blue-300',
        'Siap Diambil'        => 'bg-purple-100 text-purple-800 border-purple-300',
        'Selesai'             => 'bg-emerald-100 text-emerald-800 border-emerald-300',
        'Dibatalkan'          => 'bg-red-100 text-red-800 border-red-300',
        default               => 'bg-slate-100 text-slate-800 border-slate-300',
    };
}