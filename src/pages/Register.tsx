import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Register: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ 1. เพิ่ม Logic ตรวจจับ Theme (Dark/Light) เหมือนหน้า Login
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

    const isDark = theme === 'dark'; // ตัวแปรเช็คสถานะโหมด

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        // จำลองการ Register (Mock)
        setTimeout(() => {
            console.log('Registering with:', formData);
            setLoading(false);
            alert('Registration successful! Please login.');
            navigate('/login');
        }, 1500);
    };

    // --- Dynamic Styles (เปลี่ยนตาม isDark) ---

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        // 🌓 พื้นหลัง: Dark=ดำไล่ส้ม / Light=ขาวไล่ส้มจางๆ
        background: isDark
            ? 'radial-gradient(circle at center, rgba(255, 87, 34, 0.2) 0%, #000000 70%)'
            : 'radial-gradient(circle at center, rgba(255, 87, 34, 0.15) 0%, #ffffff 70%)',
        padding: '20px',
        fontFamily: "'Inter', sans-serif",
        transition: 'background 0.3s ease'
    };

    const cardStyle: React.CSSProperties = {
        // 🌓 การ์ด: Dark=เทาดำ / Light=ขาว
        background: isDark ? '#1a1a1a' : '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        // 🔥 เงาฟุ้งสีส้มหลังกล่อง (ปรับความเข้มตามโหมดเพื่อให้ดูดีทั้งคู่)
        boxShadow: isDark
            ? '0 0 60px rgba(255, 87, 34, 0.6)'  // โหมดมืด: เงาส้มเข้ม
            : '0 0 60px rgba(255, 87, 34, 0.3)', // โหมดสว่าง: เงาส้มจางลงนิดนึงจะได้ไม่แสบตา
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        color: isDark ? '#ffffff' : '#333333',
        border: isDark ? '1px solid #333' : '1px solid #ffe0b2', // ขอบเปลี่ยนสี
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.3s ease'
    };

    const titleStyle: React.CSSProperties = {
        marginBottom: '10px',
        fontSize: '2rem',
        color: '#FF5722',
        fontWeight: '800',
        letterSpacing: '-0.5px',
        textTransform: 'capitalize'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: isDark ? '#e0e0e0' : '#555555', // สี Label เปลี่ยนตามโหมด
        fontSize: '0.9rem',
        textAlign: 'left'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? '#444' : '#ddd',
        // 🌓 ช่องกรอก: Dark=สีเทาเข้ม / Light=สีขาวควันบุหรี่
        background: isDark ? '#2a2a2a' : '#f9f9f9',
        color: isDark ? '#fff' : '#333',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.3s'
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px',
        background: '#FF5722',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        marginTop: '30px',
        boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
        transition: 'transform 0.2s, background 0.2s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={titleStyle}>{t('create_account')}</h2>
                <p style={{ color: isDark ? '#a0a0a0' : '#888', marginBottom: '30px', fontSize: '0.95rem' }}>
                    {t('join_us')}
                </p>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(211, 47, 47, 0.15)',
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

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('username')}</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                            onBlur={(e) => e.target.style.borderColor = isDark ? '#444' : '#ddd'}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                            onBlur={(e) => e.target.style.borderColor = isDark ? '#444' : '#ddd'}
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
                            onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                            onBlur={(e) => e.target.style.borderColor = isDark ? '#444' : '#ddd'}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('confirm_password')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                            onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                            onBlur={(e) => e.target.style.borderColor = isDark ? '#444' : '#ddd'}
                        />
                    </div>

                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={loading}
                        onMouseOver={(e) => e.currentTarget.style.transform = loading ? 'none' : 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        {loading ? t('creating_account') : t('sign_up')}
                    </button>
                </form>

                <p style={{ marginTop: '25px', fontSize: '0.9rem', color: isDark ? '#888' : '#666' }}>
                    {t('already_have_account')} <Link to="/login" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold' }}>{t('login_here')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;