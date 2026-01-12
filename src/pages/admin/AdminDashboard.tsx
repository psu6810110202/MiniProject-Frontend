import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const dashboardContainer: React.CSSProperties = {
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        animation: 'fadeIn 0.5s ease-in-out'
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '2.5rem',
        marginBottom: '30px',
        borderBottom: '2px solid #FF5722',
        paddingBottom: '10px',
        color: '#fff'
    };

    const gridContainer: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginTop: '20px'
    };

    const cardStyle = (color: string): React.CSSProperties => ({
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '15px',
        border: `1px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        textAlign: 'center',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden'
    });

    const menuItems = [
        {
            label: 'Manage Users', path: '/admin/users', color: '#2196F3', desc: 'View, Edit, Ban Users',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            label: 'Manage Fandoms', path: '/admin/fandoms', color: '#9C27B0', desc: 'Create & Edit Fandoms',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20"></path>
                    <path d="M2 12l5 5"></path>
                    <path d="M22 12l-5 5"></path>
                    <path d="M12 2a5 5 0 0 1 5 5v5H7V7a5 5 0 0 1 5-5z"></path>
                    <path d="M12 22a5 5 0 0 0 5-5v-5H7v5a5 5 0 0 0 5 5z"></path>
                </svg>
            )
        },
        {
            label: 'Manage Products', path: '/admin/products', color: '#4CAF50', desc: 'Add, Edit, Stock, Categories',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            )
        },
        {
            label: 'Pre-Orders', path: '/admin/preorders', color: '#FF9800', desc: 'Manage Pre-order Items',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            )
        },
        {
            label: 'Custom Requests', path: '/admin/custom-requests', color: '#00BCD4', desc: 'Custom Product Orders',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
            )
        }
    ];

    return (
        <div style={dashboardContainer}>
            <h1 style={headerStyle}>
                Admin Dashboard <span style={{ color: '#FF5722', fontSize: '1.2rem' }}>Control Panel</span>
            </h1>

            <div style={gridContainer}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        style={cardStyle(item.color)}
                        onClick={() => navigate(item.path)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = `0 10px 20px -5px ${item.color}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{item.icon}</div>
                        <h2 style={{ fontSize: '1.5rem', margin: '10px 0', color: '#fff' }}>{item.label}</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
