import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const RequestCustomProduct: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- Form State ---
    const [formData, setFormData] = useState({
        productName: '',
        link: '',
        details: '',
        region: 'JP',
        price: '',
        quantity: 1
    });
    const [estimatedTotal, setEstimatedTotal] = useState<number | null>(null);

    // --- List State ---
    const [requests, setRequests] = useState<any[]>([]);

    // Mock Rates
    const rates: Record<string, number> = {
        'US': 35,
        'JP': 0.24,
        'CN': 5.0,
        'KR': 0.027
    };
    const shippingBase = 100;

    // Calculate Estimate
    useEffect(() => {
        const priceVal = parseFloat(formData.price);
        if (!isNaN(priceVal) && formData.region) {
            const rate = rates[formData.region];
            const total = (priceVal * rate * formData.quantity) + shippingBase;
            setEstimatedTotal(total);
        } else {
            setEstimatedTotal(null);
        }
    }, [formData.price, formData.region, formData.quantity]);

    // Load Requests
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('custom_requests') || '[]');
        setRequests(stored);
    }, [user]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const requestId = `REQ${Date.now().toString().slice(-6)}`;

        const newRequest = {
            id: requestId,
            productName: formData.productName,
            link: formData.link,
            details: formData.details,
            region: formData.region,
            price: parseFloat(formData.price),
            quantity: formData.quantity,
            estimatedTotal: estimatedTotal || 0,
            status: 'pending',
            userName: user?.name || user?.username || 'Unknown User',
            userEmail: user?.email || '-',
            userId: user?.id || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedRequests = [...requests, newRequest];
        setRequests(updatedRequests);
        localStorage.setItem('custom_requests', JSON.stringify(updatedRequests));

        // Reset Form
        setFormData({
            productName: '',
            link: '',
            details: '',
            region: 'JP',
            price: '',
            quantity: 1
        });
        navigate('/profile');
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb', fontSize: '0.9rem'
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444',
        background: '#333', color: 'white', fontSize: '1rem', outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>

                <div style={{ marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#FF5722' }}>
                        {'Request Custom Product'}
                    </h1>
                    <p style={{ margin: '5px 0 0 0', color: '#888' }}>
                        {"Can't find what you're looking for? Send us a link!"}
                    </p>
                </div>

                {/* Form Card */}
                <div style={{
                    background: '#1a1a1a', padding: '40px', borderRadius: '16px',
                    border: '1px solid #333',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Region */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>{t('select_region_rate')}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                {[
                                    { id: 'JP', currency: 'JPY' },
                                    { id: 'US', currency: 'USD' },
                                    { id: 'CN', currency: 'CNY' },
                                    { id: 'KR', currency: 'WON' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleChange('region', item.id)}
                                        style={{
                                            padding: '15px', borderRadius: '10px',
                                            border: formData.region === item.id ? '1px solid #FF5722' : '1px solid #444',
                                            background: formData.region === item.id ? 'rgba(255, 87, 34, 0.1)' : 'transparent',
                                            color: formData.region === item.id ? '#FF5722' : '#666',
                                            cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{item.id}</span>
                                        <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{item.currency}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name & Link Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={labelStyle}>{t('product_name')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productName}
                                    onChange={e => handleChange('productName', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Item Name"
                                    onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                                    onBlur={(e) => e.target.style.borderColor = '#444'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('product_link_url')}</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.link}
                                    onChange={e => handleChange('link', e.target.value)}
                                    style={inputStyle}
                                    placeholder="https://..."
                                    onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                                    onBlur={(e) => e.target.style.borderColor = '#444'}
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>{t('details_size_color')}</label>
                            <textarea
                                value={formData.details}
                                onChange={e => handleChange('details', e.target.value)}
                                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                                placeholder="Size, Color, Version, etc."
                                onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                                onBlur={(e) => e.target.style.borderColor = '#444'}
                            />
                        </div>

                        {/* Price & Quantity Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={labelStyle}>{t('price_foreign_currency')}</label>
                                <input
                                    type="number"
                                    required
                                    step="any"
                                    value={formData.price}
                                    onChange={e => handleChange('price', e.target.value)}
                                    style={inputStyle}
                                    placeholder="0.00"
                                    onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                                    onBlur={(e) => e.target.style.borderColor = '#444'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('quantity')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => handleChange('quantity', parseInt(e.target.value))}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#FF5722'}
                                    onBlur={(e) => e.target.style.borderColor = '#444'}
                                />
                            </div>
                        </div>

                        {/* Estimate Box */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                padding: '20px',
                                background: 'rgba(255, 152, 0, 0.05)',
                                border: '1px solid #FF9800',
                                borderRadius: '10px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: '#FF9800', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    Est: {estimatedTotal ? `฿${estimatedTotal.toLocaleString()}` : '---'}
                                </span>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>*Approximate total</div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: 'linear-gradient(135deg, #FF5722, #F4511E)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                boxShadow: '0 5px 15px rgba(255,87,34,0.3)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {t('submit_request') || 'Submit Request'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default RequestCustomProduct;
