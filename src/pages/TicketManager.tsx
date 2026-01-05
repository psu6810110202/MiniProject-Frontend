import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    message: string;
    userName: string;
    userEmail: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    adminResponse?: string;
}

const TicketManager: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [responseText, setResponseText] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/profile');
        }
        loadTickets();
    }, [role, navigate]);

    const loadTickets = () => {
        const mockTickets: Ticket[] = [
            {
                id: 'TKT001',
                subject: 'สินค้าที่สั่งซื้อไม่ถูกต้อง',
                category: 'product',
                priority: 'high',
                status: 'open',
                message: 'ผมได้สั่งซื้อสินค้า Hazbin Hotel Figure แต่ได้รับสินค้าที่เป็น Undertale Figure แทน ขอความช่วยเหลือด้วยครับ',
                userName: 'สมชาย ใจดี',
                userEmail: 'somchai@email.com',
                userId: 'user123',
                createdAt: '2025-01-05T10:30:00Z',
                updatedAt: '2025-01-05T10:30:00Z'
            },
            {
                id: 'TKT002',
                subject: 'การจัดส่งล่าช้า',
                category: 'shipping',
                priority: 'medium',
                status: 'in_progress',
                message: 'สั่งซื้อสินค้าไปแล้ว 5 วันแต่ยังไม่ได้รับสินค้า ต้องการทราบสถานะการจัดส่ง',
                userName: 'มานี รักดี',
                userEmail: 'manee@email.com',
                userId: 'user456',
                createdAt: '2025-01-04T14:20:00Z',
                updatedAt: '2025-01-05T09:15:00Z',
                adminResponse: 'เราได้ตรวจสอบสถานะการจัดส่งแล้ว สินค้าอยู่ระหว่างการจัดส่งครับ'
            },
            {
                id: 'TKT003',
                subject: 'ปัญหาการชำระเงิน',
                category: 'payment',
                priority: 'urgent',
                status: 'resolved',
                message: 'ชำระเงินแล้วแต่ระบบแสดงสถานะว่ายังไม่ชำระเงิน',
                userName: 'วิชัย มั่นคง',
                userEmail: 'wichai@email.com',
                userId: 'user789',
                createdAt: '2025-01-03T16:45:00Z',
                updatedAt: '2025-01-04T11:30:00Z',
                adminResponse: 'ได้ตรวจสอบและอัพเดทสถานะการชำระเงินเรียบร้อยแล้วครับ'
            }
        ];

        const storedTickets = localStorage.getItem('admin_tickets');
        if (storedTickets) {
            setTickets(JSON.parse(storedTickets));
        } else {
            setTickets(mockTickets);
            localStorage.setItem('admin_tickets', JSON.stringify(mockTickets));
        }
    };

    const updateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
        const updatedTickets = tickets.map(ticket => 
            ticket.id === ticketId 
                ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
                : ticket
        );
        setTickets(updatedTickets);
        localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
    };

    const addAdminResponse = () => {
        if (!selectedTicket || !responseText.trim()) return;

        const updatedTickets = tickets.map(ticket => 
            ticket.id === selectedTicket.id 
                ? { 
                    ...ticket, 
                    adminResponse: responseText,
                    status: 'in_progress' as Ticket['status'],
                    updatedAt: new Date().toISOString()
                }
                : ticket
        );
        
        setTickets(updatedTickets);
        localStorage.setItem('admin_tickets', JSON.stringify(updatedTickets));
        setSelectedTicket({ ...selectedTicket, adminResponse: responseText, status: 'in_progress' });
        setResponseText('');
        alert('ตอบกลับ Ticket เรียบร้อยแล้ว');
    };

    const getFilteredTickets = () => {
        return tickets.filter(ticket => {
            const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
            const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
            return statusMatch && priorityMatch;
        });
    };

    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'open': return '#FF5722';
            case 'in_progress': return '#FFC107';
            case 'resolved': return '#4CAF50';
            case 'closed': return '#9E9E9E';
            default: return '#666';
        }
    };

    const getPriorityColor = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'urgent': return '#F44336';
            case 'high': return '#FF5722';
            case 'medium': return '#FFC107';
            case 'low': return '#4CAF50';
            default: return '#666';
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'general': 'ทั่วไป',
            'shipping': 'การจัดส่ง',
            'payment': 'การชำระเงิน',
            'product': 'สินค้า',
            'account': 'บัญชีผู้ใช้'
        };
        return labels[category] || category;
    };

    const getStatusLabel = (status: Ticket['status']) => {
        const labels: Record<string, string> = {
            'open': 'เปิด',
            'in_progress': 'ดำเนินการ',
            'resolved': 'แก้ไขแล้ว',
            'closed': 'ปิด'
        };
        return labels[status] || status;
    };

    const getPriorityLabel = (priority: Ticket['priority']) => {
        const labels: Record<string, string> = {
            'urgent': 'เร่งด่วน',
            'high': 'สูง',
            'medium': 'ปานกลาง',
            'low': 'ต่ำ'
        };
        return labels[priority] || priority;
    };

    if (role !== 'admin') return null;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile')}
                style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
                ← Back to Profile
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                    Ticket Management 🎫
                </h1>
                <div style={{ color: '#888' }}>
                    Total Tickets: {getFilteredTickets().length}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>สถานะ</label>
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
                        <option value="all">ทั้งหมด</option>
                        <option value="open">เปิด</option>
                        <option value="in_progress">ดำเนินการ</option>
                        <option value="resolved">แก้ไขแล้ว</option>
                        <option value="closed">ปิด</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>ความสำคัญ</label>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={{
                            padding: '10px',
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="urgent">เร่งด่วน</option>
                        <option value="high">สูง</option>
                        <option value="medium">ปานกลาง</option>
                        <option value="low">ต่ำ</option>
                    </select>
                </div>
            </div>

            {/* Tickets Table */}
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '15px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', background: 'rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Ticket ID</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>หัวข้อ</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>ผู้ใช้</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>หมวดหมู่</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>ความสำคัญ</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>สถานะ</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>วันที่</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredTickets().map(ticket => (
                            <tr key={ticket.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#FF5722' }}>{ticket.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{ticket.subject}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {ticket.message}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{ticket.userName}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{ticket.userEmail}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#333',
                                        color: '#aaa',
                                        fontSize: '0.8rem'
                                    }}>
                                        {getCategoryLabel(ticket.category)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getPriorityColor(ticket.priority),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getPriorityLabel(ticket.priority)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getStatusColor(ticket.status),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {new Date(ticket.createdAt).toLocaleDateString('th-TH')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {new Date(ticket.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => setSelectedTicket(ticket)}
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
                                        ดูรายละเอียด
                                    </button>
                                    {ticket.status !== 'closed' && (
                                        <button
                                            onClick={() => updateTicketStatus(ticket.id, 'closed')}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#666',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ปิด
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {getFilteredTickets().length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        ไม่พบ Ticket ที่ตรงกับเงื่อนไข
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
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
                            <h2 style={{ margin: 0 }}>Ticket Details: {selectedTicket.id}</h2>
                            <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: '#888' }}>หัวข้อ:</span>
                                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{selectedTicket.subject}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>สถานะ:</span>
                                    <span style={{ 
                                        marginLeft: '10px', 
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getStatusColor(selectedTicket.status),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusLabel(selectedTicket.status)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: '#888' }}>ผู้ใช้:</span>
                                    <span style={{ marginLeft: '10px' }}>{selectedTicket.userName} ({selectedTicket.userEmail})</span>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>ความสำคัญ:</span>
                                    <span style={{ 
                                        marginLeft: '10px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: getPriorityColor(selectedTicket.priority),
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {getPriorityLabel(selectedTicket.priority)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#888' }}>วันที่สร้าง:</span>
                                <span style={{ marginLeft: '10px' }}>
                                    {new Date(selectedTicket.createdAt).toLocaleString('th-TH')}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#FF5722' }}>ข้อความจากผู้ใช้:</h4>
                            <div style={{
                                background: '#2a2a2a',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #333'
                            }}>
                                {selectedTicket.message}
                            </div>
                        </div>

                        {selectedTicket.adminResponse && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '10px', color: '#4CAF50' }}>การตอบกลับจาก Admin:</h4>
                                <div style={{
                                    background: '#2a2a2a',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #4CAF50'
                                }}>
                                    {selectedTicket.adminResponse}
                                </div>
                            </div>
                        )}

                        {selectedTicket.status !== 'closed' && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '10px' }}>ตอบกลับ Ticket:</h4>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="พิมพ์การตอบกลับที่นี่..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#2a2a2a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        minHeight: '100px',
                                        resize: 'vertical',
                                        marginBottom: '10px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={addAdminResponse}
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
                                        ส่งการตอบกลับ
                                    </button>
                                    <button
                                        onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
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
                                        ทำเครื่องหมายว่าแก้ไขแล้ว
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketManager;
