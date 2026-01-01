import { useState } from 'react';
import { preorderItems, type PreOrderItem } from '../data/preorderData';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

interface PreOrderProps {
    addPoints: (amount: number) => void;
}

const PreOrder: React.FC<PreOrderProps> = ({ addPoints }) => {
    const { t } = useLanguage();
    const { addToCart, cartItems, purchasedItems } = useCart();
    // Independent state for this page's visual interactions
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const handlePreOrder = (item: PreOrderItem) => {
        // Check if item is already in cart or purchased (Limit 1 per account)
        if (cartItems.some(cartItem => cartItem.id === item.id) || purchasedItems.includes(item.id)) {
            alert('You can only pre-order 1 unit of this item per account.');
            return;
        }

        // Add to cart
        addToCart({
            id: item.id,
            name: item.name,
            price: `฿${item.price.toLocaleString()}`,
            category: 'Pre-Order',
            fandom: 'Exclusive',
            image: item.image
        });

        // Award points silently
        addPoints(50);
    };

    return (
        <div style={{
            padding: '40px 20px',
            background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
            minHeight: '100vh',
            color: '#fff'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #FF5722, #FFC107)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    {t('exclusive_preorders')}
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
                    {t('preorder_subtitle')}
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '40px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {preorderItems.map((item) => (
                    <div
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                            background: '#252525',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            position: 'relative',
                            transform: hoveredId === item.id ? 'translateY(-10px)' : 'translateY(0)',
                            boxShadow: hoveredId === item.id ? '0 15px 30px rgba(255, 87, 34, 0.3)' : '0 4px 10px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            border: '1px solid #333'
                        }}
                    >
                        <div style={{ position: 'relative', height: '350px', overflow: 'hidden' }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s',
                                    transform: hoveredId === item.id ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px', right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                color: '#FFC107',
                                fontWeight: 'bold',
                                border: '1px solid #FFC107'
                            }}>
                                {t('release_date')}: {item.releaseDate}
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', lineHeight: '1.4' }}>{item.name}</h2>
                            <p style={{ color: '#bbb', fontSize: '0.95rem', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>
                                {item.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>{t('total_price')}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>฿{item.price.toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#ff7043' }}>{t('deposit')}</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#FF5722' }}>฿{item.deposit.toLocaleString()}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePreOrder(item)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(45deg, #FF5722, #F4511E)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {t('preorder_now')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreOrder;
