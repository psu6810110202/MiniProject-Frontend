import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';

// --- Navbar Component ---
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const isLoggedIn = !!token;

  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
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

  const logoSrc = theme === 'dark' ? '/DomPort.png' : '/DomPort_DarkTone.png';

  // 👇👇 จุดที่ 1: แก้สี Navbar ตรงนี้ครับ 👇👇
  const navStyle = {
    padding: '10px 40px',
    // เปลี่ยนพื้นหลังเป็นสีดำเข้ม
    background: '#0a0a0a', 
    // เพิ่มเส้นขอบล่างสีส้ม
    borderBottom: '2px solid #FF5722', 
    // เพิ่มเงาสีส้มจางๆ ให้ดูสวย
    boxShadow: '0 4px 20px rgba(255, 87, 34, 0.2)', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'background 0.3s'
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src={logoSrc} 
          alt="DomPort Logo" 
          style={{ height: '50px', marginRight: '10px', transition: 'all 0.3s' }} 
        />
        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FF5722', letterSpacing: '-1px' }}>
          Dom<span style={{ color: 'var(--text-main)' }}>Port</span>
        </span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: '50%',
            width: '40px', height: '40px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>Home</Link>
        <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>About Us</Link>

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
const Home: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    const checkTheme = () => {
        const t = document.documentElement.getAttribute('data-theme');
        if(t) setCurrentTheme(t);
    };
    const interval = setInterval(checkTheme, 100); 
    return () => clearInterval(interval);
  }, []);

  const logoSrc = currentTheme === 'dark' ? '/DomPort.png' : '/DomPort_DarkTone.png';

  return (
    <div style={{ 
      padding: '80px 20px', 
      textAlign: 'center',
      minHeight: '80vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      // 👇👇 จุดที่ 2: แก้สีพื้นหลัง Home ตรงนี้ครับ 👇👇
      // ใช้การไล่สีจาก ตรงกลาง (ส้มเข้มๆ) -> ไปหาขอบ (สีดำ)
      background: 'radial-gradient(circle at center, #2e1005 0%, #000000 80%)' 
    }}>
      <img 
        src={logoSrc} 
        alt="DomPort Giant Logo" 
        style={{ 
          width: '220px', 
          marginBottom: '30px', 
          transition: 'all 0.3s',
          // เพิ่มเงาให้โลโก้เด่นขึ้น
          filter: 'drop-shadow(0 0 15px rgba(255,87,34,0.4))' 
        }} 
      />
      <h1 style={{ fontSize: '4rem', marginBottom: '20px', fontWeight: '900', color: 'var(--text-main)' }}>
        Welcome to <span style={{ color: '#FF5722', textShadow: '0 0 15px rgba(255,87,34,0.6)' }}>DomPort</span>
      </h1>
      <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
        Your ultimate gateway to the fandom universe.
      </p>
      
      <div style={{ marginTop: '40px' }}>
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
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;