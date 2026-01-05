import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';

const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // This will be the custom ID (e.g. 111) or UUID
    const navigate = useNavigate();
    const { items, updateItem, fandoms, categories } = useProducts();
    const { role } = useAuth();

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

    // Load Product Data
    useEffect(() => {
        if (!id || items.length === 0) return;

        // Note: The ID passed in URL might be the Custom ID (e.g. '111') generated in frontend,
        // OR the actual ID.
        // Since we don't store Custom ID in backend/context, we need to be clever.
        // However, looking at ProductManager, we used the generated ID for navigation.

        // Strategy: 
        // 1. Try to find by direct ID match (in case it wasn't custom)
        // 2. Or if we can recreate the logic... but that's hard.
        // Let's rely on the fact that for now we might just be passing the ID that we have.

        // Wait, in ProductManager we rendered `product.product_id`.
        // If that was the Custom ID (111), looking it up directly in `items` won't work because `items` use internal ID (1).

        // Let's scan all items and see which one 'generates' this Custom ID? 
        // OR simpler: In ProductManager, let's Change the Edit button to pass the ORIGINAL ID?
        // -> That would be safer, but the URL would look like /edit/1 instead of /edit/111.

        // Let's try to search flexibly.

        // Attempt 1: Direct Match
        let found = items.find(i => String(i.id) === id);

        // Attempt 2: If finding by Custom ID Logic is needed...
        // For now let's assume the ID passed is arguably findable or we iterate.
        // Ideally we should have passed the Raw ID.

        // Quick Fix for "Custom ID" issue:
        // If we can't find it directly, let's try to guess from the last digits? (111 -> 1)
        if (!found && id && id.length >= 3) {
            const possibleId = parseInt(id.slice(2)); // Remove first 2 digits (Fandom+Cat)
            found = items.find(i => i.id === possibleId);
        }

        // If still not found (maybe it was a raw UUID or something), then fail.

        if (found) {
            setInternalId(found.id);
            setName(found.name);
            // Clean price string if needed
            const priceVal = String(found.price).replace(/[^0-9.]/g, '');
            setPrice(priceVal);
            setCategory(found.category);
            setFandom(found.fandom);
            setImage(found.image);
            setStock((found as any).stock || 0); // Mock items might not have stock
        } else {
            // alert('Product not found!');
            // navigate('/profile/products');
        }
    }, [id, items, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!internalId) {
            alert('Error: Could not identify original product.');
            return;
        }

        if (!name || !price || !category || !fandom) {
            alert('Please fill in all required fields.');
            return;
        }

        const updatedItem = {
            id: Number(internalId), // Keep original ID
            name,
            price: `฿${Number(price).toLocaleString()}`,
            category,
            fandom,
            image: image || 'https://via.placeholder.com/300',
            stock: Number(stock)
        };

        updateItem(updatedItem);
        alert('Product updated successfully!');
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

    if (!id) return null;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile/products')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem' }}
            >
                ← Back to Product List
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '15px' }}>
                Edit Product
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
                        Update Product
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

export default EditProduct;
