import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { updatePosts } from '../data/updatesData';

const Updates: React.FC = () => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<string>(t('all'));

    const categories = [t('all'), t('announcement'), t('new_release'), t('event'), t('delay')];

    // Create a mapping from translated category names to English data values
    const categoryMap: { [key: string]: string } = {
        [t('announcement')]: 'Announcement',
        [t('new_release')]: 'New Release',
        [t('event')]: 'Event',
        [t('delay')]: 'Delay'
    };

    const filteredPosts = filter === t('all')
        ? updatePosts
        : updatePosts.filter(post => post.category === categoryMap[filter]);

    // Color code for categories
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Announcement': return '#FFC107'; // Amber
            case 'New Release': return '#4CAF50'; // Green
            case 'Event': return '#2196F3'; // Blue
            case 'Delay': return '#F44336'; // Red
            default: return '#9E9E9E';
        }
    };

    return (
        <div style={{
            padding: '40px 20px',
            background: 'var(--bg-color)',
            minHeight: '100vh',
            color: 'var(--text-main)',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>
                    {t('news_updates')}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
                    {t('updates_description')}
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: '1px solid #444',
                            background: filter === cat ? '#FF5722' : 'transparent',
                            color: filter === cat ? 'white' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: 'bold'
                        }}
                    >
                        {cat === t('all') ? t('all') : cat}
                    </button>
                ))}
            </div>

            {/* Posts Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {filteredPosts.map(post => (
                    <div
                        key={post.id}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '15px',
                            padding: '25px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{
                                background: getCategoryColor(post.category),
                                color: '#000',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {post.category === 'Announcement' ? t('announcement') : 
                                 post.category === 'New Release' ? t('new_release') : 
                                 post.category === 'Event' ? t('event') : 
                                 post.category === 'Delay' ? t('delay') : post.category}
                            </span>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                {post.date} • {t('by')} {post.author}
                            </span>
                        </div>

                        <h2 style={{ fontSize: '1.8rem', margin: '0' }}>
                            {language === 'th' && post.title_th ? post.title_th : post.title}
                        </h2>

                        {post.image && (
                            <img
                                src={post.image}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    marginTop: '10px'
                                }}
                            />
                        )}

                        <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                            {language === 'th' && post.content_th ? post.content_th : post.content}
                        </p>
                    </div>
                ))}

                {filteredPosts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        {t('no_updates_category')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Updates;
