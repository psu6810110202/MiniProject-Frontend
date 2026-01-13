import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePoints } from '../hooks/usePoints';

import { useNavigate, useLocation } from 'react-router-dom';

import SearchableSelect from '../components/SearchableSelect';

import { useProducts } from '../contexts/ProductContext';
import { userAPI, orderAPI } from '../services/api';

const Profile: React.FC = () => {
    const { t } = useLanguage();

    const { user, updateUser, logout, isLoggedIn } = useAuth();
    const { userOrders } = useCart();
    const { points } = usePoints();
    const { likedFandoms, toggleLikeFandom, fandomImages } = useProducts();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const favoriteFandomList = likedFandoms;

    const isEditing = useLocation().pathname.includes('/edit');
    const [isLoading, setIsLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    interface ThaiSubDistrict {
        id: number;
        zip_code: number;
        name_th: string;
        name_en: string;
        district_id: number;
    }
    interface ThaiDistrict {
        id: number;
        name_th: string;
        name_en: string;
        province_id: number;
        sub_districts: ThaiSubDistrict[];
    }
    interface ThaiProvince {
        id: number;
        name_th: string;
        name_en: string;
        districts: ThaiDistrict[];
    }

    const [thaiAddressData, setThaiAddressData] = useState<ThaiProvince[]>([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // State for form
    const [formData, setFormData] = useState<{
        username: string;
        name: string;
        phone: string;
        house_number: string;
        sub_district: string;
        district: string;
        province: string;
        postal_code: string;
    }>({
        username: '',
        name: '',
        phone: '',
        house_number: '',
        sub_district: '',
        district: '',
        province: '',
        postal_code: '',

    });

    // Custom Requests Logic
    const [customRequests, setCustomRequests] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const stored = JSON.parse(localStorage.getItem('custom_requests') || '[]');
            const myRequests = stored.filter((r: any) => r.userId === (user.id || (user as any).user_id) || r.userEmail === user.email);
            setCustomRequests(myRequests);
        }
    }, [user]);

    const [apiOrders, setApiOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const fetched = await orderAPI.getAll();
                // Filter and Map
                const mapped = fetched
                    .filter((o: any) => o.user_id === (user.id || (user as any).user_id))
                    .map((o: any) => ({
                        ...o,
                        id: o.order_id || o.id,
                        date: o.order_date || o.created_at || o.date,
                        totalAmount: Number(o.total_amount || o.totalAmount || 0),
                        status: o.payment_status || o.status || 'pending',
                        items: o.items || []
                    }));
                setApiOrders(mapped);
            } catch (err) {
                console.error("Failed to fetch orders profiles", err);
            }
        };
        fetchOrders();
    }, [user]);

    // Merge Orders and Requests for Display
    const historySource = apiOrders.length > 0 ? apiOrders : userOrders;

    // Fetch Thai Address Data
    useEffect(() => {
        const fetchAddressData = async () => {
            setIsLoadingAddress(true);
            try {
                const response = await fetch('/thai_address_data.json');
                if (!response.ok) throw new Error("Failed to load address data");
                const data = await response.json();
                setThaiAddressData(data);
            } catch (error) {
                console.error("Error loading Thai address data:", error);
            } finally {
                setIsLoadingAddress(false);
            }
        };
        fetchAddressData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                phone: user.phone || '',
                house_number: user.house_number || '',
                sub_district: user.sub_district || '',
                district: user.district || '',
                province: user.province || '',
                postal_code: user.postal_code || '',

            });
        }
    }, [user]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'province') {
            setFormData(prev => ({
                ...prev,
                province: value,
                district: '',
                sub_district: '',
                postal_code: ''
            }));
        } else if (name === 'district') {
            setFormData(prev => ({
                ...prev,
                district: value,
                sub_district: '',
                postal_code: ''
            }));
        } else if (name === 'sub_district') {
            // Find zip code
            const selectedProvince = thaiAddressData.find(p => p.name_th === formData.province);
            const selectedDistrict = selectedProvince?.districts.find(d => d.name_th === formData.district);
            const selectedSubDistrict = selectedDistrict?.sub_districts.find(s => s.name_th === value);

            setFormData(prev => ({
                ...prev,
                sub_district: value,
                postal_code: selectedSubDistrict ? String(selectedSubDistrict.zip_code) : ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            // userAPI.update handles token automatically via api.ts
            const updatedUserData = await userAPI.update(user.id || (user as any).user_id, {
                ...formData,
                points: user.points || 0
            });

            updateUser({ ...user, ...updatedUserData });
            navigate('/profile');
            window.scrollTo(0, 0);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            if (error.message === 'Unauthorized' || error.message.includes('401')) {
                alert(t('session_expired_login_again'));
                logout();
                navigate('/login');
            } else {
                alert(`${t('failed_to_update_profile')}: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            alert(t('passwords_do_not_match'));
            setIsLoading(false);
            return;
        }

        try {
            // Use userAPI to update password
            await userAPI.update(user.id || (user as any).user_id, { password: newPassword });

            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');

        } catch (e: any) {
            console.error("Password change failed", e);
            alert(`Failed to change password: ${e.message || 'Unknown error'}`);
        }
        setIsLoading(false);
    };

    const getStatusText = (status: string) => {
        return t(`status_${status}`);
    };

    const inputStyle = {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #444',
        background: 'var(--bg-color)',
        color: 'var(--text-main)',
        width: '100%',
        boxSizing: 'border-box' as const,
        marginBottom: '15px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
    };

    // Helper to get districts for selected province
    const getDistricts = () => {
        const province = thaiAddressData.find(p => p.name_th === formData.province);
        return province ? province.districts : [];
    };

    // Helper to get sub-districts for selected district
    const getSubDistricts = () => {
        const province = thaiAddressData.find(p => p.name_th === formData.province);
        const district = province?.districts.find(d => d.name_th === formData.district);
        return district ? district.sub_districts : [];
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: user?.role === 'admin' ? '1200px' : '900px',
            margin: '0 auto',
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
        }}>
            {/* User Info Card */}
            {!isEditing && (
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '5px' }}>
                                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
                                            {user?.username || user?.name}
                                        </h2>
                                        {/* Points Display (Moved here) */}
                                        <div style={{
                                            background: 'rgba(76, 175, 80, 0.1)',
                                            border: '1px solid rgba(76, 175, 80, 0.3)',
                                            borderRadius: '20px',
                                            padding: '4px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '0.9rem' }}>
                                                {points.toLocaleString()} pts
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 20px 0' }}>{user?.email}</p>

                                    {/* Address Display (Moved inside card) - HIDDEN FOR ADMIN */}
                                    {user?.role !== 'admin' && (user?.house_number || user?.province) && (
                                        <div style={{
                                            paddingTop: '15px',
                                            borderTop: '1px solid var(--border-color)',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.6'
                                        }}>
                                            <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem' }}>
                                                {t('shipping_address')}
                                            </div>
                                            <div>{user.house_number} {user.sub_district} {user.district}</div>
                                            <div>{user.province} {user.postal_code}</div>
                                            <div style={{ marginTop: '2px' }}>{t('phone')}: {user.phone}</div>
                                        </div>
                                    )}

                                    {/* Action Buttons - HIDDEN FOR ADMIN */}
                                    {user?.role !== 'admin' && (
                                        <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '180px' }}>
                                            <button
                                                onClick={() => navigate('/profile/edit')}
                                                style={{
                                                    background: '#FF5722',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '10px 0',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {t('edit_profile')}
                                            </button>

                                            <button
                                                onClick={() => setIsChangingPassword(true)}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    padding: '10px 0',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-main)';
                                                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = 'var(--text-muted)';
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                }}
                                            >
                                                {t('change_password')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {isEditing && (
                <form onSubmit={handleSubmit} style={{ marginTop: '0', paddingTop: '0', borderTop: 'none' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '30px', fontSize: '1.8rem' }}>{t('edit_profile')}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>{t('username_label')}</label>
                            <input name="username" value={formData.username} onChange={handleAddressChange} style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('full_name_label')}</label>
                            <input name="name" value={formData.name} onChange={handleAddressChange} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div>
                            <label style={labelStyle}>{t('phone_label')}</label>
                            <input name="phone" value={formData.phone} onChange={handleAddressChange} style={inputStyle} placeholder="+66..." />
                        </div>
                    </div>

                    <h4 style={{ color: 'var(--text-main)', marginTop: '10px', marginBottom: '15px' }}>{t('address')}</h4>

                    {isLoadingAddress ? (
                        <div style={{ color: '#FF5722' }}>{t('loading_address_data')}</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>{t('house_number')}</label>
                                <input name="house_number" value={formData.house_number} onChange={handleAddressChange} style={inputStyle} placeholder="123/45 Village No.1" />
                            </div>

                            <div>
                                <label style={labelStyle}>{t('province')}</label>
                                <SearchableSelect
                                    options={thaiAddressData.map(p => ({ value: p.name_th, label: p.name_th }))}
                                    value={formData.province}
                                    onChange={(val) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            province: val as string,
                                            district: '',
                                            sub_district: '',
                                            postal_code: ''
                                        }));
                                    }}
                                    placeholder={t('select_province')}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>{t('district')}</label>
                                <SearchableSelect
                                    options={getDistricts().map(d => ({ value: d.name_th, label: d.name_th }))}
                                    value={formData.district}
                                    onChange={(val) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            district: val as string,
                                            sub_district: '',
                                            postal_code: ''
                                        }));
                                    }}
                                    disabled={!formData.province}
                                    placeholder={t('select_district')}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>{t('sub_district')}</label>
                                <SearchableSelect
                                    options={getSubDistricts().map(s => ({ value: s.name_th, label: s.name_th }))}
                                    value={formData.sub_district}
                                    onChange={(val) => {
                                        const subDist = getSubDistricts().find(s => s.name_th === val);
                                        setFormData(prev => ({
                                            ...prev,
                                            sub_district: val as string,
                                            postal_code: subDist ? String(subDist.zip_code) : ''
                                        }));
                                    }}
                                    disabled={!formData.district}
                                    placeholder={t('select_sub_district')}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>{t('postal_code')}</label>
                                <input name="postal_code" value={formData.postal_code} readOnly style={{ ...inputStyle, background: '#333', cursor: 'not-allowed' }} placeholder="Auto-filled" />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', alignItems: 'center' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px 30px',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}>
                            {isLoading ? t('saving') : t('save_changes')}
                        </button>
                    </div>
                </form>
            )}

            {/* Password Change Modal */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
            `}</style>

            {isChangingPassword && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '30px',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        position: 'relative',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            ✕
                        </button>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '20px', marginTop: 0 }}>{t('change_password')}</h3>
                        <form onSubmit={handlePasswordSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>{t('new_password')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '40px' }}
                                            placeholder={t('new_password_placeholder')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#888',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {showNewPassword ? (
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
                                <div>
                                    <label style={labelStyle}>{t('confirm_password_label')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '40px' }}
                                            placeholder={t('confirm_new_password_placeholder')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#888',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {showConfirmPassword ? (
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
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#FF5722',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: isLoading ? 'not-allowed' : 'pointer'
                                    }}>
                                    {isLoading ? t('saving') : t('update_password')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders & Tracking Section */}
            {
                !isEditing && user?.role !== 'admin' && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-main)', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                            {t('order_history')}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

                            {/* Left Column: Custom Requests */}
                            <div>
                                <h3 style={{ color: '#2196F3', fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                    Custom Requests
                                </h3>
                                <div className="custom-scrollbar" style={{ display: 'grid', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {customRequests.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)' }}>No requests found</p>
                                    ) : (
                                        customRequests
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => navigate(`/profile/request/${item.id}`)}
                                                    style={{
                                                        background: 'var(--card-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '12px',
                                                        padding: '15px',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        opacity: 0.9
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                            <h3 style={{ color: '#2196F3', fontSize: '1rem', margin: 0 }}>
                                                                {`${t('request')} #${item.id}`}
                                                            </h3>
                                                            <span style={{ fontSize: '0.7rem', background: '#2196F3', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>CUSTOM</span>
                                                        </div>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                            {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                                        </span>
                                                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.productName}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                                            {item.estimatedTotal > 0 ? `฿${item.estimatedTotal.toLocaleString()}` : 'Pending'}
                                                        </div>
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            marginTop: '5px',
                                                            display: 'inline-block',
                                                            backgroundColor: getStatusText(item.status).includes('Cancel') ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                                                            color: getStatusText(item.status).includes('Cancel') ? '#f44336' : '#2196F3'
                                                        }}>
                                                            {getStatusText(item.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Pre-orders / Products */}
                            <div>
                                <h3 style={{ color: '#FF5722', fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                    Products / Pre-Orders
                                </h3>
                                <div className="custom-scrollbar" style={{ display: 'grid', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {historySource.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)' }}>{t('no_orders_found')}</p>
                                    ) : (
                                        historySource
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => navigate(`/profile/orders/${item.id}`, { state: { order: item } })}
                                                    style={{
                                                        background: 'var(--card-bg)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '12px',
                                                        padding: '15px',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                                    }}
                                                >
                                                    <div>
                                                        <h3 style={{ color: '#FF5722', fontSize: '1rem', margin: '0 0 5px 0' }}>
                                                            {`${t('order')} #${item.id}`}
                                                        </h3>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                            {new Date(item.date).toLocaleDateString('en-GB')}
                                                        </span>
                                                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                                                            {item.items.length} {t('items')}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                                            ฿{item.totalAmount.toLocaleString()}
                                                        </div>
                                                        <div style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            marginTop: '5px',
                                                            display: 'inline-block',
                                                            backgroundColor:
                                                                item.status === 'delivered' ? 'rgba(76, 175, 80, 0.1)' :
                                                                    item.status === 'shipped' ? 'rgba(33, 150, 243, 0.1)' :
                                                                        item.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                                                            color:
                                                                item.status === 'delivered' ? '#4CAF50' :
                                                                    item.status === 'shipped' ? '#2196F3' :
                                                                        item.status === 'cancelled' ? '#f44336' : '#FFC107'
                                                        }}>
                                                            {getStatusText(item.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )
            }

            {/* Favorites Section */}
            {
                !isEditing && user?.role !== 'admin' && (
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                            {t('my_favorites')}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                            {favoriteFandomList.length > 0 ? (
                                favoriteFandomList.map((fandom, index) => (
                                    <div key={index} style={{
                                        background: 'var(--card-bg)',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        border: '1px solid var(--border-color)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                        onClick={() => navigate(`/fandoms/${fandom}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #FF5722' }}>
                                            <img src={fandomImages[fandom] || 'https://placehold.co/100x100?text=Fandom'} alt={fandom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{fandom}</h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLikeFandom(fandom);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #F44336',
                                                color: '#F44336',
                                                borderRadius: '20px',
                                                padding: '5px 15px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {t('unlike')}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>{t('no liked fandoms')}</p>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Profile;
