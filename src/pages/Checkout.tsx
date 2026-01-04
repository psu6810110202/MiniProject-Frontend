import React, { useState } from 'react';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { type Order } from '../data/mockOrders';

type PaymentMethodId = 'bank' | 'truemoney';

const Checkout: React.FC = () => {

    const { cartItems, totalAmount, clearCart, addOrder } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'bank' as PaymentMethodId
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

    const [step, setStep] = useState(1); // 1: Info, 2: Payment Method, 3: Pay

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState({ name: false, phone: false, address: false });

    const totals = React.useMemo(() => {
        const shipping = totalAmount > 1000 ? 0 : 50;
        const truemoneyFee = form.paymentMethod === 'truemoney' ? 10 : 0;
        return { subtotal: totalAmount, shipping, total: totalAmount + shipping + truemoneyFee, truemoneyFee };
    }, [totalAmount, form.paymentMethod]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const isStep1Valid = () => {
        return !!form.name.trim() && !!form.phone.trim() && !!form.address.trim();
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({ name: true, phone: true, address: true });
        if (!isStep1Valid()) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setError(null);
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handlePay = async () => {
        setError(null);

        if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            setStep(1);
            window.scrollTo(0, 0);
            return;
        }

        if (cartItems.length === 0) {
            setError('ตะกร้าสินค้าว่าง');
            return;
        }

        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));

            const orderId = `ORD-${Date.now().toString().slice(-6)}`;
            const newOrder: Order = {
                id: orderId,
                date: new Date().toISOString().split('T')[0],
                status: 'pending',
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(String(item.price).replace(/[^0-9.-]+/g, ""))
                })),
                total: totals.total,
                carrier: 'Thailand Post',
                trackingNumber: `TH${Date.now().toString().slice(-10)}`
            };

            addOrder(newOrder);
            clearCart();
            navigate(`/profile/orders/${orderId}`, { state: { order: newOrder } });
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsProcessing(false);
        }
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
        <>
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
                        <span>Confirm</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                    {/* Left Column: Form */}
                    <div style={{ flex: '1 1 600px' }}>

                        {step === 1 && (
                            <form onSubmit={handleNext} style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Shipping Information</h2>

                                {error && (
                                    <div style={{ marginBottom: '15px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.35)', color: '#ffb3ad' }}>
                                        {error}
                                    </div>
                                )}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Full Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: `1px solid ${touched.name && !form.name.trim() ? 'rgba(244,67,54,0.7)' : '#555'}`, background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Phone Number</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: `1px solid ${touched.phone && !form.phone.trim() ? 'rgba(244,67,54,0.7)' : '#555'}`, background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Address</label>
                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                                        required
                                        rows={4}
                                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: `1px solid ${touched.address && !form.address.trim() ? 'rgba(244,67,54,0.7)' : '#555'}`, background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)', resize: 'vertical' }}
                                    />
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '15px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', opacity: isStep1Valid() ? 1 : 0.9 }}>
                                    Continue to Payment
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Payment Method</h2>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'bank' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: form.paymentMethod === 'bank' ? '#FF5722' : '#555' }}>
                                        <input type="radio" name="paymentMethod" value="bank" checked={form.paymentMethod === 'bank'} onChange={handleChange} />
                                        <span>🏦 Bank Transfer</span>
                                    </label>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'truemoney' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: form.paymentMethod === 'truemoney' ? '#FF5722' : '#555' }}>
                                        <input type="radio" name="paymentMethod" value="truemoney" checked={form.paymentMethod === 'truemoney'} onChange={handleChange} />
                                        <span>💰 TrueMoney Wallet +10 THB fee</span>
                                    </label>
                                </div>

                                {form.paymentMethod === 'bank' && (
                                    <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid #444' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem' }}>Bank Transfer Details</h3>
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Bank Name</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                    Kasikornbank (K-Bank)
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Number</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    123-456-7890
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Name</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                    DomPort Company Limited
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>QR Code</label>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '20px',
                                                    background: 'white',
                                                    borderRadius: '10px',
                                                    border: '2px dashed #FF5722'
                                                }}>
                                                    <div style={{
                                                        width: '200px',
                                                        height: '200px',
                                                        background: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <div style={{ textAlign: 'center', color: '#666' }}>
                                                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📱</div>
                                                            <div style={{ fontSize: '0.9rem' }}>QR Code</div>
                                                            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Placeholder</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {form.paymentMethod === 'truemoney' && (
                                    <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid #444' }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem' }}>TrueMoney Wallet Details</h3>
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Phone Number</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    089-123-4567
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '15px',
                                                background: 'rgba(255,193,7,0.1)',
                                                borderRadius: '8px',
                                                border: '1px solid #FFC107',
                                                color: '#FFC107',
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                💰 Additional 10 THB fee will be applied
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>QR Code</label>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    padding: '20px',
                                                    background: 'white',
                                                    borderRadius: '10px',
                                                    border: '2px dashed #FF5722'
                                                }}>
                                                    <div style={{
                                                        width: '200px',
                                                        height: '200px',
                                                        background: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <div style={{ textAlign: 'center', color: '#666' }}>
                                                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💰</div>
                                                            <div style={{ fontSize: '0.9rem' }}>TrueMoney QR</div>
                                                            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Placeholder</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button onClick={() => setStep(1)} disabled={isProcessing} style={{ flex: 1, padding: '15px', background: 'transparent', border: '1px solid #555', color: 'var(--text-main)', borderRadius: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}>Back</button>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setStep(3);
                                            window.scrollTo(0, 0);
                                        }}
                                        disabled={isProcessing}
                                        style={{ flex: 2, padding: '15px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}
                                    >
                                        Continue to Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Confirm & Pay</h2>
                                <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '20px' }}>
                                    ตรวจสอบข้อมูล แล้วกดยืนยันการชำระเงินเพื่อสร้างคำสั่งซื้อ
                                </p>

                                {error && (
                                    <div style={{ marginBottom: '15px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.35)', color: '#ffb3ad' }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #444', background: 'rgba(0,0,0,0.10)' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>ผู้รับ</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{form.name} • {form.phone}</div>
                                        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{form.address}</div>
                                    </div>

                                    <div style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #444', background: 'rgba(0,0,0,0.10)' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Payment Method</div>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            {form.paymentMethod === 'bank' ? '🏦 Bank Transfer' : '💰 TrueMoney Wallet'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '6px' }}>
                                            <span>Shipping</span>
                                            <span>฿{totals.shipping.toLocaleString()}</span>
                                        </div>
                                        {totals.truemoneyFee > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '6px' }}>
                                                <span>TrueMoney Fee</span>
                                                <span>฿{totals.truemoneyFee.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
                                            <span>Total</span>
                                            <span style={{ color: '#FF5722' }}>฿{totals.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={isProcessing}
                                        style={{ flex: 1, padding: '15px', background: 'transparent', border: '1px solid #555', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePay}
                                        disabled={isProcessing}
                                        style={{ flex: 2, padding: '15px', background: isProcessing ? '#4CAF50' : '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.8 : 1 }}
                                    >
                                        {isProcessing ? 'กำลังดำเนินการ…' : `ยืนยันการชำระเงิน ฿${totals.total.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary */}
                    {step !== 0 && (
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
                                <div style={{ borderTop: '1px solid #555', paddingTop: '15px', marginTop: '15px', display: 'grid', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>Subtotal</span>
                                        <span>฿{totals.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>Shipping</span>
                                        <span>฿{totals.shipping.toLocaleString()}</span>
                                    </div>
                                    {totals.truemoneyFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                            <span>ค่าธรรมเนียม True Money</span>
                                            <span>฿{totals.truemoneyFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#FF5722' }}>฿{totals.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Checkout;
