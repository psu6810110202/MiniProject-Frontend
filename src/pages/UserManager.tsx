import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Load users from mock DB
    useEffect(() => {
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        setUsers(Object.values(db));
    }, []);

    const handleToggleBlacklist = () => {
        if (!selectedUser) return;
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        if (db[selectedUser.id]) {
            db[selectedUser.id].isBlacklisted = !db[selectedUser.id].isBlacklisted;
            localStorage.setItem('mock_users_db', JSON.stringify(db));

            // Update local state
            setSelectedUser(db[selectedUser.id]);
            setUsers(Object.values(db));
        }
    };

    if (role !== 'admin') return null;

    // --- User Detail View ---
    if (selectedUser) {
        const userOrders = JSON.parse(localStorage.getItem(`userOrders_${selectedUser.id}`) || '[]');

        return (
            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <button
                        onClick={() => setSelectedUser(null)}
                        style={{ background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ← Back to User List
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleToggleBlacklist}
                            style={{
                                padding: '10px 20px',
                                background: selectedUser.isBlacklisted ? '#4CAF50' : '#333',
                                color: 'white',
                                border: '1px solid #555',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                            {selectedUser.isBlacklisted ? 'Remove from Blacklist' : '🚫 Blacklist User'}
                        </button>
                    </div>
                </div>

                <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    User Details: {selectedUser.username || selectedUser.name}
                    {selectedUser.isBlacklisted && <span style={{ fontSize: '1rem', background: '#F44336', color: 'white', padding: '5px 10px', borderRadius: '15px' }}>Blacklisted</span>}
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                        <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>Account Info</h3>
                        <p><strong>ID:</strong> {selectedUser.id}</p>
                        <p><strong>Username:</strong> {selectedUser.username || '-'}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Password:</strong> {selectedUser.password ? String(selectedUser.password) : '<No Password>'}</p>
                        <p><strong>Points:</strong> {selectedUser.points || 0}</p>
                    </div>

                    <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                        <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>Contact & Address</h3>
                        <p><strong>Full Name:</strong> {selectedUser.name || '-'}</p>
                        <p><strong>Phone:</strong> {selectedUser.phone || '-'}</p>
                        <p><strong>Address:</strong> {selectedUser.house_number ? `${selectedUser.house_number}, ${selectedUser.sub_district || ''}, ${selectedUser.district || ''}, ${selectedUser.province || ''}` : 'No address set'}</p>
                    </div>
                </div>

                <h3 style={{ marginTop: '40px', marginBottom: '20px', color: '#FF5722' }}>Order History</h3>
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
    }

    // --- User List View ---
    const activeUsers = users.filter(u => !u.isBlacklisted);
    const blacklistedUsers = users.filter(u => u.isBlacklisted);

    const UserTable = ({ list, emptyMsg, isBlacklistTable }: { list: any[], emptyMsg: string, isBlacklistTable?: boolean }) => (
        <div style={{
            overflowX: 'auto',
            background: isBlacklistTable ? 'rgba(50,0,0,0.5)' : '#222',
            padding: '20px',
            borderRadius: '10px',
            border: isBlacklistTable ? '1px solid #F44336' : '1px solid #444'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #444', color: isBlacklistTable ? '#F44336' : '#FF5722' }}>
                        <th style={{ padding: '15px' }}>Username</th>
                        <th style={{ padding: '15px' }}>Full Name</th>
                        <th style={{ padding: '15px' }}>Phone</th>
                        <th style={{ padding: '15px' }}>Email</th>
                        <th style={{ padding: '15px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '15px' }}>
                                <div style={{ fontWeight: 'bold' }}>{user.username || '-'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>ID: {user.id}</div>
                            </td>
                            <td style={{ padding: '15px' }}>{user.name || '-'}</td>
                            <td style={{ padding: '15px' }}>{user.phone || '-'}</td>
                            <td style={{ padding: '15px' }}>{user.email}</td>
                            <td style={{ padding: '15px' }}>
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    style={{
                                        background: '#FF5722',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}>
                                    Edit / View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {list.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>{emptyMsg}</p>}
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
            >
                ← Back to Profile
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                User Management (Mock)
            </h1>

            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Active Users <span style={{ fontSize: '0.8rem', background: '#444', padding: '2px 8px', borderRadius: '10px' }}>{activeUsers.length}</span>
            </h3>
            <UserTable list={activeUsers} emptyMsg="No active users found." />

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px', color: '#F44336', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🚫 Blacklisted Users <span style={{ fontSize: '0.8rem', background: '#F44336', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{blacklistedUsers.length}</span>
                </h3>
                <UserTable list={blacklistedUsers} emptyMsg="No blacklisted users." isBlacklistTable={true} />
            </div>
        </div>
    );
};

export default UserManager;
