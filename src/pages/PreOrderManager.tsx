import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { type PreOrderItem, preorderItems } from '../data/preorderData';

// Add Pre-Order Modal Component
interface AddPreOrderModalProps {
    onClose: () => void;
    onAdd: (item: PreOrderItem) => void;
}

const AddPreOrderModal: React.FC<AddPreOrderModalProps> = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        deposit: '',
        releaseDate: '',
        image: '',
        description: '',
        fandom: '',
        category: 'Figure'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Generate new ID (max existing ID + 1)
        const newId = Math.max(...preorderItems.map(item => item.id), 0) + 1;
        
        const newItem: PreOrderItem = {
            id: newId,
            name: formData.name,
            price: Number(formData.price),
            deposit: Number(formData.deposit),
            releaseDate: formData.releaseDate,
            image: formData.image || 'http://localhost:3000/images/covers/default.webp',
            description: formData.description,
            fandom: formData.fandom,
            category: formData.category
        };

        onAdd(newItem);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px'
        }}>
            <div style={{
                background: '#1a1a1a', 
                padding: '40px', 
                borderRadius: '20px', 
                width: '100%', 
                maxWidth: '500px',
                maxHeight: '90vh', 
                overflowY: 'auto', 
                border: '1px solid #FF5722'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#FF5722' }}>Add New Pre-Order</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Product Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Price *</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Deposit *</label>
                            <input
                                type="number"
                                required
                                value={formData.deposit}
                                onChange={(e) => handleInputChange('deposit', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Release Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.releaseDate}
                            onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Fandom *</label>
                            <input
                                type="text"
                                required
                                value={formData.fandom}
                                onChange={(e) => handleInputChange('fandom', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="Figure">Figure</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Image URL</label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => handleInputChange('image', e.target.value)}
                            placeholder="http://localhost:3000/images/covers/product.webp"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#2a2a2a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                resize: 'vertical',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Add Pre-Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PreOrderManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { preOrders, deletePreOrder, addPreOrder } = useProducts();
    const [editItem, setEditItem] = useState<PreOrderItem | null>(null);
    const [viewItem, setViewItem] = useState<PreOrderItem | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [reservations, setReservations] = useState<any[]>([]);

    // Function to load reservations for a specific item
    const loadReservations = (itemId: number) => {
        const allReservations: any[] = [];
        const userDb = JSON.parse(localStorage.getItem('mock_users_db') || '{}');

        // Scan all user orders in localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('userOrders_')) {
                const userId = key.split('_')[1];
                const orders = JSON.parse(localStorage.getItem(key) || '[]');
                const user = userDb[userId] || { name: 'Unknown User', email: '-' };

                orders.forEach((order: any) => {
                    const hasItem = order.items?.some((item: any) => item.id === itemId);
                    if (hasItem) {
                        allReservations.push({
                            ...order,
                            userName: user.name || user.username,
                            userEmail: user.email,
                            userId: userId
                        });
                    }
                });
            }
        });
        setReservations(allReservations);
    };

    const handleViewReservations = (item: PreOrderItem) => {
        setViewItem(item);
        loadReservations(item.id);
    };

    const handleConfirmOrder = (orderId: string, userId: string) => {
        const key = `userOrders_${userId}`;
        const orders = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedOrders = orders.map((order: any) => {
            if (order.id === orderId) {
                return { ...order, status: 'Confirmed' };
            }
            return order;
        });
        localStorage.setItem(key, JSON.stringify(updatedOrders));
        // Refresh local state
        if (viewItem) loadReservations(viewItem.id);
        alert('Order Confirmed!');
    };

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

    if (role !== 'admin') return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                ← Back to Profile
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                    Pre-Order Management 📦
                </h1>
                <button 
                    onClick={() => setShowAddModal(true)}
                    style={{
                        padding: '12px 25px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)'
                    }}
                >
                    + Add New Pre-Order
                </button>
            </div>

            {/* Grid display ("ช่องเรียบร้อย") */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '25px'
            }}>
                {preOrders.map(item => (
                    <div key={item.id} style={{
                        background: 'var(--card-bg)',
                        borderRadius: '15px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ position: 'relative', height: '200px' }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                color: '#FFC107',
                                fontWeight: 'bold'
                            }}>
                                ID: {item.id}
                            </div>
                        </div>

                        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', height: '2.4em', overflow: 'hidden' }}>{item.name}</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Price</div>
                                    <div style={{ fontWeight: 'bold', color: '#FF5722' }}>฿{item.price.toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Release</div>
                                    <div style={{ fontWeight: 'bold' }}>{item.releaseDate}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewReservations(item)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    background: '#333',
                                    color: '#FFC107',
                                    border: '1px solid #FFC107',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                👁️ View Reservations
                            </button>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setEditItem(item)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'rgba(33, 150, 243, 0.1)',
                                        color: '#2196F3',
                                        border: '1px solid #2196F3',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'rgba(244, 67, 54, 0.1)',
                                        color: '#F44336',
                                        border: '1px solid #F44336',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reservations Modal */}
            {viewItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px'
                }}>
                    <div style={{
                        background: '#1a1a1a', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '800px',
                        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #FF5722'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Reservations: {viewItem.name}</h2>
                            <button onClick={() => setViewItem(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>

                        {reservations.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #333', color: '#FF5722' }}>
                                        <th style={{ padding: '12px' }}>Customer</th>
                                        <th style={{ padding: '12px' }}>Order Date</th>
                                        <th style={{ padding: '12px' }}>Total Amount</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(res => (
                                        <tr key={res.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{res.userName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{res.userEmail}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{new Date(res.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px' }}>฿{res.total.toLocaleString()}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: res.status === 'Confirmed' ? '#4CAF50' : '#FFC107',
                                                    color: 'black',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {res.status !== 'Confirmed' && (
                                                    <button
                                                        onClick={() => handleConfirmOrder(res.id, res.userId)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#FF5722',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No reservations found for this item.</p>
                        )}
                    </div>
                </div>
            )}

            {editItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: '#1a1a1a', padding: '30px', borderRadius: '20px', width: '400px',
                        border: '1px solid #FF5722'
                    }}>
                        <h3>Mock Edit: {editItem.name}</h3>
                        <p style={{ color: '#888', marginBottom: '20px' }}>
                            This form is a placeholder. Changes are not currently persisted.
                        </p>
                        <button
                            onClick={() => setEditItem(null)}
                            style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Add Pre-Order Modal */}
            {showAddModal && (
                <AddPreOrderModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={(newItem) => {
                        addPreOrder(newItem);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default PreOrderManager;
