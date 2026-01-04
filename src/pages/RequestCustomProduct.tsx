import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const RequestCustomProduct: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productName: '',
        link: '',
        details: '',
        region: 'JP', // Default to Japan or one of them
        price: '',
        quantity: 1
    });

    const [estimatedTotal, setEstimatedTotal] = useState<number | null>(null);

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
        alert('Custom product request submitted!');
        navigate('/preorder'); // Go back to PreOrder or Track Ticket
    };

    return (
        <div style={{
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                background: '#1a1a1a',
                padding: '30px',
                borderRadius: '20px',
                border: '1px solid #333',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={() => navigate('/preorder')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}
                >
                    ← Back to Pre-Order
                </button>

                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#FF5722', textAlign: 'center' }}>
                    Request Custom Product
                </h1>
                <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>
                    Send us a link, and we'll order it for you!
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Region Selector */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Region / Rate</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['US', 'JP', 'CN', 'KR'].map(region => (
                                <button
                                    key={region}
                                    type="button"
                                    onClick={() => handleChange('region', region)}
                                    style={{
                                        padding: '10px 25px',
                                        borderRadius: '25px',
                                        border: formData.region === region ? '1px solid #FF5722' : '1px solid #333',
                                        background: formData.region === region ? '#FF5722' : 'transparent',
                                        color: formData.region === region ? 'white' : '#aaa',
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
                        <label style={{ display: 'block', marginBottom: '8px' }}>Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.productName}
                            onChange={(e) => handleChange('productName', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #444',
                                background: '#222',
                                color: 'white',
                                outline: 'none'
                            }}
                            placeholder="e.g. Hatsune Miku Figure 2024"
                        />
                    </div>

                    {/* Product Link */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Product Link (URL)</label>
                        <input
                            type="url"
                            required
                            value={formData.link}
                            onChange={(e) => handleChange('link', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #444',
                                background: '#222',
                                color: 'white',
                                outline: 'none'
                            }}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Details (Size, Color, etc.)</label>
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
                            <label style={{ display: 'block', marginBottom: '8px' }}>Price (in Foreign Currency)</label>
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
                            <label style={{ display: 'block', marginBottom: '8px' }}>Quantity</label>
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
                            <span style={{ color: '#aaa' }}>Estimated Total:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#FF5722' }}>
                                {estimatedTotal ? `≈ ฿${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '---'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                            *Includes estimated shipping to Thailand. Final price may vary.
                        </p>
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '15px',
                            background: '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '10px',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F4511E'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#FF5722'}
                    >
                        Submit Request
                    </button>

                </form>
            </div>
        </div>
    );
};

export default RequestCustomProduct;
