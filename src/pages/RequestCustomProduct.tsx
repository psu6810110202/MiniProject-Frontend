import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const RequestCustomProduct: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();

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
        alert(t('custom_product_request_submitted') || 'Request Submitted Successfully!');
    };

    // Styles from previous Modal
    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#bbb', fontSize: '0.9rem'
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444',
        background: '#333', color: 'white', fontSize: '1rem', outline: 'none'
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>

                <div style={{ marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#FF5722' }}>
                        {t('request_custom_product') || 'Request Custom Product'}
                    </h1>
                    <p style={{ margin: '5px 0 0 0', color: '#888' }}>
                        {t('send_us_link_order') || "Can't find what you're looking for? Send us a link!"}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                    {/* Form Section */}
                    <div style={{
                        background: '#1a1a1a', padding: '40px', borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Region */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={labelStyle}>{t('select_region_rate')}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                                    {['JP', 'US', 'CN', 'KR'].map(region => (
                                        <button
                                            key={region}
                                            type="button"
                                            onClick={() => handleChange('region', region)}
                                            style={{
                                                padding: '15px', borderRadius: '12px',
                                                border: formData.region === region ? '2px solid #FF5722' : '1px solid #444',
                                                background: formData.region === region ? 'rgba(255, 87, 34, 0.2)' : 'transparent',
                                                color: formData.region === region ? '#FF5722' : '#888',
                                                cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {region === 'JP' ? '🇯🇵' : region === 'US' ? '🇺🇸' : region === 'CN' ? '🇨🇳' : '🇰🇷'}
                                            </span>
                                            {region}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                {/* Product Name */}
                                <div>
                                    <label style={labelStyle}>{t('product_name')}</label>
                                    <input type="text" required value={formData.productName} onChange={e => handleChange('productName', e.target.value)} style={inputStyle} placeholder="Item Name" />
                                </div>

                                {/* Link */}
                                <div>
                                    <label style={labelStyle}>{t('product_link_url')}</label>
                                    <input type="url" required value={formData.link} onChange={e => handleChange('link', e.target.value)} style={inputStyle} placeholder="https://..." />
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={labelStyle}>{t('details_size_color')}</label>
                                <textarea value={formData.details} onChange={e => handleChange('details', e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Size, Color, Version, etc." />
                            </div>

                            {/* Price & Quantity & Estimate */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', alignItems: 'end', marginBottom: '40px' }}>
                                <div>
                                    <label style={labelStyle}>{t('price_foreign_currency')}</label>
                                    <input type="number" required step="any" value={formData.price} onChange={e => handleChange('price', e.target.value)} style={inputStyle} placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('quantity')}</label>
                                    <input type="number" min="1" value={formData.quantity} onChange={e => handleChange('quantity', parseInt(e.target.value))} style={inputStyle} />
                                </div>
                            </div>

                            {/* Estimated Total */}
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ padding: '15px', background: 'rgba(255,152,0,0.1)', border: '1px solid #FF9800', borderRadius: '8px', textAlign: 'center', height: '75%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span style={{ color: '#FF9800', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        Est: {estimatedTotal ? `฿${estimatedTotal.toLocaleString()}` : '---'}
                                    </span>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>*Approximate total</div>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #FF5722, #F4511E)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 5px 15px rgba(255,87,34,0.3)' }}>
                                {t('submit_request') || 'Submit Request'}
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default RequestCustomProduct;
