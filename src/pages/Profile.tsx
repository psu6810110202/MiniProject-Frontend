import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePoints } from '../hooks/usePoints';

import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchableSelect from '../components/SearchableSelect';

import { useProducts } from '../contexts/ProductContext';
import AdminDashboard from './AdminDashboard';

const Profile: React.FC = () => {
    const { t } = useLanguage();

    const { user, updateUser, token, logout } = useAuth();
    const { userOrders } = useCart();
    const { points } = usePoints();
    const { items, likedProductIds, likedFandoms, toggleLikeProduct, toggleLikeFandom, fandomImages } = useProducts();
    const navigate = useNavigate();

    // Favorites Logic
    const [activeTab, setActiveTab] = useState<'products' | 'fandoms'>('products');
    const favoriteProducts = items.filter(item => likedProductIds.includes(item.id));
    const favoriteFandomList = likedFandoms;

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
        facebook?: string;
        twitter?: string;
        line?: string;
        facebookName?: string;
        twitterName?: string;
        lineName?: string;
    }>({
        username: '',
        name: '',
        phone: '',
        house_number: '',
        sub_district: '',
        district: '',
        province: '',
        postal_code: '',
        facebook: '',
        twitter: '',
        line: '',
        facebookName: '',
        twitterName: '',
        lineName: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                facebook: user.facebook || '',
                twitter: user.twitter || '',
                line: user.line || '',
                facebookName: user.facebookName || '',
                twitterName: user.twitterName || '',
                lineName: user.lineName || '',
            });
        }
    }, [user]);

    const handleConfirmDelete = async () => {
        if (!user || !token) return;

        // Mock User Deletion (Soft Delete)
        if (String(user.id).startsWith('mock-') || String(user.id)) { // Apply to all users for consistency in this demo
            try {
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                if (db[user.id]) {
                    // Soft Delete: Mark with timestamp instead of removing
                    db[user.id].deletedAt = new Date().toISOString();
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                }
            } catch (e) { console.error(e); }
            logout();
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Determine if we should treat this as a Soft Delete locally too
                // (Backend now does soft delete, so we should mark local DB as such for Mock Logic to work)
                try {
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    if (db[user.id]) {
                        db[user.id].deletedAt = new Date().toISOString();
                        localStorage.setItem('mock_users_db', JSON.stringify(db));
                    }
                } catch (e) { console.error(e); }

                logout();
                navigate('/login');
            } else {
                const errorDat = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Delete failed:', errorDat);
                alert(`Failed to delete account: ${errorDat.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred.");
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

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
        if (!user || !token) return;
        setIsLoading(true);

        // Mock User Update (Client-side)
        if (String(user.id).startsWith('mock-')) {
            try {
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                const updatedUser: any = { ...user, ...formData };

                db[user.id] = updatedUser;
                localStorage.setItem('mock_users_db', JSON.stringify(db));

                updateUser(updatedUser);
                setIsEditing(false);
                alert(t('profile_updated_successfully'));
            } catch (e) {
                console.error("Mock update failed", e);
                alert(t('failed_to_update_profile'));
            }
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, points: user.points || 0 })
            });

            if (response.ok) {
                const updatedUserData = await response.json();
                updateUser({ ...user, ...updatedUserData });
                setIsEditing(false);
                alert(t('profile_updated_successfully'));
                window.scrollTo(0, 0);
            } else if (response.status === 401) {
                alert(t('session_expired_login_again'));
                logout();
                navigate('/login');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error("Update failed:", errorData);
                alert(`${t('failed_to_update_profile')}: ${errorData.message || response.statusText}`);
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            alert(t('error_updating_profile'));
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

        // Mock Only Logic for Password (since real backend API wasn't provided for password change)
        if (String(user.id).startsWith('mock-')) {
            try {
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                const updatedUser: any = { ...user };
                updatedUser.password = newPassword;

                db[user.id] = updatedUser;
                localStorage.setItem('mock_users_db', JSON.stringify(db));

                // updateUser(updatedUser); // No need to update context for password
                setIsChangingPassword(false);
                setNewPassword('');
                setConfirmPassword('');
                alert('Password changed successfully!');
            } catch (e) {
                alert("Failed to change password");
            }
        } else {
            // Save locally first (Fallback persistence)
            try {
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                const overrideUser: any = { ...user, password: newPassword };
                db[user.id] = overrideUser;
                localStorage.setItem('mock_users_db', JSON.stringify(db));
            } catch (e) {
                console.error("Local save failed", e);
            }

            // Attempt to update password via API for real users
            try {
                const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: newPassword })
                });

                // Check success even if API fails/is partial
                if (response.ok) {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    alert('Password changed successfully!');
                } else {
                    // Even if backend fails, we rely on local override for this session/login
                    console.warn("Backend rejected, but local override saved.");
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    alert('Password changed successfully (Local Override)!');
                }
            } catch (e) {
                // Network error? We still have local override
                setIsChangingPassword(false);
                setNewPassword('');
                setConfirmPassword('');
                alert('Password saved locally (Backend unavailable).');
            }
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
                                <h2 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--text-main)' }}>
                                    {user?.username || user?.name}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user?.email}</p>

                                {/* Points Display */}
                                <div style={{
                                    background: 'rgba(76, 175, 80, 0.1)',
                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    marginTop: '15px',
                                    display: 'inline-block'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '0.9rem' }}>
                                            Your Points:
                                        </span>
                                        <span style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            color: '#4CAF50'
                                        }}>
                                            {points.toLocaleString()} pts
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '4px'
                                    }}>
                                        Earn points with every purchase (1 point per ฿100)
                                    </div>
                                </div>

                                {/* Social Links Display or Edit */}
                                {!isEditing && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                        {user?.facebook && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <a href={user.facebook} target="_blank" rel="noreferrer" style={{ color: '#1877F2', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    Facebook
                                                </a>
                                                {user.facebookName && <span style={{ color: 'var(--text-muted)' }}>Name: {user.facebookName}</span>}
                                            </div>
                                        )}
                                        {user?.twitter && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <a href={user.twitter} target="_blank" rel="noreferrer" style={{ color: '#1DA1F2', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    Twitter
                                                </a>
                                                {user.twitterName && <span style={{ color: 'var(--text-muted)' }}>Name: {user.twitterName}</span>}
                                            </div>
                                        )}
                                        {user?.line && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <a href={user.line} target="_blank" rel="noreferrer" style={{ color: '#00C300', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    Line
                                                </a>
                                                {user.lineName && <span style={{ color: 'var(--text-muted)' }}>Name: {user.lineName}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'end' }}>
                                {user?.role !== 'admin' && (
                                    <>
                                        <button
                                            onClick={() => { setIsEditing(!isEditing); setIsChangingPassword(false); }}
                                            style={{
                                                padding: '8px 20px',
                                                background: isEditing ? '#555' : '#FF5722',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}>
                                            {isEditing ? t('cancel') : t('edit_profile')}
                                        </button>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                                style={{
                                                    padding: '8px 20px',
                                                    background: isChangingPassword ? '#555' : '#333',
                                                    color: 'white',
                                                    border: '1px solid #555',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    width: '100%'
                                                }}>
                                                {isChangingPassword ? t('cancel') : t('change_password')}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <form onSubmit={handleSubmit} style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>{t('edit_profile')}</h3>

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



                        <h4 style={{ color: 'var(--text-main)', marginTop: '10px', marginBottom: '15px' }}>{t('social_media')}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>{t('facebook_url')}</label>
                                <input name="facebook" value={formData.facebook || ''} onChange={handleAddressChange} style={inputStyle} placeholder="https://facebook.com/..." />
                                <input name="facebookName" value={formData.facebookName || ''} onChange={handleAddressChange} style={{ ...inputStyle, marginTop: '5px' }} placeholder={t('facebook_name_placeholder')} />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('twitter_url')}</label>
                                <input name="twitter" value={formData.twitter || ''} onChange={handleAddressChange} style={inputStyle} placeholder={t('twitter_url_placeholder')} />
                                <input name="twitterName" value={formData.twitterName || ''} onChange={handleAddressChange} style={{ ...inputStyle, marginTop: '5px' }} placeholder={t('twitter_name_placeholder')} />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('line_id_url')}</label>
                                <input name="line" value={formData.line || ''} onChange={handleAddressChange} style={inputStyle} placeholder={t('line_id_placeholder')} />
                                <input name="lineName" value={formData.lineName || ''} onChange={handleAddressChange} style={{ ...inputStyle, marginTop: '5px' }} placeholder={t('line_name_placeholder')} />
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
                                            // Manual event simulation for compatibility with existing handler structure if needed,
                                            // or just call logic directly.
                                            // Since handleAddressChange expects event, let's create a custom setter logic here or adapt handleAddressChange.
                                            // Adapting logic inline is safer for now.
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

                {/* Password Change Form */}
                {isChangingPassword && (
                    <form onSubmit={handlePasswordSubmit} style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>{t('change_password')}</h3>
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
                )}

                {/* Display Address if not editing */}
                {!isEditing && (user?.house_number || user?.province) && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <h4 style={{ color: 'var(--text-main)', marginTop: 0 }}>{t('shipping_address')}</h4>
                        <p>{user.house_number} {user.sub_district} {user.district}</p>
                        <p>{user.province} {user.postal_code}</p>
                        <p>{t('phone')}: {user.phone}</p>
                    </div>
                )}

            </div>

            {user?.role === 'admin' && <AdminDashboard />}

            {/* Orders & Tracking Section */}
            {user?.role !== 'admin' && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📦 {t('order_history')}
                    </h2>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        {userOrders.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>{t('no_orders_found')}</p>
                        ) : (
                            userOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/profile/orders/${order.id}`, { state: { order } })}
                                    style={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '20px',
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
                                        <h3 style={{ color: '#FF5722', marginBottom: '5px', fontSize: '1rem', margin: 0 }}>{t('order')} #{order.id}</h3>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{order.date}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>฿{order.total.toLocaleString()}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{order.items.length} {t('items')}</div>
                                        </div>
                                        <div style={{
                                            padding: '5px 12px',
                                            borderRadius: '15px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            backgroundColor: order.status === 'delivered' ? 'rgba(76, 175, 80, 0.1)' :
                                                order.status === 'shipped' ? 'rgba(33, 150, 243, 0.1)' :
                                                    order.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                                            color: order.status === 'delivered' ? '#4CAF50' :
                                                order.status === 'shipped' ? '#2196F3' :
                                                    order.status === 'cancelled' ? '#f44336' : '#FFC107'
                                        }}>
                                            {getStatusText(order.status)}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            &gt;
                                        </div>
                                    </div>
                                </div>
                            )))
                        }
                    </div>
                </div>
            )}

            {/* Favorites Section */}
            {user?.role !== 'admin' && (
                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                        {t('my_favorites')}
                    </h2>

                    <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => setActiveTab('products')}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'products' ? '2px solid #FF5722' : '2px solid transparent',
                                color: activeTab === 'products' ? '#FF5722' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                transition: 'color 0.2s'
                            }}
                        >
                            {t('liked_products')}
                        </button>
                        <button
                            onClick={() => setActiveTab('fandoms')}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'fandoms' ? '2px solid #FF5722' : '2px solid transparent',
                                color: activeTab === 'fandoms' ? '#FF5722' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                transition: 'color 0.2s'
                            }}
                        >
                            {t('liked_fandoms')}
                        </button>
                    </div>

                    {activeTab === 'products' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {favoriteProducts.length > 0 ? (
                                favoriteProducts.map(item => (
                                    <div key={item.id} style={{
                                        background: 'var(--card-bg)',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ height: '180px', marginBottom: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{item.name}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                            <span style={{ color: '#FF5722', fontWeight: 'bold' }}>{item.price}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLikeProduct(item.id);
                                                }}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF5722" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    {t('no_favorite_products')}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'fandoms' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {favoriteFandomList.length > 0 ? (
                                favoriteFandomList.map((fandomName, index) => (
                                    <div key={index} style={{
                                        background: 'var(--card-bg)',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                        onClick={() => navigate(`/fandoms/${encodeURIComponent(fandomName)}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '15px', border: '3px solid #FF5722' }}>
                                            <img
                                                src={fandomImages[fandomName] || items.find(i => i.fandom === fandomName)?.image || '/placeholder.png'}
                                                alt={fandomName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', textAlign: 'center' }}>{fandomName}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLikeFandom(fandomName);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                background: 'rgba(255, 68, 68, 0.1)',
                                                color: '#ff4444',
                                                border: '1px solid #ff4444',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {t('unlike')}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    {t('no_favorite_fandoms')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {user?.role !== 'admin' && (
                <>
                    <div style={{
                        marginTop: '40px',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '20px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            style={{
                                padding: '12px 30px',
                                background: 'transparent',
                                color: '#f44336',
                                border: '1px solid #f44336',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f44336';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#f44336';
                            }}
                        >
                            ⚠️ {t('delete_account')}
                        </button>
                    </div>

                    <ConfirmationModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleConfirmDelete}
                        title={t('delete_account')}
                        message={t('delete_account_confirm_message')}
                        confirmText={t('delete')}
                        isDangerous={true}
                    />
                </>
            )}
        </div >
    );
};

export default Profile;
