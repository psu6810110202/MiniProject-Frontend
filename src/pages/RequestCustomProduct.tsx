import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const RequestCustomProduct: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        productName: '',
        link: '',
        details: '',
        region: 'JP', // Default to Japan or one of them
        price: '',
        quantity: 1
    });

    const [estimatedTotal, setEstimatedTotal] = useState<number | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    // Mock Rates
    const rates: Record<string, number> = {
        'US': 35, // Example: 1 USD = 35 THB
        'JP': 0.24, // Example: 1 JPY = 0.24 THB
        'CN': 5.0,  // Example: 1 CNY = 5.0 THB
        'KR': 0.027 // Example: 1 KRW = 0.027 THB
    };

    const shippingBase = 100; // Mock shipping

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

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Generate new request ID
        const requestId = `REQ${Date.now().toString().slice(-6)}`;
        
        // Create new request object
        const newRequest = {
            id: requestId,
            productName: formData.productName,
            link: formData.link,
            details: formData.details,
            region: formData.region,
            price: parseFloat(formData.price),
            quantity: formData.quantity,
            estimatedTotal: estimatedTotal || 0,
            status: 'pending' as const,
            userName: user?.name || user?.username || 'Unknown User',
            userEmail: user?.email || '-',
            userId: user?.id || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Get existing requests from localStorage
        const existingRequests = JSON.parse(localStorage.getItem('custom_requests') || '[]');
        
        // Add new request
        existingRequests.push(newRequest);
        
        // Save to localStorage
        localStorage.setItem('custom_requests', JSON.stringify(existingRequests));
        
        // Show theme-aware notification
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
        setFormData({
            productName: '',
            link: '',
            details: '',
            region: 'JP',
            price: '',
            quantity: 1
        });
        navigate('/preorder');
    };

    return (
        <div style={{
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'var(--bg-color)',
            color: 'var(--text-main)',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={() => navigate('/preorder')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}
                >
                    ← {t('back_to_preorder')}
                </button>

                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-color)', textAlign: 'center' }}>
                    {t('request_custom_product')}
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
                    {t('send_us_link_order')}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Region Selector */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('select_region_rate')}</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['US', 'JP', 'CN', 'KR'].map(region => (
                                <button
                                    key={region}
                                    type="button"
                                    onClick={() => handleChange('region', region)}
                                    style={{
                                        padding: '10px 25px',
                                        borderRadius: '25px',
                                        border: formData.region === region ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        background: formData.region === region ? 'var(--primary-color)' : 'transparent',
                                        color: formData.region === region ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {region === 'JP' ? 'Japan (🇯🇵)' :
                                        region === 'US' ? 'USA (🇺🇸)' :
                                            region === 'CN' ? 'China (🇨🇳)' :
                                                'Korea (🇰🇷)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>{t('product_name')}</label>
                        <input
                            type="text"
                            required
                            value={formData.productName}
                            onChange={(e) => handleChange('productName', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                            placeholder="e.g. Hatsune Miku Figure 2024"
                        />
                    </div>

                    {/* Product Link */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>{t('product_link_url')}</label>
                        <input
                            type="url"
                            required
                            value={formData.link}
                            onChange={(e) => handleChange('link', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>{t('details_size_color')}</label>
                        <textarea
                            value={formData.details}
                            onChange={(e) => handleChange('details', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #444',
                                background: '#222',
                                color: 'white',
                                minHeight: '100px',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                            placeholder="Specific details about the item..."
                        />
                    </div>

                    {/* Price & Quantity */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)' }}>{t('price_foreign_currency')}</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #444',
                                    background: '#222',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                placeholder="0.00"
                            />
                        </div>
                        <div style={{ width: '100px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>{t('quantity')}</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #444',
                                    background: '#222',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Estimated Total */}
                    <div style={{
                        padding: '15px',
                        background: 'rgba(255, 87, 34, 0.1)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 87, 34, 0.3)',
                        marginTop: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{t('estimated_total')}:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                {estimatedTotal ? `≈ ฿${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '---'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            *{t('includes_estimated_shipping')}
                        </p>
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '15px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '10px',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-color)'}
                    >
                        {t('submit_request')}
                    </button>

                </form>
            </div>
            
            {/* Theme-aware Notification */}
            {showNotification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--primary-color)',
                    boxShadow: '0 4px 20px rgba(255, 87, 34, 0.3)',
                    zIndex: 1000,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    animation: 'slideIn 0.3s ease-out',
                    maxWidth: '300px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>✓</span>
                        {t('custom_product_request_submitted')}
                    </div>
                </div>
            )}
            
            {/* Notification Animation */}
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default RequestCustomProduct;
