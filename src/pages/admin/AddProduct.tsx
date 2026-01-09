import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const { addItem, fandoms, categories } = useProducts();
    const { role } = useAuth();

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [fandom, setFandom] = useState('');
    const [image, setImage] = useState('');
    const [stock, setStock] = useState(0);

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!name || !price || !category || !fandom) {
            alert('Please fill in all required fields.');
            return;
        }

        const newItem = {
            id: Date.now(), // Generate a temp ID
            name,
            price: `฿${Number(price).toLocaleString()}`, // Format as expected by Item interface
            category,
            fandom,
            image: image || 'https://via.placeholder.com/300', // Default placeholder
            stock: Number(stock) // Note: Item interface in mock might not consistenly show stock, but we pass it for now
        };

        addItem(newItem);
        alert('Product added successfully!');
        navigate('/profile/products');
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
                onClick={() => navigate('/profile/products')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
            >
                ← Back to Product List
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '15px' }}>
                Add New Product
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
                            <option value="Other">Other</option>
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
                            <option value="New Fandom">Is a New Fandom?</option>
                        </select>
                    </div>
                </div>

                {/* Handling New Fandom Manual Input if needed could be added here, keeping it simple for now */}

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
                        Save Product
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile/products')}
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

export default AddProduct;
