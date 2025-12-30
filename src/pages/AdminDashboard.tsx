import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { type Item } from '../data/mockItem';
import { useProducts } from '../contexts/ProductContext';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { items, deleteItem, updateFandomName } = useProducts();
    const [editItem, setEditItem] = useState<Item | null>(null);

    // Derived unique fandoms
    const fandoms = React.useMemo(() => Array.from(new Set(items.map(i => i.fandom))), [items]);

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(id);
        }
    };

    const handleRenameFandom = (oldName: string) => {
        const newName = prompt(`Rename fandom "${oldName}" to:`, oldName);
        if (newName && newName !== oldName) {
            updateFandomName(oldName, newName);
        }
    };

    const handleEdit = (item: Item) => {
        setEditItem(item);
    };

    if (role !== 'admin') return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                Admin Dashboard 🛠️
            </h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <div style={{
                    flex: 1, minWidth: '300px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                }}>
                    <h3>Manage Products</h3>
                    <p style={{ color: '#888' }}>Total Items: {items.length}</p>
                    <button style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        + Add New Product
                    </button>
                </div>

                <div style={{
                    flex: 1, minWidth: '300px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                }}>
                    <h3>Manage Fandoms</h3>
                    <p style={{ color: '#888' }}>Edit All Fandom Section</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {fandoms.map(fandom => (
                            <div key={fandom} style={{
                                background: '#333', padding: '5px 10px', borderRadius: '5px',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <span>{fandom}</span>
                                <button
                                    onClick={() => handleRenameFandom(fandom)}
                                    style={{
                                        fontSize: '0.8rem', background: '#2196F3', color: 'white',
                                        border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '2px 5px'
                                    }}>
                                    ✎
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    flex: 1, minWidth: '300px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                }}>
                    <h3>User Management (Mock)</h3>
                    <p style={{ color: '#888' }}>View registered users.</p>
                </div>
            </div>

            <h2>Product List</h2>
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Image</th>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Fandom</th>
                            <th style={{ padding: '15px' }}>Price</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px' }}>{item.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.name}</td>
                                <td style={{ padding: '15px' }}>{item.fandom}</td>
                                <td style={{ padding: '15px', color: '#FF5722' }}>{item.price}</td>
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
