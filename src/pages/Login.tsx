import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BlacklistModal, DeletedWarningModal, RestoreModal } from '../components/LoginModals';
import './Login.css'; // Import the CSS file

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
    const [showDeletedWarningModal, setShowDeletedWarningModal] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const handleStorageChange = () => {
            setTheme(localStorage.getItem('theme') || 'dark');
        };
        window.addEventListener('storage', handleStorageChange);

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

    const handleRestoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: restoreData.username, password: restoreData.password }),
            });
            const loginData = await loginResponse.json();

            if (loginResponse.ok && loginData.access_token) {
                const userId = loginData.user.id || loginData.user.user_id;
                const restoreResponse = await fetch(`http://localhost:3000/api/users/${userId}/restore`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${loginData.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (restoreResponse.ok) {
                    alert('Account restored successfully! Logging you in...');
                    try {
                        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                        if (db[userId]) {
                            delete db[userId].deletedAt;
                            localStorage.setItem('mock_users_db', JSON.stringify(db));
                        }
                    } catch (e) { console.error(e); }
                    login(loginData.access_token, { ...loginData.user, deletedAt: null }, true);
                    navigate('/');
                    return;
                } else {
                    const errorJson = await restoreResponse.json();
                    alert(`Restore failed (Server): ${errorJson.message || restoreResponse.statusText}`);
                    setLoading(false);
                    return;
                }
            } else {
                await loginResponse.json().catch(() => ({}));
            }
        } catch (apiErr: any) {
            console.error("API Restore flow failed", apiErr);
        }

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
        setLoading(false);
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
            if (response.status === 401) {
                const errData = await response.json();
                if (errData.message === 'User is blacklisted') {
                    setShowBlacklistModal(true);
                    setLoading(false);
                    return;
                }
                throw new Error(errData.message || 'Login failed');
            }

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Login failed');

            if (data.access_token) {
                if (data.user.isBlacklisted) {
                    setShowBlacklistModal(true);
                    setLoading(false);
                    return;
                }

                if (data.user.deletedAt) {
                    setRestoreData({ ...restoreData, username: formData.username, password: formData.password });
                    setShowDeletedWarningModal(true);
                    setLoading(false);
                    return;
                }

                let userToUse = data.user;
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    const localUser = db[userToUse.id] || Object.values(db).find((u: any) => u.email === userToUse.email);

                    if (localUser) {
                        if (localUser.isBlacklisted) {
                            setShowBlacklistModal(true);
                            setLoading(false);
                            return;
                        }

                        if (localUser.deletedAt && !userToUse.deletedAt) {
                            setRestoreData({ ...restoreData, username: formData.username, password: formData.password });
                            setShowDeletedWarningModal(true);
                            setLoading(false);
                            return;
                        }
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

            if (err.message === 'Login failed' || err.message === 'User is blacklisted' || err.message === 'Unauthorized') {
                setError(err.message);
                setLoading(false);
                return;
            }

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
                if (userToLogin.deletedAt) {
                    alert('Account is pending deletion.');
                    setLoading(false); return;
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
                        if ((foundUser as any).deletedAt) {
                            // alert('This account is pending deletion/recovery within 30 days.\nPlease restore your account to continue.');
                            setRestoreData({ ...restoreData, username: formData.username, password: formData.password });
                            setShowDeletedWarningModal(true);
                            setLoading(false);
                            return;
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

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    {t('welcome_back')}
                </h2>
                <p className="login-desc">
                    {t('sign_in_desc')}
                </p>

                {error && (
                    <div className="login-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="login-label">{t('Username or Email') || 'Username or Email'}</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="login-input" required />
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <label className="login-label">{t('password')}</label>
                        <div className="password-wrapper">
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="login-input" style={{ paddingRight: '40px' }} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn">
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
                        <button type="button" onClick={() => setShowForgotModal(true)} className="forgot-btn">
                            Forgot Password?
                        </button>
                    </div>

                    <div className="checkbox-wrapper">
                        <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="custom-checkbox" />
                        <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>{t('remember_me')}</label>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? t('signing_in') : t('sign_in')}
                    </button>
                </form>

                <p className="signup-text">
                    {t('dont_have_account')} <Link to="/register" className="signup-link">{t('sign_up')}</Link>
                </p>
            </div>

            <BlacklistModal
                isOpen={showBlacklistModal}
                onClose={() => setShowBlacklistModal(false)}
                isDark={isDark}
            />

            {showForgotModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <h3 className="login-title" style={{ fontSize: '1.5rem' }}>Reset Password</h3>
                        <form onSubmit={handleForgotSubmit}>
                            {forgotStep === 'email' ? (
                                <>
                                    <label className="login-label">Enter your Username or Email</label>
                                    <input type="text" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="login-input" required />
                                </>
                            ) : (
                                <>
                                    <label className="login-label">Enter New Password</label>
                                    <div className="password-wrapper" style={{ marginBottom: '15px' }}>
                                        <input
                                            type={showResetPass ? 'text' : 'password'}
                                            value={newResetPass}
                                            onChange={e => setNewResetPass(e.target.value)}
                                            className="login-input" style={{ paddingRight: '40px' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                                            className="password-toggle-btn">
                                            {showResetPass ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            )}
                                        </button>
                                    </div>

                                    <label className="login-label">Confirm New Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showResetPass ? 'text' : 'password'}
                                            value={confirmResetPass}
                                            onChange={e => setConfirmResetPass(e.target.value)}
                                            className="login-input" style={{ paddingRight: '40px' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                                            className="password-toggle-btn">
                                            {showResetPass ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="login-btn">{forgotStep === 'email' ? 'Find Account' : 'Reset Password'}</button>
                            <button type="button" onClick={() => setShowForgotModal(false)} className="login-btn cancel-btn" style={{ background: '#555', marginTop: '10px' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <RestoreModal
                isOpen={showRestoreModal}
                onClose={() => setShowRestoreModal(false)}
                onSubmit={handleRestoreSubmit}
                data={restoreData}
                setData={setRestoreData}
                isDark={isDark}
            />

            <DeletedWarningModal
                isOpen={showDeletedWarningModal}
                onClose={() => setShowDeletedWarningModal(false)}
                onRestore={() => { setShowDeletedWarningModal(false); setShowRestoreModal(true); }}
                isDark={isDark}
            />
        </div>
    );
};

export default Login;
