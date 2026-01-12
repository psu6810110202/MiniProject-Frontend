import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CustomRequest {
    id: string;
    productName: string;
    link: string;
    details: string;
    region: 'US' | 'JP' | 'CN' | 'KR';
    price: number;
    quantity: number;
    estimatedTotal: number;
    status: 'pending' | 'payment_pending' | 'payment_verification' | 'paid' | 'ordered' | 'arrived_th' | 'shipping' | 'completed' | 'rejected' | 'approved';
    userName: string;
    userEmail: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    adminNotes?: string;
    preorderId?: string;
    shippingCost?: number;
    paymentSlip?: string;
    paymentDate?: string;
    paymentTime?: string;
    shippingAddress?: string;
    trackingNumber?: string;
}

const CustomRequestManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    // Removed unused useProducts call entirely
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRegion, setFilterRegion] = useState<string>('all');
    const [shippingCostInput, setShippingCostInput] = useState<string>('');
    const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/admin');
        }
        loadRequests();
    }, [role, navigate]);

    const loadRequests = () => {
        const storedRequests = localStorage.getItem('custom_requests');
        if (storedRequests) {
            setRequests(JSON.parse(storedRequests));
        } else {
            setRequests([]);
        }
    };

    const updateRequestStatus = (requestId: string, newStatus: CustomRequest['status'], notes?: string, extraFields?: Partial<CustomRequest>) => {
        const updatedRequests = requests.map(request =>
            request.id === requestId
                ? {
                    ...request,
                    ...extraFields,
                    status: newStatus,
                    adminNotes: notes || request.adminNotes,
                    updatedAt: new Date().toISOString()
                }
                : request
        );
        setRequests(updatedRequests);
        localStorage.setItem('custom_requests', JSON.stringify(updatedRequests));

        if (selectedRequest && selectedRequest.id === requestId) {
            setSelectedRequest({
                ...selectedRequest,
                ...extraFields,
                status: newStatus,
                adminNotes: notes || selectedRequest.adminNotes
            });
        }
    };

    const addAdminNotes = () => {
        if (!selectedRequest || !adminNotes.trim()) return;

        updateRequestStatus(selectedRequest.id, selectedRequest.status, adminNotes);
        setAdminNotes('');
        alert('บันทึกหมายเหตุเรียบร้อยแล้ว');
    };

    const handleConfirmOrder = (request: CustomRequest) => {
        // Update request status to "ordered" without creating a PreOrder item
        updateRequestStatus(request.id, 'ordered', 'Admin confirmed order.');

        // Alert user
        alert(`Confirmed Order for Request #${request.id}`);

        // Close modal or refresh (optional, but updateRequestStatus updates state)
        setSelectedRequest(prev => prev ? { ...prev, status: 'ordered' } : null);
    };

    const getFilteredRequests = () => {
        return requests.filter(request => {
            const statusMatch = filterStatus === 'all' || request.status === filterStatus;
            const regionMatch = filterRegion === 'all' || request.region === filterRegion;
            return statusMatch && regionMatch;
        });
    };

    const getStatusColor = (status: CustomRequest['status']) => {
        switch (status) {
            case 'pending': return '#FFC107'; // Amber
            case 'approved':
            case 'payment_pending': return '#FF9800'; // Orange
            case 'payment_verification': return '#2196F3'; // Blue
            case 'paid':
            case 'ordered': return '#4CAF50'; // Green
            case 'arrived_th': return '#9C27B0'; // Purple
            case 'shipping': return '#00BCD4'; // Cyan
            case 'completed': return '#8BC34A'; // Light Green
            case 'rejected': return '#F44336'; // Red
            default: return '#666';
        }
    };

    const getRegionLabel = (region: string) => {
        const labels: Record<string, string> = {
            'US': 'USA (🇺🇸)',
            'JP': 'Japan (🇯🇵)',
            'CN': 'China (🇨🇳)',
            'KR': 'Korea (🇰🇷)'
        };
        return labels[region] || region;
    };

    const getStatusLabel = (status: CustomRequest['status']) => {
        const labels: Record<string, string> = {
            'pending': 'รอดำเนินการ',
            'approved': 'อนุมัติ (Old)',
            'payment_pending': 'รอชำระเงิน',
            'payment_verification': 'ตรวจสอบสลิป',
            'paid': 'ชำระแล้ว',
            'ordered': 'สั่งซื้อแล้ว',
            'arrived_th': 'ถึงไทยแล้ว',
            'shipping': 'กำลังจัดส่ง',
            'completed': 'เสร็จสิ้น',
            'rejected': 'ปฏิเสธ'
        };
        return labels[status] || status;
    };

    if (role !== 'admin') return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                ← Back to Admin
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                    Custom Request Management 🛍️
                </h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ color: '#888' }}>
                        Total Requests: {getFilteredRequests().length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '10px',
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="ordered">Ordered</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Region</label>
                    <select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        style={{
                            padding: '10px',
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="all">All</option>
                        <option value="US">USA</option>
                        <option value="JP">Japan</option>
                        <option value="CN">China</option>
                        <option value="KR">Korea</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '15px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Request ID</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Region</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Estimated Price</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredRequests().map(request => (
                            <tr key={request.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#FF5722' }}>{request.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{request.productName}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {request.link}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{request.userName}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{request.userEmail}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#333',
                                        color: '#aaa',
                                        fontSize: '0.8rem'
                                    }}>
                                        {getRegionLabel(request.region)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>฿{request.estimatedTotal.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {request.quantity}x {request.price.toLocaleString()} {request.region}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getStatusColor(request.status),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusLabel(request.status)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {new Date(request.createdAt).toLocaleDateString('th-TH')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {new Date(request.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => setSelectedRequest(request)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            marginRight: '5px'
                                        }}
                                    >
                                        View Details
                                    </button>
                                    {request.status === 'approved' && (
                                        <button
                                            onClick={() => handleConfirmOrder(request)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Create PreOrder: {request.productName}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {getFilteredRequests().length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        No requests found matching the criteria
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '20px'
                }}>
                    <div style={{
                        background: '#1a1a1a', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '800px',
                        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #FF5722'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Request Details: {selectedRequest.id}</h2>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: '#888' }}>ชื่อสินค้า:</span>
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{selectedRequest.productName}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>สถานะ:</span>
                                    <span style={{
                                        marginLeft: '10px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getStatusColor(selectedRequest.status),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusLabel(selectedRequest.status)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: '#888' }}>ผู้ใช้:</span>
                                    <span style={{ marginLeft: '10px' }}>{selectedRequest.userName} ({selectedRequest.userEmail})</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>ภูมิภาค:</span>
                                    <span style={{ marginLeft: '10px' }}>{getRegionLabel(selectedRequest.region)}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#888' }}>ลิงก์สินค้า:</span>
                                <div style={{ marginTop: '5px' }}>
                                    <a
                                        href={selectedRequest.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#2196F3', textDecoration: 'none' }}
                                    >
                                        {selectedRequest.link}
                                    </a>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#888' }}>รายละเอียด:</span>
                                <div style={{
                                    marginTop: '5px',
                                    padding: '10px',
                                    background: '#2a2a2a',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}>
                                    {selectedRequest.details || '-'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: '#888' }}>ราคาต้นทาง:</span>
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                        {selectedRequest.price.toLocaleString()} {selectedRequest.region}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>จำนวน:</span>
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{selectedRequest.quantity}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>ราคาประเมิน:</span>
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#4CAF50' }}>
                                        ฿{selectedRequest.estimatedTotal.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#888' }}>วันที่สร้าง:</span>
                                <span style={{ marginLeft: '10px' }}>
                                    {new Date(selectedRequest.createdAt).toLocaleString('th-TH')}
                                </span>
                            </div>
                        </div>

                        {selectedRequest.adminNotes && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '10px', color: '#FF5722' }}>หมายเหตุจาก Admin:</h4>
                                <div style={{
                                    background: '#2a2a2a',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #FF5722'
                                }}>
                                    {selectedRequest.adminNotes}
                                </div>
                            </div>
                        )}

                        {selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed' && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '10px' }}>จัดการคำขอ:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    {/* 1. Pending -> Approved/Payment Pending */}
                                    {selectedRequest.status === 'pending' && (
                                        <div style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', marginBottom: '5px' }}>ค่าส่ง (Shipping Cost):</label>
                                                <input
                                                    type="number"
                                                    placeholder="ระบุค่าส่ง (บาท) หรือ 0"
                                                    value={shippingCostInput}
                                                    onChange={(e) => setShippingCostInput(e.target.value)}
                                                    style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => {
                                                        const cost = parseFloat(shippingCostInput || '0');
                                                        updateRequestStatus(selectedRequest.id, 'payment_pending', undefined, { shippingCost: cost });
                                                        setShippingCostInput('');
                                                        alert('อนุมัติและแจ้งชำระเงินเรียบร้อย');
                                                    }}
                                                    style={{ padding: '10px 20px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    อนุมัติ & แจ้งชำระเงิน
                                                </button>
                                                <button
                                                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                                                    style={{ padding: '10px 20px', background: '#F44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ปฏิเสธ
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Payment Pending (Waiting for User) */}
                                    {selectedRequest.status === 'payment_pending' && (
                                        <div style={{ color: '#aaa', fontStyle: 'italic' }}>
                                            รอลูกค้าชำระเงิน (ยอดรวม: ฿{((selectedRequest.estimatedTotal || 0) + (selectedRequest.shippingCost || 0)).toLocaleString()})
                                        </div>
                                    )}

                                    {/* 3. Payment Verification */}
                                    {selectedRequest.status === 'payment_verification' && (
                                        <div style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>ตรวจสอบการชำระเงิน</h4>
                                            <div style={{ marginBottom: '10px' }}>
                                                <strong>วันที่:</strong> {selectedRequest.paymentDate} {selectedRequest.paymentTime}
                                            </div>
                                            <div style={{ marginBottom: '10px' }}>
                                                <strong>ที่อยู่จัดส่ง:</strong><br />
                                                {selectedRequest.shippingAddress}
                                            </div>
                                            {selectedRequest.paymentSlip && (
                                                <div style={{ marginBottom: '15px' }}>
                                                    <strong>สลิปโอนเงิน:</strong>
                                                    <div style={{ marginTop: '5px' }}>
                                                        <a href={selectedRequest.paymentSlip} target="_blank" rel="noopener noreferrer">
                                                            <img src={selectedRequest.paymentSlip} alt="Slip" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #555' }} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => {
                                                        // Auto create PreOrder logic could go here, or just simple status update first
                                                        handleConfirmOrder(selectedRequest);
                                                        // Note: handleConfirmOrder sets status to 'ordered' automatically
                                                    }}
                                                    style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ยืนยันยอด & สั่งซื้อ (Confirm Order)
                                                </button>
                                                <button
                                                    onClick={() => updateRequestStatus(selectedRequest.id, 'payment_pending', 'Slip rejected, please re-upload')}
                                                    style={{ padding: '10px 20px', background: '#F44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    สลิปไม่ถูกต้อง (Reject Slip)
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Tracking Updates */}
                                    {(selectedRequest.status === 'ordered' || selectedRequest.status === 'arrived_th' || selectedRequest.status === 'shipping') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {selectedRequest.status !== 'shipping' && (
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {selectedRequest.status !== 'arrived_th' && (
                                                        <button
                                                            onClick={() => updateRequestStatus(selectedRequest.id, 'arrived_th')}
                                                            style={{ padding: '8px 16px', background: '#9C27B0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                        >
                                                            สินค้าถึงไทย (Arrived TH)
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => updateRequestStatus(selectedRequest.id, 'shipping')}
                                                        style={{ padding: '8px 16px', background: '#00BCD4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                    >
                                                        กำลังจัดส่ง (Shipping)
                                                    </button>
                                                </div>
                                            )}

                                            {selectedRequest.status === 'shipping' && (
                                                <div style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <label style={{ display: 'block', marginBottom: '5px' }}>Tracking Number / Postal Code:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter tracking number..."
                                                            value={trackingNumberInput}
                                                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                                                            style={{ width: '100%', padding: '10px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (!trackingNumberInput.trim()) {
                                                                alert('Please enter a tracking number');
                                                                return;
                                                            }
                                                            // Update tracking number but keep status as 'shipping'
                                                            updateRequestStatus(selectedRequest.id, 'shipping', undefined, { trackingNumber: trackingNumberInput });

                                                            alert('บันทึกเลขพัสดุเรียบร้อย (Tracking Saved)!');
                                                        }}
                                                        style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        บันทึกเลขพัสดุ (Save Tracking)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px' }}>เพิ่มหมายเหตุ:</h4>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="พิมพ์หมายเหตุสำหรับคำขอนี้..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    marginBottom: '10px'
                                }}
                            />
                            <button
                                onClick={addAdminNotes}
                                style={{
                                    padding: '10px 20px',
                                    background: '#FF5722',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                บันทึกหมายเหตุ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomRequestManager;
