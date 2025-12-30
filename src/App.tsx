import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import PreOrder from './pages/PreOrder';
import Updates from './pages/Updates';
import Catalog from './pages/Catalog';
import { usePoints } from './hooks/usePoints';

// --- Navbar Component ---
interface NavbarProps {
  points: number;
}

const Navbar: React.FC<NavbarProps> = ({ points }) => {
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
        {/* ✅ 3. Logo ใน Navbar: ล็อคใช้แบบ DarkTone (ตัวขาว) เสมอ เพราะพื้นหลังดำ */}
        <img
          src="/DomPort_DarkTone.png"
          alt="DomPort Logo"
          style={{ height: '50px', marginRight: '10px' }}
        />
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
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{points} pts</span>
          </div>
        )}

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

        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/catalog" style={linkStyle}>Catalog</Link>
        <Link to="/preorder" style={linkStyle}>Pre-Order</Link>
        <Link to="/updates" style={linkStyle}>Updates</Link>
        <Link to="/about" style={linkStyle}>About Us</Link>

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
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

// --- Home Component ---
// ส่วนเนื้อหา Home ยังคงเปลี่ยนสีตามโหมด (Dark/Light) เพื่อความสวยงาม
interface HomeProps {
  addPoints: (amount: number) => void;
}

const Home: React.FC<HomeProps> = ({ addPoints }) => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [canCheckIn, setCanCheckIn] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t) setCurrentTheme(t);
    };
    const interval = setInterval(checkTheme, 100);
    const lastCheckIn = localStorage.getItem('last_check_in');
    if (lastCheckIn) {
      const today = new Date().toDateString();
      if (lastCheckIn === today) setCanCheckIn(false);
    }

    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    if (canCheckIn) {
      addPoints(10);
      setCanCheckIn(false);
      const today = new Date().toDateString();
      localStorage.setItem('last_check_in', today);
      alert("You earned 10 points!");
    }
  };

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
        Welcome to <span style={{ color: '#FF5722', textShadow: '0 0 15px rgba(255,87,34,0.6)' }}>DomPort</span>
      </h1>
      <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
        Your ultimate gateway to the fandom universe.
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
          Explore Now
        </Link>

        <button
          onClick={handleCheckIn}
          disabled={!canCheckIn}
          style={{
            padding: '15px 40px',
            fontSize: '1.1rem',
            background: canCheckIn ? 'linear-gradient(45deg, #FFD700, #FFA500)' : '#555',
            color: canCheckIn ? '#000' : '#888',
            borderRadius: '50px',
            border: 'none',
            fontWeight: 'bold',
            cursor: canCheckIn ? 'pointer' : 'not-allowed',
            boxShadow: canCheckIn ? '0 0 20px rgba(255, 215, 0, 0.4)' : 'none',
            transition: 'transform 0.2s'
          }}
        >
          {canCheckIn ? '✨ Collect Daily Points' : '✅ Checked In Today'}
        </button>
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
          <Route path="/" element={<Home addPoints={addPoints} />} />
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