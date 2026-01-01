import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';

const Catalog: React.FC = () => {
    const { t } = useLanguage();
    const { items, likedProductIds, toggleLikeProduct } = useProducts();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFandom, setSelectedFandom] = useState('All');

    const handleAddToCart = (item: any) => {
        addToCart(item);
        alert(`${item.name} added to cart!`);
    };


    // Extract unique fandoms for filtering
    const fandoms = useMemo(() => {
        const fans = new Set(items.map(item => item.fandom));
        return ['All', ...Array.from(fans)];
    }, [items]);



    // Filter Logic: Filter by FANDOM instead of Category
    const filteredItems = useMemo(() => {
        return items.filter(item => {

            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            // Check Fandom
            const matchesFandom = selectedFandom === 'All' || item.fandom === selectedFandom;

            return matchesSearch && matchesFandom;
        });
    }, [searchTerm, selectedFandom]);

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
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>
                <span style={{ color: '#FF5722' }}>{t('explore_fandoms').split(' ')[0]}</span> {t('explore_fandoms').split(' ').slice(1).join(' ')}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                {t('catalog_subtitle')}
            </p>

            {/* Search & Filter Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '20px',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '1000px',
                marginBottom: '40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Text Search */}
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: '1 1 300px',
                        padding: '12px 20px',
                        borderRadius: '50px',
                        border: 'none',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />

                {/* Fandom Filter Buttons */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {fandoms.map((fan) => (
                        <button
                            key={fan}
                            onClick={() => setSelectedFandom(fan)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #555',
                                background: selectedFandom === fan ? '#FF5722' : 'transparent',
                                color: selectedFandom === fan ? 'white' : '#aaa',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontWeight: selectedFandom === fan ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {fan}
                        </button>
                    ))}
                </div>


            </div>

            {/* Results Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '30px',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {filteredItems.map((item) => (
                    <div key={item.id} style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer' // Add cursor pointer
                    }}
                        onClick={() => navigate(`/product/${item.id}`)} // Navigate on card click
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ height: '250px', overflow: 'hidden' }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                {/* Display Fandom instead of Category */}
                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#FF5722', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    {item.fandom}
                                </span>
                                <h3
                                    style={{
                                        margin: '5px 0 10px 0',
                                        fontSize: '1.2rem',
                                        transition: 'color 0.2s',
                                        display: 'inline-block'
                                    }}
                                >{item.name}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#888' }}>{item.category}</div>
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
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
                    <h2>{t('no_items_found')}</h2>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedFandom('All'); }}
                        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid #555', color: '#fff' }}
                    >
                        {t('reset_filters')}
                    </button>
                </div>
            )}

        </div>
    );
};

export default Catalog;
