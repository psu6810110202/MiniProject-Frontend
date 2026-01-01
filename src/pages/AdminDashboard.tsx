import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { type PreOrderItem } from '../data/preorderData';
import { useProducts } from '../contexts/ProductContext';


const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { items, preOrders, deletePreOrder } = useProducts();
    const [editItem, setEditItem] = useState<PreOrderItem | null>(null);

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this pre-order?')) {
            deletePreOrder(id);
        }
    };

    const handleEdit = (item: PreOrderItem) => {
        setEditItem(item);
    };

    const [viewMode, setViewMode] = useState<'dashboard' | 'users'>('dashboard');
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);


    // Refresh users when entering user mode
    React.useEffect(() => {
        if (viewMode === 'users') {
            const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
            setUsers(Object.values(db));
        }
    }, [viewMode]);

    if (role !== 'admin') return null;



    const handleToggleBlacklist = () => {
        const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        if (db[selectedUser.id]) {
            db[selectedUser.id].isBlacklisted = !db[selectedUser.id].isBlacklisted;
            localStorage.setItem('mock_users_db', JSON.stringify(db));

            // Update local state
            setSelectedUser(db[selectedUser.id]);
            setUsers(Object.values(db));
        }
    };

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
                    {/* Basic Info */}
                    <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                        <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>Account Info</h3>
                        <p><strong>ID:</strong> {selectedUser.id}</p>
                        <p><strong>Username:</strong> {selectedUser.username || '-'}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Password:</strong> {selectedUser.password ? String(selectedUser.password) : '<No Password>'}</p>
                        <p><strong>Points:</strong> {selectedUser.points || 0}</p>
                    </div>

                    {/* Contact Info */}
                    <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444' }}>
                        <h3 style={{ color: '#FF5722', marginBottom: '15px' }}>Contact & Address</h3>
                        <p><strong>Full Name:</strong> {selectedUser.name || '-'}</p>
                        <p><strong>Phone:</strong> {selectedUser.phone || '-'}</p>
                        <p><strong>Address:</strong> {selectedUser.house_number ? `${selectedUser.house_number}, ${selectedUser.sub_district || ''}, ${selectedUser.district || ''}, ${selectedUser.province || ''}` : 'No address set'}</p>
                    </div>
                </div>

                {/* Orders */}
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
    if (viewMode === 'users') {
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
                    onClick={() => setViewMode('dashboard')}
                    style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ← Back to Dashboard
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
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                Admin Dashboard 🛠️
            </h1>

            {/* Top Row: User Management */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3>User Management (Mock)</h3>
                        <p style={{ color: '#888' }}>View and manage registered users.</p>
                    </div>
                    <button
                        onClick={() => setViewMode('users')}
                        style={{
                            padding: '10px 25px',
                            background: '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                        Manage Users
                    </button>
                </div>
            </div>

            {/* Second Row: 3 Management Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Manage Categories */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Categories</h3>
                        <p style={{ color: '#888' }}>Organize products by category</p>
                    </div>
                    <button style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '100%'
                    }}>
                        View Categories
                    </button>
                </div>

                {/* Manage Fandoms */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Fandoms</h3>
                        <p style={{ color: '#888' }}>Edit All Fandom Section</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/fandoms')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage All Fandoms
                    </button>
                </div>

                {/* Manage Products */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Products</h3>
                        <p style={{ color: '#888' }}>Total Products: {items.length}</p>
                    </div>
                    <button style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '100%'
                    }}>
                        Manage All Products
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                <h2>Pre-Order List</h2>
                <button style={{
                    padding: '10px 20px',
                    background: '#FF5722',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}>
                    + Add New Pre-Order
                </button>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Image</th>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Price</th>
                            <th style={{ padding: '15px' }}>Deposit</th>
                            <th style={{ padding: '15px' }}>Release Date</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preOrders.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px' }}>{item.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.name}</td>
                                <td style={{ padding: '15px', color: '#FF5722' }}>{item.price.toLocaleString()}</td>
                                <td style={{ padding: '15px' }}>{item.deposit.toLocaleString()}</td>
                                <td style={{ padding: '15px' }}>{item.releaseDate}</td>
                                <td style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        style={{ marginRight: '10px', background: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{ background: '#F44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editItem && (
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: '#222',
                    border: '1px solid #FF5722',
                    borderRadius: '10px'
                }}>
                    <h3>Editing: {editItem.name}</h3>
                    <p style={{ color: '#888' }}>This is a mock edit form. Changes won't persist to the actual database.</p>
                    <button onClick={() => setEditItem(null)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}


        </div>
    );
};

export default AdminDashboard;
