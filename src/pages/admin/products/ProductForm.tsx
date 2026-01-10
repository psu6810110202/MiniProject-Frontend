import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../../contexts/ProductContext';
import { useAuth } from '../../../contexts/AuthContext';
import { type Item } from '../../../types';

const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, addItem, updateItem, fandoms, categories } = useProducts();
    const { role } = useAuth();

    const isEditMode = !!id;

    // Helper to separate Description and Specs
    const parseInitialData = (item: Item | undefined) => {
        if (!item) return { desc: '', specs: {} };
        const desc = item.description || '';
        const marker = '--- Specifications ---';
        const [mainDesc, specStr] = desc.includes(marker) ? desc.split(marker) : [desc, ''];

        const parsedSpecs: Record<string, string> = {};
        if (specStr) {
            specStr.trim().split('\n').forEach(l => {
                if (l.includes(':')) {
                    const [k, ...v] = l.split(':');
                    parsedSpecs[k.trim()] = v.join(':').trim();
                }
            });
        }
        return { desc: mainDesc.trim(), specs: parsedSpecs };
    };

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        fandom: '',
        image: '',
        description: '',
        gallery: [] as string[]
    });

    const [specs, setSpecs] = useState<Record<string, string>>({});
    const [internalId, setInternalId] = useState<number | string | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Load Data
    useEffect(() => {
        if (!isEditMode) return;
        if (items.length === 0) return;

        let found = items.find(i => String(i.id) === id);
        // Fallback search
        if (!found && id && id.length >= 3) {
            const possibleId = parseInt(id.slice(2));
            found = items.find(i => i.id === possibleId);
        }

        if (found) {
            setInternalId(found.id);
            const { desc, specs: parsedSpecs } = parseInitialData(found);

            // Extract numeric price from string like "฿2,500"
            const priceVal = String(found.price).replace(/[^0-9.]/g, '');

            setFormData({
                name: found.name,
                price: priceVal,
                stock: (found.stock || 0).toString(),
                category: found.category,
                fandom: found.fandom,
                image: found.image,
                description: desc,
                gallery: found.gallery || []
            });
            setSpecs(parsedSpecs);
        }
    }, [id, items, isEditMode]);

    const handleInput = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = 5 - formData.gallery.length;
        const filesToProcess = files.slice(0, remainingSlots);

        if (filesToProcess.length < files.length) {
            alert(`You can only upload up to 5 images. Processing first ${remainingSlots} files.`);
        }

        const readPromises = filesToProcess.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        const newImages = await Promise.all(readPromises);
        setFormData(prev => ({
            ...prev,
            gallery: [...prev.gallery, ...newImages]
        }));
        e.target.value = '';
    };

    const handleRemoveGalleryImage = (index: number) => {
        setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && !internalId) {
            alert('Error: Could not identify original product.');
            return;
        }

        // Format Specifications
        const specString = Object.entries(specs)
            .filter(([_, val]) => val.trim() !== '')
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');

        const fullDescription = formData.description + (specString ? '\n\n--- Specifications ---\n' + specString : '');

        const productData: Item = {
            id: isEditMode ? Number(internalId) : Date.now(),
            name: formData.name,
            price: `฿${Number(formData.price).toLocaleString()}`,
            category: formData.category,
            fandom: formData.fandom,
            image: formData.image || 'https://via.placeholder.com/300',
            description: fullDescription,
            gallery: formData.gallery,
            stock: Number(formData.stock)
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

    // Styles
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #444',
        background: '#333',
        color: 'white',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#bbb',
        fontSize: '0.9rem'
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

            <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', padding: '40px', borderRadius: '20px', border: '1px solid #444', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>

                {/* Name */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Product Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInput('name', e.target.value)}
                        style={inputStyle}
                        placeholder="e.g. Alastor Standard Figure"
                    />
                </div>

                {/* Price & Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={labelStyle}>Price (THB) *</label>
                        <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={(e) => handleInput('price', e.target.value)}
                            style={inputStyle}
                            placeholder="2500"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Stock Quantity</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => handleInput('stock', e.target.value)}
                            style={inputStyle}
                            placeholder="50"
                        />
                    </div>
                </div>

                {/* Fandom & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={labelStyle}>Fandom *</label>
                        <select
                            required
                            value={formData.fandom}
                            onChange={(e) => handleInput('fandom', e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Select Fandom</option>
                            {fandoms.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Category *</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => handleInput('category', e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Image Upload Section */}
                <div style={{ marginBottom: '30px', padding: '20px', background: '#252525', borderRadius: '10px', border: '1px dashed #555' }}>
                    {/* Thumbnail */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Thumbnail Image (Cover) *</label>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '100px', height: '100px', background: '#333', borderRadius: '10px', overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #444', flexShrink: 0
                            }}>
                                {formData.image ? (
                                    <img src={formData.image} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem', color: '#555' }}>📷</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                    style={{ ...inputStyle, padding: '8px', marginBottom: '5px' }}
                                />
                                <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>Upload the main cover image.</p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div>
                        <label style={labelStyle}>Gallery Images (Max 5) - {formData.gallery.length}/5</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                            disabled={formData.gallery.length >= 5}
                            style={{ ...inputStyle, padding: '8px', marginBottom: '15px' }}
                        />

                        {formData.gallery.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                {formData.gallery.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #555' }}>
                                        <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGalleryImage(idx)}
                                            style={{
                                                position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.7)',
                                                color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Specs Section */}
                <div style={{ marginBottom: '30px', padding: '20px', background: '#252525', borderRadius: '10px', border: '1px solid #444' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#FF5722' }}>Product Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity'].map(spec => (
                            <div key={spec}>
                                <label style={labelStyle}>{spec}</label>
                                <input
                                    type="text"
                                    placeholder={`e.g. ${spec === 'Material' ? 'PVC' : spec === 'Height' ? '20cm' : '...'}`}
                                    style={inputStyle}
                                    value={specs[spec] || ''}
                                    onChange={(e) => handleSpecChange(spec, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Description (Main Text)</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInput('description', e.target.value)}
                        rows={6}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="Enter detailed product description..."
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '15px' }}>
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
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)'
                        }}
                    >
                        {isEditMode ? 'Save Changes' : 'Add Product'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ProductForm;
