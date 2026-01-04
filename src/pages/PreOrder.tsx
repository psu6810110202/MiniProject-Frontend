import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { preorderItems } from '../data/preorderData';
import { useLanguage } from '../contexts/LanguageContext';


interface PreOrderProps {
    addPoints?: (amount: number) => void;
}

const PreOrder: React.FC<PreOrderProps> = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    // Independent state for this page's visual interactions
    const [hoveredId, setHoveredId] = useState<number | null>(null);




    return (
        <>
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
                        Pre Order
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
                        สินค้า Pre order และรับสั่งซื้อเพิ่มเติม
                    </p>

                    {/* Search Bar and Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', maxWidth: '600px', margin: '30px auto 0' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="ค้นหาสินค้า..."
                                style={{
                                    width: '100%',
                                    padding: '12px 50px 12px 20px',
                                    borderRadius: '25px',
                                    border: '1px solid #333',
                                    background: '#1a1a1a',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#aaa'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>
                        <button
                            style={{
                                padding: '12px 25px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'background 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F4511E'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#FF5722'}
                        >
                            สั่งเพิ่มเติม
                        </button>
                    </div>
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
                            style={{
                                background: '#252525',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                position: 'relative',
                                transform: 'translateY(0)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                border: '1px solid #333',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                console.log('Navigating to pre-order detail:', item.id, item.name);
                                navigate(`/preorder/${item.id}`);
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
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
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px', left: '10px',
                                    background: '#FF5722',
                                    padding: '5px 12px',
                                    borderRadius: '15px',
                                    fontSize: '0.8rem',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }}>
                                    {item.fandom}
                                </div>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <Link
                                    to={`/preorder/${item.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#FF5722';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'inherit';
                                    }}
                                >
                                    <h2 style={{
                                        fontSize: '1.4rem',
                                        marginBottom: '10px',
                                        lineHeight: '1.4',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}>{item.name}</h2>
                                </Link>
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/preorder/${item.id}`);
                                    }}
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
                                    {t('view')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </>
    );
};

export default PreOrder;
