import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useTheme } from '../contexts/ThemeContext';
import { orderAPI, type Shipment } from '../services/api';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { items, preOrders } = useProducts();

    const [shippingOrderId, setShippingOrderId] = React.useState('');
    const [shippingLoading, setShippingLoading] = React.useState(false);
    const [shippingError, setShippingError] = React.useState<string | null>(null);
    const [shippingResult, setShippingResult] = React.useState<Shipment | null>(null);

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/profile');
        }
    }, [role, navigate]);

    if (role !== 'admin') return null;

    const handleCreateShippingLabel = async () => {
        setShippingError(null);
        setShippingResult(null);

        const orderId = shippingOrderId.trim();
        if (!orderId) {
            setShippingError('Please enter Order ID');
            return;
        }

        setShippingLoading(true);
        try {
            // Mock API call for demonstration
            const mockShipment = {
                shipment_id: `SHIP${Date.now()}`,
                order_id: orderId,
                provider: 'Thailand Post',
                tracking_number: `TH${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                label_url: 'https://track.thailandpost.co.th/',
                created_at: new Date().toISOString()
            };
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setShippingResult(mockShipment);
            setShippingOrderId('');
        } catch (err: any) {
            const message = typeof err?.message === 'string' ? err.message : 'Failed to create shipping label';
            setShippingError(message);
        } finally {
            setShippingLoading(false);
        }
    };

    return (
        <div style={{ color: 'var(--text-main)', marginTop: '40px' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px', fontSize: '1.8rem' }}>
                Admin Dashboard 🛠️
            </h2>

            {/* Top Row: User Management */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>User Management</h3>
                        <p style={{ color: 'var(--text-muted)' }}>View and manage registered users.</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/users')}
                        style={{
                            padding: '10px 25px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                        Manage Users
                    </button>
                </div>
            </div >



            {/* Management Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {/* Shipping Tools */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Create Shipping Label</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                            Create shipping labels and tracking numbers (must be PAID orders)
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        <input
                            value={shippingOrderId}
                            onChange={(e) => setShippingOrderId(e.target.value)}
                            placeholder="Order ID (e.g. 7b8c...uuid)"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)'
                            }}
                        />

                        <button
                            onClick={handleCreateShippingLabel}
                            disabled={shippingLoading}
                            style={{
                                padding: '10px 20px',
                                background: shippingLoading ? '#4CAF50' : 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: shippingLoading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                width: '100%',
                                opacity: shippingLoading ? 0.8 : 1
                            }}>
                            {shippingLoading ? 'Creating...' : 'Create Label'}
                        </button>

                        {shippingError && (
                            <div style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: 'rgba(244,67,54,0.12)',
                                border: '1px solid rgba(244,67,54,0.35)',
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem'
                            }}>
                                {shippingError}
                            </div>
                        )}

                        {shippingResult && (
                            <div style={{
                                padding: '12px 12px',
                                borderRadius: '8px',
                                background: 'rgba(76,175,80,0.10)',
                                border: '1px solid rgba(76,175,80,0.35)',
                                color: 'var(--text-main)'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Success</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '6px' }}>
                                    Tracking: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{shippingResult.tracking_number}</span>
                                </div>
                                <a
                                    href={shippingResult.label_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}
                                >
                                    Open Label
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manage Fandoms */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Manage Fandoms</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Edit All Fandom Section</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/fandoms')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage All Fandoms
                    </button>
                </div>

                {/* Manage Products */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Manage Products</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Total Products: {items.length}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/products')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage All Products
                    </button>
                </div>

                {/* Manage Pre-Orders */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Manage Pre-Orders</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Total Items: {preOrders.length}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/preorders')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage Pre-Orders
                    </button>
                </div>

                {/* Manage Tickets */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Manage Tickets</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Receive and respond to tickets from users</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/tickets')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage Tickets
                    </button>
                </div>

                {/* Manage Custom Requests */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ color: 'var(--text-main)' }}>Custom Requests</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Receive custom product requests from users</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/custom-requests')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}>
                        Manage Requests
                    </button>
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;
