import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderTimeline: React.FC = () => {
    const navigate = useNavigate();

    const getProductionSteps = () => {
        return [
            { step: 'design', label: 'Design', status: 'completed' as const, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'molding', label: 'Molding', status: 'completed' as const, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'painting', label: 'Painting', status: 'in_progress' as const, date: new Date().toISOString().split('T')[0] },
            { step: 'quality_check', label: 'Quality Check', status: 'upcoming' as const, date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'packaging', label: 'Packaging', status: 'upcoming' as const, date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { step: 'shipping', label: 'Shipping', status: 'upcoming' as const, date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#4caf50';
            case 'shipped': return '#2196f3';
            case 'pending': return '#ff9800';
            case 'cancelled': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '80vh',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
                gap: '20px'
            }}>
                <button 
                    onClick={() => navigate('/orders')}
                    style={{
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
                
                <h1 style={{
                    fontSize: '2.5rem',
                    color: 'var(--text-main)',
                    fontWeight: 'bold',
                    margin: 0
                }}>
                    🏭 Pre-Order Production Timeline
                </h1>
            </div>

            {/* Order Info Card */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginBottom: '40px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF5722' }}>#ORD-12345</span>
                        <span style={{ marginLeft: '15px', padding: '4px 8px', background: '#FF5722', color: 'white', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            PRE-ORDER
                        </span>
                        <span style={{ marginLeft: '15px', color: 'var(--text-muted)', fontSize: '1rem' }}>2024-01-01</span>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: `${getStatusColor('pending')}20`,
                        color: getStatusColor('pending'),
                        border: `1px solid ${getStatusColor('pending')}`,
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}>
                        ⏳ Pending
                    </div>
                </div>

                <div style={{ color: 'var(--text-main)' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Items:</div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '10px', 
                        padding: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #FF5722'
                    }}>
                        <span>Dragon Figure Thai Pattern x 1</span>
                        <span style={{ fontWeight: 'bold' }}>฿1,500</span>
                    </div>
                </div>

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
                    <span style={{ marginRight: '15px', fontSize: '1rem', color: 'var(--text-muted)' }}>Total:</span>
                    <span style={{ color: '#FF5722' }}>฿1,500</span>
                </div>
            </div>

            {/* Production Timeline */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 30px 0', color: 'var(--text-main)', fontSize: '1.5rem' }}>
                    🏭 Production Steps
                </h2>
                
                <div style={{ position: 'relative' }}>
                    {getProductionSteps().map((step, index) => (
                        <div key={step.step} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: index < getProductionSteps().length - 1 ? '40px' : '0'
                        }}>
                            {/* Timeline Dot */}
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: getProductionStatusColor(step.status),
                                border: step.status === 'in_progress' ? '3px solid #FF5722' : `3px solid ${getProductionStatusColor(step.status)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 2
                            }}>
                                {step.status === 'completed' && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                    </svg>
                                )}
                                {step.status === 'in_progress' && (
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        animation: 'pulse 2s infinite'
                                    }}/>
                                )}
                                {step.status === 'upcoming' && (
                                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            
                            {/* Timeline Line */}
                            {index < getProductionSteps().length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '32px',
                                    width: '3px',
                                    height: '40px',
                                    backgroundColor: step.status === 'completed' ? '#4CAF50' : '#333',
                                    transform: 'translateX(-50%)'
                                }}/>
                            )}
                            
                            {/* Step Content */}
                            <div style={{ marginLeft: '25px', flex: 1 }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: step.status === 'completed' || step.status === 'in_progress' ? 'var(--text-main)' : 'var(--text-muted)',
                                    fontSize: '1.2rem'
                                }}>
                                    {step.label}
                                </div>
                                <div style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '1rem',
                                    marginTop: '8px',
                                    padding: '10px 15px',
                                    background: step.status === 'completed' ? 'rgba(76,175,80,0.1)' : 
                                               step.status === 'in_progress' ? 'rgba(255,152,0,0.1)' : 
                                               'rgba(33,150,243,0.1)',
                                    borderRadius: '10px',
                                    borderLeft: `4px solid ${getProductionStatusColor(step.status)}`
                                }}>
                                    {step.status === 'completed' && `✅ Completed on: ${step.date}`}
                                    {step.status === 'in_progress' && `🔄 In Progress - Est. completion: ${step.date}`}
                                    {step.status === 'upcoming' && `📅 Scheduled for: ${step.date}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Summary */}
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: 'rgba(255,87,34,0.1)',
                    borderRadius: '12px',
                    border: '2px solid #FF5722',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FF5722', marginBottom: '10px' }}>
                        📊 Progress Summary
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '1rem' }}>
                        Completed 2/6 steps (33%) - Currently in Painting phase
                    </div>
                    <div style={{ 
                        marginTop: '15px', 
                        height: '8px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '33%',
                            height: '100%',
                            background: 'linear-gradient(90deg, #FF5722, #FF7043)',
                            borderRadius: '4px'
                        }}/>
                    </div>
                </div>
            </div>

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

export default OrderTimeline;
