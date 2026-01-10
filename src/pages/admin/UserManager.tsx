import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

import { userAPI } from '../../services/api';

const UserManager: React.FC = () => {
    const { role } = useAuth(); // Token is handled by api.ts now
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const fetchUsers = async (manualRetry = false) => {
        try {
            // Attempt to fetch real users from backend
            const data = await userAPI.getAll();
            setUsers(data);
            if (manualRetry) alert('Connected to Server Successfully! Data updated.');
        } catch (error: any) {
            console.warn('Backend unavailable:', error);
            const errMsg = error.message || 'Unknown Error';

            if (manualRetry) {
                alert(`Connection Failed: ${errMsg}`);
            }
            setUsers([]); // Clear users on error
        } finally { }
    };

    // Load users from API (Primary) with Mock DB Fallback
    useEffect(() => {
        if (role === 'admin') {
            fetchUsers();
        }
    }, [role]);



    if (role !== 'admin') return null;



    // --- User List View ---
    const activeUsers = users.filter(u => !u.isBlacklisted && !u.deletedAt && u.role !== 'admin');
    const blacklistedUsers = users.filter(u => u.isBlacklisted && !u.deletedAt);
    const deletedUsers = users.filter(u => u.deletedAt);

    const handleRestoreUser = async (userId: string) => {
        try {
            await userAPI.restore(userId);

            // Update Local UI State
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === userId ? { ...u, deletedAt: null } : u
            ));

            alert('User restored successfully');
        } catch (e) {
            console.error(e);
            alert("Error restoring user");
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
