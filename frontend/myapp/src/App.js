import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Notification from './components/Notification';
import GlobalModal from './components/GlobalModal';
import ScrollToTop from './components/ScrollToTop';
import { UIProvider } from './context/UIContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreDetails from './pages/StoreDetails';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperLogin from './pages/SuperLogin';
import Favorites from './pages/Favorites';
import BannedNotice from './pages/BannedNotice';

import Stores from './pages/Stores';
import Contact from './pages/Contact';

const AppContent = () => {
  const location = useLocation();
  const isImmersive = location.pathname.startsWith('/store/') ||
    location.pathname.startsWith('/admin/dashboard') ||
    location.pathname.startsWith('/super-admin/dashboard') ||
    location.pathname === '/superlogin';

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/store/:id" element={<StoreDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superlogin" element={<SuperLogin />} />
      <Route path="/banned" element={<BannedNotice />} />
    </Routes>
  );

  return (
    <>
      <Navbar />
      <CartSidebar />
      <Notification />
      <GlobalModal />
      <ScrollToTop />
      {isImmersive ? (
        <div style={{ paddingTop: '0' }}>
          {routes}
        </div>
      ) : (
        <div className="container" style={{ paddingTop: '90px' }}>
          {routes}
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
