import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Login: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true); // Default to true for better UX
    const [loading, setLoading] = useState(false);

    // ✅ 1. เพิ่มตัวแปรสำหรับตรวจจับ Theme (Dark/Light)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // ฟังก์ชันคอยเช็คว่า Navbar มีการเปลี่ยนโหมดหรือยัง (เช็คทุก 0.1 วินาที)
    useEffect(() => {
        const checkTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme && currentTheme !== theme) {
                setTheme(currentTheme);
            }
        };
        const interval = setInterval(checkTheme, 100);
        return () => clearInterval(interval);
    }, [theme]);

    const isDark = theme === 'dark'; // ตัวช่วยเช็คว่าเป็นโหมดมืดหรือไม่

    // ✅ Explicitly using React.ChangeEvent type
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Explicitly using React.FormEvent type
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.username, // Using username field as email for now, or update backend DTO
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.access_token) {
                login(data.access_token, data.user, rememberMe);
                navigate('/');
            } else {
                throw new Error('No access token received');
            }

        } catch (err: any) {
            console.error('Login Error:', err);
            // Fallback for demo users with persistence simulation
            const getPersistedUser = (defaultUser: any) => {
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    // If user exists in DB, use it (preserving points). Else use default (0 points).
                    return db[defaultUser.id] || defaultUser;
                } catch { return defaultUser; }
            };

            if (formData.username === 'demo' && formData.password === '1234') {
                const defaultUser = { id: 'mock-1', name: 'Demo User', email: 'demo@example.com', role: 'user', points: 0 };
                login('mock-user-token', getPersistedUser(defaultUser), rememberMe);
                navigate('/');
            } else if (formData.username === 'admin' && formData.password === 'admin') {
                const defaultAdmin = { id: 'mock-2', name: 'Admin User', email: 'admin@example.com', role: 'admin', points: 0 };
                login('mock-admin-token', getPersistedUser(defaultAdmin), rememberMe);
                navigate('/');
            } else {
                setError(err.message || 'Invalid email or username or password');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Dynamic Styles (เปลี่ยนสีตาม isDark) ---

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        // 🔥 ไฮไลท์: พื้นหลังเปลี่ยนตามโหมด
        // Dark: แสงส้มบนพื้นดำ
        // Light: แสงส้มบนพื้นขาว (เงาส้มฟุ้งๆ)
        background: isDark
            ? 'radial-gradient(circle at center, rgba(255, 87, 34, 0.4) 0%, #000000 70%)'
            : 'radial-gradient(circle at center, rgba(255, 87, 34, 0.25) 0%, #ffffff 70%)',
        padding: '20px',
        fontFamily: "'Inter', sans-serif",
        transition: 'background 0.3s ease' // เพิ่ม transition ให้สมูทเวลาเปลี่ยนโหมด
    };

    const cardStyle: React.CSSProperties = {
        // Dark: การ์ดสีเทาดำ / Light: การ์ดสีขาว
        background: isDark ? '#1a1a1a' : '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        // เงาของการ์ด
        boxShadow: isDark
            ? '0 10px 40px rgba(0, 0, 0, 0.8)' // เงาดำสำหรับโหมดมืด
            : '0 10px 40px rgba(255, 87, 34, 0.15)', // เงาส้มจางๆ สำหรับโหมดสว่าง
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        color: isDark ? '#ffffff' : '#333333', // เปลี่ยนสีตัวหนังสือตามโหมด
        border: isDark ? '1px solid #333' : '1px solid #ffe0b2', // ขอบสีเปลี่ยนตามโหมด
        transition: 'all 0.3s ease'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: isDark ? '#e0e0e0' : '#555555', // สี Label
        fontSize: '0.9rem',
        textAlign: 'left'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? '#ccc' : '#ddd',
        background: '#f0f4f8', // ให้ช่องกรอกเป็นสีสว่างเสมอเพื่อให้อ่านง่าย
        color: '#333',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border 0.3s'
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        background: '#FF5722',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        marginTop: '20px',
        boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
        transition: 'transform 0.2s, background 0.2s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{
                    marginBottom: '10px',
                    fontSize: '2rem',
                    color: '#FF5722',
                    fontWeight: '800',
                    letterSpacing: '-0.5px'
                }}>
                    {t('welcome_back')}
                </h2>
                <p style={{ color: isDark ? '#a0a0a0' : '#888888', marginBottom: '30px', fontSize: '0.95rem' }}>
                    {t('sign_in_desc')}
                </p>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(211, 47, 47, 0.1)',
                        border: '1px solid #d32f2f',
                        color: '#d32f2f',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'left'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('Username or Email') || 'Username or Email'}</label>
                        <input
                            type="text"
                            name="username" // Keep name as username for state mapping, but treat as identifier
                            value={formData.username}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('password')}</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: isDark ? '#a0a0a0' : '#666', textAlign: 'left' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ marginRight: '10px', accentColor: '#FF5722', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>{t('remember_me')}</label>
                    </div>

                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={loading}
                        onMouseOver={(e) => e.currentTarget.style.transform = loading ? 'none' : 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        {loading ? t('signing_in') : t('sign_in')}
                    </button>
                </form>

                <p style={{ marginTop: '25px', fontSize: '0.9rem', color: isDark ? '#888' : '#666' }}>
                    {t('dont_have_account')} <Link to="/register" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold' }}>{t('sign_up')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;