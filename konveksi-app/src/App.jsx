import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import OrderForm from './components/OrderForm';
import CheckOrder from './components/CheckOrder';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { getProducts, getOrders, createOrder } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State navigasi dan auth
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('konveksi_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load data awal dari Supabase / Store
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, orderData] = await Promise.all([
        getProducts(),
        getOrders()
      ]);
      setProducts(prodData || []);
      setOrders(orderData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler saat produk dipilih dari katalog
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    const formElem = document.getElementById('pesan');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler submit pesanan baru
  const handleOrderSuccess = async (orderPayload) => {
    const res = await createOrder(orderPayload);
    if (res.success) {
      // Refresh produk dan pesanan
      loadData();
    }
    return res;
  };

  // Handler auth login
  const handleLoginSuccess = (admin) => {
    setAdminUser(admin);
    setShowAdminDashboard(true);
    try {
      sessionStorage.setItem('konveksi_admin_session', JSON.stringify(admin));
    } catch (e) {
      console.error(e);
    }
  };

  // Handler auth logout
  const handleLogout = () => {
    setAdminUser(null);
    setShowAdminDashboard(false);
    try {
      sessionStorage.removeItem('konveksi_admin_session');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Jika Admin View Aktif */}
      {showAdminDashboard && adminUser ? (
        <AdminDashboard
          admin={adminUser}
          orders={orders}
          products={products}
          onRefreshData={loadData}
          onLogout={handleLogout}
          onBackToPublic={() => setShowAdminDashboard(false)}
        />
      ) : (
        /* Halaman Utama Publik */
        <>
          <Navbar
            onOpenAdminLogin={() => setIsLoginModalOpen(true)}
            isAdmin={Boolean(adminUser)}
            onToggleAdminView={() => setShowAdminDashboard(true)}
            showAdminDashboard={showAdminDashboard}
          />

          <main className="flex-1">
            <Hero
              onExploreCatalog={() => {
                document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onTrackOrder={() => {
                document.getElementById('cek-status')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <ProductCatalog
              products={products}
              onSelectProduct={handleSelectProduct}
            />

            <OrderForm
              products={products}
              selectedProduct={selectedProduct}
              onOrderSuccess={handleOrderSuccess}
            />

            <CheckOrder />
          </main>

          <Footer />
        </>
      )}

      {/* Modal Login Admin */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
