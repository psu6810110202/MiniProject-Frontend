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
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStep, setForgotStep] = useState<'email' | 'newpass'>('email');
    const [forgotUserId, setForgotUserId] = useState<string | null>(null);
    const [newResetPass, setNewResetPass] = useState('');
    const [confirmResetPass, setConfirmResetPass] = useState('');
    const [showResetPass, setShowResetPass] = useState(false);

    const [restoreData, setRestoreData] = useState({ username: '', password: '' });

    // ✅ 1. เพิ่มตัวแปรสำหรับตรวจจับ Theme (Dark/Light)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // ตรวจจับการเปลี่ยนแปลงใน localStorage (เผื่อเปลี่ยนจากหน้าอื่นแล้วกลับมา)
    useEffect(() => {
        const handleStorageChange = () => {
            setTheme(localStorage.getItem('theme') || 'dark');
        };
        window.addEventListener('storage', handleStorageChange);

        // Restore Admin if missing (Prevent lockout) - FIXED: Check by EMAIL not just ID to avoid duplicates
        const currentDB = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        const adminExists = Object.values(currentDB).some((u: any) => u.email === 'admin@example.com' || u.username === 'admin');

        if (!adminExists) {
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

    const isDark = theme === 'dark';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleForgotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');

        if (forgotStep === 'email') {
            const user = Object.values(db).find((u: any) => u.email === forgotEmail || u.username === forgotEmail);
            if (user) {
                setForgotUserId((user as any).id);
                setForgotStep('newpass');
            } else {
                alert('Account not found');
            }
        } else {
            if (newResetPass !== confirmResetPass) {
                alert('Passwords do not match!');
                return;
            }
            if (forgotUserId && db[forgotUserId]) {
                db[forgotUserId].password = newResetPass;
                localStorage.setItem('mock_users_db', JSON.stringify(db));
                alert('Password reset successfully. Please login.');
                setShowForgotModal(false);
                setForgotStep('email');
                setForgotEmail('');
                setNewResetPass('');
                setConfirmResetPass('');
            }
        }
    };

    const handleRestoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');

        const user = Object.values(db).find((u: any) =>
            (u.username === restoreData.username || u.email === restoreData.username)
        );

        if (user && (user as any).password === restoreData.password) {
            if ((user as any).deletedAt) {
                delete (user as any).deletedAt;
                db[(user as any).id] = user;
                localStorage.setItem('mock_users_db', JSON.stringify(db));
                alert('Account restored successfully! Logging you in...');
                login('restored-token', user as any, true);
                navigate('/');
            } else {
                alert('This account is active. You can log in normally.');
                setShowRestoreModal(false);
            }
        } else {
            alert('Invalid credentials or account not found.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.username, password: formData.password }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Login failed');

            if (data.access_token) {
                let userToUse = data.user;
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    const localUser = db[userToUse.id] || Object.values(db).find((u: any) => u.email === userToUse.email);
                    if (localUser) userToUse = { ...userToUse, points: localUser.points };
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
            const getPersistedUser = (defaultUser: any) => {
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    const saved = db[defaultUser.id];
                    return saved ? { ...defaultUser, ...saved } : defaultUser;
                } catch { return defaultUser; }
            };

            const saveToMockDB = (user: any) => {
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    db[user.id] = user;
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                } catch (e) { console.error("Failed to save to mock DB", e); }
            };

            if (formData.username === 'demo') {
                const defaultUser = { id: 'mock-1', name: 'Demo User', email: 'demo@example.com', role: 'user', points: 0 };
                const userToLogin = getPersistedUser(defaultUser);
                const validPass = userToLogin.password || '1234';

                if (userToLogin.isBlacklisted) {
                    setShowBlacklistModal(true); setLoading(false); return;
                }

                if (formData.password === validPass) {
                    saveToMockDB(userToLogin);
                    login('mock-user-token', userToLogin, rememberMe);
                    navigate('/');
                } else { setError('Invalid password'); }
            } else if (formData.username === 'admin') {
                const defaultAdmin = { id: 'mock-2', name: 'Admin User', email: 'admin@example.com', role: 'admin', points: 9999 };
                const userToLogin = getPersistedUser(defaultAdmin);
                const validPass = userToLogin.password || 'admin';
                if (formData.password === validPass) {
                    saveToMockDB(userToLogin);
                    alert('⚠️ Backend Connection Failed. Using Mock Admin Session.');
                    login('mock-admin-token', userToLogin, rememberMe);
                    navigate('/');
                } else { setError('Invalid password'); }
            } else {
                let localLoginSuccess = false;
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    const foundUser = Object.values(db).find((u: any) =>
                        (u.email === formData.username || u.name === formData.username || u.username === formData.username) &&
                        u.password === formData.password
                    );

                    if (foundUser) {
                        if ((foundUser as any).isBlacklisted) {
                            setShowBlacklistModal(true); setLoading(false); return;
                        }
                        saveToMockDB(foundUser);
                        login('mock-override-token', foundUser as any, rememberMe);
                        navigate('/');
                        localLoginSuccess = true;
                    }
                } catch (e) { console.error("Local override check failed", e); }
                if (!localLoginSuccess) { setError(err.message || 'Invalid email or username or password'); }
            }
        } finally { setLoading(false); }
    };

    // --- Dynamic Styles ---
    const containerStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        background: isDark ? 'radial-gradient(circle at center, rgba(255, 87, 34, 0.4) 0%, #000000 70%)' : 'radial-gradient(circle at center, rgba(255, 87, 34, 0.25) 0%, #ffffff 70%)',
        padding: '20px', fontFamily: "'Inter', sans-serif", transition: 'background 0.3s ease'
    };

    const cardStyle: React.CSSProperties = {
        background: isDark ? '#1a1a1a' : '#ffffff', padding: '40px', borderRadius: '16px',
        boxShadow: isDark ? '0 10px 40px rgba(0, 0, 0, 0.8)' : '0 10px 40px rgba(255, 87, 34, 0.15)',
        width: '100%', maxWidth: '400px', textAlign: 'center',
        color: isDark ? '#ffffff' : '#333333', border: isDark ? '1px solid #333' : '1px solid #ffe0b2',
        transition: 'all 0.3s ease'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '8px', fontWeight: '600',
        color: isDark ? '#e0e0e0' : '#555555', fontSize: '0.9rem', textAlign: 'left'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid',
        borderColor: isDark ? '#ccc' : '#ddd', background: '#f0f4f8',
        color: '#333', fontSize: '1rem', outline: 'none',
        boxSizing: 'border-box', transition: 'border 0.3s'
    };

    const buttonStyle: React.CSSProperties = {
        width: '100%', padding: '12px', background: '#FF5722', color: 'white',
        border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        marginTop: '20px', boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
        transition: 'transform 0.2s, background 0.2s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: '10px', fontSize: '2rem', color: '#FF5722', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    {t('welcome_back')}
                </h2>
                <p style={{ color: isDark ? '#a0a0a0' : '#888888', marginBottom: '30px', fontSize: '0.95rem' }}>
                    {t('sign_in_desc')}
                </p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(211, 47, 47, 0.1)', border: '1px solid #d32f2f', color: '#d32f2f', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('Username or Email') || 'Username or Email'}</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} style={inputStyle} required />
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <label style={labelStyle}>{t('password')}</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} style={{ ...inputStyle, paddingRight: '40px' }} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#a0a0a0' : '#888', display: 'flex', alignItems: 'center' }}>
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

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: 'none', border: 'none', color: '#FF5722', fontSize: '0.85rem', cursor: 'pointer' }}>
                            Forgot Password?
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: isDark ? '#a0a0a0' : '#666', textAlign: 'left' }}>
                        <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ marginRight: '10px', accentColor: '#FF5722', width: '16px', height: '16px', cursor: 'pointer' }} />
                        <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>{t('remember_me')}</label>
                    </div>

                    <button type="submit" style={buttonStyle} disabled={loading} onMouseOver={(e) => e.currentTarget.style.transform = loading ? 'none' : 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                        {loading ? t('signing_in') : t('sign_in')}
                    </button>
                </form>

                <div style={{ marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowRestoreModal(true)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Restore Deleted Account
                    </button>
                </div>

                <p style={{ marginTop: '25px', fontSize: '0.9rem', color: isDark ? '#888' : '#666' }}>
                    {t('dont_have_account')} <Link to="/register" style={{ color: '#FF5722', textDecoration: 'none', fontWeight: 'bold' }}>{t('sign_up')}</Link>
                </p>
            </div>

            {showBlacklistModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                    <div style={{ background: isDark ? '#1a1a1a' : '#ffffff', padding: '40px', borderRadius: '24px', maxWidth: '450px', width: '100%', textAlign: 'center', border: '2px solid #FF5722', boxShadow: '0 20px 50px rgba(255, 87, 34, 0.3)', animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(255, 87, 34, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#FF5722' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                        <h2 style={{ color: '#FF5722', marginBottom: '15px', fontSize: '1.8rem' }}>บัญชีของคุณถูกระงับ</h2>
                        <p style={{ color: isDark ? '#e0e0e0' : '#333', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>คุณถูก Blacklist ข้อหาผิดกฎที่คุณได้ตกลงและยอมรับไว้กับทางระบบ</p>
                        <button onClick={() => setShowBlacklistModal(false)} style={{ width: '100%', padding: '14px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e64a19'} onMouseOut={(e) => e.currentTarget.style.background = '#FF5722'}>ตกลง</button>
                    </div>
                </div>
            )}

            {showForgotModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: isDark ? '#222' : 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px', border: '1px solid #FF5722' }}>
                        <h3 style={{ color: '#FF5722', marginBottom: '20px' }}>Reset Password</h3>
                        <form onSubmit={handleForgotSubmit}>
                            {forgotStep === 'email' ? (
                                <>
                                    <label style={labelStyle}>Enter your Username or Email</label>
                                    <input type="text" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inputStyle} required />
                                </>
                            ) : (
                                <>
                                    <label style={labelStyle}>Enter New Password</label>
                                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                                        <input
                                            type={showResetPass ? 'text' : 'password'}
                                            value={newResetPass}
                                            onChange={e => setNewResetPass(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '40px' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                            {showResetPass ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            )}
                                        </button>
                                    </div>

                                    <label style={labelStyle}>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showResetPass ? 'text' : 'password'}
                                            value={confirmResetPass}
                                            onChange={e => setConfirmResetPass(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '40px' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                            {showResetPass ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                            <button type="submit" style={buttonStyle}>{forgotStep === 'email' ? 'Find Account' : 'Reset Password'}</button>
                            <button type="button" onClick={() => setShowForgotModal(false)} style={{ ...buttonStyle, background: '#555', marginTop: '10px' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {showRestoreModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: isDark ? '#222' : 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px', border: '1px solid #4CAF50' }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>Restore Account</h3>
                        <form onSubmit={handleRestoreSubmit}>
                            <label style={labelStyle}>Username / Email</label>
                            <input type="text" value={restoreData.username} onChange={e => setRestoreData({ ...restoreData, username: e.target.value })} style={{ ...inputStyle, marginBottom: '15px' }} required />
                            <label style={labelStyle}>Password</label>
                            <input type="password" value={restoreData.password} onChange={e => setRestoreData({ ...restoreData, password: e.target.value })} style={inputStyle} required />
                            <button type="submit" style={{ ...buttonStyle, background: '#4CAF50' }}>Restore & Login</button>
                            <button type="button" onClick={() => setShowRestoreModal(false)} style={{ ...buttonStyle, background: '#555', marginTop: '10px' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
};

export default Login;
