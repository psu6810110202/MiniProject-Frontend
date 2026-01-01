import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../hooks/usePoints';
import { useAuth } from '../contexts/AuthContext';
import { mockOrders } from '../data/mockOrders';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchableSelect from '../components/SearchableSelect';

import { useProducts } from '../contexts/ProductContext';

const Profile: React.FC = () => {
    const { t } = useLanguage();
    const { points } = usePoints();
    const { user, updateUser, token, logout } = useAuth();
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
    }>({
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
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            });
        }
    }, [user]);

    const handleConfirmDelete = async () => {
        if (!user || !token) return;

        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // alert('Account deleted successfully.'); // Optional: remove alert for smoother UX
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

        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUserData = await response.json();
                updateUser({ ...user, ...updatedUserData });
                setIsEditing(false);
                alert('Profile updated successfully!');
                window.scrollTo(0, 0);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error("Update failed:", errorData);
                alert(`Failed to update profile: ${errorData.message || response.statusText}`);
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating profile');
        } finally {
            setIsLoading(false);
        }
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

    const selectStyle = {
        ...inputStyle,
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FF5722%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right .7em top 50%',
        backgroundSize: '.65em auto',
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
            maxWidth: '1000px',
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
                            <div>
                                <h1 style={{ color: 'var(--text-main)', marginBottom: '5px', marginTop: 0 }}>{user?.name}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user?.email}</p>
                                {/* Social Links Display or Edit */}
                                {!isEditing && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        {user?.facebook && <a href={user.facebook} target="_blank" rel="noreferrer" style={{ color: '#1877F2', textDecoration: 'none' }}>Facebook</a>}
                                        {user?.twitter && <a href={user.twitter} target="_blank" rel="noreferrer" style={{ color: '#1DA1F2', textDecoration: 'none' }}>Twitter</a>}
                                        {user?.line && <a href={user.line} target="_blank" rel="noreferrer" style={{ color: '#00C300', textDecoration: 'none' }}>Line</a>}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                style={{
                                    padding: '8px 20px',
                                    background: isEditing ? '#555' : '#FF5722',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <div style={{
                            marginTop: '15px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 193, 7, 0.1)',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: '1px solid #FFC107'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>💎</span>
                            <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {points} {t('points')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <form onSubmit={handleSubmit} style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Edit Profile</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input name="name" value={formData.name} onChange={handleAddressChange} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleAddressChange} style={inputStyle} placeholder="+66..." />
                            </div>
                        </div>

                        <h4 style={{ color: 'var(--text-main)', marginTop: '10px', marginBottom: '15px' }}>Social Media</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Facebook URL</label>
                                <input name="facebook" value={formData.facebook || ''} onChange={handleAddressChange} style={inputStyle} placeholder="https://facebook.com/..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Twitter URL</label>
                                <input name="twitter" value={formData.twitter || ''} onChange={handleAddressChange} style={inputStyle} placeholder="https://twitter.com/..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Line ID/URL</label>
                                <input name="line" value={formData.line || ''} onChange={handleAddressChange} style={inputStyle} placeholder="Line ID" />
                            </div>
                        </div>

                        <h4 style={{ color: 'var(--text-main)', marginTop: '10px', marginBottom: '15px' }}>Address</h4>

                        {isLoadingAddress ? (
                            <div style={{ color: '#FF5722' }}>Loading address data...</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>House Number</label>
                                    <input name="house_number" value={formData.house_number} onChange={handleAddressChange} style={inputStyle} placeholder="123/45 Village No.1" />
                                </div>

                                <div>
                                    <label style={labelStyle}>Province</label>
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
                                        placeholder="Select Province"
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>District</label>
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
                                        placeholder="Select District"
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Sub-district</label>
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
                                        placeholder="Select Sub-district"
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Postal Code</label>
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
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Display Address if not editing */}
                {!isEditing && (user?.house_number || user?.province) && (
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <h4 style={{ color: 'var(--text-main)', marginTop: 0 }}>Shipping Address</h4>
                        <p>{user.house_number} {user.sub_district} {user.district}</p>
                        <p>{user.province} {user.postal_code}</p>
                        <p>Phone: {user.phone}</p>
                    </div>
                )}

            </div>

            {/* Orders & Tracking Section */}
            <div>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                    {t('order_history')}
                </h2>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {mockOrders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => navigate(`/profile/orders/${order.id}`)}
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
                                <h3 style={{ color: '#FF5722', marginBottom: '5px', fontSize: '1rem', margin: 0 }}>Order #{order.id}</h3>
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
                    ))}
                </div>
            </div>

            {/* Favorites Section */}
            <div style={{ marginTop: '40px' }}>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                    My Favorites
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
                        Liked Products
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
                        Liked Fandoms
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
                                No favorite products yet.
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
                                    onClick={() => navigate(`/catalog?fandom=${encodeURIComponent(fandomName)}`)}
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
                                        Unlike
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No favorite fandoms yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
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
                    ⚠️ Delete Account
                </button>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
                confirmText="Delete"
                isDangerous={true}
            />
        </div >
    );
};

export default Profile;
