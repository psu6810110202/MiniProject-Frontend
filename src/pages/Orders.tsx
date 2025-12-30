import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockOrders } from '../data/mockOrders';


const Orders: React.FC = () => {
    const { t } = useLanguage();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#4caf50';
            case 'shipped': return '#2196f3';
            case 'pending': return '#ff9800';
            case 'cancelled': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getStatusText = (status: string) => {
        return t(`status_${status}`);
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh',
        }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '2.5rem',
                marginBottom: '40px',
                color: 'var(--text-main)',
                textShadow: '0 0 10px rgba(255, 87, 34, 0.3)'
            }}>
                {t('orders')}
            </h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {mockOrders.map((order) => (
                    <div key={order.id} style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                            e.currentTarget.style.borderColor = '#FF5722';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            paddingBottom: '15px'
                        }}>
                            <div>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FF5722' }}>#{order.id}</span>
                                <span style={{ marginLeft: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.date}</span>
                            </div>
                            <div style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                backgroundColor: `${getStatusColor(order.status)}20`,
                                color: getStatusColor(order.status),
                                border: `1px solid ${getStatusColor(order.status)}`,
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {getStatusText(order.status)}
                            </div>
                        </div>

                        <div style={{ color: 'var(--text-main)' }}>
                            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('items')}:</div>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '10px', borderLeft: '2px solid #FF5722' }}>
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>฿{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '10px',
                            paddingTop: '15px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: 'var(--text-main)'
                        }}>
                            <span style={{ marginRight: '10px', fontSize: '1rem', color: 'var(--text-muted)' }}>{t('total')}:</span>
                            <span style={{ color: '#FF5722' }}>฿{order.total.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
