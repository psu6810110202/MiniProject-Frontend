import React, { useState } from 'react';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { type Order } from '../data/mockOrders';

const Checkout: React.FC = () => {

    const { cartItems, totalAmount, clearCart, addToHistory, addOrder } = useCart();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'creditCard'
    });

    // Populate form with user data if available
    React.useEffect(() => {
        if (user) {
            const addressParts = [
                user.house_number,
                user.sub_district,
                user.district,
                user.province,
                user.postal_code
            ].filter(Boolean); // Filter out empty strings/undefined

            setForm(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                address: addressParts.join(' ') || user.address || ''
            }));
        }
    }, [user]);

    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Complete

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const handlePlaceOrder = () => {
        // Here you would typically call your backend API to place the order
        console.log('Order Placed:', { ...form, items: cartItems, total: totalAmount });

        // Add items to purchased history
        addToHistory(cartItems);

        // Create Order Object
        const newOrder: Order = {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: Number(item.price.replace(/[^0-9.-]+/g, ""))
            })),
            total: totalAmount
        };
        addOrder(newOrder);

        // Update User Points (e.g., 1 point per 100 THB)
        if (user && updateUser) {
            const pointsEarned = Math.floor(totalAmount / 100);
            updateUser({ ...user, points: (user.points || 0) + pointsEarned });
        }

        // Mock Success
        clearCart();
        setStep(3);
        window.scrollTo(0, 0);
        // After a few seconds redirect to profile
        setTimeout(() => {
            navigate('/profile');
        }, 3000);
    };

    if (cartItems.length === 0 && step !== 3) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/catalog')} style={{ marginTop: '20px', padding: '10px 20px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Go to Catalog
                </button>
            </div>
        );
    }

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1000px',
            margin: '0 auto',
            minHeight: '80vh',
            color: 'var(--text-main)'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>Checkout</h1>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 1 ? '#FF5722' : 'var(--text-muted)' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 1 ? '#FF5722' : '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                    <span>Shipping</span>
                </div>
                <div style={{ width: '50px', height: '2px', background: '#333', alignSelf: 'center' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 2 ? '#FF5722' : 'var(--text-muted)' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 2 ? '#FF5722' : '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                    <span>Payment</span>
                </div>
                <div style={{ width: '50px', height: '2px', background: '#333', alignSelf: 'center' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 3 ? '#FF5722' : 'var(--text-muted)' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 3 ? '#FF5722' : '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                    <span>Done</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                {/* Left Column: Form */}
                <div style={{ flex: '1 1 600px' }}>

                    {step === 1 && (
                        <form onSubmit={handleNext} style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Shipping Information</h2>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Full Name</label>
                                <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #555', background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Phone Number</label>
                                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #555', background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Address</label>
                                <textarea name="address" value={form.address} onChange={handleChange} required rows={4} style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #555', background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)', resize: 'vertical' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '15px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                Continue to Payment
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Payment Method</h2>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'creditCard' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: form.paymentMethod === 'creditCard' ? '#FF5722' : '#555' }}>
                                    <input type="radio" name="paymentMethod" value="creditCard" checked={form.paymentMethod === 'creditCard'} onChange={handleChange} />
                                    <span>Credit / Debit Card</span>
                                </label>
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'cod' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: form.paymentMethod === 'cod' ? '#FF5722' : '#555' }}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '15px', background: 'transparent', border: '1px solid #555', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
                                <button onClick={handlePlaceOrder} style={{ flex: 2, padding: '15px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Place Order
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Order Placed Successfully!</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Thank you for shopping with DomPort.</p>
                            <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Redirecting you to profile...</p>
                        </div>
                    )}

                </div>

                {/* Right Column: Order Summary */}
                {step !== 3 && (
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #555', paddingBottom: '15px' }}>Order Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                {cartItems.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{item.name} x {item.quantity}</span>
                                        <span style={{ fontWeight: 'bold' }}>฿{(Number(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px solid #555', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span style={{ color: '#FF5722' }}>฿{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
