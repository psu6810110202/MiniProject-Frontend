import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preorderItems } from '../../data/preorderData';
import { useLanguage } from '../../contexts/LanguageContext';


interface PreOrderProps {
    addPoints?: (amount: number) => void;
}

const PreOrder: React.FC<PreOrderProps> = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [hoveredId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter State
    const [selectedFandoms, setSelectedFandoms] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Mock data for filters
    const allFandoms = Array.from(new Set(preorderItems.map(item => item.fandom)));
    const allCategories = Array.from(new Set(preorderItems.map(item => item.category)));

    // Calculate counts
    const fandomCounts = preorderItems.reduce((acc, item) => {
        acc[item.fandom] = (acc[item.fandom] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryCounts = preorderItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const filteredItems = preorderItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFandom = selectedFandoms.length === 0 || selectedFandoms.includes(item.fandom);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
        return matchesSearch && matchesFandom && matchesCategory;
    });

    return (
        <div style={{
            padding: '40px 20px',
            background: 'var(--bg-color)',
            minHeight: '100vh',
            color: 'var(--text-main)'
        }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #FF5722, #FFC107)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    {t('pre_order')}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                    {t('preorder_items_custom_requests')}
                </p>

                {/* Search Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', maxWidth: '600px', margin: '30px auto 0', position: 'relative' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 50px 12px 20px',
                                borderRadius: '25px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
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

                {/* Custom Product Request Button */}
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    padding: '15px',
                    background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 193, 7, 0.05))',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 87, 34, 0.3)',
                    maxWidth: '500px',
                    margin: '20px auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '5px', color: 'var(--primary-color)', margin: 0 }}>
                                {t('cant_find_it')}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                {t('request_custom_order_provided')}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/request-custom-product')}
                            style={{
                                padding: '8px 20px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(255, 87, 34, 0.3)',
                                transition: 'all 0.3s',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 87, 34, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 87, 34, 0.3)';
                            }}
                        >
                            {t('order_custom_product')}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '40px', maxWidth: '1400px', marginLeft: '5%', alignItems: 'flex-start' }}>

                {/* Sidebar Filters */}
                <aside style={{
                    flex: '0 0 250px',
                    background: 'var(--card-bg)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid var(--border-color)',
                    position: 'sticky',
                    top: '100px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>Filters</h2>
                        <button
                            onClick={() => { setSelectedFandoms([]); setSelectedCategories([]); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                        >
                            Reset All
                        </button>
                    </div>

                    {/* Fandom Filter */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Fandoms</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {allFandoms.map(fandom => (
                                <label key={fandom} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: selectedFandoms.includes(fandom) ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFandoms.includes(fandom)}
                                        onChange={() => toggleFilter(selectedFandoms, setSelectedFandoms, fandom)}
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    {fandom} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({fandomCounts[fandom] || 0})</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Categories</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {allCategories.map(cat => (
                                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: selectedCategories.includes(cat) ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    {cat} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({categoryCounts[cat] || 0})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main style={{ flex: 1 }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '30px',
                    }}>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'var(--card-bg)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    console.log('Navigating to pre-order detail:', item.id, item.name);
                                    navigate(`/preorder/P${item.id}`);
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
                                        background: 'var(--primary-color)',
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
                                    <h3 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: 'var(--text-main)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: '2.8rem',
                                        height: 'auto'
                                    }}>
                                        {item.name}
                                    </h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                            ฿{item.price.toLocaleString()}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Deposit: ฿{item.deposit.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PreOrder;
