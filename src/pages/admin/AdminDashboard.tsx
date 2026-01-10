import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { items, preOrders } = useProducts();

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/profile');
        }
    }, [role, navigate]);

    if (role !== 'admin') return null;

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
