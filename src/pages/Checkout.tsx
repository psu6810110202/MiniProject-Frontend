import React, { useState } from 'react';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePoints } from '../hooks/usePoints';
import { useProducts } from '../contexts/ProductContext';
import { userAPI, orderAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

type PaymentMethodId = 'bank' | 'truemoney';

const Checkout: React.FC = () => {

    const { cartItems, totalAmount, clearCart, addOrder } = useCart();
    const { user, isLoggedIn, updateUser } = useAuth();
    const { t } = useLanguage();
    const { addPoints, calculatePointsFromAmount } = usePoints();
    const { deductStock } = useProducts();
    const navigate = useNavigate();
    const location = useLocation();

    // Derive step from URL (omitted unchanged parts)
    const step = location.pathname.includes('confirm') ? 2 : 1;
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: (location.state?.paymentMethod || 'bank') as PaymentMethodId,
        transferDate: '',
        transferTime: '',
        slipImage: null as File | null
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
            ].filter(Boolean);

            setForm(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                address: addressParts.join(' ') || user.address || ''
            }));
        }
    }, [user]);

    // Recover payment method from state if navigating back/forth
    React.useEffect(() => {
        if (location.state?.paymentMethod) {
            setForm(prev => ({ ...prev, paymentMethod: location.state.paymentMethod }));
        }
    }, [location.state]);

    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        house_number: '',
        sub_district: '',
        district: '',
        province: '',
        postal_code: ''
    });

    React.useEffect(() => {
        if (user) {
            setAddressForm({
                name: user.name || '',
                phone: user.phone || '',
                house_number: user.house_number || '',
                sub_district: user.sub_district || '',
                district: user.district || '',
                province: user.province || '',
                postal_code: user.postal_code || ''
            });
        }
    }, [user]);

    const handleSaveAddress = async () => {
        if (!user) return;
        try {
            const updatedUser = { ...user, ...addressForm };
            await userAPI.update(user.id, updatedUser);
            updateUser(updatedUser);

            const addressParts = [
                addressForm.house_number,
                addressForm.sub_district,
                addressForm.district,
                addressForm.province,
                addressForm.postal_code
            ].filter(Boolean);

            setForm(prev => ({
                ...prev,
                name: addressForm.name,
                phone: addressForm.phone,
                address: addressParts.join(' ')
            }));

            setIsEditingAddress(false);
            alert(t('address_updated_success'));
        } catch (error) {
            console.error(error);
            alert(t('failed_update_address'));
        }
    };

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totals = React.useMemo(() => {
        let shippingCost = 60;
        if (user?.province) {
            const userProvince = user.province;
            const bkkVicinity = ['กรุงเทพมหานคร', 'Bangkok', 'นนทบุรี', 'Nonthaburi', 'ปทุมธานี', 'Pathum Thani', 'สมุทรปราการ', 'Samut Prakan'];
            if (bkkVicinity.some(p => userProvince.includes(p))) {
                shippingCost = 45;
            }
        }
        const truemoneyFee = form.paymentMethod === 'truemoney' ? 10 : 0;
        return { subtotal: totalAmount, shipping: shippingCost, total: totalAmount + shippingCost + truemoneyFee, truemoneyFee };
    }, [totalAmount, form.paymentMethod, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm({ ...form, slipImage: e.target.files[0] });
        }
    };

    const handlePay = async () => {
        setError(null);

        // ตรวจสอบข้อมูลการชำระเงิน (Step 3 validation)
        if (!form.transferDate || !form.transferTime || !form.slipImage) {
            setError('กรุณากรอก วันที่/เวลา และแนบสลิปการโอนเงิน ให้ครบถ้วน');
            window.scrollTo(0, 0);
            return;
        }

        // ตรวจสอบตะกร้าสินค้า
        if (cartItems.length === 0) {
            setError('ตะกร้าสินค้าว่าง');
            return;
        }

        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));

            // Deduct Stock immediately (sanitize ID by removing 'P' if present)
            await Promise.all(cartItems.map(item => deductStock(String(item.id).replace(/^P/i, ''), item.quantity)));

            // Convert slip to Base64
            let slipBase64 = null;
            if (form.slipImage) {
                try {
                    slipBase64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(form.slipImage!);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = error => reject(error);
                    });
                } catch (err) {
                    console.error("Error reading file", err);
                }
            }

            // Prepare Order Payload for Backend
            const orderPayload: any = {
                user_id: user?.id,
                total_amount: totals.total,
                shipping_fee: totals.shipping,
                status: 'pending',
                payment_status: 'pending_verification',
                shipping_address: `${form.name} | ${form.phone} | ${form.address}`,
                items: cartItems.map(item => ({
                    product_id: String(item.id).replace(/^P/i, ''),
                    quantity: item.quantity,
                    unit_price: Number(String(item.price).replace(/[^0-9.-]+/g, ""))
                })),
                payment_slip: slipBase64,
                payment_date: form.transferDate,
                payment_time: form.transferTime
            };

            // Call Backend API
            const createdOrder = await orderAPI.create(orderPayload);
            const orderId = createdOrder.order_id || `ORD-${Date.now().toString().slice(-6)}`; // Fallback if mock

            const newOrder: any = {
                id: orderId,
                date: (() => {
                    const now = new Date();
                    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                })(),
                status: 'pending',
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(String(item.price).replace(/[^0-9.-]+/g, "")),
                    type: (item as any).type
                })),
                totalAmount: totals.total,
                carrier: 'Thailand Post',
                trackingNumber: `TH${Date.now().toString().slice(-10)}`,
                payment: {
                    date: form.transferDate,
                    time: form.transferTime,
                    slip: form.slipImage ? form.slipImage.name : 'slip.jpg'
                }
            };

            addOrder(newOrder);

            // Award points after successful payment
            const earnedPoints = calculatePointsFromAmount(totals.total);
            if (earnedPoints > 0) {
                addPoints(earnedPoints);
                console.log(`Payment successful! Added ${earnedPoints} points to user account.`);
            }

            clearCart();
            navigate(`/profile/orders/${orderId}`, { state: { order: newOrder } });
        } catch (e) {
            console.error("Order Creation Error:", e);
            const msg = (e as any)?.message || 'การสร้างคำสั่งซื้อล้มเหลว';
            // Check for specific backend validation messages if possible, otherwise show raw message to help debug
            setError(`เกิดข้อผิดพลาด: ${msg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Redirect logic: Auth & Empty Cart Protection
    const isNotLoggedIn = !isLoggedIn;
    const isCartEmpty = cartItems.length === 0 && step !== 2;

    React.useEffect(() => {
        if (isNotLoggedIn) {
            navigate('/login');
        } else if (isCartEmpty) {
            navigate('/fandoms');
        }
    }, [isNotLoggedIn, isCartEmpty, navigate]);

    if (isNotLoggedIn || isCartEmpty) return null;

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
                        <span>Payment</span>
                    </div>
                    <div style={{ width: '50px', height: '2px', background: '#333', alignSelf: 'center' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 2 ? '#FF5722' : 'var(--text-muted)' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 2 ? '#FF5722' : '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                        <span>Confirm</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                    {/* Left Column: Form */}
                    <div style={{ flex: '1 1 600px' }}>

                        {step === 1 && (
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
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Bank Name</label>
                                                    <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                        Kasikornbank (K-Bank)
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Number</label>
                                                    <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                        125-8-04638-9
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Name</label>
                                                    <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                        ด.ญ.พันน์ชิตา ทองคำ
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ width: '180px', flexShrink: 0, textAlign: 'center' }}>
                                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>Scan to Pay</label>
                                                <div style={{
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #555',
                                                    background: 'white',
                                                    padding: '5px'
                                                }}>
                                                    <img
                                                        src="http://localhost:3000/images/payment/Qr.jpeg"
                                                        alt="Payment QR Code"
                                                        style={{ width: '100%', display: 'block' }}
                                                    />
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
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Name</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                    นางสาวปาริชาติ หงส์สุวรรวัธนะ
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Phone Number</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    080-569-2994
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
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            navigate('/checkout-confirm', { state: { paymentMethod: form.paymentMethod } });
                                            window.scrollTo(0, 0);
                                        }}
                                        disabled={isProcessing}
                                        style={{ width: '100%', padding: '15px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1 }}
                                    >
                                        Continue to Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Confirm Payment</h2>
                                <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '20px' }}>
                                    Upload purchase proof and confirm your order.
                                </p>

                                {error && (
                                    <div style={{ marginBottom: '15px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.35)', color: '#ffb3ad' }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>

                                    {/* Transfer Date/Time */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>วันที่โอน (Transfer Date)</label>
                                            <input
                                                type="date"
                                                name="transferDate"
                                                value={form.transferDate}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: '90%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #555',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-main)',
                                                    colorScheme: 'dark',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>เวลาที่โอน (Transfer Time)</label>
                                            <input
                                                type="time"
                                                name="transferTime"
                                                value={form.transferTime}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: '90%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #555',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-main)',
                                                    colorScheme: 'dark',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Slip Upload */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>สลิปการโอนเงิน (Upload Slip)</label>
                                        <div style={{ border: '2px dashed #555', borderRadius: '10px', padding: '25px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
                                            onClick={() => document.getElementById('slip-upload')?.click()}
                                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#FF5722'}
                                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#555'}
                                        >
                                            <input
                                                type="file"
                                                id="slip-upload"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            {form.slipImage ? (
                                                <div style={{ color: '#4CAF50', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>✓</span> {form.slipImage.name}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#aaa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                                    <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>☁️</span>
                                                    <span>Click to upload slip image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping Information */}
                                    <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #444', background: 'rgba(0,0,0,0.10)', marginBottom: '20px', position: 'relative' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>Shipping Address</div>
                                        <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                            <div style={{ marginBottom: '4px', color: 'var(--text-main)' }}>{form.name}
                                                <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '10px' }}>{form.phone}</span>
                                            </div>
                                            <div>{form.address}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAddress(true)}
                                            style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                width: '36px',
                                                height: '36px',
                                                background: '#333',
                                                border: '1px solid #555',
                                                color: '#fff',
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 1
                                            }}
                                            title={t('edit_address')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20h9"></path>
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => navigate('/checkout-payment', { state: { paymentMethod: form.paymentMethod } })}
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
                                        {isProcessing ? 'Processing…' : `Confirm Payment`}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary */}
                    {true && (
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

            {/* Address Edit Modal */}
            {isEditingAddress && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', border: '1px solid #444' }}>
                        <h3>{t('edit_address')}</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <input placeholder={t('full_name_label')} value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            <input placeholder={t('phone_label')} value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            <input placeholder={t('house_number')} value={addressForm.house_number} onChange={e => setAddressForm({ ...addressForm, house_number: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input placeholder={t('sub_district')} value={addressForm.sub_district} onChange={e => setAddressForm({ ...addressForm, sub_district: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                                <input placeholder={t('district')} value={addressForm.district} onChange={e => setAddressForm({ ...addressForm, district: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input placeholder={t('province')} value={addressForm.province} onChange={e => setAddressForm({ ...addressForm, province: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                                <input placeholder={t('postal_code')} value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} style={{ padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditingAddress(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>{t('cancel')}</button>
                            <button onClick={handleSaveAddress} style={{ padding: '10px 20px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('save_update_profile')}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Checkout;
