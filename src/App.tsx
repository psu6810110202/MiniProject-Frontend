import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import PreOrder from './pages/PreOrder';
import Updates from './pages/Updates';
import Catalog from './pages/Catalog';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
// import AdminDashboard from './pages/AdminDashboard'; // AdminDashboard is used within Profile page now
import Checkout from './pages/Checkout';
import CallCenter from './pages/CallCenter';
import CustomerChat from './pages/CustomerChat';
import StaffDashboard from './pages/StaffDashboard';
import { usePoints } from './hooks/usePoints';

import UserManager from './pages/UserManager';
import UserDetail from './pages/UserDetail';
import PreOrderManager from './pages/PreOrderManager';
import PreOrderDetail from './pages/PreOrderDetail';

import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { useProducts } from './contexts/ProductContext';
import { useCart } from './contexts/CartContext';

// --- Navbar Component ---
interface NavbarProps {
  points: number;
}

// Remove NavbarProps interface as it is no longer needed
// interface NavbarProps {
//   points: number;
// }

const Navbar: React.FC<NavbarProps> = ({ points }) => {
  const { t, language, setLanguage } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, totalAmount, totalItems } = useCart();
  const navigate = useNavigate();

  // เรายังต้องการ state เพื่อเปลี่ยน icon พระอาทิตย์/พระจันทร์
  const [theme, setTheme] = useState('dark');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // เปลี่ยน Theme รวมของเว็บ (Body, Cards, Text)
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ 1. Navbar Style: ล็อคเป็นสีดำ (ไม่ใช้ตัวแปร Theme)
  const navStyle: React.CSSProperties = {
    padding: '10px 40px',
    background: '#0a0a0a', // สีดำเสมอ
    borderBottom: '2px solid #FF5722',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  // ✅ 2. Link Style: ล็อคตัวหนังสือเป็นสีขาว (เพื่อให้เห็นบนแถบดำ)
  const linkStyle = {
    textDecoration: 'none',
    color: '#ffffff', // ขาวเสมอ
    fontWeight: '500'
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FF5722', letterSpacing: '-1px' }}>
            Dom<span style={{ color: '#ffffff' }}>Port</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/preorder" style={linkStyle}>{t('preorder')}</Link>
          <Link to="/fandoms" style={linkStyle}>All Fandom</Link>
          <Link to="/updates" style={linkStyle}>{t('updates')}</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

        {/* Search Icon */}
        <Link to="/catalog" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              color: 'white'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '150%',
              right: '-10px',
              width: '240px',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
              border: '1px solid #333',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001
            }}>
              <Link
                to={isLoggedIn ? "/profile" : "/login"}
                onClick={() => setIsDropdownOpen(false)}
                style={{
                  padding: '12px 20px',
                  color: 'white',
                  textDecoration: 'none',
                  borderBottom: '1px solid #333',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}
              >
                <span>👤</span> {t('profile')}
              </Link>



              {/* Points Display */}
              {isLoggedIn && (
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #333', background: 'rgba(255,87,34,0.1)' }}>
                  <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '5px' }}>Your Points</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF5722', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>💎</span> {points}
                  </div>
                </div>
              )}



              <div
                onClick={() => {
                  setLanguage(language === 'en' ? 'th' : 'en');
                }}
                style={{
                  padding: '12px 20px',
                  color: '#ccc',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #333'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🌐</span> {t('language')}
                </div>
                <span style={{ fontSize: '0.8rem', background: '#FF5722', padding: '2px 8px', borderRadius: '10px', color: 'white' }}>
                  {language.toUpperCase()}
                </span>
              </div>

              <div
                onClick={toggleTheme}
                style={{
                  padding: '12px 20px',
                  color: '#ccc',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #333'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{theme === 'dark' ? '🌙' : '☀️'}</span> {t('theme')}
                </div>
              </div>

              {isLoggedIn ? (
                <div
                  onClick={handleLogout}
                  style={{
                    padding: '12px 20px',
                    color: '#ff4444',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🚪</span> {t('logout')}
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsDropdownOpen(false)} style={{
                  padding: '12px 20px',
                  color: '#FF5722',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontWeight: 'bold'
                }}>
                  <span>🔑</span> {t('login')}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Cart Icon (Toggle Drawer) */}
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px', color: 'white'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span style={{ fontWeight: 'bold' }}>{totalItems}</span>
        </button>

        {/* Cart Drawer */}
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setIsCartOpen(false)}
              style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.5)', zIndex: 1100
              }}
            />
            {/* Drawer Panel */}
            <div style={{
              position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh',
              background: 'var(--card-bg)', zIndex: 1101,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-5px 0 30px rgba(0,0,0,0.5)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              {/* Drawer Header */}
              <div style={{
                padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '2px solid #FF5722'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('your_cart')}</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {cartItems.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '100%'
                  }}>
                    <div style={{ marginBottom: '20px', color: 'var(--border-color)' }}>
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('cart_empty')}</h3>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cartItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text-main)' }}>{item.name}</h4>
                          <div style={{ color: '#FF5722', fontWeight: 'bold' }}>{item.price}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: '#333', border: 'none', color: 'white', width: '25px', height: '25px', borderRadius: '5px', cursor: 'pointer' }}>-</button>
                            <span style={{ color: 'var(--text-main)' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.category === 'Pre-Order'}
                              title={item.category === 'Pre-Order' ? 'Limit 1 per account' : ''}
                              style={{
                                background: item.category === 'Pre-Order' ? '#1a1a1a' : '#333',
                                border: item.category === 'Pre-Order' ? '1px solid #333' : 'none',
                                color: item.category === 'Pre-Order' ? '#555' : 'white',
                                width: '25px', height: '25px', borderRadius: '5px',
                                cursor: item.category === 'Pre-Order' ? 'not-allowed' : 'pointer'
                              }}
                            >+</button>
                            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer (Total & Checkout) */}
              {cartItems.length > 0 && (
                <div style={{ padding: '20px', borderTop: '2px solid #FF5722', background: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    <span>Total:</span>
                    <span style={{ color: '#FF5722' }}>฿{totalAmount.toLocaleString()}</span>
                  </div>
                  <Link to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '15px',
                      background: '#FF5722',
                      color: 'white',
                      textAlign: 'center',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </div>

            {/* Keyframes for animation - inline style hack since we can't easily add keyframes in inline styles. 
                 Ideally this should be in CSS, but this works for a quick implementation. */}
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
          </>
        )}

      </div>
    </nav>
  );
};

// --- Home Component ---
// ส่วนเนื้อหา Home ยังคงเปลี่ยนสีตามโหมด (Dark/Light) เพื่อความสวยงาม
const Home: React.FC = () => {
  const { t } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');


  useEffect(() => {
    const checkTheme = () => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t) setCurrentTheme(t);
    };
    const interval = setInterval(checkTheme, 100);
    return () => clearInterval(interval);
  }, []);



  // ส่วนเนื้อหา Home ยังเปลี่ยนโลโก้ตามพื้นหลัง (เพราะพื้นหลัง Home เปลี่ยนสีได้)
  const logoSrc = currentTheme === 'dark' ? '/DomPort_DarkTone.png' : '/DomPort.png';

  const homeBackground = currentTheme === 'dark'
    ? 'radial-gradient(circle at center, #2e1005 0%, #000000 80%)'
    : 'radial-gradient(circle at center, #fff3e0 0%, #ffffff 80%)';

  // Extract unique fandoms and categories
  const { items, fandomImages } = useProducts();
  const fandoms = React.useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.fandom)));
    return unique.map(f => {
      const item = items.find(i => i.fandom === f);
      // Use custom image if available, else fallback to first item
      const image = (fandomImages && fandomImages[f]) ? fandomImages[f] : item?.image;
      return { name: f, image: image };
    });
  }, [items, fandomImages]);

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(items.map(item => item.category)));
    return unique.map(c => {
      const item = items.find(i => i.category === c);
      return { name: c, image: item?.image };
    });
  }, [items]);

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        padding: '80px 20px',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: homeBackground,
        transition: 'background 0.3s'
      }}>
        <img
          src={logoSrc}
          alt="DomPort Giant Logo"
          style={{
            width: '220px',
            marginBottom: '30px',
            transition: 'all 0.3s',
            filter: 'drop-shadow(0 0 15px rgba(255,87,34,0.4))'
          }}
        />
        <h1 style={{ fontSize: '4rem', marginBottom: '20px', fontWeight: '900', color: 'var(--text-main)' }}>
          {t('welcome')} <span style={{ color: '#FF5722', textShadow: '0 0 15px rgba(255,87,34,0.6)' }}>DomPort</span>
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
          {t('description')}
        </p>

        <div style={{ marginTop: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/catalog" style={{
            padding: '15px 40px',
            fontSize: '1.1rem',
            background: '#FF5722',
            color: 'white',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(255, 87, 34, 0.4)',
            transition: 'transform 0.2s'
          }}>
            {t('explore')}
          </Link>
        </div>
      </div>

      {/* All Fandom Section */}
      <div style={{
        padding: '60px 40px',
        background: 'var(--bg-color)',
        borderTop: '1px solid var(--border-color)',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          marginBottom: '30px',
          padding: '0 10px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            margin: 0,
            color: 'var(--text-main)',
            fontWeight: 'bold'
          }}>
            All Fandom
          </h2>
          <Link to="/fandoms" style={{
            color: '#FF5722',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            View All Fandom →
          </Link>
        </div>

        {/* Horizontal Scroll Container */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '40px', // Increased gap
          padding: '10px',
          scrollBehavior: 'smooth',
          paddingBottom: '20px' // Space for scrollbar
        }} className="custom-scrollbar">
          <style>{`
             .custom-scrollbar::-webkit-scrollbar {
               height: 8px;
             }
             .custom-scrollbar::-webkit-scrollbar-track {
               background: rgba(255, 255, 255, 0.05); 
               border-radius: 4px;
             }
             .custom-scrollbar::-webkit-scrollbar-thumb {
               background: #FF5722; 
               border-radius: 4px;
             }
             .custom-scrollbar::-webkit-scrollbar-thumb:hover {
               background: #F4511E; 
             }
           `}</style>
          {fandoms.map((f, i) => (
            <Link key={i} to={`/fandoms/${encodeURIComponent(f.name)}`} style={{ textDecoration: 'none' }}>
              <div style={{
                flex: '0 0 220px', // Smaller cards
                cursor: 'pointer',
                transition: 'transform 0.3s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                {/* Image Container - Square */}
                <div style={{
                  width: '220px',
                  height: '220px', // Square aspect ratio
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  background: 'var(--card-bg)'
                }}>
                  <img src={f.image} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  {/* Optional: Subtle gradient overlay for depth */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.4))',
                  }}></div>
                </div>

                <h3 style={{
                  textAlign: 'center',
                  color: 'var(--text-main)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  margin: '0',
                  letterSpacing: '0.5px'
                }}>
                  {f.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div style={{
        padding: '60px 40px',
        background: 'var(--bg-color)',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          marginBottom: '30px',
          padding: '0 10px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            margin: 0,
            color: 'var(--text-main)',
            fontWeight: 'bold'
          }}>
            Categories
          </h2>
          <Link to="/catalog" style={{
            color: '#FF5722',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            View All Categories →
          </Link>
        </div>

        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '40px',
          padding: '10px',
          scrollBehavior: 'smooth',
          paddingBottom: '20px'
        }} className="custom-scrollbar">
          {categories.slice(0, 6).map((c, i) => (
            <Link key={i} to="/catalog" style={{ textDecoration: 'none' }}>
              <div style={{
                flex: '0 0 220px',
                cursor: 'pointer',
                transition: 'transform 0.3s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                <div style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    padding: '20px',
                    height: '50%',
                    display: 'flex', alignItems: 'end', justifyContent: 'center'
                  }}>
                  </div>
                </div>
                <h3 style={{ textAlign: 'center', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Footer Component ---
const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--bg-color)',
      borderTop: '2px solid var(--border-color)',
      padding: '60px 40px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '40px'
      }}>
        {/* Brand Section */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-1px' }}>
            <span style={{ color: 'var(--text-main)' }}>DOM</span>
            <span style={{ color: '#FF5722' }}>PORT</span>
          </h2>
        </div>

        {/* Links Container */}
        <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
          {/* Shop Column */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-main)' }}>{t('shop')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/catalog" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('all_products')}</Link>
              <Link to="/preorder" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('preorder')}</Link>
              <Link to="/regular-products" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>Regular Products</Link>
            </div>
          </div>

          {/* About Column */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-main)' }}>{t('who_we_are')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('about')}</Link>
              <Link to="/updates" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('updates')}</Link>
              <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('for_fandoms')}</Link>
            </div>
          </div>

          {/* Support Column */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-main)' }}>{t('support')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/call-center" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('help_center')}</Link>
              <a href="https://track.thailandpost.co.th/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text-muted)', transition: 'color 0.2s' }}>{t('track_order')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

import FandomManager from './pages/FandomManager'; // Import FandomManager
import FandomList from './pages/FandomList';

import AllFandom from './pages/AllFandom';
import FandomDetail from './pages/FandomDetail';
import RegularProducts from './pages/RegularProducts';

import ProductDetail from './pages/ProductDetail';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const { points, addPoints } = usePoints();

  const { isLoggedIn, logout, user } = useAuth();
  const [showBlacklistKickModal, setShowBlacklistKickModal] = useState(false);

  // Auto-kick if blacklisted while logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const checkBlacklistStatus = async () => {
        try {
          // 1. API Check (Priority)
          const token = localStorage.getItem('access_token');
          if (token && user?.id) {
            try {
              const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                const remoteUser = await response.json();
                if (remoteUser.isBlacklisted) {
                  setShowBlacklistKickModal(true);
                  logout();
                  return;
                }
              }
            } catch (apiErr) {
              // API might be down, fall through to local
            }
          }

          // 2. Local Fallback
          const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
          const currentUser = db[user.id];
          if (currentUser && currentUser.isBlacklisted) {
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
    <Router>
      <ScrollToTop />
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>

        <Navbar points={points} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/preorder" element={<PreOrder addPoints={addPoints} />} />
            <Route path="/preorder/:id" element={<PreOrderDetail />} />
            <Route path="/regular-products" element={<RegularProducts />} />
            <Route path="/regular-products/:id" element={<ProductDetail />} />
            <Route path="/fandoms" element={<AllFandom />} />
            <Route path="/fandoms/:name" element={<FandomDetail />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/orders/:orderId" element={<OrderDetail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Admin Routes moved to /profile path */}
            <Route path="/profile/users" element={<UserManager />} />
            <Route path="/profile/users/:id" element={<UserDetail />} />
            <Route path="/profile/preorders" element={<PreOrderManager />} />
            <Route path="/profile/categories" element={<div style={{ padding: '100px', color: 'white' }}>Category Management Page (Coming Soon)</div>} />
            <Route path="/profile/products" element={<div style={{ padding: '100px', color: 'white' }}>Product Management Page (Coming Soon)</div>} />
            <Route path="/profile/fandoms" element={<FandomList />} />
            <Route path="/profile/fandom/:name" element={<FandomManager />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/regular-products" element={<RegularProducts />} />
            <Route path="/call-center" element={<CallCenter />} />
            <Route path="/customer-chat" element={<CustomerChat />} />
            <Route path="/staff-dashboard" element={<StaffDashboard />} />
            <Route path="/product/:id" element={<ProductDetail />} />

          </Routes>
        </div>
        <Footer />
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

      <style>{`
        @keyframes popInGlobal {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </Router>
  );
}

export default App;