import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
const AllFandom: React.FC = () => {
    // Independent state for interactions, similar to PreOrder
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Get fandoms from items and custom images
    const { items, fandomImages } = useProducts();
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
        });
    }, [items, fandomImages]);

    return (
        <div style={{
            padding: '40px 20px',
            background: 'var(--bg-color)', // Use theme background or static dark like preorder
            minHeight: '100vh',
            color: 'var(--text-main)'
        }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '20px' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    marginBottom: '10px'
                }}>
                    All Fandoms
                </h1>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#FF5722',
                    marginTop: '0'
                }}>
                    The Latest Drops
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Exclusive limited-time campaigns from your favorite creators. Get them before they're gone!
                </p>
            </div>

            {/* Grid Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '40px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {fandoms.map((f, i) => (
                    <Link key={i} to="/catalog" style={{ textDecoration: 'none' }}>
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
                                <h3 style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                    margin: '0 0 5px 0',
                                    lineHeight: '1.2'
                                }}>
                                    {f.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    <span>Funded</span>
                                    <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#666' }}></div>
                                    <span style={{ color: '#4CAF50' }}>100% Success</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AllFandom;
