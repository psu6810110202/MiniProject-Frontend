import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';

const AllFandom: React.FC = () => {
    const { t } = useLanguage();
    // Independent state for interactions, similar to PreOrder
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Get fandoms from items and custom images
    const { items, fandomImages, likedFandoms, toggleLikeFandom } = useProducts();
    const fandoms = React.useMemo(() => {
        const unique = Array.from(new Set(items.map(item => item.fandom)));
        return unique.map(f => {
            const item = items.find(i => i.fandom === f);
            // Use custom image if available, else fallback to first item
            const image = (fandomImages && fandomImages[f]) ? fandomImages[f] : item?.image;
            return {
                name: f,
                image: image,
                // Mock campaign end time for "The Latest Drops" feel
                timeLeft: Math.floor(Math.random() * 24) + 1 + 'h left'
            };
        }).filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, fandomImages, searchTerm]);

    return (
        <div style={{
            padding: '40px 20px',
            background: 'var(--bg-color)', // Use theme background or static dark like preorder
            minHeight: '100vh',
            color: 'var(--text-main)',
            position: 'relative'
        }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                }}>
                    {t('all_fandoms')}
                </h1>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '20px', color: 'var(--text-main)' }}>
                    {t('the_latest_drops')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px' }}>
                    {t('fandom_description')}
                </p>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                    <input
                        type="text"
                        placeholder={t('search_fandom')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px 50px 15px 25px',
                            borderRadius: '50px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '40px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {fandoms.length > 0 ? (
                    fandoms.map((f, i) => (
                        <Link key={i} to={`/fandoms/${encodeURIComponent(f.name)}`} style={{ textDecoration: 'none' }}>
                            <div
                                onMouseEnter={() => setHoveredId(f.name)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    transform: hoveredId === f.name ? 'translateY(-10px)' : 'translateY(0)',
                                }}
                            >
                                {/* Card Image Wrapper */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    marginBottom: '20px',
                                    border: '1px solid var(--border-color)',
                                    position: 'relative',
                                    background: 'var(--card-bg)',
                                    boxShadow: hoveredId === f.name ? '0 15px 30px rgba(255, 87, 34, 0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
                                }}>
                                    <img
                                        src={f.image}
                                        alt={f.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s',
                                            transform: hoveredId === f.name ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    />
                                    {/* Status Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px', right: '10px',
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        color: '#FF5722',
                                        fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        {f.timeLeft}
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div style={{ padding: '0 5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{
                                            color: 'var(--text-main)',
                                            fontSize: '1.4rem',
                                            fontWeight: 'bold',
                                            margin: '0 0 5px 0',
                                            lineHeight: '1.2'
                                        }}>
                                            {f.name}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleLikeFandom(f.name);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '5px'
                                            }}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill={likedFandoms.includes(f.name) ? "#FF5722" : "none"}
                                                stroke="#FF5722"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        <span>{t('funded')}</span>
                                        <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#666' }}></div>
                                        <span style={{ color: '#4CAF50' }}>{t('success')} 100%</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <h3>{t('no_fandoms_found')} "{searchTerm}"</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllFandom;
