import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // ✅ Checkbox State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const token = data.access_token; // รับ Token จาก Backend

      // ✅ Logic: Remember Me
      if (rememberMe) {
        localStorage.setItem('access_token', token); // จำตลอดไป (จนกว่าจะ Logout)
      } else {
        sessionStorage.setItem('access_token', token); // จำแค่ปิด Browser
      }

      // alert('Login Successful!');
      navigate('/'); // ไปหน้า Home
      window.location.reload(); // Reload เพื่อให้ Navbar อัปเดตสถานะ

    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to manage your collection</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
             <label className="form-label">Username</label>
             <input 
               type="text" 
               className="form-input" 
               value={username} 
               onChange={(e) => setUsername(e.target.value)} 
               required 
             />
          </div>

          <div className="form-group">
             <label className="form-label">Password</label>
             <input 
               type="password" 
               className="form-input" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
             />
          </div>

          {/* ✅ Checkbox Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ marginRight: '8px', width: 'auto' }}
            />
            <label htmlFor="remember" style={{ color: '#4a5568', fontSize: '0.9rem', cursor: 'pointer' }}>
              Remember Me
            </label>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="toggle-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;