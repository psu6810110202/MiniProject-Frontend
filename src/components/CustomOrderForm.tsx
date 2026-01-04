import React, { useState } from 'react';

interface CustomOrderFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomOrderForm: React.FC<CustomOrderFormProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        productName: '',
        productLink: '',
        description: '',
        country: 'US',
        originalPrice: ''
    });

    // Exchange rates and shipping costs
    const exchangeRates = {
        US: 36.5,   // USD to THB
        Japan: 0.24, // JPY to THB  
        China: 5.0  // CNY to THB
    };

    const shippingCosts = {
        US: 350,
        Japan: 280,
        China: 180
    };

    // Calculate total price in real-time
    const calculateTotal = () => {
        const price = parseFloat(formData.originalPrice) || 0;
        const rate = exchangeRates[formData.country as keyof typeof exchangeRates];
        const shipping = shippingCosts[formData.country as keyof typeof shippingCosts];
        
        const thbPrice = price * rate;
        const total = thbPrice + shipping;
        
        return {
            thbPrice: thbPrice.toFixed(2),
            shipping: shipping.toFixed(2),
            total: total.toFixed(2)
        };
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculation = calculateTotal();

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            />

            {/* Form Container */}
            <div style={{
                position: 'relative',
                background: '#ffffff',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #FF5722 0%, #F4511E 100%)',
                    padding: '24px 32px',
                    borderRadius: '16px 16px 0 0',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: '#ffffff',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        ×
                    </button>
                    
                    <h2 style={{
                        color: '#ffffff',
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        margin: 0,
                        lineHeight: '1.2'
                    }}>
                        Custom Order Form
                    </h2>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: '4px 0 0 0',
                        fontSize: '1rem'
                    }}>
                        Order products not available on our website
                    </p>
                </div>

                {/* Form Content */}
                <div style={{ padding: '32px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        {/* Product Name */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                Product Name <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.productName}
                                onChange={(e) => handleInputChange('productName', e.target.value)}
                                placeholder="Enter product name..."
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    color: '#1F2937',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: '#F9FAFB'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FF5722';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.background = '#F9FAFB';
                                }}
                            />
                        </div>

                        {/* Product Link */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                Product Link <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="url"
                                value={formData.productLink}
                                onChange={(e) => handleInputChange('productLink', e.target.value)}
                                placeholder="https://example.com/product"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    color: '#1F2937',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: '#F9FAFB'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FF5722';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.background = '#F9FAFB';
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                Details
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Additional details about the product..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    color: '#1F2937',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: '#F9FAFB',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#FF5722';
                                    e.target.style.background = '#ffffff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.background = '#F9FAFB';
                                }}
                            />
                        </div>

                        {/* Country Selection */}
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                Source Country <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px'
                            }}>
                                {[
                                    { value: 'US', label: 'United States', flag: '🇺🇸' },
                                    { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
                                    { value: 'China', label: 'China', flag: '🇨🇳' }
                                ].map((country) => (
                                    <label
                                        key={country.value}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="country"
                                            value={country.value}
                                            checked={formData.country === country.value}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            style={{ position: 'absolute', opacity: 0 }}
                                        />
                                        <div style={{
                                            padding: '12px',
                                            border: formData.country === country.value ? '2px solid #FF5722' : '2px solid #E5E7EB',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            background: formData.country === country.value ? '#FFF7ED' : '#F9FAFB',
                                            transition: 'all 0.3s',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{country.flag}</div>
                                            <div style={{ fontWeight: '600', color: '#1F2937' }}>{country.label}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Original Price */}
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px'
                            }}>
                                Original Price <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6B7280',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}>
                                    {formData.country === 'US' ? '$' : formData.country === 'Japan' ? '¥' : '¥'}
                                </span>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 40px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        color: '#1F2937',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        background: '#F9FAFB'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#FF5722';
                                        e.target.style.background = '#ffffff';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.background = '#F9FAFB';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Calculation Display */}
                    <div style={{
                        background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)',
                        border: '2px solid #FB923C',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{
                            color: '#EA580C',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            margin: '0 0 16px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Price Calculation
                        </h3>
                        
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Original Price:</span>
                                <span style={{ color: '#1F2937', fontWeight: '600' }}>
                                    {formData.country === 'US' ? '$' : formData.country === 'Japan' ? '¥' : '¥'}{formData.originalPrice || '0.00'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Exchange Rate:</span>
                                <span style={{ color: '#1F2937', fontWeight: '600' }}>
                                    {exchangeRates[formData.country as keyof typeof exchangeRates]}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Price in THB:</span>
                                <span style={{ color: '#1F2937', fontWeight: '600' }}>฿{calculation.thbPrice}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Domestic Shipping:</span>
                                <span style={{ color: '#1F2937', fontWeight: '600' }}>฿{calculation.shipping}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '12px',
                                borderTop: '2px solid #FB923C',
                                marginTop: '12px'
                            }}>
                                <span style={{ color: '#EA580C', fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
                                <span style={{ color: '#EA580C', fontSize: '1.3rem', fontWeight: '700' }}>฿{calculation.total}</span>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(254, 240, 138, 0.5)',
                            border: '1px solid #FBBF24',
                            borderRadius: '6px',
                            padding: '12px',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                color: '#92400E',
                                fontSize: '0.85rem',
                                margin: 0,
                                fontWeight: '500'
                            }}>
                                This total does not include international shipping + domestic shipping
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #FF5722 0%, #F4511E 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onClick={() => {
                            alert('Order request submitted successfully! We will contact you within 24 hours');
                            onClose();
                        }}
                    >
                        Submit Order Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomOrderForm;
