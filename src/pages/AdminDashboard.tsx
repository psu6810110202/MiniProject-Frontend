import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { orderAPI, type Shipment } from '../services/api';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
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
            setShippingError('กรุณากรอก Order ID');
            return;
        }

        setShippingLoading(true);
        try {
            const shipment = await orderAPI.createShippingLabel(orderId);
            setShippingResult(shipment);
        } catch (err: any) {
            const message = typeof err?.message === 'string' ? err.message : 'สร้างใบปะหน้าจัดส่งไม่สำเร็จ';
            setShippingError(message);
        } finally {
            setShippingLoading(false);
        }
    };

    return (
        <div style={{ color: 'var(--text-main)', marginTop: '40px' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px', fontSize: '1.8rem' }}>
                Admin Dashboard 🛠️
            </h2>

            {/* Top Row: User Management */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '30px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3>User Management</h3>
                        <p style={{ color: '#888' }}>View and manage registered users.</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/users')}
                        style={{
                            padding: '10px 25px',
                            background: '#FF5722',
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
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div>
                        <h3>Create Shipping Label</h3>
                        <p style={{ color: '#888', marginTop: '6px' }}>
                            สร้างเลขพัสดุและใบปะหน้า (ต้องเป็นออเดอร์สถานะ PAID)
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        <input
                            value={shippingOrderId}
                            onChange={(e) => setShippingOrderId(e.target.value)}
                            placeholder="Order ID (เช่น 7b8c...uuid)"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #444',
                                background: 'rgba(0,0,0,0.15)',
                                color: 'var(--text-main)'
                            }}
                        />

                        <button
                            onClick={handleCreateShippingLabel}
                            disabled={shippingLoading}
                            style={{
                                padding: '10px 20px',
                                background: shippingLoading ? '#4CAF50' : '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: shippingLoading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                width: '100%',
                                opacity: shippingLoading ? 0.8 : 1
                            }}>
                            {shippingLoading ? 'กำลังสร้าง…' : 'Create Label'}
                        </button>

                        {shippingError && (
                            <div style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: 'rgba(244,67,54,0.12)',
                                border: '1px solid rgba(244,67,54,0.35)',
                                color: '#ffb3ad',
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
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>สร้างสำเร็จ</div>
                                <div style={{ color: '#cfcfcf', fontSize: '0.95rem', marginBottom: '6px' }}>
                                    Tracking: <span style={{ color: 'white', fontWeight: 'bold' }}>{shippingResult.tracking_number}</span>
                                </div>
                                <a
                                    href={shippingResult.label_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#FF5722', fontWeight: 'bold', textDecoration: 'none' }}
                                >
                                    เปิดใบปะหน้า (Label)
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manage Fandoms */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Fandoms</h3>
                        <p style={{ color: '#888' }}>Edit All Fandom Section</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/fandoms')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#FF5722',
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
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Products</h3>
                        <p style={{ color: '#888' }}>Total Products: {items.length}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/products')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#FF5722',
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
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Pre-Orders</h3>
                        <p style={{ color: '#888' }}>Total Items: {preOrders.length}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/preorders')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#FF5722',
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
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Tickets</h3>
                        <p style={{ color: '#888' }}>รับปัญหาและตอบกลับ Ticket จากผู้ใช้</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/tickets')}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#FF5722',
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
            </div>
        </div >
    );
};

export default AdminDashboard;
