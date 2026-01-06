import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { type OrderItem } from '../data/mockOrders';

const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { userOrders } = useCart();

    const getTrackingUrl = (carrier: string, trackingNumber: string) => {
        switch (carrier) {
            case 'Thailand Post':
                return `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`;
            case 'Kerry Express':
                return `https://th.kerryexpress.com/th/track/?track=${trackingNumber}`;
            case 'Flash Express':
                return `https://www.flashexpress.co.th/tracking/?se=${trackingNumber}`;
            case 'J&T Express':
                return `https://www.jtexpress.co.th/track?billcode=${trackingNumber}`;
            default:
                return '#';
        }
    };

    // Try finding order in passed state or context
    const stateOrder = location.state?.order;
    const order = stateOrder || userOrders.find(o => o.id === orderId);

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
        const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
        const currentStepIndex = steps.indexOf(status) === -1 ? (status === 'pending' ? 0 : status === 'shipped' ? 2 : status === 'delivered' ? 3 : 0) : steps.indexOf(status);
        // Note: Logic above handles if 'confirmed' is not a real status in use yet, mapping shipped/delivered correctly. 
        // Actually simpler: 
        // If status 'shipped', indexOf is 2. If 'delivered' 3. If 'pending' 0. 
        // Only if I use a status NOT in list (like cancelled) it breaks. 
        // But mockOrders uses 'pending', 'shipped', 'delivered'. So indexOf is fine for those.
        // Just need to ensure 'confirmed' status never happens? Or if it happens it works.

        const isCancelled = status === 'cancelled';

        if (isCancelled) return <div style={{ color: '#f44336', fontWeight: 'bold' }}>{getStatusText('cancelled')}</div>;

        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '30px', marginBottom: '30px' }}>
                {steps.map((step, index) => {
                    // Logic to treat 'confirmed' as done if status is shipped/delivered
                    // If status is 'pending' (idx 0), 'confirmed' (idx 1) is NOT active.
                    // If status is 'shipped' (idx 2), 'confirmed' (idx 1) IS active.
                    // This works naturally with indexOf and <= comparison.

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
                                {step === 'pending' ? 'Waiting for Staff Confirmation' : step === 'confirmed' ? 'Confirmed' : getStatusText(step)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getProductionSteps = () => {
        const isConfirmed = order.status !== 'pending' && order.status !== 'cancelled';
        const isShipped = order.status === 'shipped' || order.status === 'delivered';
        const isDelivered = order.status === 'delivered';

        // Helper to format date or show placeholder
        const getDate = (condition: boolean, offsetDays: number = 0) => {
            if (!condition) return 'Upcoming';
            if (order.date) {
                const d = new Date(order.date);
                d.setDate(d.getDate() + offsetDays);
                return d.toISOString().split('T')[0];
            }
            return '-';
        };

        return [
            {
                step: 'start_production',
                label: t('start_production'),
                status: (isConfirmed || isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isConfirmed, 1)
            },
            {
                step: 'production_completed',
                label: t('production_completed'),
                status: (isShipped || isDelivered) ? 'completed' : (isConfirmed ? 'in_progress' : 'upcoming'),
                date: getDate(isShipped, 14)
            },
            {
                step: 'shipping_to_th',
                label: t('shipping_to_thailand'),
                status: (isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isShipped, 20)
            },
            {
                step: 'arrived_th',
                label: t('arrived_in_thailand'),
                status: (isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isShipped, 25)
            },
            {
                step: 'domestic_shipping',
                label: t('start_domestic_shipping'),
                status: (isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isShipped, 27)
            }
        ];
    };

    const getProductionStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'in_progress': return '#FF9800';
            case 'upcoming': return '#2196F3';
            default: return '#666';
        }
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

                {/* Shipment Tracking Section */}
                {order.carrier && order.trackingNumber && (
                    <div style={{
                        marginTop: '30px',
                        marginBottom: '10px',
                        padding: '20px',
                        background: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid #2196F3',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#2196F3', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🚚 Track Your Shipment
                        </h3>
                        <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Carrier:</span> <strong>{order.carrier}</strong>
                        </div>
                        <div style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)', letterSpacing: '1px', background: 'rgba(0,0,0,0.2)', padding: '10px 20px', borderRadius: '8px' }}>
                            {order.trackingNumber}
                        </div>
                        <a
                            href={getTrackingUrl(order.carrier, order.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '12px 24px',
                                background: '#2196F3',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                            }}
                        >
                            Track on {order.carrier} Website →
                        </a>
                    </div>
                )}

                <div style={{ margin: '40px 0' }}>
                    <TrackingStepper status={order.status} />
                </div>

                {/* Production Timeline Section (Show for mock demo or if preorder) */}
                <div style={{
                    marginTop: '20px',
                    marginBottom: '40px',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 30px 0', color: 'var(--text-main)' }}>🏭 Production Timeline</h3>
                    <div style={{ position: 'relative' }}>
                        {getProductionSteps().map((step, index) => (
                            <div key={step.step} style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: index < getProductionSteps().length - 1 ? '30px' : '0'
                            }}>
                                {/* Timeline Dot */}
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: getProductionStatusColor(step.status),
                                    border: step.status === 'in_progress' ? '3px solid #FF5722' : `3px solid ${getProductionStatusColor(step.status)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 2,
                                    flexShrink: 0
                                }}>
                                    {step.status === 'completed' && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                        </svg>
                                    )}
                                    {step.status === 'in_progress' && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white',
                                            animation: 'pulse 2s infinite'
                                        }} />
                                    )}
                                </div>

                                {/* Timeline Line */}
                                {index < getProductionSteps().length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '28px',
                                        width: '2px', // Thin line
                                        height: '35px', // Adjusted height matches margin
                                        backgroundColor: step.status === 'completed' ? '#4CAF50' : '#333',
                                        transform: 'translateX(-50%)'
                                    }} />
                                )}

                                {/* Step Content */}
                                <div style={{ marginLeft: '20px', flex: 1 }}>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: step.status === 'completed' || step.status === 'in_progress' ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontSize: '1rem'
                                    }}>
                                        {step.label}
                                    </div>
                                    <div style={{
                                        color: 'var(--text-muted)',
                                        fontSize: '0.9rem',
                                        marginTop: '5px'
                                    }}>
                                        {step.status === 'completed' ? `Completed: ${step.date}` :
                                            step.status === 'in_progress' ? `Target: ${step.date}` :
                                                `Expected: ${step.date}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <h3 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>Items</h3>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {order.items.map((item: OrderItem, idx: number) => (
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

export default OrderDetail;
