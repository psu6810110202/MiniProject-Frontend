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

    // Helper function to extract specs from description
    const extractSpecsFromDescription = (description: string) => {
        const specKeywords = ['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity'];
        const extractedSpecs: Record<string, string> = {};

        specKeywords.forEach(keyword => {
            const regex = new RegExp(`${keyword}\\s*[:：]\\s*([^\\n]+)`, 'i');
            const match = description.match(regex);
            if (match) {
                extractedSpecs[keyword] = match[1].trim();
            }
        });

        return extractedSpecs;
    };

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        fandom: '',
        image: '',
        description: '',
        gallery: [] as string[],
        hasSetOption: false,
        setPrice: '',
        boxCount: ''
    });

    const [specs, setSpecs] = useState<Record<string, string>>({});
    const [variants, setVariants] = useState<{ name: string; image: string; price: string; stock: string }[]>([]);
    const [internalId, setInternalId] = useState<number | string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Sync Variants with Box Count
    useEffect(() => {
        if (!formData.hasSetOption) {
            if (variants.length > 0) setVariants([]);
            return;
        }

        const count = parseInt(formData.boxCount) || 0;
        // Limit max variants to prevent browser crash/abuse
        const safeCount = Math.min(count, 50);

        setVariants(prev => {
            if (prev.length === safeCount) return prev;
            if (safeCount > prev.length) {
                // Add new slots
                const newItems = Array(safeCount - prev.length).fill(null).map(() => ({ name: '', image: '', price: '', stock: '' }));
                return [...prev, ...newItems];
            } else {
                // Remove slots
                return prev.slice(0, safeCount);
            }
        });
    }, [formData.boxCount, formData.hasSetOption]);

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
            console.log('DEBUG: Found product:', found);
            setInternalId(found.id);
            const { desc, specs: parsedSpecs, variants: parsedVariants, embeddedVariants } = parseInitialData(found);

            // Extract specs from description as well
            const extractedSpecs = extractSpecsFromDescription(desc);
            const allSpecs = { ...parsedSpecs, ...extractedSpecs };

            // Clean description logic (Remove entire specs block if it exists)
            let cleanedDescription = desc;
            const specBlockMarker = '--- Specifications ---';
            if (cleanedDescription.includes(specBlockMarker)) {
                cleanedDescription = cleanedDescription.split(specBlockMarker)[0].trim();
            } else {
                // Fallback for legacy data (keyword removal)
                const specKeywords = ['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity'];

                specKeywords.forEach(keyword => {
                    const regex = new RegExp(`${keyword}\\s*[:：]\\s*[^\\n]*\\n?`, 'gi');
                    cleanedDescription = cleanedDescription.replace(regex, '');
                });
                // Clean up extra whitespace
                cleanedDescription = cleanedDescription.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
            }

            const priceVal = String(found.price).replace(/[^0-9.]/g, '');

            setFormData({
                name: found.name,
                price: priceVal,
                stock: (found.stock || 0).toString(),
                category: found.category,
                fandom: found.fandom,
                image: found.image,
                description: cleanedDescription,
                gallery: found.gallery || [],
                hasSetOption: parsedVariants.hasSet,
                setPrice: parsedVariants.setPrice,
                // @ts-ignore
                boxCount: parsedVariants.boxCount || parsedVariants.setQty
            });
            setSpecs(allSpecs);
            if (embeddedVariants) {
                setVariants(embeddedVariants);
            }
        }
    }, [id, items, isEditMode]);

    // Helper to separate Description, Specs, and Variants
    const parseInitialData = (item: Item | undefined) => {
        if (!item) return { desc: '', specs: {}, variants: { hasSet: false, setPrice: '', setQty: '' }, embeddedVariants: [] };

        let desc = item.description || '';
        let embeddedVariants: { name: string; image: string; price: string; stock: string }[] = [];

        // Extract Variants JSON Block
        const variantDataMarker = '--- Variants Data ---';
        if (desc.includes(variantDataMarker)) {
            const [preVariant, variantJson] = desc.split(variantDataMarker);
            desc = preVariant.trim();
            try {
                embeddedVariants = JSON.parse(variantJson.trim());
            } catch (e) {
                console.error("Failed to parse embedded variants", e);
            }
        }

        // Extract Variants Sales Options
        const variantMarker = '--- Sales Options ---';
        let variants = { hasSet: false, setPrice: '', setQty: '' };

        if (desc.includes(variantMarker)) {
            const [mainD, varStr] = desc.split(variantMarker);
            desc = mainD.trim();
            const setPrice = varStr.match(/Set Price: (\d+)/)?.[1] || '';
            const setQty = varStr.match(/Set Quantity: (\d+)/)?.[1] || ''; // Legacy support
            const boxCount = varStr.match(/Box Count: (\d+)/)?.[1] || setQty || '';

            return {
                desc: mainD.trim(),
                specs: {},
                variants: {
                    hasSet: !!setPrice || !!boxCount,
                    setPrice,
                    boxCount
                },
                embeddedVariants
            };
        }

        // Extract Specs
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
        return { desc: mainDesc.trim(), specs: parsedSpecs, variants, embeddedVariants };
    };

    const handleInput = (key: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    const handleVariantChange = (index: number, field: 'name' | 'image' | 'price' | 'stock', value: string) => {
        setVariants(prev => {
            const newVar = [...prev];
            newVar[index] = { ...newVar[index], [field]: value };
            return newVar;
        });
    };

    const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleVariantChange(index, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDescriptionChange = (value: string) => {
        // ... (reuse existing logic if desired, or simplify)
        // Auto-extract specs logic
        const extractedSpecs = extractSpecsFromDescription(value);
        setSpecs(prev => ({ ...prev, ...extractedSpecs }));

        let cleanedDescription = value;
        const specKeywords = ['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity'];
        specKeywords.forEach(keyword => {
            const regex = new RegExp(`${keyword}\\s*[:：]\\s*[^\\n]*\\n?`, 'gi');
            cleanedDescription = cleanedDescription.replace(regex, '');
        });
        cleanedDescription = cleanedDescription.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        handleInput('description', cleanedDescription);
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
        // ... (existing logic)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && !internalId) {
            alert('Error: Could not identify original product.');
            return;
        }

        setIsSubmitting(true);

        const stdSpecs = ['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity'];
        const specString = stdSpecs
            .map(key => `${key}: ${specs[key]?.trim() || '-'}`)
            .join('\n');

        let variantString = '';
        if (formData.hasSetOption || formData.boxCount) {
            variantString = `\n\n--- Sales Options ---\nBox Count: ${formData.boxCount}`;
            if (formData.hasSetOption) {
                variantString += `\nSet Price: ${formData.setPrice}`;
            }
        }

        let variantDataString = '';
        if (variants.length > 0) {
            variantDataString = `\n\n--- Variants Data ---\n${JSON.stringify(variants)}`;
        }

        let fullDescription = formData.description;

        // Append specs only if they are not already in the description (to avoid duplication on re-save)
        // However, since we clean the description on load, formData.description should be 'clean'.
        // But let's be safe.
        const specMarker = '--- Specifications ---';

        // If the user manually edited the description and left the marker, we should respect that or clean it.
        // Given the current logic cleans it on load, we assume formData.description is clean.

        if (specString && !fullDescription.includes(specMarker)) {
            fullDescription += `\n\n${specMarker}\n${specString}`;
        }

        fullDescription += variantString + variantDataString;

        const productData: Item = {
            id: isEditMode && internalId ? internalId : Date.now(),
            name: formData.name,
            price: `฿${Number(formData.price).toLocaleString()}`,
            category: formData.category,
            fandom: formData.fandom,
            image: formData.image || 'https://via.placeholder.com/300',
            description: fullDescription,
            gallery: formData.gallery,
            stock: Number(formData.stock)
        };

        try {
            if (isEditMode) {
                await updateItem(productData);
            } else {
                await addItem(productData);
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error('Save product error:', error);
            alert(`Failed to save product: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (rest of styles)
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

                    {/* Sales Options (New Feature) */}
                    <div style={{ marginBottom: '30px', padding: '20px', background: '#252525', borderRadius: '10px', border: '1px solid #4CAF50' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#4CAF50' }}>Sales Options</h4>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <input
                                type="checkbox"
                                checked={formData.hasSetOption}
                                onChange={(e) => handleInput('hasSetOption', e.target.checked)}
                                style={{ width: '20px', height: '20px', marginRight: '10px' }}
                            />
                            <label style={{ color: 'white', fontWeight: 'bold' }}>Sell more than one?</label>
                        </div>

                        {formData.hasSetOption && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={labelStyle}>Product Count</label>
                                        <input
                                            type="number"
                                            value={formData.boxCount}
                                            onChange={(e) => handleInput('boxCount', e.target.value)}
                                            style={inputStyle}
                                            placeholder="e.g. 6, 8, 12"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Products Input */}
                                {variants.length > 0 && (
                                    <div style={{ marginTop: '20px', background: '#1e1e1e', padding: '15px', borderRadius: '8px' }}>
                                        <label style={{ ...labelStyle, color: '#4CAF50', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px' }}>
                                            Product Details ({variants.length} items)
                                        </label>
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {variants.map((v, i) => (
                                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px', gap: '15px', alignItems: 'end', background: '#252525', padding: '15px', borderRadius: '6px' }}>
                                                    {/* Image Upload Block */}
                                                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                        <input
                                                            type="file"
                                                            id={`var-img-${i}`}
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => handleVariantImageUpload(e, i)}
                                                        />
                                                        <label
                                                            htmlFor={`var-img-${i}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                background: '#333',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #444',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                transition: 'border-color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF5722'}
                                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
                                                        >
                                                            {v.image ? (
                                                                <img src={v.image} alt={`Var ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ textAlign: 'center', color: '#666' }}>
                                                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>+</span>
                                                                    <span style={{ fontSize: '0.7rem' }}>Img</span>
                                                                </div>
                                                            )}
                                                            {/* Overlay for existing image to hint change */}
                                                            {v.image && (
                                                                <div style={{
                                                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s',
                                                                    color: 'white', fontSize: '0.8rem', fontWeight: 'bold'
                                                                }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                                                >
                                                                    Change
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>

                                                    {/* Name */}
                                                    <div>
                                                        <label style={labelStyle}>Option Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`e.g. Set A`}
                                                            value={v.name}
                                                            onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                                                            style={inputStyle}
                                                        />
                                                    </div>

                                                    {/* Price */}
                                                    <div>
                                                        <label style={labelStyle}>Price (THB)</label>
                                                        <input
                                                            type="number"
                                                            value={v.price}
                                                            onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                                            style={inputStyle}
                                                            placeholder="e.g. 3000"
                                                        />
                                                    </div>

                                                    {/* Stock */}
                                                    <div>
                                                        <label style={labelStyle}>Stock</label>
                                                        <input
                                                            type="number"
                                                            value={v.stock || ''}
                                                            onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                                            style={inputStyle}
                                                            placeholder="e.g. 10"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        rows={6}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="Enter detailed product description... (e.g. Material: PVC, Height: 20cm, Weight: 500g)"
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
                        disabled={isSubmitting}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: isSubmitting ? '#555' : 'linear-gradient(135deg, #FF5722, #E64A19)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(255, 87, 34, 0.4)',
                            opacity: isSubmitting ? 0.7 : 1
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
