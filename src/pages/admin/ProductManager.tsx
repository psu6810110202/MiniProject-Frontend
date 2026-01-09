import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';

interface Product {
    product_id: string;
    id: number | string; // Handle both types from context
    name: string;
    price: string | number;
    stock_qty?: number;
    stock?: number;
    category_id?: string;
    category?: string;
    fandom?: string; // Add Fandom
    image?: string;
}

const ProductManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();

    // Use Context instead of raw fetch to get frontend mock data + api data
    const { items, deleteItem } = useProducts();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
            return;
        }

        setProducts(items.map(item => ({
            ...item,
            product_id: String(item.id),
            stock_qty: (item as any).stock_qty || 10, // Default or fetch from backend
            category_id: item.category
        })));
        setLoading(false);
    }, [role, navigate, items]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        deleteItem(id);
        setProducts(prev => prev.filter(p => p.id !== id && p.product_id !== String(id)));
    };

    if (loading) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading products...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
            >
                ← Back to Profile
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '15px' }}>
                <h1 style={{ margin: 0 }}>Product Management</h1>
                <button
                    onClick={() => navigate('/profile/products/new')}
                    style={{
                        background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                    }}
                >
                    + Add New Product
                </button>
            </div>

            <div style={{
                background: '#222',
                borderRadius: '10px',
                border: '1px solid #444',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#333', color: '#FF5722' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Image</th>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Fandom</th>
                            <th style={{ padding: '15px' }}>Category</th>
                            <th style={{ padding: '15px' }}>Price</th>
                            <th style={{ padding: '15px' }}>Stock</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.product_id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px', fontFamily: 'monospace', color: '#bbb', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    {product.product_id}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#444', borderRadius: '5px', overflow: 'hidden' }}>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.7rem' }}>No Img</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{product.name}</td>
                                <td style={{ padding: '15px', color: '#4CAF50' }}>{product.fandom || '-'}</td>
                                <td style={{ padding: '15px' }}>{product.category_id}</td>
                                <td style={{ padding: '15px' }}>{product.price}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        color: (product.stock_qty || 0) > 0 ? '#4CAF50' : '#F44336',
                                        fontWeight: 'bold'
                                    }}>
                                        {product.stock_qty}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => navigate(`/profile/products/edit/${product.product_id}`)}
                                        style={{ background: '#444', color: 'white', border: '1px solid #666', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.product_id)}
                                        style={{ background: 'rgba(244, 67, 54, 0.2)', color: '#F44336', border: '1px solid #F44336', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductManager;
