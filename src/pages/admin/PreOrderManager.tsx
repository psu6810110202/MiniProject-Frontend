import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { type PreOrderItem } from '../../types';
import { orderAPI } from '../../services/api';

// Add Pre-Order Modal Component
interface AddPreOrderModalProps {
    onClose: () => void;
    onAdd: (item: PreOrderItem) => void;
    onUpdate?: (item: PreOrderItem) => void;
    initialItem?: PreOrderItem | null;
}

const AddPreOrderModal: React.FC<AddPreOrderModalProps> = ({ onClose, onAdd, onUpdate, initialItem }) => {
    const { fandoms, categories } = useProducts();

    // Helper to separate Description and Specs
    const parseInitialData = (item: PreOrderItem | null | undefined) => {
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

    const { desc: initialDesc, specs: initialSpecs } = parseInitialData(initialItem);

    const [formData, setFormData] = useState({
        name: initialItem?.name || '',
        price: initialItem?.price?.toString() || '',
        deposit: initialItem?.deposit?.toString() || '',
        preOrderCloseDate: initialItem?.preOrderCloseDate || '',
        image: initialItem?.image || '',
        description: initialDesc,
        fandom: initialItem?.fandom || '',
        category: initialItem?.category || '',
        gallery: initialItem?.gallery || [] as string[]
    });

    // define default keys
    const defaultSpecKeys = ['Material', 'Height', 'Weight', 'Base', 'Paint', 'Packaging', 'Authenticity', 'Domestic Shipping'];
    const filledSpecs = { ...initialSpecs };
    defaultSpecKeys.forEach(key => {
        if (!filledSpecs[key]) filledSpecs[key] = '-';
    });

    const [specs, setSpecs] = useState<Record<string, string>>(filledSpecs);

    const handleSpecChange = (key: string, value: string) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format Specifications
        const specString = Object.entries(specs)
            .filter(([_, val]) => val.trim() !== '')
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');

        const fullDescription = formData.description + (specString ? '\n\n--- Specifications ---\n' + specString : '');

        const newId = initialItem ? initialItem.id : Date.now();
        const newItem: PreOrderItem = {
            id: newId,
            name: formData.name,
            price: Number(formData.price),
            deposit: Number(formData.deposit),
            preOrderCloseDate: formData.preOrderCloseDate,
            image: formData.image || '',
            description: fullDescription,
            fandom: formData.fandom,
            category: formData.category,
            gallery: formData.gallery
        };

        if (initialItem && onUpdate) {
            onUpdate(newItem);
        } else {
            onAdd(newItem);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px', backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1a1a1a',
                padding: '40px',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid #444',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{initialItem ? 'Edit Pre-Order' : 'Add New Pre-Order'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '2rem', lineHeight: 0.5 }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Product Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            style={inputStyle}
                            placeholder="e.g. Alastor Limited Edition"
                        />
                    </div>

                    {/* Price & Deposit Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Full Price (THB) *</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Deposit Amount (THB) *</label>
                            <input
                                type="number"
                                required
                                value={formData.deposit}
                                onChange={(e) => handleInputChange('deposit', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Date & Shipping Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Pre-order Close Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.preOrderCloseDate}
                                onChange={(e) => handleInputChange('preOrderCloseDate', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Domestic Shipping (THB)</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                style={inputStyle}
                                value={specs['Domestic Shipping'] || ''}
                                onChange={(e) => handleSpecChange('Domestic Shipping', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Fandom & Category Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Fandom *</label>
                            <select
                                required
                                value={formData.fandom}
                                onChange={(e) => handleInputChange('fandom', e.target.value)}
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
                                onChange={(e) => handleInputChange('category', e.target.value)}
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
                                        <span style={{ fontSize: '2rem', color: '#555' }}>�</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        style={{ ...inputStyle, padding: '8px', marginBottom: '5px' }}
                                    />
                                    <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>Upload the main cover image. Square or 16:9 ratio recommended.</p>
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
                            <div>
                                <label style={labelStyle}>Material</label>
                                <input type="text" placeholder="e.g. Premium PVC Vinyl" style={inputStyle}
                                    value={specs['Material'] || ''}
                                    onChange={(e) => handleSpecChange('Material', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Height</label>
                                <input type="text" placeholder="e.g. 18 cm" style={inputStyle}
                                    value={specs['Height'] || ''}
                                    onChange={(e) => handleSpecChange('Height', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Weight</label>
                                <input type="text" placeholder="e.g. 450g" style={inputStyle}
                                    value={specs['Weight'] || ''}
                                    onChange={(e) => handleSpecChange('Weight', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Base Size</label>
                                <input type="text" placeholder="e.g. 7cm x 5cm" style={inputStyle}
                                    value={specs['Base'] || ''}
                                    onChange={(e) => handleSpecChange('Base', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Paint</label>
                                <input type="text" placeholder="e.g. Hand-painted details" style={inputStyle}
                                    value={specs['Paint'] || ''}
                                    onChange={(e) => handleSpecChange('Paint', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Packaging</label>
                                <input type="text" placeholder="e.g. Collector's box" style={inputStyle}
                                    value={specs['Packaging'] || ''}
                                    onChange={(e) => handleSpecChange('Packaging', e.target.value)} />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Authenticity</label>
                                <input type="text" placeholder="e.g. Certificate included" style={inputStyle}
                                    value={specs['Authenticity'] || ''}
                                    onChange={(e) => handleSpecChange('Authenticity', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={labelStyle}>Description (Main Text)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '15px',
                                background: '#444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
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
                                transition: 'transform 0.1s',
                                boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)'
                            }}
                        >
                            {initialItem ? 'Save Changes' : 'Add Pre-Order'}
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
    const { preOrders, deletePreOrder, addPreOrder, updatePreOrder } = useProducts();
    const [editItem, setEditItem] = useState<PreOrderItem | null>(null);
    const [viewItem, setViewItem] = useState<PreOrderItem | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [reservations, setReservations] = useState<any[]>([]);

    // Function to load reservations for a specific item
    const loadReservations = async (itemId: number) => {
        setReservations([]);
        console.log("Fetching reservations for item:", itemId);
        try {
            const allOrders = await orderAPI.getAll();

            // Filter orders containing this pre-order item
            // Note: We match numeric itemId with product_id in order items
            const relevantOrders = allOrders.filter((order: any) =>
                order.items && order.items.some((i: any) => Number(i.product_id) === Number(itemId))
            ).map((order: any) => ({
                id: order.order_id, // Ensure this matches backend Order entity ID
                userId: order.user_id,
                userName: order.user?.name || `User ${order.user_id}`,
                userEmail: order.user?.email || '-',
                date: order.created_at || new Date().toISOString(),
                total: Number(order.total_amount),
                status: order.payment_status === 'PAID' ? 'Confirmed' : order.payment_status
            }));

            setReservations(relevantOrders);
        } catch (e) {
            console.error("Failed to load reservations", e);
        }
    };

    const handleViewReservations = (item: PreOrderItem) => {
        setViewItem(item);
        loadReservations(item.id);
    };

    const handleConfirmOrder = async (orderId: string, userId: string) => {
        if (!confirm('Mark this pre-order as CONFIRMED (PAID)?')) return;

        try {
            // Using updated orderAPI
            await orderAPI.updateStatus(orderId, 'PAID');

            alert('Order status updated successfully!');
            // Update local state to reflect change immediately
            setReservations(prev => prev.map(r =>
                r.id === orderId ? { ...r, status: 'Confirmed' } : r
            ));
        } catch (e) {
            console.error(e);
            alert('Error connecting to server');
        }
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
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                ← Back to Admin
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

            {/* Table Display */}
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
                            <th style={{ padding: '15px' }}>Deposit</th>
                            <th style={{ padding: '15px' }}>Close Date</th>
                            <th style={{ padding: '15px', minWidth: '220px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preOrders.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px', fontFamily: 'monospace', color: '#bbb', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    {item.id}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#444', borderRadius: '5px', overflow: 'hidden' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.name}</td>
                                <td style={{ padding: '15px', color: '#9C27B0' }}>{item.fandom}</td>
                                <td style={{ padding: '15px' }}>{item.category}</td>
                                <td style={{ padding: '15px', color: '#FF5722', fontWeight: 'bold' }}>฿{item.price.toLocaleString()}</td>
                                <td style={{ padding: '15px', color: '#FFC107' }}>฿{item.deposit.toLocaleString()}</td>
                                <td style={{ padding: '15px' }}>{item.preOrderCloseDate}</td>
                                <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleViewReservations(item)}
                                        style={{
                                            background: '#333',
                                            color: '#FFC107',
                                            border: '1px solid #FFC107',
                                            padding: '6px 10px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                        title="View Reservations"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => setEditItem(item)}
                                        style={{
                                            background: '#444',
                                            color: 'white',
                                            border: '1px solid #666',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{
                                            background: 'rgba(244, 67, 54, 0.2)',
                                            color: '#F44336',
                                            border: '1px solid #F44336',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {preOrders.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                    No pre-orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                                                {res.status !== 'Confirmed' && res.status !== 'PAID' && (
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
                <AddPreOrderModal
                    initialItem={editItem}
                    onClose={() => setEditItem(null)}
                    onAdd={() => { }} // Not used in edit mode
                    onUpdate={async (updatedItem) => {
                        try {
                            await updatePreOrder(updatedItem);
                            setEditItem(null);
                            alert(`Updated ${updatedItem.name} successfully!`);
                        } catch (error) {
                            console.error("Update failed", error);
                        }
                    }}
                />
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
