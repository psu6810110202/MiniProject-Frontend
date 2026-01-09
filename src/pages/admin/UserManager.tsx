import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const UserManager: React.FC = () => {
    const { role, token } = useAuth(); // Get token from context (handles session/local storage abstraction)
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const [dataSource, setDataSource] = useState<'api' | 'mock'>('api');
    const [isLoading, setIsLoading] = useState(false);
    const [lastError, setLastError] = useState<string>('');

    const fetchUsers = async (manualRetry = false) => {
        setIsLoading(true);
        setLastError('');
        // Token is already retrieved from useAuth
        try {
            // Attempt to fetch real users from backend
            const response = await fetch('http://localhost:3000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setDataSource('api');
                if (manualRetry) alert('Connected to Server Successfully! Data updated.');
            } else {
                if (response.status === 401) {
                    if (manualRetry) alert('Session expired. Please log out and log in again.');
                    throw new Error('Unauthorized');
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        } catch (error: any) {
            console.warn('Backend unavailable:', error);
            const errMsg = error.message || 'Unknown Error';
            setLastError(errMsg);

            if (manualRetry) {
                alert(`Connection Failed: ${errMsg}\n\nSystem is using offline/mock data.`);
            }
            // Fallback to local mock DB
            const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
            setUsers(Object.values(db));
            setDataSource('mock');
        } finally {
            setIsLoading(false);
        }
    };

    // Load users from API (Primary) with Mock DB Fallback
    useEffect(() => {
        if (role === 'admin') {
            fetchUsers();
        }
    }, [role]);



    if (role !== 'admin') return null;



    // --- User List View ---
    const activeUsers = users.filter(u => !u.isBlacklisted && !u.deletedAt);
    const blacklistedUsers = users.filter(u => u.isBlacklisted && !u.deletedAt);
    const deletedUsers = users.filter(u => u.deletedAt);

    const handleRestoreUser = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:3000/api/users/${userId}/restore`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Update Local UI State
                setUsers(prevUsers => prevUsers.map(u =>
                    u.id === userId ? { ...u, deletedAt: null } : u
                ));

                // Update Local Mock DB if needed
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                if (db[userId]) {
                    delete db[userId].deletedAt;
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                }
                alert('User restored successfully');
            } else {
                alert('Failed to restore user from server');
            }
        } catch (e) {
            console.error(e);
            // Fallback to local
            const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
            if (db[userId]) {
                delete db[userId].deletedAt;
                localStorage.setItem('mock_users_db', JSON.stringify(db));
                setUsers(Object.values(db));
                alert('Restored locally (Server might be down)');
            }
        }
    };



    const UserTable = ({ list, emptyMsg, type }: { list: any[], emptyMsg: string, type: 'active' | 'blacklist' | 'deleted' }) => (
        <div style={{
            overflowX: 'auto',
            background: type === 'blacklist' ? 'rgba(50,0,0,0.8)' : type === 'deleted' ? 'rgba(50,50,50,0.8)' : '#222',
            color: '#e0e0e0', // Force light text for readability on dark backgrounds
            padding: '20px',
            borderRadius: '10px',
            border: type === 'blacklist' ? '1px solid #F44336' : type === 'deleted' ? '1px solid #777' : '1px solid #444',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #555', color: type === 'blacklist' ? '#ff6b6b' : type === 'deleted' ? '#bbb' : '#FF5722' }}>
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
                            <td style={{ padding: '15px', color: '#fff' }}>
                                <div style={{ fontWeight: 'bold' }}>{user.username || '-'}</div>
                            </td>
                            <td style={{ padding: '15px' }}>{user.name || '-'}</td>
                            <td style={{ padding: '15px', color: '#aaa' }}>{user.email}</td>
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
                                    <button onClick={() => navigate('/profile/users/' + user.id)} style={{ background: '#FF5722', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Edit / View</button>
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
                ← {t('back_to_profile')}
            </button>

            {dataSource === 'mock' && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: 'rgba(255, 152, 0, 0.1)',
                    border: '1px solid #FF9800',
                    borderRadius: '8px',
                    color: '#FF9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div>
                            <strong>Offline Mode / Mock Data Active</strong>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                The backend server is unreachable. You are viewing cached data.
                            </div>
                            {lastError && (
                                <div style={{ fontSize: '0.85rem', color: '#ff6b6b', marginTop: '4px', fontWeight: 'bold' }}>
                                    Error: {lastError}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => fetchUsers(true)}
                        disabled={isLoading}
                        style={{
                            background: '#FF9800',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Connecting...' : 'Retry Connection'}
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                <h1 style={{ margin: 0 }}>{t('user_management')}</h1>

            </div>

            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {t('active_users')} <span style={{ fontSize: '0.8rem', background: '#444', padding: '2px 8px', borderRadius: '10px' }}>{activeUsers.length}</span>
            </h3>
            <UserTable list={activeUsers} emptyMsg={t('no_active_users_found')} type="active" />

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px', color: '#F44336', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🚫 {t('blacklisted_users')} <span style={{ fontSize: '0.8rem', background: '#F44336', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{blacklistedUsers.length}</span>
                </h3>
                <UserTable list={blacklistedUsers} emptyMsg={t('no_blacklisted_users')} type="blacklist" />
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #444', paddingTop: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🗑️ {t('recent_deletions')} <span style={{ fontSize: '0.8rem', background: '#666', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{deletedUsers.length}</span>
                </h3>
                <UserTable list={deletedUsers} emptyMsg={t('recycle_bin_empty')} type="deleted" />
            </div>
        </div>
    );
};

export default UserManager;
