import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { usePoints } from './hooks/usePoints';

import Navbar from './components/Navbar';
import Footer from './components/footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import PreOrder from './pages/preorder/PreOrder';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import Checkout from './pages/Checkout';
import CreateTicket from './pages/CreateTicket';
import CallCenter from './pages/CallCenter';
import CustomerChat from './pages/CustomerChat';

import AllFandom from './pages/fandoms/AllFandom';
import FandomDetail from './pages/fandoms/FandomDetail';
import ProductDetail from './pages/fandoms/ProductDetail';
import RequestCustomProduct from './pages/RequestCustomProduct';

import UserDetail from './pages/UserDetail';
import PreOrderDetail from './pages/preorder/PreOrderDetail';

import FandomManager from './pages/admin/FandomManager';
import UserManager from './pages/admin/UserManager';
import PreOrderManager from './pages/admin/PreOrderManager';
import ProductManager from './pages/admin/products/ProductManager';
import ProductForm from './pages/admin/products/ProductForm';
import TicketManager from './pages/admin/TicketManager';
import CustomRequestManager from './pages/admin/CustomRequestManager';
import AdminDashboard from './pages/admin/AdminDashboard';

import { useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';

import { userAPI } from './services/api';

// ... (Other imports)

function MainLayout() {
  const { addPoints } = usePoints();

  const { isLoggedIn, logout, user } = useAuth();
  const [showBlacklistKickModal, setShowBlacklistKickModal] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);

  // Auto-kick if blacklisted while logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const checkBlacklistStatus = async () => {
        try {
          if (!user.id) return;

          try {
            // Use centralized API
            const remoteUser = await userAPI.getById(user.id);
            if (remoteUser && remoteUser.isBlacklisted) {
              setShowBlacklistKickModal(true);
              logout();
              return;
            }
          } catch (apiErr) {
            // API might be down or user not found (?)
            // Fallthrough to local check if critical
          }

          // 2. Local Fallback (Optional, but valid for continuity)
          const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
          if (db[user.id]?.isBlacklisted) {
            setShowBlacklistKickModal(true);
            logout();
          }
        } catch (e) {
          console.error("Blacklist check failed", e);
        }
      };

      checkBlacklistStatus();
      const interval = setInterval(checkBlacklistStatus, 3000); // Check every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user, logout]);

  return (
    <>
      <ScrollToTop />
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>

        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>

            {/* Home Routes */}
            <Route path="/" element={<Home />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Preorder Routes */}
            <Route path="/preorder" element={<PreOrder addPoints={addPoints} />} />
            <Route path="/preorder/:id" element={<PreOrderDetail />} />

            {/* Fandom Routes */}
            <Route path="/fandoms" element={<AllFandom />} />
            <Route path="/fandoms/:name" element={<FandomDetail />} />
            <Route path="/fandoms/:name/:id" element={<ProductDetail />} />

            {/* About Routes */}
            <Route path="/about" element={<AboutUs />} />

            {/* Checkout Routes */}
            <Route path="/checkout-payment" element={<Checkout />} />
            <Route path="/checkout-confirm" element={<Checkout />} />

            {/* Profile Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<Profile />} />
            <Route path="/profile/orders/:orderId" element={<OrderDetail />} />
            <Route path="/profile/users/:id" element={<UserDetail />} />
            {/* Profile Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManager />} />
            <Route path="/admin/tickets" element={<TicketManager />} />
            <Route path="/admin/preorders" element={<PreOrderManager />} />
            <Route path="/admin/products" element={<ProductManager />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/edit/:id" element={<ProductForm />} />
            <Route path="/admin/fandoms" element={<FandomManager />} />
            <Route path="/admin/custom-requests" element={<CustomRequestManager />} />

            {/* Support Routes */}
            <Route path="/call-center" element={<CallCenter />} />
            <Route path="/call-center/new-ticket" element={<CreateTicket />} />
            <Route path="/customer-chat" element={<CustomerChat />} />
            <Route path="/request-custom-product" element={<RequestCustomProduct />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '20px'
        }}>
          {showChatPopup && (
            <div style={{
              width: '350px',
              height: '500px',
              background: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: '0 5px 25px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <CustomerChat isPopup={true} onClose={() => setShowChatPopup(false)} />
            </div>
          )}
          <button
            onClick={() => setShowChatPopup(!showChatPopup)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FF5722',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255, 87, 34, 0.4)',
              transition: 'all 0.3s',
              transform: showChatPopup ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = showChatPopup ? 'rotate(90deg) scale(1.1)' : 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 87, 34, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = showChatPopup ? 'rotate(90deg) scale(1)' : 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 87, 34, 0.4)';
            }}
          >
            {showChatPopup ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Global Blacklist Kick Popup */}
      {showBlacklistKickModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1a1a1a',
            padding: '40px',
            borderRadius: '24px',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            border: '2px solid #FF5722',
            boxShadow: '0 20px 50px rgba(255, 87, 34, 0.3)',
            animation: 'popInGlobal 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            <div style={{
              width: '80px', height: '80px', background: 'rgba(255, 87, 34, 0.1)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#FF5722'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 style={{ color: '#FF5722', marginBottom: '15px', fontSize: '1.8rem' }}>บัญชีของคุณถูกระงับ</h2>
            <p style={{
              color: document.documentElement.getAttribute('data-theme') === 'light' ? '#333' : '#e0e0e0',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '30px',
              fontWeight: '500'
            }}>
              คุณถูก Blacklist ข้อหาผิดกฎที่คุณได้ตกลงและยอมรับไว้กับทางระบบ
            </p>
            <button
              onClick={() => {
                setShowBlacklistKickModal(false);
                window.location.href = '/login';
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Popup effect */}
      <style>{`
        @keyframes popInGlobal {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;