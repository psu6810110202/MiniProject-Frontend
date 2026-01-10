import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../../contexts/ProductContext';
import { useAuth } from '../../../contexts/AuthContext';

const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // If id exists, we are in EDIT mode
    const navigate = useNavigate();
    const { items, addItem, updateItem, fandoms, categories } = useProducts();
    const { role } = useAuth();

    const isEditMode = !!id;

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [fandom, setFandom] = useState('');
    const [image, setImage] = useState('');
    const [stock, setStock] = useState(0);
    const [internalId, setInternalId] = useState<number | string | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Load Product Data if Edit Mode
    useEffect(() => {
        if (!isEditMode) return;

        if (items.length === 0) return;

        let found = items.find(i => String(i.id) === id);

        // Fallback for custom IDs (e.g. Fandom+Cat prefix logic if needed)
        if (!found && id && id.length >= 3) {
            const possibleId = parseInt(id.slice(2));
            found = items.find(i => i.id === possibleId);
        }

        if (found) {
            setInternalId(found.id);
            setName(found.name);
            const priceVal = String(found.price).replace(/[^0-9.]/g, ''); // Extract numeric value
            setPrice(priceVal);
            setCategory(found.category);
            setFandom(found.fandom);
            setImage(found.image);
            setStock((found as any).stock || 0);
        }
    }, [id, items, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && !internalId) {
            alert('Error: Could not identify original product.');
            return;
        }

        if (!name || !price || !category || !fandom) {
            alert('Please fill in all required fields.');
            return;
        }

        const productData = {
            id: isEditMode ? Number(internalId) : Date.now(),
            name,
            price: `฿${Number(price).toLocaleString()}`,
            category,
            fandom,
            image: image || 'https://via.placeholder.com/300',
            stock: Number(stock)
        };

        if (isEditMode) {
            updateItem(productData);
            alert('Product updated successfully!');
        } else {
            addItem(productData);
            alert('Product added successfully!');
        }

        navigate('/admin/products');
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #444',
        background: '#333',
        color: 'white',
        marginBottom: '15px',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#bbb'
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/admin/products')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
            >
                ← Back to Product List
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '15px' }}>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} style={{ background: '#222', padding: '30px', borderRadius: '15px', border: '1px solid #444' }}>

                {/* Product Name */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Product Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputStyle}
                        placeholder="e.g., Alastor Figure"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Price */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Price (THB) *</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            style={inputStyle}
                            placeholder="e.g., 2500"
                            min="0"
                        />
                    </div>

                    {/* Stock */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Stock Quantity</label>
                        <input
                            type="number"
                            value={stock}
                            onChange={e => setStock(Number(e.target.value))}
                            style={inputStyle}
                            placeholder="e.g., 50"
                            min="0"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Category */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Category *</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fandom */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Fandom *</label>
                        <select
                            value={fandom}
                            onChange={e => setFandom(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">-- Select Fandom --</option>
                            {fandoms.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Image URL */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Image URL</label>
                    <input
                        type="text"
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        style={inputStyle}
                        placeholder="http://..."
                    />
                    {image && (
                        <div style={{ marginTop: '10px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Preview:</p>
                            <img src={image} alt="Preview" style={{ height: '100px', borderRadius: '5px', border: '1px solid #555' }} />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {isEditMode ? 'Update Product' : 'Save Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ProductForm;
