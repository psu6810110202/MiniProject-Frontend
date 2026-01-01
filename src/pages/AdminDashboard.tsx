import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { items, preOrders } = useProducts();

    // Redirect if not admin
    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    if (role !== 'admin') return null;

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
                        onClick={() => navigate('/admin/users')}
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
            </div>

            {/* Management Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {/* Manage Categories */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <h3>Manage Categories</h3>
                        <p style={{ color: '#888' }}>Organize products by category</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/categories')}
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
                        View Categories
                    </button>
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
                        onClick={() => navigate('/admin/fandoms')}
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
                        onClick={() => navigate('/admin/products')}
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
                        onClick={() => navigate('/admin/preorders')}
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
            </div>
        </div>
    );
};

export default AdminDashboard;
