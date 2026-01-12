import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { isLoggedIn, logout, role } = useAuth();
    const { cartItems, removeFromCart, updateQuantity, totalAmount, totalItems } = useCart();
    const navigate = useNavigate(); // สำหรับเปลี่ยนหน้าเว็ํบ

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    // HTMLDivElement คือ จุดอ้างอิง hitbox ใช้ร่วมกับบรรทัด 62

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // !dropdownRef.current.contains(event.target as Node) คือ จุดที่คลิก ไม่ได้อยู่ข้างในกล่องเมนูใช่ไหม?
                // event.target คือ จุดที่คลิก
                // .contains() คือ ตรวจสอบว่าจุดที่คลิกอยู่ในกล่องเมนูหรือไม่
                setIsDropdownOpen(false);
            }
        };
        // document เป็นค่า global และมาจาก Web API โดยตรง
        // addEventListner เป็นฟังก์ชันที่ใช้เพื่อจับ event
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // React.CSSProperties ไว้ล็อคสไตล์
    const navStyle: React.CSSProperties = {
        padding: '10px 40px',
        background: '#0a0a0a', // สีดำเสมอ
        borderBottom: '2px solid #FF5722',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    };

    // ✅ 2. Link Style: ล็อคตัวหนังสือเป็นสีขาว (เพื่อให้เห็นบนแถบดำ)
    const linkStyle = {
        textDecoration: 'none', // ไม่มีเส้นใต้
        color: '#ffffff', // ขาวเสมอ
        fontWeight: '500'
    };

    return (
        <nav style={navStyle}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-1px' }}>
                        <span style={{ color: '#FFFFFF' }}>Dom</span>
                        <span style={{ color: '#FF5722' }}>Port</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/request-custom-product" style={linkStyle}>Request</Link>
                    <Link to="/fandoms" style={linkStyle}>{t('all_fandoms')}</Link>
                    {role === 'admin' && (
                        <Link to="/admin" style={{ ...linkStyle, color: '#FF5722' }}>
                            Admin Dashboard
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

                {/* Search Icon */}
                <Link to="/fandoms" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </Link>

                {/* User Profile Dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            color: 'white'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '150%',
                            right: '-10px',
                            width: '240px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '12px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                            border: '1px solid #333',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1001
                        }}>
                            <Link
                                to={isLoggedIn ? "/profile" : "/login"}
                                onClick={() => setIsDropdownOpen(false)}
                                style={{
                                    padding: '12px 20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid #333',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <span>👤</span> {t('profile')}
                            </Link>

                            <div
                                onClick={() => {
                                    setLanguage(language === 'en' ? 'th' : 'en');
                                }}
                                style={{
                                    padding: '12px 20px',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    borderBottom: '1px solid #333'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>🌐</span> {t('language')}
                                </div>
                                <span style={{ fontSize: '0.8rem', background: '#FF5722', padding: '2px 8px', borderRadius: '10px', color: 'white' }}>
                                    {language.toUpperCase()}
                                </span>
                            </div>

                            <div
                                onClick={toggleTheme}
                                style={{
                                    padding: '12px 20px',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    borderBottom: '1px solid #333'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>{theme === 'dark' ? '🌙' : '☀️'}</span> {t('theme')}
                                </div>
                            </div>

                            {isLoggedIn ? (
                                <div
                                    onClick={handleLogout}
                                    style={{
                                        padding: '12px 20px',
                                        color: '#ff4444',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        fontWeight: 'bold'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span>🚪</span> {t('logout')}
                                </div>
                            ) : (
                                <Link to="/login" onClick={() => setIsDropdownOpen(false)} style={{
                                    padding: '12px 20px',
                                    color: '#FF5722',
                                    textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    <span>🔑</span> {t('login')}
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart Icon (Toggle Drawer) */}
                <button
                    onClick={() => setIsCartOpen(true)}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', color: 'white'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span style={{ fontWeight: 'bold' }}>{totalItems}</span>
                </button>

                {/* Cart Drawer */}
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsCartOpen(false)}
                            style={{
                                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                                background: 'rgba(0,0,0,0.5)', zIndex: 1100
                            }}
                        />
                        {/* Drawer Panel */}
                        <div style={{
                            position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh',
                            background: 'var(--card-bg)', zIndex: 1101,
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '-5px 0 30px rgba(0,0,0,0.5)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            {/* Drawer Header */}
                            <div style={{
                                padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '2px solid #FF5722'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('your_cart')}</h2>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                {cartItems.length === 0 ? (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '100%'
                                    }}>
                                        <div style={{ marginBottom: '20px', color: 'var(--border-color)' }}>
                                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('cart_empty')}</h3>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {cartItems.map(item => (
                                            <div key={item.id} style={{ display: 'flex', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} />
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text-main)' }}>{item.name}</h4>
                                                    <div style={{ color: '#FF5722', fontWeight: 'bold' }}>{item.price}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: '#333', border: 'none', color: 'white', width: '25px', height: '25px', borderRadius: '5px', cursor: 'pointer' }}>-</button>
                                                        <span style={{ color: 'var(--text-main)' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.category === 'Pre-Order'}
                                                            title={item.category === 'Pre-Order' ? 'Limit 1 per account' : ''}
                                                            style={{
                                                                background: item.category === 'Pre-Order' ? '#1a1a1a' : '#333',
                                                                border: item.category === 'Pre-Order' ? '1px solid #333' : 'none',
                                                                color: item.category === 'Pre-Order' ? '#555' : 'white',
                                                                width: '25px', height: '25px', borderRadius: '5px',
                                                                cursor: item.category === 'Pre-Order' ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >+</button>
                                                        <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer (Total & Checkout) */}
                            {cartItems.length > 0 && (
                                <div style={{ padding: '20px', borderTop: '2px solid #FF5722', background: 'var(--card-bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                        <span>Total:</span>
                                        <span style={{ color: '#FF5722' }}>฿{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <Link to={isLoggedIn ? "/checkout-payment" : "/login"}
                                        onClick={() => setIsCartOpen(false)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '15px',
                                            background: '#FF5722',
                                            color: 'white',
                                            textAlign: 'center',
                                            textDecoration: 'none',
                                            borderRadius: '10px',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Keyframes for animation - inline style hack since we can't easily add keyframes in inline styles. 
                            Ideally this should be in CSS, but this works for a quick implementation. */}
                        <style>{`
                            @keyframes slideIn {
                                from { transform: translateX(100%); }
                                to { transform: translateX(0); }
                            }
                        `}</style>
                    </>
                )}

            </div>
        </nav>
    );
};

export default Navbar;
