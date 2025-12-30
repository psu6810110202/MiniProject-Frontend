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

    if (role !== 'admin') return null;

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
                    border: '1px solid #333'
                }}>
                    <h3>User Management (Mock)</h3>
                    <p style={{ color: '#888' }}>View and manage registered users.</p>
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
