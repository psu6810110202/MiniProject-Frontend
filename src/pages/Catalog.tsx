import React, { useState, useMemo } from 'react';
import { mockItems } from '../data/mockItem';

const Catalog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFandom, setSelectedFandom] = useState('All');
    const [maxPrice, setMaxPrice] = useState<number>(20000);

    // Extract unique fandoms for filtering
    const fandoms = useMemo(() => {
        const fans = new Set(mockItems.map(item => item.fandom));
        return ['All', ...Array.from(fans)];
    }, []);

    // Helper to parse price string "฿4,500" -> 4500
    const parsePrice = (priceStr: string) => {
        return parseInt(priceStr.replace(/[^\d]/g, ''), 10);
    };

    // Filter Logic: Filter by FANDOM instead of Category
    const filteredItems = useMemo(() => {
        return mockItems.filter(item => {
            const price = parsePrice(item.price);
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            // Check Fandom
            const matchesFandom = selectedFandom === 'All' || item.fandom === selectedFandom;
            const matchesPrice = price <= maxPrice;

            return matchesSearch && matchesFandom && matchesPrice;
        });
    }, [searchTerm, selectedFandom, maxPrice]);

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
                <span style={{ color: '#FF5722' }}>Explore</span> Fandoms
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                Search items by your favorite series.
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
                    placeholder="Search items..."
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

                {/* Price Ranger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                    <span>Max Price: ฿{maxPrice.toLocaleString()}</span>
                    <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                        style={{ accentColor: '#FF5722' }}
                    />
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
                        flexDirection: 'column'
                    }}
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
                                <span style={{ fontSize: '0.8rem', color: '#FF5722', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {item.fandom}
                                </span>
                                <h3 style={{ margin: '5px 0 10px 0', fontSize: '1.2rem' }}>{item.name}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#888' }}>{item.category}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{item.price}</span>
                                <button style={{
                                    padding: '8px 15px',
                                    background: '#333',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}>
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
                    <h2>No items found matching your criteria.</h2>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedFandom('All'); setMaxPrice(20000); }}
                        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid #555', color: '#fff' }}
                    >
                        Reset Filters
                    </button>
                </div>
            )}

        </div>
    );
};

export default Catalog;
