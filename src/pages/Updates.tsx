import React, { useState } from 'react';
import { updatePosts } from '../data/updatesData';

const Updates: React.FC = () => {
    const [filter, setFilter] = useState<string>('All');

    const categories = ['All', 'Announcement', 'New Release', 'Event', 'Delay'];

    const filteredPosts = filter === 'All'
        ? updatePosts
        : updatePosts.filter(post => post.category === filter);

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
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>
                    <span style={{ color: '#FF5722' }}>News</span> & Updates
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Stay tuned with the latest happenings at DomPort.</p>
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
                        {cat}
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
                                {post.category}
                            </span>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                {post.date} • by {post.author}
                            </span>
                        </div>

                        <h2 style={{ fontSize: '1.8rem', margin: '0' }}>{post.title}</h2>

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
                            {post.content}
                        </p>
                    </div>
                ))}

                {filteredPosts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No updates found for this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Updates;
