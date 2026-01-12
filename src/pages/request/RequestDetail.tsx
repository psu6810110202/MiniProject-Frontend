import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { userAPI } from '../../services/api';

// Extended interface for the new flow
interface CustomRequest {
    id: string;
    productName: string;
    link: string;
    details: string;
    region: string;
    price: number;
    quantity: number;
    estimatedTotal: number;
    // New fields
    shippingCost?: number;
    finalTotal?: number;
    status: 'pending' | 'payment_pending' | 'payment_verification' | 'paid' | 'ordered' | 'arrived_th' | 'shipping' | 'completed' | 'rejected';
    trackingNumber?: string;
    paymentSlip?: string;
    paymentDate?: string;
    paymentTime?: string;
    shippingAddress?: string; // Snapshot of address at time of order
    userName: string;
    userEmail: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    adminNotes?: string;
}

const RequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user, updateUser } = useAuth();
    const [request, setRequest] = useState<CustomRequest | null>(null);
    const [loading, setLoading] = useState(true);

    // Payment State
    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentTime, setPaymentTime] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'truemoney'>('bank'); // Added state

    // Address Edit State
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

    useEffect(() => {
        // Load request from localStorage
        const storedRequests = JSON.parse(localStorage.getItem('custom_requests') || '[]');
        const found = storedRequests.find((r: any) => r.id === id);
        if (found) {
            // Mock data migration/default for new status flow
            if (found.status === 'approved') found.status = 'payment_pending';
            setRequest(found);
        } else {
            // Handle not found
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        if (user) {
            setAddressForm({
                name: user.name || '',
                phone: user.phone || '', // Use phone from user profile
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
            // Validate basic fields
            if (!addressForm.name || !addressForm.phone || !addressForm.house_number || !addressForm.province) {
                alert(t('please_fill_all_address_fields'));
                return;
            }

            // Update User Profile via API
            const updatedUserData = await userAPI.update(user.id || (user as any).user_id, {
                ...addressForm
            });
            updateUser({ ...user, ...updatedUserData });
            setIsEditingAddress(false);
            alert(t('address_updated_success'));
        } catch (error) {
            console.error(error);
            alert(t('failed_update_address'));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader(); // Removed TypeScript cast for simplicity as file is checked
            reader.onloadend = () => {
                setSlipImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitPayment = () => {
        if (!slipImage || !paymentDate || !paymentTime) {
            alert(t('please_upload_slip'));
            return;
        }
        if (!request) return;

        const updatedRequest = {
            ...request,
            status: 'payment_verification' as const,
            paymentSlip: slipImage,
            paymentDate,
            paymentTime,
            shippingAddress: `${addressForm.name} ${addressForm.phone} ${addressForm.house_number} ${addressForm.sub_district} ${addressForm.district} ${addressForm.province} ${addressForm.postal_code}`,
            updatedAt: new Date().toISOString()
        };

        // Save to LocalStorage
        const storedRequests = JSON.parse(localStorage.getItem('custom_requests') || '[]');
        const updatedList = storedRequests.map((r: any) => r.id === request.id ? updatedRequest : r);
        localStorage.setItem('custom_requests', JSON.stringify(updatedList));

        setRequest(updatedRequest);
        alert(t('payment_submitted'));
        window.scrollTo(0, 0);
    };

    const confirmReceived = () => {
        if (!request) return;
        if (!window.confirm(t('confirm_received_msg'))) return;

        const updatedRequest = {
            ...request,
            status: 'completed' as const,
            updatedAt: new Date().toISOString()
        };

        const storedRequests = JSON.parse(localStorage.getItem('custom_requests') || '[]');
        const updatedList = storedRequests.map((r: any) => r.id === request.id ? updatedRequest : r);
        localStorage.setItem('custom_requests', JSON.stringify(updatedList));

        setRequest(updatedRequest);
    };

    if (loading) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>{t('loading_product_details')}</div>;
    if (!request) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>{t('no_orders_found')}</div>;

    // Helper for steps
    const steps = [
        { id: 'pending', label: t('status_pending_approval') },
        { id: 'payment_pending', label: t('status_payment') },
        { id: 'payment_verification', label: t('status_verifying') },
        { id: 'arrived_th', label: t('status_in_thailand') },
        { id: 'shipping', label: t('status_shipped') },
        { id: 'completed', label: t('status_delivered') }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === request.status) > -1
        ? steps.findIndex(s => s.id === request.status)
        // Fallback mapping for statuses that might skip steps or be equivalent
        : request.status === 'paid' || request.status === 'ordered' ? 2 // Treat paid/ordered as passed payment
            : 0;

    // Helper for status translation
    const getStatusTranslation = (status: CustomRequest['status']) => {
        const map: Record<string, string> = {
            'pending': t('status_pending_approval'),
            'payment_pending': t('status_payment'),
            'payment_verification': t('status_verifying'),
            'paid': t('status_paid'),
            'ordered': t('status_ordered'),
            'arrived_th': t('status_in_thailand'),
            'shipping': t('status_shipped'),
            'completed': t('status_completed'),
            'rejected': t('status_rejected')
        };
        return map[status] || status.toUpperCase();
    };

    // Fee logic
    const truemoneyFee = paymentMethod === 'truemoney' ? 10 : 0;
    const totalToPay = (request.finalTotal || request.estimatedTotal) + (request.shippingCost || 0) + truemoneyFee;

    return (
        <div style={{ padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => navigate('/profile')} style={{ color: '#FF5722', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}>
                    ← {t('back_to_profile')}
                </button>

                <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '30px', border: '1px solid var(--border-color)' }}>
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FF5722' }}>{t('request_id')}{request.id}</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#888' }}>{t('placed_on')} {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                padding: '6px 12px', borderRadius: '8px',
                                background: '#333', color: 'white', fontWeight: 'bold'
                            }}>
                                {getStatusTranslation(request.status)}
                            </span>
                        </div>
                    </div>

                    {/* Stepper (Simplified) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                        {/* Line behind steps */}
                        <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#333', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, height: '2px', background: '#FF5722', zIndex: 0, transition: 'width 0.3s' }}></div>

                        {steps.map((step, index) => {
                            const isActive = index <= currentStepIndex;
                            return (
                                <div key={step.id} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '80px' }}>
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: isActive ? '#FF5722' : '#333',
                                        margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', color: 'white', border: '4px solid var(--card-bg)'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: isActive ? 'white' : '#666' }}>{step.label}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Main Content Area Based on Status */}

                    {/* 1. Pending Admin Approval */}
                    {request.status === 'pending' && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '12px', border: '1px solid #FFC107' }}>
                            <h2 style={{ color: '#FFC107', marginTop: 0 }}>{t('waiting_admin_approval_title')}</h2>
                            <p style={{ color: '#ccc' }}>{t('waiting_admin_approval_desc')}</p>
                        </div>
                    )}

                    {/* 2. Payment Required */}
                    {request.status === 'payment_pending' && (
                        <div>
                            <h2 style={{ borderLeft: '4px solid #FF5722', paddingLeft: '15px' }}>{t('make_payment')}</h2>

                            {/* Payment Method Selection */}
                            <div style={{ marginBottom: '30px', background: '#222', padding: '20px', borderRadius: '12px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'white' }}>{t('payment_method')}</h3>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer',
                                        background: paymentMethod === 'bank' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: paymentMethod === 'bank' ? '#FF5722' : '#555'
                                    }}>
                                        <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                                        <span>🏦 {t('bank_transfer')}</span>
                                    </label>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer',
                                        background: paymentMethod === 'truemoney' ? 'rgba(255,87,34,0.1)' : 'transparent', borderColor: paymentMethod === 'truemoney' ? '#FF5722' : '#555'
                                    }}>
                                        <input type="radio" name="paymentMethod" value="truemoney" checked={paymentMethod === 'truemoney'} onChange={() => setPaymentMethod('truemoney')} />
                                        <span>💰 {t('truemoney_fee_notice')}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>{t('product_estimate')}</span>
                                    <span>฿{request.estimatedTotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>{t('shipping_admin_quote')}</span>
                                    <span>฿{(request.shippingCost || 0).toLocaleString()}</span>
                                </div>
                                {paymentMethod === 'truemoney' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#FFC107' }}>
                                        <span>TrueMoney Fee</span>
                                        <span>฿10</span>
                                    </div>
                                )}
                                <div style={{ borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#FF5722', fontSize: '1.2rem' }}>
                                    <span>{t('total_to_pay')}</span>
                                    <span>฿{totalToPay.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Details Section (Bank or TrueMoney) */}
                            {paymentMethod === 'bank' && (
                                <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid #444' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem' }}>{t('bank_transfer_details')}</h3>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '250px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>{t('bank_label')}</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                    {t('bank_name')}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Account Number</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    125-8-04638-9
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>{t('account_name_label')}</label>
                                                <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                    ด.ญ.พันน์ชิตา ทองคำ
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ width: '180px', flexShrink: 0, textAlign: 'center' }}>
                                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>{t('scan_to_pay')}</label>
                                            <div style={{
                                                borderRadius: '10px', overflow: 'hidden', border: '1px solid #555', background: 'white', padding: '5px'
                                            }}>
                                                <img src="http://localhost:3000/images/payment/Qr.jpeg" alt="Payment QR Code" style={{ width: '100%', display: 'block' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'truemoney' && (
                                <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid #444' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem' }}>{t('truemoney_details')}</h3>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>{t('account_name_label')}</label>
                                            <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold' }}>
                                                นางสาวปาริชาติ หงส์สุวรรวัธนะ
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>{t('phone_number')}</label>
                                            <div style={{ padding: '10px', background: 'rgba(255,87,34,0.1)', borderRadius: '5px', border: '1px solid #FF5722', color: '#FF5722', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                080-569-2994
                                            </div>
                                        </div>
                                        <div style={{ padding: '15px', background: 'rgba(255,193,7,0.1)', borderRadius: '8px', border: '1px solid #FFC107', color: '#FFC107', textAlign: 'center', fontWeight: 'bold' }}>
                                            💰 {t('additional_fee_applied')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Address Verification */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>{t('shipping_address')}</h3>
                                    <button onClick={() => setIsEditingAddress(true)} style={{ color: '#2196F3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>{t('edit_address')}</button>
                                </div>
                                <div style={{ padding: '15px', background: '#333', borderRadius: '8px', border: '1px solid #444', lineHeight: '1.6' }}>
                                    <strong>{user?.name} {user?.phone}</strong><br />
                                    {user?.house_number} {user?.sub_district} {user?.district}<br />
                                    {user?.province} {user?.postal_code}
                                </div>
                            </div>

                            {/* Upload Slip with Checkout Style */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3>{t('upload_transfer_slip')}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>{t('date')}</label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={e => setPaymentDate(e.target.value)}
                                            style={{
                                                width: '95%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid #555', color: 'var(--text-main)', borderRadius: '8px', colorScheme: 'dark'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>{t('time')}</label>
                                        <input
                                            type="time"
                                            value={paymentTime}
                                            onChange={e => setPaymentTime(e.target.value)}
                                            style={{
                                                width: '95%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid #555', color: 'var(--text-main)', borderRadius: '8px', colorScheme: 'dark'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        border: '2px dashed #555', borderRadius: '10px', padding: '25px', textAlign: 'center', cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', height: '150px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    onClick={() => document.getElementById('slip-upload')?.click()}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#FF5722'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#555'}
                                >
                                    <input type="file" id="slip-upload" hidden accept="image/*" onChange={handleFileUpload} />
                                    {slipImage ? (
                                        <img src={slipImage} alt="Slip" style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '8px' }} />
                                    ) : (
                                        <div style={{ color: '#aaa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>☁️</span>
                                            <span>{t('click_to_upload_slip')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={submitPayment}
                                style={{
                                    width: '100%', padding: '15px', background: '#4CAF50', color: 'white',
                                    border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                                }}>
                                {t('confirm_payment')}
                            </button>
                        </div>
                    )}

                    {/* 3. Verification & Later Steps */}
                    {['payment_verification', 'paid', 'ordered', 'arrived_th', 'shipping', 'completed'].includes(request.status) && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            {request.status === 'payment_verification' && (
                                <div>
                                    <h2 style={{ color: '#2196F3' }}>{t('verifying_payment_title')}</h2>
                                    <p>{t('verifying_payment_desc')}</p>
                                </div>
                            )}
                            {(request.status === 'paid' || request.status === 'ordered') && (
                                <div>
                                    <h2 style={{ color: '#4CAF50' }}>{t('order_confirmed_title')}</h2>
                                    <p>{t('order_confirmed_desc')}</p>
                                </div>
                            )}
                            {request.status === 'arrived_th' && (
                                <div>
                                    <h2 style={{ color: '#9C27B0' }}>{t('arrived_th_title')}</h2>
                                    <p>{t('arrived_th_desc')}</p>
                                </div>
                            )}
                            {request.status === 'shipping' && (
                                <div>
                                    <h2 style={{ color: '#FF9800' }}>{t('out_for_delivery_title')}</h2>
                                    <p>{t('out_for_delivery_desc')}</p>
                                    {request.trackingNumber && (
                                        <div style={{ margin: '15px 0', padding: '15px', background: '#333', borderRadius: '8px', display: 'inline-block' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>Tracking Number</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px', marginBottom: '10px' }}>
                                                {request.trackingNumber}
                                            </div>
                                            <a
                                                href={`https://track.thailandpost.co.th/?trackNumber=${request.trackingNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '6px 12px',
                                                    background: '#2196F3',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Check Tracking (เช็คพัสดุ)
                                            </a>
                                        </div>
                                    )}
                                    <button
                                        onClick={confirmReceived}
                                        style={{ marginTop: '15px', padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {t('confirm_received_product')}
                                    </button>
                                </div>
                            )}
                            {request.status === 'completed' && (
                                <div>
                                    <h2 style={{ color: '#4CAF50' }}>{t('order_completed_title')}</h2>
                                    <p>{t('order_completed_desc')}</p>
                                </div>
                            )}
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
        </div>
    );
};

export default RequestDetail;
