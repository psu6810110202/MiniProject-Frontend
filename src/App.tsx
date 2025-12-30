import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import PreOrder from './pages/PreOrder';
import Updates from './pages/Updates';
import Catalog from './pages/Catalog';
import { usePoints } from './hooks/usePoints';
import { useLanguage } from './contexts/LanguageContext';

// --- Navbar Component ---
interface NavbarProps {
  points: number;
}

const Navbar: React.FC<NavbarProps> = ({ points }) => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const isLoggedIn = !!token;

  // เรายังต้องการ state เพื่อเปลี่ยน icon พระอาทิตย์/พระจันทร์
  const [theme, setTheme] = useState('dark');

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
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    navigate('/login');
    window.location.reload();
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
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FF5722', letterSpacing: '-1px' }}>
          Dom<span style={{ color: '#ffffff' }}>Port</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Points Display */}
        {isLoggedIn && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(255, 87, 34, 0.2)', padding: '5px 15px', borderRadius: '20px',
            border: '1px solid #FF5722'
          }}>
            <span style={{ fontSize: '1.2rem' }}>💎</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{points} {t('points')}</span>
          </div>
        )}

        <Link to="/" style={linkStyle}>{t('home')}</Link>
        <Link to="/catalog" style={linkStyle}>{t('catalog')}</Link>
        <Link to="/preorder" style={linkStyle}>{t('preorder')}</Link>
        <Link to="/updates" style={linkStyle}>{t('updates')}</Link>
        <Link to="/about" style={linkStyle}>{t('about')}</Link>

        {/* ปุ่มสลับ Theme: ยังทำงานเปลี่ยนสีเนื้อหาข้างล่าง แต่ตัวปุ่มเป็นสีขาว */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#ffffff', // ไอคอนสีขาว
            borderRadius: '50%',
            width: '40px', height: '40px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          {language === 'en' ? 'TH' : 'EN'}
        </button>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 20px', backgroundColor: '#d32f2f', color: 'white',
              border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              padding: '8px 20px', backgroundColor: '#FF5722', color: 'white',
              textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold'
            }}
          >
            {t('login')}
          </Link>
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

  return (
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
        <Link to="/about" style={{
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
  );
};

function App() {
  const { points, addPoints } = usePoints();

  return (
    <Router>
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <Navbar points={points} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/preorder" element={<PreOrder addPoints={addPoints} />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;