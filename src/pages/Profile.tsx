import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../hooks/usePoints';
import { mockOrders } from '../data/mockOrders';

const Profile: React.FC = () => {
    const { t } = useLanguage();
    const { points } = usePoints();
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        // Mock user data
        setUser({
            name: 'Art Toy Lover',
            email: 'user@example.com'
        });
    }, []);

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
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '10px' }}>
                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    return (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {/* Line connector */}
                            {index > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '-50%',
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: isActive ? '#4caf50' : '#555',
                                    zIndex: 0
                                }} />
                            )}

                            {/* Circle */}
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#4caf50' : '#555',
                                border: '2px solid var(--bg-color)',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {isActive ? '✓' : ''}
                            </div>
                            <span style={{ fontSize: '0.8rem', marginTop: '5px', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
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
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
        }}>
            {/* User Info Card */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF5722, #FFC107)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'white',
                    boxShadow: '0 5px 15px rgba(255, 87, 34, 0.4)'
                }}>
                    {user?.name.charAt(0)}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--text-main)', marginBottom: '5px' }}>{user?.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user?.email}</p>

                    <div style={{
                        marginTop: '15px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 193, 7, 0.1)',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: '1px solid #FFC107'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>💎</span>
                        <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {points} {t('points')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders & Tracking Section */}
            <div>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>
                    {t('order_history')}
                </h2>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {mockOrders.map((order) => (
                        <div key={order.id} style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div>
                                    <h3 style={{ color: '#FF5722', marginBottom: '5px' }}>#{order.id}</h3>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.date}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.1rem' }}>฿{order.total.toLocaleString()}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.items.length} {t('items')}</div>
                                </div>
                            </div>

                            {/* Tracking visualization */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
                                <div style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {t('status')}:
                                </div>
                                <TrackingStepper status={order.status} />
                            </div>

                            {/* Item summary */}
                            <div style={{ marginTop: '15px' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>
                                        • {item.name} x {item.quantity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
