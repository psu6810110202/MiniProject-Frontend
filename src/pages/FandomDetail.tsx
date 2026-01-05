import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

const FandomDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const { items, fandomImages, likedProductIds, toggleLikeProduct } = useProducts();
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const decodedName = decodeURIComponent(name || '');

    // Filter items for this fandom
    const fandomItems = items.filter(item => item.fandom === decodedName);

    // Get fandom image
    const fandomImage = (fandomImages && fandomImages[decodedName])
        ? fandomImages[decodedName]
        : fandomItems[0]?.image;

    const handleAddToCart = (item: any) => {
        addToCart(item);
        alert(`${t('added_to_cart')}: ${item.name}`);
    };

    if (!decodedName) return <div>{t('fandom_not_found')}</div>;

    return (
        <div style={{
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'var(--bg-color)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Header / Hero for Fandom */}
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                marginBottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}>
                <div style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)'
                }}>
                    {fandomImage ? (
                        <img
                            src={fandomImage}
                            alt={decodedName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', color: '#666' }}>{t('no_cover_image')}</span>
                        </div>
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        padding: '40px',
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>
                        <h1 style={{
                            fontSize: '4rem',
                            fontWeight: '900',
                            margin: 0,
                            color: 'white',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                        }}>
                            {decodedName}
                        </h1>
                    </div>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    {fandomItems.length} {t('products_available')}
                </p>
            </div>

            {/* Products Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '30px',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {fandomItems.length > 0 ? (
                    fandomItems.map((item) => (
                        <div key={item.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer'
                        }}
                            onClick={() => {
                                // Navigate to product detail page
                                navigate(`/fandoms/${encodeURIComponent(decodedName)}/${item.id}`);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image')}
                                />
                            </div>
                            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{
                                        margin: '5px 0 10px 0',
                                        fontSize: '1.2rem',
                                        transition: 'color 0.2s',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/fandoms/${encodeURIComponent(item.fandom)}`);
                                    }}>{item.name}</h3>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{item.price}</span>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLikeProduct(item.id);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '5px'
                                            }}
                                        >
                                            {likedProductIds.includes(item.id) ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF5722" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item);
                                            }}
                                            style={{
                                                padding: '8px 15px',
                                                background: '#FF5722',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('add_to_cart') || 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        <h2>{t('no_products_fandom')}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FandomDetail;
