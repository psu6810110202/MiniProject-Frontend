import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { mockOrders } from '../data/mockOrders';

const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const order = mockOrders.find(o => o.id === orderId);

    if (!order) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)' }}>
                <h2>Order not found</h2>
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    const getStatusText = (status: string) => {
        return t(`status_${status}`);
    };

    // Tracking Stepper Component
    const TrackingStepper = ({ status }: { status: string }) => {
        const steps = ['pending', 'shipped', 'delivered'];
        const currentStepIndex = steps.indexOf(status);
        const isCancelled = status === 'cancelled';

        if (isCancelled) return <div style={{ color: '#f44336', fontWeight: 'bold' }}>{getStatusText('cancelled')}</div>;

        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '30px', marginBottom: '30px' }}>
                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    return (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {/* Line connector */}
                            {index > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '-50%',
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: isActive ? '#4caf50' : '#555',
                                    zIndex: 0
                                }} />
                            )}

                            {/* Circle */}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#4caf50' : '#555',
                                border: '2px solid var(--bg-color)',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                {isActive ? '✓' : ''}
                            </div>
                            <span style={{ fontSize: '0.9rem', marginTop: '10px', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {getStatusText(step)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1000px',
            margin: '0 auto',
            minHeight: '80vh'
        }}>
            <button
                onClick={() => navigate('/profile')}
                style={{
                    marginBottom: '20px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                ← Back to Profile
            </button>

            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Order #{order.id}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Placed on {order.date}</p>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        backgroundColor: order.status === 'delivered' ? 'rgba(76, 175, 80, 0.1)' :
                            order.status === 'shipped' ? 'rgba(33, 150, 243, 0.1)' :
                                order.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                        color: order.status === 'delivered' ? '#4CAF50' :
                            order.status === 'shipped' ? '#2196F3' :
                                order.status === 'cancelled' ? '#f44336' : '#FFC107'
                    }}>
                        {getStatusText(order.status)}
                    </div>
                </div>

                <div style={{ margin: '40px 0' }}>
                    <TrackingStepper status={order.status} />
                </div>

                <h3 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>Items</h3>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {order.items.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px'
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quantity: {item.quantity}</div>
                            </div>
                            {/* Assuming price is per unit and not available in simple mock item, but if it were: */}
                            {/* <div style={{color: 'var(--text-main)'}}>฿{item.price}</div> */}
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: 'var(--text-main)'
                }}>
                    Total: ฿{order.total.toLocaleString()}
                </div>

            </div>
        </div>
    );
};

export default OrderDetail;
