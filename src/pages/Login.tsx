import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { BlacklistModal, DeletedWarningModal, RestoreModal } from '../components/LoginModals';
import ThemeNotification from '../components/ThemeNotification';
import { authAPI, userAPI, api } from '../services/api';
import './Login.css';

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

    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreData, setRestoreData] = useState({ username: '', password: '' });
    const [showDeletedWarningModal, setShowDeletedWarningModal] = useState(false);

    const { theme } = useTheme();
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const isDark = theme === 'dark';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRestoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loginData = await authAPI.login({ email: restoreData.username, password: restoreData.password });

            if (loginData.access_token) {
                const userId = loginData.user.id || loginData.user.user_id;

                // Manually set token for this operation since we haven't fully logged in via Context yet
                api.setToken(loginData.access_token);

                try {
                    await userAPI.restore(userId);
                    alert('Account restored successfully! Logging you in...');
                    login(loginData.access_token, { ...loginData.user, deletedAt: null }, true);
                    navigate('/');
                } catch (restoreErr: any) {
                    // If restore fails, we shouldn't leave the token in the api instance if login wasn't fully intended
                    // api.clearToken(); // Assuming we might want to clear. But technically user authenticated.
                    // But restore failed, so maybe we shouldn't login?
                    // Let's keep it safe.
                    const msg = restoreErr.message || 'Restore failed';
                    alert(msg);
                }
            }
        } catch (apiErr: any) {
            console.error("API Restore flow failed", apiErr.message);
            alert("Failed to restore account via API. " + (apiErr.message || ''));
        }
        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login({ email: formData.username, password: formData.password });

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

                login(data.access_token, data.user, rememberMe);
                navigate('/');
            } else {
                throw new Error('No access token received');
            }
        } catch (err: any) {
            console.error('Login Error:', err);
            const msg = err.message || 'Login failed';

            if (msg === 'User is blacklisted') {
                setShowBlacklistModal(true);
            } else {
                setError(msg);
            }
            setLoading(false);
        }
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

                    <div className="checkbox-wrapper" style={{ marginTop: '20px' }}>
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

            <ThemeNotification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, show: false })}
            />
        </div>
    );
};

export default Login;
