import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { mockOrders } from '../data/mockOrders';

interface Order {
    id: string;
    date: string;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    items: any[];
    total: number;
}

interface ProductionStep {
    step: string;
    label: string;
    status: 'completed' | 'in_progress' | 'upcoming';
    date: string;
}


const Orders: React.FC = () => {
    const { t } = useLanguage();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#4caf50';
            case 'shipped': return '#2196f3';
            case 'pending': return '#ff9800';
            case 'cancelled': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getTimelineSteps = (status: string) => {
        const steps = [
            { key: 'order_placed', label: 'Order Placed', completed: true },
            { key: 'processing', label: 'Processing', completed: status !== 'pending' },
            { key: 'shipped', label: 'Shipped', completed: status === 'shipped' || status === 'delivered' },
            { key: 'delivered', label: 'Delivered', completed: status === 'delivered' }
        ];
        return steps;
    };

    const getProductionSteps = () => {
        return [
            { step: 'design', label: 'Design Phase', status: 'completed' as const, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'molding', label: 'Molding Process', status: 'completed' as const, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'painting', label: 'Painting & Detailing', status: 'in_progress' as const, date: new Date().toISOString().split('T')[0] },
            { step: 'quality_check', label: 'Quality Control', status: 'upcoming' as const, date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'packaging', label: 'Packaging', status: 'upcoming' as const, date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'shipping', label: 'Shipping', status: 'upcoming' as const, date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ];
    };

    const getProductionTimeline = (steps: ProductionStep[]) => {
        return steps.map((step, index) => ({
            ...step,
            isCurrent: step.status === 'in_progress',
            isCompleted: step.status === 'completed',
            isUpcoming: step.status === 'upcoming'
        }));
    };

    const getProductionStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'in_progress': return '#FF9800';
            case 'upcoming': return '#2196F3';
            default: return '#666';
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
                fontWeight: 'bold'
            }}>
                {t('orders')}
            </h1>

            {selectedOrder ? (
                // Order Detail View with Timeline
                <div>
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        style={{
                            marginBottom: '20px',
                            padding: '10px 20px',
                            background: '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ← Back to Orders
                    </button>

                    <div style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '15px',
                        padding: '30px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        {/* Order Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF5722' }}>#{selectedOrder.id}</span>
                                <span style={{ marginLeft: '15px', color: 'var(--text-muted)', fontSize: '1rem' }}>{selectedOrder.date}</span>
                            </div>
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                                color: getStatusColor(selectedOrder.status),
                                border: `1px solid ${getStatusColor(selectedOrder.status)}`,
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}>
                                {getStatusText(selectedOrder.status)}
                            </div>
                        </div>

                        {/* Production Timeline */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.3rem' }}>
                                🏭 Production Timeline
                            </h3>
                            <div style={{ position: 'relative' }}>
                                {getProductionTimeline(getProductionSteps()).map((step, index) => (
                                    <div key={step.step} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: index < getProductionSteps().length - 1 ? '30px' : '0'
                                    }}>
                                        {/* Timeline Dot */}
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: getProductionStatusColor(step.status),
                                            border: step.isCurrent ? '3px solid #FF5722' : `3px solid ${getProductionStatusColor(step.status)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            zIndex: 2
                                        }}>
                                            {step.isCompleted && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                                </svg>
                                            )}
                                            {step.isCurrent && (
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white',
                                                    animation: 'pulse 2s infinite'
                                                }}/>
                                            )}
                                        </div>
                                        
                                        {/* Timeline Line */}
                                        {index < getProductionSteps().length - 1 && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '24px',
                                                width: '2px',
                                                height: '30px',
                                                backgroundColor: step.isCompleted ? '#4CAF50' : '#333',
                                                transform: 'translateX(-50%)'
                                            }}/>
                                        )}
                                        
                                        {/* Step Content */}
                                        <div style={{ marginLeft: '20px', flex: 1 }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: step.isCompleted || step.isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                                                fontSize: '1rem'
                                            }}>
                                                {step.label}
                                            </div>
                                            <div style={{
                                                color: 'var(--text-muted)',
                                                fontSize: '0.9rem',
                                                marginTop: '5px'
                                            }}>
                                                {step.isCompleted && `✅ Completed on ${step.date}`}
                                                {step.isCurrent && `🔄 In progress - Est. ${step.date}`}
                                                {step.isUpcoming && `📅 Scheduled for ${step.date}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.3rem' }}>
                                📦 Order Status
                            </h3>
                            <div style={{ position: 'relative' }}>
                                {getTimelineSteps(selectedOrder.status).map((step, index) => (
                                    <div key={step.key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: index < getTimelineSteps(selectedOrder.status).length - 1 ? '30px' : '0'
                                    }}>
                                        {/* Timeline Dot */}
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: step.completed ? '#FF5722' : '#333',
                                            border: step.completed ? '3px solid #FF5722' : '3px solid #555',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            zIndex: 2
                                        }}>
                                            {step.completed && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style={{ marginTop: '2px' }}>
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                                </svg>
                                            )}
                                        </div>
                                        
                                        {/* Timeline Line */}
                                        {index < getTimelineSteps(selectedOrder.status).length - 1 && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '24px',
                                                width: '2px',
                                                height: '30px',
                                                backgroundColor: step.completed ? '#FF5722' : '#333',
                                                transform: 'translateX(-50%)'
                                            }}/>
                                        )}
                                        
                                        {/* Step Content */}
                                        <div style={{ marginLeft: '20px', flex: 1 }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: step.completed ? 'var(--text-main)' : 'var(--text-muted)',
                                                fontSize: '1rem'
                                            }}>
                                                {step.label}
                                            </div>
                                            {step.completed && (
                                                <div style={{
                                                    color: 'var(--text-muted)',
                                                    fontSize: '0.9rem',
                                                    marginTop: '5px'
                                                }}>
                                                    {index === 0 && selectedOrder.date}
                                                    {index === 1 && selectedOrder.status !== 'pending' && 'Processing started'}
                                                    {index === 2 && selectedOrder.status === 'delivered' && 'Package shipped'}
                                                    {index === 3 && selectedOrder.status === 'delivered' && 'Delivered successfully'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.3rem' }}>
                                📋 Order Items
                            </h3>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '10px', 
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid #FF5722'
                                }}>
                                    <span>{item.name} x {item.quantity}</span>
                                    <span style={{ fontWeight: 'bold' }}>฿{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '20px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: 'var(--text-main)'
                        }}>
                            <span style={{ marginRight: '15px', fontSize: '1rem', color: 'var(--text-muted)' }}>{t('total')}:</span>
                            <span style={{ color: '#FF5722' }}>฿{selectedOrder.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Order List View with Mini Timeline
                <div style={{ display: 'grid', gap: '25px' }}>
                    {mockOrders.map((order) => (
                        <div key={order.id} style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                            }}
                        >
                            {/* Order Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                paddingBottom: '15px'
                            }}>
                                <div>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#FF5722' }}>#{order.id}</span>
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

                            {/* Mini Order Timeline */}
                            <div style={{ padding: '15px 0' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                        📦 Order Status
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: getStatusColor(order.status) }}>
                                        {order.status === 'pending' && '⏳ Processing'}
                                        {order.status === 'shipped' && '🚚 Shipped'}
                                        {order.status === 'delivered' && '✅ Delivered'}
                                        {order.status === 'cancelled' && '❌ Cancelled'}
                                    </span>
                                </div>
                                
                                {/* Order Progress Bar */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    {[
                                        { status: 'completed', label: 'Order' },
                                        { status: order.status !== 'pending' ? 'completed' : 'current', label: 'Process' },
                                        { status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 
                                          order.status === 'pending' ? 'upcoming' : 'current', label: 'Ship' },
                                        { status: order.status === 'delivered' ? 'completed' : 'upcoming', label: 'Receive' }
                                    ].map((step, index) => (
                                        <React.Fragment key={index}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: step.status === 'completed' ? '#FF5722' : 
                                                                 step.status === 'current' ? '#FF9800' : '#333',
                                                border: step.status === 'current' ? '3px solid #FF5722' : 
                                                       step.status === 'completed' ? '2px solid #FF5722' : '2px solid #555',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                position: 'relative'
                                            }}>
                                                {step.status === 'completed' && '✓'}
                                                {step.status === 'current' && (
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'white',
                                                        animation: 'pulse 2s infinite'
                                                    }}/>
                                                )}
                                                {step.status === 'upcoming' && index + 1}
                                            </div>
                                            {index < 3 && (
                                                <div style={{
                                                    flex: 1,
                                                    height: '2px',
                                                    backgroundColor: step.status === 'completed' ? '#FF5722' : '#333'
                                                }}/>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                
                                {/* Step Labels */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '5px'
                                }}>
                                    <span>Order</span>
                                    <span>Process</span>
                                    <span>Ship</span>
                                    <span>Receive</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ color: 'var(--text-main)' }}>
                                <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{t('items')}:</div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        marginBottom: '5px', 
                                        paddingLeft: '10px', 
                                        borderLeft: '2px solid #FF5722' 
                                    }}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>฿{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
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

                            {/* View Details Button */}
                            <button
                                onClick={() => navigate('/timeline')}
                                style={{
                                    padding: '12px 20px',
                                    background: 'linear-gradient(135deg, #FF5722, #FF7043)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,87,34,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                🏭 View Production Timeline →
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Pulse Animation */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Orders;
