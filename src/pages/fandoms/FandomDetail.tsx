import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';

const FandomDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const { items, fandomImages, preOrders } = useProducts();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const decodedName = decodeURIComponent(name || '');

    // Filter items for this fandom
    const fandomItems = items.filter(item => item.fandom === decodedName);
    const fandomPreOrders = preOrders.filter(item => item.fandom === decodedName);

    // Combine items for display
    const displayItems = [
        ...fandomPreOrders.map(p => ({
            ...p,
            id: p.id,
            price: `฿${p.price.toLocaleString()}`, // Format price for display
            type: 'preorder' as const
        })),
        ...fandomItems.map(i => ({
            ...i,
            type: 'regular' as const
        }))
    ];

    // Get fandom image
    const fandomImage = (fandomImages && fandomImages[decodedName])
        ? fandomImages[decodedName]
        : (displayItems[0]?.image || fandomItems[0]?.image);

    if (!decodedName) return <div>{t('fandom_not_found')}</div>;

    return (
        <div style={{
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'var(--bg-color)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative' // Added for absolute positioning of Back button
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
                    {displayItems.length} {t('products_available')}
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
                {displayItems.length > 0 ? (
                    displayItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                            onClick={() => {
                                // Navigate based on type
                                if (item.type === 'preorder') {
                                    navigate(`/fandoms/${encodeURIComponent(decodedName)}/P${item.id}`);
                                } else {
                                    navigate(`/fandoms/${encodeURIComponent(decodedName)}/${item.id}`);
                                }
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {item.type === 'preorder' && (
                                <>
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '1px solid #FFC107',
                                        color: '#FFC107',
                                        padding: '5px 15px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        zIndex: 2,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Pre Order Close Date: {item.preOrderCloseDate}
                                    </div>
                                </>
                            )}
                            <div style={{ height: '320px', overflow: 'hidden', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image')}
                                />
                            </div>
                            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{
                                        margin: '5px 0 20px 0',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        transition: 'color 0.2s',
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        lineHeight: '1.4'
                                    }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.type === 'preorder') {
                                                navigate(`/fandoms/${encodeURIComponent(decodedName)}/P${item.id}`);
                                            } else {
                                                navigate(`/fandoms/${encodeURIComponent(decodedName)}/${item.id}`);
                                            }
                                        }}>{item.name}</h3>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF5722' }}>{item.price}</div>
                                    </div>
                                    {item.type === 'preorder' && (
                                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                            Deposit: ฿{(item as any).deposit?.toLocaleString()}
                                        </div>
                                    )}
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
