import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Load users from API
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await fetch('http://localhost:3000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error('Failed to fetch users from API');
                    // Fallback to mock DB if API fails (optional, good for dev)
                    const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                    setUsers(Object.values(db));
                    if (role === 'admin') alert('⚠️ Backend Connection Failed. Using Mock Admin Session.');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                setUsers(Object.values(db));
            }
        };
        fetchUsers();
    }, [role]);



    if (role !== 'admin') return null;



    // --- User List View ---
    const activeUsers = users.filter(u => !u.isBlacklisted && !u.deletedAt);
    const blacklistedUsers = users.filter(u => u.isBlacklisted && !u.deletedAt);
    const deletedUsers = users.filter(u => u.deletedAt);

    const handleRestoreUser = (userId: string) => {
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        if (db[userId]) {
            delete db[userId].deletedAt;
            localStorage.setItem('mock_users_db', JSON.stringify(db));

            // Update local state
            setUsers(Object.values(db));
        }
    };



    const UserTable = ({ list, emptyMsg, type }: { list: any[], emptyMsg: string, type: 'active' | 'blacklist' | 'deleted' }) => (
        <div style={{
            overflowX: 'auto',
            background: type === 'blacklist' ? 'rgba(50,0,0,0.5)' : type === 'deleted' ? 'rgba(50,50,50,0.2)' : '#222',
            padding: '20px',
            borderRadius: '10px',
            border: type === 'blacklist' ? '1px solid #F44336' : type === 'deleted' ? '1px solid #777' : '1px solid #444'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #444', color: type === 'blacklist' ? '#F44336' : type === 'deleted' ? '#aaa' : '#FF5722' }}>
                        <th style={{ padding: '15px' }}>Username</th>
                        <th style={{ padding: '15px' }}>Full Name</th>
                        <th style={{ padding: '15px' }}>Email</th>
                        <th style={{ padding: '15px' }}>{type === 'deleted' ? 'Deletion Date' : 'Phone'}</th>
                        <th style={{ padding: '15px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #333', opacity: type === 'deleted' ? 0.7 : 1 }}>
                            <td style={{ padding: '15px' }}>
                                <div style={{ fontWeight: 'bold' }}>{user.username || '-'}</div>
                            </td>
                            <td style={{ padding: '15px' }}>{user.name || '-'}</td>
                            <td style={{ padding: '15px' }}>{user.email}</td>
                            <td style={{ padding: '15px' }}>
                                {type === 'deleted'
                                    ? (user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : '-')
                                    : (user.phone || '-')}
                            </td>
                            <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                {type === 'deleted' ? (
                                    <>
                                        <button onClick={() => handleRestoreUser(user.id)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Restore</button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate('/admin/users/' + user.id)} style={{ background: '#FF5722', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Edit / View</button>
                                )}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                <h1 style={{ margin: 0 }}>User Management</h1>
                <button
                    onClick={() => {
                        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                        const uniqueMap = new Map();

                        Object.values(db).forEach((u: any) => {
                            if (!u.email) return;
                            if (!uniqueMap.has(u.email)) {
                                uniqueMap.set(u.email, u);
                            } else {
                                // Keep the one with more keys (more data) or the one that isn't 'mock-1' if possible
                                const existing = uniqueMap.get(u.email);
                                const existingKeys = Object.keys(existing).length;
                                const newKeys = Object.keys(u).length;

                                if (newKeys > existingKeys || (existing.id.startsWith('mock') && !u.id.startsWith('mock'))) {
                                    uniqueMap.set(u.email, u);
                                }
                            }
                        });

                        const newDb: any = {};
                        uniqueMap.forEach((u: any) => {
                            newDb[u.id] = u;
                        });

                        localStorage.setItem('mock_users_db', JSON.stringify(newDb));
                        setUsers(Object.values(newDb));
                        alert('Duplicates removed based on unique emails.');
                    }}
                    style={{
                        background: '#333',
                        color: 'var(--text-muted)',
                        border: '1px solid #555',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}>
                    🔧 Fix Duplicates
                </button>
            </div>

            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Active Users <span style={{ fontSize: '0.8rem', background: '#444', padding: '2px 8px', borderRadius: '10px' }}>{activeUsers.length}</span>
            </h3>
            <UserTable list={activeUsers} emptyMsg="No active users found." type="active" />

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px', color: '#F44336', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🚫 Blacklisted Users <span style={{ fontSize: '0.8rem', background: '#F44336', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{blacklistedUsers.length}</span>
                </h3>
                <UserTable list={blacklistedUsers} emptyMsg="No blacklisted users." type="blacklist" />
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #444', paddingTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🗑️ Recent Deletions (30 Days) <span style={{ fontSize: '0.8rem', background: '#666', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{deletedUsers.length}</span>
                </h3>
                <UserTable list={deletedUsers} emptyMsg="Recycle bin is empty." type="deleted" />
            </div>
        </div>
    );
};

export default UserManager;
