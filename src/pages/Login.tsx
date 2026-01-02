import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Login: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showBlacklistModal, setShowBlacklistModal] = useState(false);

    // ✅ 1. เพิ่มตัวแปรสำหรับตรวจจับ Theme (Dark/Light)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    // ตรวจจับการเปลี่ยนแปลงใน localStorage (เผื่อเปลี่ยนจากหน้าอื่นแล้วกลับมา)
    useEffect(() => {
        const handleStorageChange = () => {
            setTheme(localStorage.getItem('theme') || 'dark');
        };
        window.addEventListener('storage', handleStorageChange);

        // DEBUG: Help user find their password
        const db = localStorage.getItem('mock_users_db');
        if (db) {
            console.log("%c=== SAVED ACCOUNTS (MOCK DB) ===", "color: lime; font-size: 14px; font-weight: bold;");
            const parsed = JSON.parse(db);
            // Table view for easy reading
            console.table(Object.values(parsed).map((u: any) => ({
                id: u.id,
                username: u.username || u.name,
                email: u.email,
                password: u.password // Show password so they can recover it
            })));
        }

        // Restore Admin if missing (Prevent lockout)
        const currentDB = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        if (!currentDB['mock-2']) {
            currentDB['mock-2'] = {
                id: 'mock-2',
                username: 'admin',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                points: 9999,
                password: 'admin',
                isBlacklisted: false
            };
            localStorage.setItem('mock_users_db', JSON.stringify(currentDB));
            console.log("Restored Admin User to Mock DB");
        }

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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
                // Feature: Frontend Persistence for State (Points) even for Backend Users
                // If backend is stateless/restarts, we trust our local cache for 'points'
                let userToUse = data.user;
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    // Find matching user in local DB (by ID or Email to be safe)
                    const localUser = db[userToUse.id] || Object.values(db).find((u: any) => u.email === userToUse.email);

                    if (localUser) {
                        console.log("Restoring local state for backend user:", localUser.username);
                        userToUse = { ...userToUse, points: localUser.points };
                    }
                } catch (e) {
                    console.error("Failed to merge local state", e);
                }

                login(data.access_token, userToUse, rememberMe);
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
                    const saved = db[defaultUser.id];
                    // Merge saved data with default to ensure integrity while keeping persisted points
                    return saved ? { ...defaultUser, ...saved } : defaultUser;
                } catch { return defaultUser; }
            };

            const saveToMockDB = (user: any) => {
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    db[user.id] = user; // Update or add the user
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                } catch (e) {
                    console.error("Failed to save to mock DB", e);
                }
            };

            if (formData.username === 'demo') {
                const defaultUser = { id: 'mock-1', name: 'Demo User', email: 'demo@example.com', role: 'user', points: 0 };
                // Logic Fix: Load from DB first, if not exists then use default
                const userToLogin = getPersistedUser(defaultUser);

                // Check password (use the one from DB if exists, else default)
                const validPass = userToLogin.password || '1234';

                if (userToLogin.isBlacklisted) {
                    setShowBlacklistModal(true);
                    setLoading(false);
                    return;
                }

                if (formData.password === validPass) {
                    saveToMockDB(userToLogin);
                    login('mock-user-token', userToLogin, rememberMe);
                    navigate('/');
                } else {
                    setError('Invalid password');
                }
            } else if (formData.username === 'admin') {
                const defaultAdmin = { id: 'mock-2', name: 'Admin User', email: 'admin@example.com', role: 'admin', points: 9999 };
                // Logic Fix: Load from DB first, if not exists then use default
                const userToLogin = getPersistedUser(defaultAdmin);

                const validPass = userToLogin.password || 'admin';
                if (formData.password === validPass) {
                    saveToMockDB(userToLogin);
                    alert('⚠️ Backend Connection Failed. Using Mock Admin Session. (Delete will fail)');
                    login('mock-admin-token', userToLogin, rememberMe);
                    navigate('/');
                } else {
                    setError('Invalid password');
                }
            } else {
                // Fallback: Check local override for Real Users who changed password locally
                let localLoginSuccess = false;
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    // Find user matching username/email AND password
                    const foundUser = Object.values(db).find((u: any) =>
                        (u.email === formData.username || u.name === formData.username || u.username === formData.username) &&
                        u.password === formData.password
                    );

                    if (foundUser) {
                        if ((foundUser as any).isBlacklisted) {
                            setShowBlacklistModal(true);
                            setLoading(false);
                            return;
                        }

                        saveToMockDB(foundUser);
                        login('mock-override-token', foundUser as any, rememberMe);
                        navigate('/');
                        localLoginSuccess = true;
                    }
                } catch (e) {
                    console.error("Local override check failed", e);
                }

                if (!localLoginSuccess) {
                    setError(err.message || 'Invalid email or username or password');
                }
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
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ ...inputStyle, paddingRight: '40px' }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isDark ? '#a0a0a0' : '#888',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
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

            {/* Blacklist Popup Modal */}
            {showBlacklistModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 3000, padding: '20px'
                }}>
                    <div style={{
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        padding: '40px',
                        borderRadius: '24px',
                        maxWidth: '450px',
                        width: '100%',
                        textAlign: 'center',
                        border: '2px solid #FF5722',
                        boxShadow: '0 20px 50px rgba(255, 87, 34, 0.3)',
                        animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
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
                            color: isDark ? '#e0e0e0' : '#333',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            marginBottom: '30px',
                            fontWeight: '500'
                        }}>
                            คุณถูก Blacklist ข้อหาผิดกฎที่คุณได้ตกลงและยอมรับไว้กับทางระบบ
                        </p>
                        <button
                            onClick={() => setShowBlacklistModal(false)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e64a19'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#FF5722'}
                        >
                            ตกลง
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Login;