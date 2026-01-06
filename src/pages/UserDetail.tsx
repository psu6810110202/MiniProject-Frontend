import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { role } = useAuth();
    const { t } = useLanguage();
    const [user, setUser] = useState<any | null>(null);
    const [userOrders, setUserOrders] = useState<any[]>([]);

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            try {
                // Try fetching from API first
                const response = await fetch(`http://localhost:3000/api/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    // Mock orders for now/load from local if existing
                    const orders = JSON.parse(localStorage.getItem(`userOrders_${userData.id}`) || '[]');
                    setUserOrders(orders);
                } else {
                    throw new Error('API fetch failed');
                }
            } catch (error) {
                console.warn('Fetching user from API failed, trying local mock DB');
                // Fallback to local
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                const foundUser = db[id as string];

                if (foundUser) {
                    setUser(foundUser);
                    const orders = JSON.parse(localStorage.getItem(`userOrders_${foundUser.id}`) || '[]');
                    setUserOrders(orders);
                } else {
                    alert('User not found');
                    navigate('/profile/users');
                }
            }
        };

        fetchUser();
    }, [id, role, navigate]);

    const handleToggleBlacklist = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('access_token');
            const newStatus = !user.isBlacklisted;

            const response = await fetch(`http://localhost:3000/api/users/${user.id || user.user_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isBlacklisted: newStatus })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);

                // Keep local mock DB in sync just in case
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                if (db[user.id]) {
                    db[user.id].isBlacklisted = newStatus;
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                }
            } else {
                console.warn('API update failed, falling back to local mock DB');
                // Fallback to local
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                if (db[user.id]) {
                    db[user.id].isBlacklisted = newStatus;
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                    setUser({ ...user, isBlacklisted: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating blacklist status:', error);
            // Fallback to local storage if API fails completely
            const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
            if (db[user.id]) {
                db[user.id].isBlacklisted = !user.isBlacklisted;
                localStorage.setItem('mock_users_db', JSON.stringify(db));
                setUser({ ...user, isBlacklisted: !user.isBlacklisted });
            }
        }
    };

    if (!user) return <div style={{ padding: '40px', color: 'white' }}>Loading user...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/profile/users')}
                    style={{ background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ← Back to User List
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleToggleBlacklist}
                        style={{
                            padding: '10px 20px',
                            background: user.isBlacklisted ? '#4CAF50' : '#333',
                            color: 'white',
                            border: '1px solid #555',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                        {user.isBlacklisted ? 'Remove from Blacklist' : '🚫 Blacklist User'}
                    </button>

                </div>
            </div>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {t('user_details')}: {user.username || user.name}
                {user.isBlacklisted && <span style={{ fontSize: '1rem', background: '#F44336', color: 'white', padding: '5px 10px', borderRadius: '15px' }}>Blacklisted</span>}
                {user.deletedAt && <span style={{ fontSize: '1rem', background: '#777', color: 'white', padding: '5px 10px', borderRadius: '15px' }}>Deleted</span>}
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                    <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>{t('account_info')}</h3>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Username:</strong> {user.username || '-'}</p>
                    <p><strong>Name:</strong> {user.name || '-'}</p>

                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Password:</strong> {user.password ? String(user.password) : '<No Password>'}</p>
                    <p><strong>Points:</strong> {user.points || 0}</p>

                    <h4 style={{ color: '#FF5722', marginTop: '20px', marginBottom: '10px', borderTop: '1px solid #444', paddingTop: '10px' }}>Social Contacts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <p>
                            <strong>Facebook:</strong> {user.facebook ? <span>{user.facebookName ? `Name: ${user.facebookName} - ` : ''}<a href={user.facebook} target="_blank" rel="noreferrer" style={{ color: '#1877F2' }}>Open Link</a></span> : <span style={{ color: '#666' }}>-</span>}
                        </p>
                        <p>
                            <strong>Twitter:</strong> {user.twitter ? <span>{user.twitterName ? `Name: ${user.twitterName} - ` : ''}<a href={user.twitter} target="_blank" rel="noreferrer" style={{ color: '#1DA1F2' }}>Open Link</a></span> : <span style={{ color: '#666' }}>-</span>}
                        </p>
                        <p>
                            <strong>Line:</strong> {user.line ? <span>{user.lineName ? `Name: ${user.lineName} - ` : ''}<a href={user.line} target="_blank" rel="noreferrer" style={{ color: '#00C300' }}>Open Link</a></span> : <span style={{ color: '#666' }}>-</span>}
                        </p>
                    </div>
                </div>

                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                    <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>{t('contact_address')}</h3>
                    <p><strong>Full Name:</strong> {user.name || '-'}</p>
                    <p><strong>Phone:</strong> {user.phone || '-'}</p>
                    <p><strong>Address:</strong> {user.house_number ? `${user.house_number}, ${user.sub_district || ''}, ${user.district || ''}, ${user.province || ''}` : 'No address set'}</p>
                </div>
            </div>

            <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#FF5722' }}>{t('order_history')}</h3>
            <div style={{ overflowX: 'auto', background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                {userOrders.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '10px' }}>Order ID</th>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Items</th>
                                <th style={{ padding: '10px' }}>Total</th>
                                <th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userOrders.map((order: any) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '10px' }}>#{order.id}</td>
                                    <td style={{ padding: '10px' }}>{new Date(order.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px' }}>{order.items?.length || 0}</td>
                                    <td style={{ padding: '10px' }}>฿{order.total?.toLocaleString()}</td>
                                    <td style={{ padding: '10px', color: '#4CAF50' }}>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#888' }}>No orders found for this user.</p>
                )}
            </div>
        </div>
    );
};

export default UserDetail;
