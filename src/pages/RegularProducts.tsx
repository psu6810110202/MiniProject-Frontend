import React from 'react';
import { Link } from 'react-router-dom';
import { regularProducts } from '../data/regularProducts';

const RegularProducts: React.FC = () => {
    return (
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
                    background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    In Stock Products
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
                    Ready to ship immediately - Order now!
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '40px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {regularProducts.map((item) => (
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
                            border: '1px solid #333'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(76, 175, 80, 0.3)';
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
                                    transition: 'transform 0.5s'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px', right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                border: '1px solid #4CAF50'
                            }}>
                                ✅ IN STOCK
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <Link 
                                to={`/product/${item.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#4CAF50';
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
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Price</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>฿{item.price.toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#4CAF50' }}>Stock</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>{item.stock}</div>
                                </div>
                            </div>

                            <button
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
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
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegularProducts;
