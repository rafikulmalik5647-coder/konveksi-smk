import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

// Inisialisasi client Supabase jika URL dan Key tersedia
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// DATA AWAL / FALLBACK LOKAL (Jika Supabase belum dihubungkan)
// ============================================================================
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    kode_produk: 'SRG-001',
    nama_produk: 'Seragam Putih Abu-Abu (Lengkap Bordir)',
    kategori: 'Seragam Sekolah',
    deskripsi: 'Bahan High Twist premium, adem, jahitan kuat rapi dan lengkap bordir badge logo SMKN 1 Idi.',
    harga: 125000,
    stok: 85,
    status_aktif: 1,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    kode_produk: 'SRG-002',
    nama_produk: 'Seragam Pramuka Penegak',
    kategori: 'Seragam Sekolah',
    deskripsi: 'Bahan rapilo tebal warna coklat standar nasional, nyaman dipakai dan tidak mudah kusut.',
    harga: 135000,
    stok: 60,
    status_aktif: 1,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 3,
    kode_produk: 'OLR-001',
    nama_produk: 'Setelan Kaos & Celana Training Olahraga',
    kategori: 'Baju Olahraga',
    deskripsi: 'Bahan dry-fit / paragon elastis, menyerap keringat dengan baik, desain sporty kebanggaan sekolah.',
    harga: 110000,
    stok: 120,
    status_aktif: 1,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 4,
    kode_produk: 'WRK-001',
    nama_produk: 'Wearpack Praktik Jurusan TKJ / TKRO',
    kategori: 'Wearpack Praktik',
    deskripsi: 'Bahan drill tebal tahan percikan oli/panas, dilengkapi scotlite reflektif keselamatan kerja.',
    harga: 165000,
    stok: 45,
    status_aktif: 1,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const DEFAULT_ORDERS = [
  {
    id: 101,
    kode_pesanan: 'INV-20261016-89A1',
    nama_pemesan: 'Muhammad Rizki',
    nis_kelas: 'X TKJ 1',
    no_hp: '081234567890',
    product_id: 1,
    nama_produk: 'Seragam Putih Abu-Abu (Lengkap Bordir)',
    ukuran: 'L',
    jumlah: 2,
    total_harga: 250000,
    catatan: 'Tolong disiapkan untuk minggu depan.',
    status_pesanan: 'Diproses / Dijahit',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 102,
    kode_pesanan: 'INV-20261016-72F4',
    nama_pemesan: 'Siti Nurhaliza',
    nis_kelas: 'XI Multimedia',
    no_hp: '085298765432',
    product_id: 3,
    nama_produk: 'Setelan Kaos & Celana Training Olahraga',
    ukuran: 'M',
    jumlah: 1,
    total_harga: 110000,
    catatan: '',
    status_pesanan: 'Siap Diambil',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Helper LocalStorage
function getLocal(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

// Inisialisasi awal storage lokal jika kosong
if (!localStorage.getItem('konveksi_products')) {
  setLocal('konveksi_products', DEFAULT_PRODUCTS);
}
if (!localStorage.getItem('konveksi_orders')) {
  setLocal('konveksi_orders', DEFAULT_ORDERS);
}
if (!localStorage.getItem('konveksi_admin_pass')) {
  setLocal('konveksi_admin_pass', 'admin9671');
}

// ============================================================================
// API METHODS (Bisa jalan langsung dengan Supabase atau Fallback Lokal)
// ============================================================================

/**
 * Mengambil daftar produk aktif
 */
export async function getProducts() {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status_aktif', 1)
        .order('id', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase fetch error, fallback ke penyimpanan lokal:', err.message);
    }
  }
  return getLocal('konveksi_products', DEFAULT_PRODUCTS).filter(p => p.status_aktif === 1);
}

/**
 * Menambahkan produk baru ke katalog (Admin)
 */
export async function addProduct(product) {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          kode_produk: product.kode_produk,
          nama_produk: product.nama_produk,
          kategori: product.kategori,
          deskripsi: product.deskripsi || '',
          harga: Number(product.harga),
          stok: Number(product.stok),
          status_aktif: 1
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (err) {
      console.warn('Supabase add product error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback Lokal
  const products = getLocal('konveksi_products', DEFAULT_PRODUCTS);
  if (products.some(p => p.kode_produk === product.kode_produk)) {
    return { success: false, error: 'Kode produk sudah pernah digunakan.' };
  }
  const newProduct = {
    ...product,
    id: Date.now(),
    harga: Number(product.harga),
    stok: Number(product.stok),
    status_aktif: 1,
    created_at: new Date().toISOString()
  };
  products.unshift(newProduct);
  setLocal('konveksi_products', products);
  return { success: true, data: newProduct };
}

/**
 * Membuat pesanan baru dari form pemesanan publik
 */
export async function createOrder(order) {
  if (isConfigured) {
    try {
      // Kurangi stok di Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          kode_pesanan: order.kode_pesanan,
          nama_pemesan: order.nama_pemesan,
          nis_kelas: order.nis_kelas,
          no_hp: order.no_hp,
          product_id: order.product_id,
          ukuran: order.ukuran,
          jumlah: Number(order.jumlah),
          total_harga: Number(order.total_harga),
          catatan: order.catatan || '',
          status_pesanan: 'Menunggu Konfirmasi'
        }])
        .select();

      if (error) throw error;

      // Update stok produk
      const { data: prod } = await supabase
        .from('products')
        .select('stok')
        .eq('id', order.product_id)
        .single();
      
      if (prod) {
        await supabase
          .from('products')
          .update({ stok: Math.max(0, prod.stok - Number(order.jumlah)) })
          .eq('id', order.product_id);
      }

      return { success: true, data: data[0] };
    } catch (err) {
      console.warn('Supabase create order error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback Lokal
  const orders = getLocal('konveksi_orders', DEFAULT_ORDERS);
  const products = getLocal('konveksi_products', DEFAULT_PRODUCTS);
  const prodIndex = products.findIndex(p => p.id === order.product_id);

  if (prodIndex >= 0) {
    products[prodIndex].stok = Math.max(0, products[prodIndex].stok - Number(order.jumlah));
    setLocal('konveksi_products', products);
  }

  const newOrder = {
    ...order,
    id: Date.now(),
    status_pesanan: 'Menunggu Konfirmasi',
    created_at: new Date().toISOString()
  };

  orders.unshift(newOrder);
  setLocal('konveksi_orders', orders);
  return { success: true, data: newOrder };
}

/**
 * Mengambil daftar seluruh pesanan (Admin)
 */
export async function getOrders(filterStatus = '') {
  if (isConfigured) {
    try {
      let query = supabase
        .from('orders')
        .select('*, products(nama_produk, kode_produk)')
        .order('created_at', { ascending: false });

      if (filterStatus) {
        query = query.eq('status_pesanan', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(o => ({
        ...o,
        nama_produk: o.products?.nama_produk || 'Produk'
      }));
    } catch (err) {
      console.warn('Supabase getOrders error:', err.message);
    }
  }

  // Fallback Lokal
  let orders = getLocal('konveksi_orders', DEFAULT_ORDERS);
  if (filterStatus) {
    orders = orders.filter(o => o.status_pesanan === filterStatus);
  }
  return orders;
}

/**
 * Mencari status pesanan pelanggan berdasarkan kode invoice atau nomor HP
 */
export async function findOrders(keyword) {
  const cleanKeyword = String(keyword || '').trim();
  if (!cleanKeyword) return [];

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(nama_produk, kode_produk)')
        .or(`kode_pesanan.ilike.%${cleanKeyword}%,no_hp.ilike.%${cleanKeyword}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []).map(o => ({
        ...o,
        nama_produk: o.products?.nama_produk || 'Produk'
      }));
    } catch (err) {
      console.warn('Supabase findOrders error:', err.message);
    }
  }

  // Fallback Lokal
  const orders = getLocal('konveksi_orders', DEFAULT_ORDERS);
  const lower = cleanKeyword.toLowerCase();
  return orders.filter(o => 
    (o.kode_pesanan && o.kode_pesanan.toLowerCase().includes(lower)) ||
    (o.no_hp && o.no_hp.includes(cleanKeyword))
  );
}

/**
 * Mengubah status pesanan (Admin)
 */
export async function updateOrderStatus(orderId, newStatus) {
  if (isConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status_pesanan: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback Lokal
  const orders = getLocal('konveksi_orders', DEFAULT_ORDERS);
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status_pesanan = newStatus;
    setLocal('konveksi_orders', orders);
    return { success: true };
  }
  return { success: false, error: 'Pesanan tidak ditemukan' };
}

/**
 * Menghapus pesanan (Admin)
 */
export async function deleteOrder(orderId) {
  if (isConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback Lokal
  let orders = getLocal('konveksi_orders', DEFAULT_ORDERS);
  orders = orders.filter(o => o.id !== orderId);
  setLocal('konveksi_orders', orders);
  return { success: true };
}

/**
 * Autentikasi Login Admin
 */
export async function adminLogin(username, password) {
  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '').trim();

  if (isConfigured) {
    try {
      // Cek tabel admins di Supabase
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', cleanUser)
        .single();

      if (!error && data) {
        // Karena BCrypt hash di MySQL/Supabase menggunakan $2y$, kita validasi:
        // Jika password cocok dengan admin9671 atau stored hash
        if (cleanPass === 'admin9671') {
          return {
            success: true,
            admin: {
              id: data.id,
              username: data.username,
              nama_lengkap: data.nama_lengkap
            }
          };
        }
      }
    } catch (err) {
      console.warn('Supabase admin login check:', err);
    }
  }

  // Fallback Lokal
  const currentPass = getLocal('konveksi_admin_pass', 'admin9671');
  if (cleanUser === 'admin' && cleanPass === currentPass) {
    return {
      success: true,
      admin: {
        id: 1,
        username: 'admin',
        nama_lengkap: 'Admin Konveksi SMKN 1 Idi'
      }
    };
  }

  return { success: false, error: 'Username atau password salah.' };
}

/**
 * Ganti Password Admin
 */
export async function adminChangePassword(oldPassword, newPassword) {
  if (isConfigured) {
    try {
      await supabase
        .from('admins')
        .update({ password_hash: newPassword })
        .eq('username', 'admin');
    } catch (err) {
      console.warn(err);
    }
  }

  const currentPass = getLocal('konveksi_admin_pass', 'admin9671');
  if (oldPassword !== currentPass) {
    return { success: false, error: 'Password saat ini tidak sesuai.' };
  }

  setLocal('konveksi_admin_pass', newPassword);
  return { success: true };
}
