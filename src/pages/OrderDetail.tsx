import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { usePoints } from '../hooks/usePoints';
import ConfirmationModal from '../components/ConfirmationModal';

import { userAPI, orderAPI } from '../services/api';

// ... (existing imports)

const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { userOrders, updateOrderStatus, removePurchasedItems } = useCart();
    const { deductPoints } = usePoints();

    const getTrackingUrl = (carrier: string, trackingNumber: string) => {
        return `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`;
    };

    // Try finding order in passed state or context
    const locationStateOrder = location.state?.order;
    const foundOrder = locationStateOrder || userOrders.find(o => o.id === orderId);

    // Local state to handle UI updates
    const [order, setOrder] = React.useState<any>(foundOrder || null);
    const [loading, setLoading] = React.useState<boolean>(!foundOrder);
    const [error, setError] = React.useState<string | null>(null);
    const [paymentOption, setPaymentOption] = React.useState<'all' | 'shipping'>('all');

    // Fetch order from API to ensure fresh data
    React.useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                // If we have an ID, try to fetch fresh data
                const fetchedOrder = await orderAPI.getById(orderId);
                if (fetchedOrder) {
                    // Map backend payment_status to frontend status if missing
                    const mappedOrder = {
                        ...fetchedOrder,
                        id: fetchedOrder.order_id || (fetchedOrder as any).id,
                        date: (fetchedOrder as any).order_date || fetchedOrder.created_at || (fetchedOrder as any).date,
                        totalAmount: Number(fetchedOrder.total_amount || (fetchedOrder as any).totalAmount || 0),
                        shippingFee: Number(fetchedOrder.shipping_fee || (fetchedOrder as any).shippingFee || 0),
                        status: fetchedOrder.payment_status || (fetchedOrder as any).status || 'pending',
                        // SAFEGUARD: Ensure items is an array
                        items: (fetchedOrder.items || []).map((item: any) => ({
                            ...item,
                            name: item.product_id ? `Product ${item.product_id}` : (item.name || 'Unknown Product'),
                            quantity: item.quantity || 1,
                            price: item.unit_price || item.price || 0
                        }))
                    };

                    // Allow product name resolution if backend provides it deeply
                    if (fetchedOrder.items && fetchedOrder.items.length > 0) {
                        mappedOrder.items = fetchedOrder.items.map((item: any) => ({
                            ...item,
                            name: item.product?.name || item.name || `Product ${item.product_id}`,
                            image: item.product?.image || item.image,
                            price: item.unit_price || item.price || 0,
                            id: item.product_id || item.id,
                            deposit: Number(item.product?.deposit_amount || 0) // Capture deposit amount
                        }));
                    }

                    // Normalize status
                    if (mappedOrder.payment_status === 'cancelled') mappedOrder.status = 'cancelled';

                    setOrder(mappedOrder);
                } else {
                    setError("Order data invalid");
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
                setError("Failed to load order");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // State for Cancel Confirmation Modal
    const [showCancelModal, setShowCancelModal] = React.useState(false);

    const handleCancelOrder = () => {
        // Trigger the modal instead of window.confirm
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        try {
            await orderAPI.updateStatus(order.id, 'cancelled');

            const cancelledOrder = { ...order, status: 'cancelled' };
            setOrder(cancelledOrder);
            updateOrderStatus(order.id, 'cancelled');

            // Deduct points (1 point per 100 baht)
            const pointsToDeduct = Math.floor(order.totalAmount / 100);
            deductPoints(pointsToDeduct);

            // Remove items from purchased history
            const itemIds = order.items.map((item: any) => item.id);
            removePurchasedItems(itemIds);

            setShowCancelModal(false);
        } catch (error) {
            console.error("Failed to cancel order:", error);
            alert("Failed to cancel order on server. Please try again.");
        }
    };

    const handleConfirmDelivery = () => {
        if (!order) return;

        const confirmedOrder = { ...order, status: 'delivered' };
        setOrder(confirmedOrder);

        // In a real app, you would call an API here.
        // For now, we update local state to reflect the change immediately.
        // If possible, we should also update userOrders via Context, but let's stick to UI feedback first.
        alert(t('order_completed_thank_you')); // Simple feedback
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-main)' }}>
                <div className="spinner" style={{ marginBottom: '20px', fontSize: '2rem' }}>⏳</div>
                <h2>Loading Order...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff5722' }}>
                <h2>Error: {error}</h2>
                <button onClick={() => navigate('/profile')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Back</button>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)' }}>
                <h2>Order not found</h2>
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    const getStatusText = (status: string) => {
        return t(`status_${status}`);
    };

    // Tracking Stepper Component
    const TrackingStepper = ({ status }: { status: string }) => {
        // Extended steps to match the detailed timeline if needed, or stick to core steps
        const steps = ['pending', 'confirmed', 'shipped', 'delivered'];

        // Map status to index
        let currentStepIndex = steps.indexOf(status);
        if (currentStepIndex === -1) {
            if (status === 'arrived_th' || status === 'status_arrived_th') currentStepIndex = 1; // Treat as confirmed phase roughly, or adding granular steps? 
            // Ideally we should map 'arrived_th' to be after 'confirmed' but before 'shipped'.
            // For now, let's keep it simple or visual only. 
            // If we really want to match the reference image steps: 
            // 1. Pending 2. Payment 3. Verifying 4. In Thailand 5. Shipped 6. Delivered
            // But we don't have all those statuses explicitly in the standard flow.

            // Let's stick to the visual style update first with existing steps, 
            // but handle 'arrived_th' to show progress.
            if (status === 'status_arrived_th' || status === 'arrived_th') currentStepIndex = 2; // Visually between confirmed and shipped?
            else if (status === 'paid') currentStepIndex = 1;
        }

        // Fix for 'arrived_th' to show as better progress if we stick to 4 steps
        // Maybe we should render the specific steps if it's a preorder?
        // Let's stick to the standard 4 for consistency but style them 'Like the first image' (Orange & Numbers)

        const isCancelled = status === 'cancelled';

        if (isCancelled) return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#f44336', border: '1px solid #f44336', borderRadius: '10px', background: 'rgba(244, 67, 54, 0.1)' }}>
                <h3>Order Cancelled</h3>
            </div>
        );

        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '30px', marginBottom: '30px', position: 'relative' }}>
                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>

                            {/* Line connector */}
                            {index > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px', // Center with 40px circle
                                    left: '-50%',
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: isActive ? '#FF5722' : '#333',
                                    zIndex: -1,
                                    transition: 'background-color 0.3s ease'
                                }} />
                            )}

                            {/* Circle */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: isActive ? '#FF5722' : '#1a1a1a', // Orange or Dark bg
                                border: isActive ? '2px solid #FF5722' : '2px solid #555',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 0 15px rgba(255, 87, 34, 0.5)' : 'none'
                            }}>
                                {isCompleted ? '✓' : index + 1}
                            </div>

                            <div style={{
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 'bold' : 'normal',
                                color: isActive ? '#FF5722' : 'var(--text-muted)',
                                textAlign: 'center',
                                textTransform: 'capitalize'
                            }}>
                                {step === 'pending' ? 'Pending Approval' :
                                    step === 'confirmed' ? 'Payment / Confirmed' :
                                        step === 'shipped' ? 'Shipped' :
                                            step === 'delivered' ? 'Delivered' : step}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    {/* Production Timeline Section (Show ONLY if preorder) */ }
    const getProductionSteps = () => {
        const isConfirmed = order.status !== 'pending' && order.status !== 'cancelled';
        const isShipped = order.status === 'shipped' || order.status === 'delivered';
        const isDelivered = order.status === 'delivered';

        // Helper to format date or show placeholder
        const getDate = (condition: boolean, offsetDays: number = 0) => {
            if (!condition) return 'Upcoming';
            if (order.date) {
                const d = new Date(order.date);
                d.setDate(d.getDate() + offsetDays);
                return d.toISOString().split('T')[0];
            }
            return '-';
        };

        return [
            {
                step: 'shipping_to_th',
                label: t('shipping_to_thailand'),
                status: (isShipped || isDelivered) ? 'completed' : (isConfirmed ? 'in_progress' : 'upcoming'),
                date: getDate(isShipped, 20)
            },
            {
                step: 'arrived_th',
                label: t('arrived_in_thailand'),
                status: (isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isShipped, 25)
            },
            {
                step: 'domestic_shipping',
                label: t('start_domestic_shipping'),
                status: (isShipped || isDelivered) ? 'completed' : 'upcoming',
                date: getDate(isShipped, 27)
            }
        ];
    };

    const getProductionStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'in_progress': return '#FF9800';
            case 'upcoming': return '#2196F3';
            default: return '#666';
        }
    };

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '1000px',
            margin: '0 auto',
            minHeight: '80vh'
        }}>
            <button
                onClick={() => navigate('/profile')}
                style={{
                    marginBottom: '20px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                ← Back to Profile
            </button>

            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Order #{order.id}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Placed on {new Date(order.date).toLocaleDateString('en-GB')}</p>
                    </div>

                    {/* Right Side: Status and Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            backgroundColor: order.status === 'delivered' ? 'rgba(76, 175, 80, 0.1)' :
                                order.status === 'shipped' ? 'rgba(33, 150, 243, 0.1)' :
                                    order.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                            color: order.status === 'delivered' ? '#4CAF50' :
                                order.status === 'shipped' ? '#2196F3' :
                                    order.status === 'cancelled' ? '#f44336' : '#FFC107'
                        }}>
                            {getStatusText(order.status)}
                        </div>


                        {/* Cancel Button (Only if Pending or Pending Verification) */}
                        {['pending', 'pending_verification', 'PENDING'].includes(order.status) && (
                            <button
                                onClick={handleCancelOrder}
                                className="cancel-button"
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: '1px solid #f44336',
                                    color: '#f44336',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(244, 67, 54, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                <h3 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>Items</h3>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {(order.items || []).map((item: any, idx: number) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px'
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quantity: {item.quantity}</div>
                            </div>
                            <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                ฿{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--text-main)'
                }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        Shipping: ฿{(order.totalAmount - (order.items || []).reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0)).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        Total: ฿{order.totalAmount.toLocaleString()}
                    </div>
                </div>

                {/* Shipment Tracking Section */}
                {(order.status === 'shipped' || order.status === 'delivered') && order.carrier && order.trackingNumber && (
                    <div style={{
                        marginTop: '30px',
                        marginBottom: '10px',
                        padding: '20px',
                        background: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid #2196F3',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#2196F3', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🚚 Track Your Shipment
                        </h3>
                        <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Carrier:</span> <strong>{order.carrier}</strong>
                        </div>
                        <div style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)', letterSpacing: '1px', background: 'rgba(0,0,0,0.2)', padding: '10px 20px', borderRadius: '8px' }}>
                            {order.trackingNumber}
                        </div>
                        <a
                            href={getTrackingUrl(order.carrier, order.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '12px 24px',
                                background: '#2196F3',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                                marginBottom: order.status === 'shipped' ? '20px' : '0'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                            }}
                        >
                            Track on {order.carrier} Website →
                        </a>

                        {/* Confirm Delivery Button */}
                        {order.status === 'shipped' && (
                            <button
                                onClick={handleConfirmDelivery}
                                style={{
                                    padding: '12px 30px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '15px',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                Get it ! (Order Received)
                            </button>
                        )}
                    </div>
                )}

                {/* Pay Remaining Balance Section (For Pre-Orders Arrived in TH) */}
                {(order.status === 'arrived_th' || order.status === 'status_arrived_th') && (
                    <div style={{
                        marginTop: '30px',
                        marginBottom: '10px',
                        padding: '25px',
                        background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 152, 0, 0.1))',
                        border: '1px solid #FF5722',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            💰 Payment Required
                        </h3>
                        <p style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.1rem' }}>
                            Your pre-order items have arrived in Thailand! Please pay the remaining balance to proceed with domestic shipping.
                        </p>

                        {(() => {
                            // Calculate logic
                            const shippingFee = order.shippingFee || 0;
                            const preOrderItem = order.items.find((i: any) => i.type === 'preorder' || i.is_preorder) || order.items[0];

                            // Try to get from direct field first, then fallback to description parsing
                            let domesticShipping = Number(preOrderItem?.product?.domestic_shipping_cost) || 0;

                            if (domesticShipping === 0 && preOrderItem?.product?.description) {
                                const description = preOrderItem.product.description;
                                const shippingMatch = description.match(/Domestic Shipping:\s*([\d,.]+)/i);
                                if (shippingMatch) {
                                    domesticShipping = Number(shippingMatch[1].replace(/,/g, '')) || 0;
                                }
                            }

                            const payAllAmount = domesticShipping + shippingFee;
                            const payAlreadyAmount = 0;

                            const currentPayAmount = paymentOption === 'all' ? payAllAmount : payAlreadyAmount;

                            return (
                                <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>

                                    {/* Selection Options */}
                                    <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: '15px',
                                            padding: '15px', borderRadius: '10px',
                                            background: paymentOption === 'all' ? 'rgba(255,87,34,0.15)' : 'rgba(255,255,255,0.05)',
                                            border: paymentOption === 'all' ? '1px solid #FF5722' : '1px solid #444',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="radio"
                                                name="paymentOption"
                                                checked={paymentOption === 'all'}
                                                onChange={() => setPaymentOption('all')}
                                                style={{ accentColor: '#FF5722', transform: 'scale(1.2)' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Pay Domestic Shipping + shipping fee</span>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    Pay ฿{domesticShipping.toLocaleString()} (Balance) + ฿{shippingFee.toLocaleString()} (Shipping)
                                                </span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#FF5722', fontSize: '1.2rem' }}>
                                                ฿{payAllAmount.toLocaleString()}
                                            </div>
                                        </label>

                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: '15px',
                                            padding: '15px', borderRadius: '10px',
                                            background: paymentOption === 'shipping' ? 'rgba(255,87,34,0.15)' : 'rgba(255,255,255,0.05)',
                                            border: paymentOption === 'shipping' ? '1px solid #FF5722' : '1px solid #444',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="radio"
                                                name="paymentOption"
                                                checked={paymentOption === 'shipping'}
                                                onChange={() => setPaymentOption('shipping')}
                                                style={{ accentColor: '#FF5722', transform: 'scale(1.2)' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Pay Domestic Shipping Only</span>
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#FF5722', fontSize: '1.2rem' }}>
                                                ฿{payAlreadyAmount.toLocaleString()}
                                            </div>
                                        </label>
                                    </div>

                                    {/* Action Button */}
                                    <div style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => navigate('/checkout', {
                                                state: {
                                                    order: {
                                                        ...order,
                                                        totalAmount: currentPayAmount,
                                                        items: order.items.map((i: any) => ({
                                                            ...i,
                                                            // Visual Adjustment only for checkout display
                                                            price: paymentOption === 'all'
                                                                ? (i.id === preOrderItem.id || i.product_id === preOrderItem.product_id ? domesticShipping : 0)
                                                                : 0 // If shipping only, maybe item price 0? 
                                                        })),
                                                        isRemainingPayment: true,
                                                        paymentOption: paymentOption // Pass this if needed later
                                                    }
                                                }
                                            })}
                                            style={{
                                                padding: '15px 40px',
                                                width: '100%',
                                                background: '#FF5722',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            {paymentOption === 'all' ? 'Pay Full Amount' : 'Pay Shipping Fee'} (฿{currentPayAmount.toLocaleString()})
                                        </button>
                                    </div>

                                </div>
                            );
                        })()}
                    </div>
                )}

                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={confirmCancel}
                    title={t('confirm_cancel_title') || "Cancel Order"}
                    message={t('confirm_cancel_message') || "Are you sure you want to cancel this order? This action cannot be undone."}
                />

                <div style={{ margin: '40px 0' }}>
                    <TrackingStepper status={order.status} />
                </div>

                {/* Production Timeline Section (Show ONLY if preorder) */}
                {order.items && order.items.some((item: any) => item.type === 'preorder') && (
                    <div style={{
                        marginTop: '20px',
                        marginBottom: '40px',
                        padding: '30px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '15px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 30px 0', color: 'var(--text-main)' }}>🏭 Production Timeline</h3>
                        <div style={{ position: 'relative' }}>
                            {getProductionSteps().map((step, index) => (
                                <div key={step.step} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: index < getProductionSteps().length - 1 ? '30px' : '0'
                                }}>
                                    {/* Timeline Dot */}
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: getProductionStatusColor(step.status),
                                        border: step.status === 'in_progress' ? '3px solid #FF5722' : `3px solid ${getProductionStatusColor(step.status)}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        zIndex: 2,
                                        flexShrink: 0
                                    }}>
                                        {step.status === 'completed' && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                            </svg>
                                        )}
                                        {step.status === 'in_progress' && (
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                        )}
                                    </div>

                                    {/* Timeline Line */}
                                    {index < getProductionSteps().length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '14px',
                                            top: '28px',
                                            width: '2px', // Thin line
                                            height: '35px', // Adjusted height matches margin
                                            backgroundColor: step.status === 'completed' ? '#4CAF50' : '#333',
                                            transform: 'translateX(-50%)'
                                        }} />
                                    )}

                                    {/* Step Content */}
                                    <div style={{ marginLeft: '20px', flex: 1 }}>
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: step.status === 'completed' || step.status === 'in_progress' ? 'var(--text-main)' : 'var(--text-muted)',
                                            fontSize: '1rem'
                                        }}>
                                            {step.label}
                                        </div>
                                        <div style={{
                                            color: 'var(--text-muted)',
                                            fontSize: '0.9rem',
                                            marginTop: '5px'
                                        }}>
                                            {step.status === 'completed' ? `Completed: ${step.date}` :
                                                step.status === 'in_progress' ? `Target: ${step.date}` :
                                                    `Expected: ${step.date}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div >
    );
};

export default OrderDetail;
