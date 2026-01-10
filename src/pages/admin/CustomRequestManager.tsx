import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';
import type { PreOrderItem } from '../../types';

interface CustomRequest {
    id: string;
    productName: string;
    link: string;
    details: string;
    region: 'US' | 'JP' | 'CN' | 'KR';
    price: number;
    quantity: number;
    estimatedTotal: number;
    status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'completed';
    userName: string;
    userEmail: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    adminNotes?: string;
    preorderId?: string;
}

const CustomRequestManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const { preOrders, addPreOrder } = useProducts();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRegion, setFilterRegion] = useState<string>('all');

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

    const updateRequestStatus = (requestId: string, newStatus: CustomRequest['status'], notes?: string) => {
        const updatedRequests = requests.map(request =>
            request.id === requestId
                ? {
                    ...request,
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

    const createPreorderFromRequest = (request: CustomRequest) => {
        // Generate new PreOrder ID
        const currentMaxId = preOrders.length > 0 ? Math.max(...preOrders.map(item => item.id)) : 0;
        const newPreorderId = currentMaxId + 1;

        // Calculate deposit (20% of total price)
        const depositAmount = Math.round(request.estimatedTotal * 0.2);

        // Create new PreOrder item from request
        const newPreorderItem: PreOrderItem = {
            id: newPreorderId,
            name: request.productName,
            price: request.estimatedTotal,
            deposit: depositAmount,
            preOrderCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
            image: 'http://localhost:3000/images/covers/custom-request.webp',
            description: `Custom request from ${request.userName}. Details: ${request.details}. Original link: ${request.link}`,
            fandom: 'Custom Request',
            category: 'Other'
        };

        // Add to Context (API + State)
        addPreOrder(newPreorderItem);

        // Update request status to "ordered" with preorder ID
        updateRequestStatus(request.id, 'ordered', `สร้าง PreOrder ID: ${newPreorderId}`);

        alert(`สร้าง PreOrder สำเร็จแล้ว! PreOrder ID: ${newPreorderId}`);

        // Navigate to PreOrder Manager to see the new preorder
        navigate('/admin/preorders');
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
            case 'pending': return '#FFC107';
            case 'approved': return '#4CAF50';
            case 'rejected': return '#F44336';
            case 'ordered': return '#2196F3';
            case 'completed': return '#9C27B0';
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
            'approved': 'อนุมัติ',
            'rejected': 'ปฏิเสธ',
            'ordered': 'สั่งซื้อแล้ว',
            'completed': 'เสร็จสิ้น'
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
                                            onClick={() => createPreorderFromRequest(request)}
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
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    {selectedRequest.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                อนุมัติ
                                            </button>
                                            <button
                                                onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: '#F44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ปฏิเสธ
                                            </button>
                                        </>
                                    )}
                                    {selectedRequest.status === 'approved' && (
                                        <button
                                            onClick={() => createPreorderFromRequest(selectedRequest)}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#2196F3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            สร้าง PreOrder: {selectedRequest.productName}
                                        </button>
                                    )}
                                    {selectedRequest.status === 'ordered' && (
                                        <button
                                            onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#9C27B0',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            เสร็จสิ้น
                                        </button>
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
