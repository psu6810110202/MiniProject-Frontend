import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import { userAPI, orderAPI } from '../../services/api';

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
            if (!id) return;
            try {
                // Try fetching from API first
                const userData = await userAPI.getById(id);

                // Fallback for ID mismatch or API structure
                // Use a proper type or cast if necessary, ignoring type errors for quick migration if 'any' used in state
                setUser(userData);

                try {
                    const allOrders = await orderAPI.getAll();
                    // Filter orders belonging to this user
                    // Handle ID variations from backend
                    const activeUserId = userData.id || userData.user_id;

                    const filteredApiOrders = allOrders.filter((o: any) =>
                        String(o.user_id) === String(activeUserId) ||
                        String(o.userId) === String(activeUserId) ||
                        String(o.user?.id) === String(activeUserId)
                    );
                    setUserOrders(filteredApiOrders);

                } catch (orderErr) {
                    console.error("Failed to load user orders:", orderErr);
                    // Fallback or just empty
                    setUserOrders([]);

                }
            } catch (error: any) {
                console.error('Fetching user failed:', error);
                const msg = error?.message || 'Unknown API Error';
                alert(`Failed to load user: ${msg}`);
                // navigate('/profile/users'); // Comment out to allow seeing the error state if needed, or keep it.
                // Keeping navigate for now but maybe better to show error UI?
                navigate('/profile/users');
            }
        };

        fetchUser();
    }, [id, role, navigate]);

    const handleToggleBlacklist = async () => {
        if (!user) return;

        try {
            const newStatus = !user.isBlacklisted;
            const updatedUser = await userAPI.update(user.id || user.user_id, { isBlacklisted: newStatus });
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating blacklist status:', error);
            alert("An error occurred while updating status.");
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
                    <p><strong>ID:</strong> {user.id || user.user_id}</p>
                    <p><strong>Username:</strong> {user.username || '-'}</p>
                    <p><strong>Name:</strong> {user.name || '-'}</p>

                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Password:</strong> {user.password ? String(user.password) : '<No Password>'}</p>
                    <p><strong>Points:</strong> {user.points || 0}</p>


                </div>

                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                    <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>{t('contact_address')}</h3>
                    <p><strong>Full Name:</strong> {user.name || '-'}</p>
                    <p><strong>Phone:</strong> {user.phone || '-'}</p>
                    <p><strong>Address:</strong> {user.house_number ? `${user.house_number}, ${user.sub_district || ''}, ${user.district || ''}, ${user.province || ''}` : 'No address set'}</p>
                </div>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2 style={{ color: '#FF5722', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                    Order History ({userOrders.length})
                </h2>
                {userOrders.length > 0 ? (
                    <div style={{ background: '#222', borderRadius: '10px', border: '1px solid #444', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#333', color: '#FF5722' }}>
                                    <th style={{ padding: '15px' }}>Order ID</th>
                                    <th style={{ padding: '15px' }}>Date</th>
                                    <th style={{ padding: '15px' }}>Total Amount</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userOrders.map((order, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '15px', color: '#ccc' }}>{order.order_id || order.id}</td>
                                        <td style={{ padding: '15px', color: '#ccc' }}>
                                            {new Date(order.created_at || order.date || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px', color: '#FFC107' }}>฿{(Number(order.total_amount || 0)).toLocaleString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px',
                                                background: ['paid', 'completed'].includes((order.status || order.payment_status || '').toLowerCase()) ? '#4CAF50' : '#FF9800',
                                                color: 'white', fontSize: '0.85rem'
                                            }}>
                                                {order.status || order.payment_status || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#888' }}>No orders found for this user.</p>
                )}
            </div>
        </div>
    );
};

export default UserDetail;
