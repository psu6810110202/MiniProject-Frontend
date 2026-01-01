import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface Staff {
    id: string;
    username: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'busy';
    lastSeen: string;
}

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isStaff: boolean;
}

interface ChatRoom {
    id: string;
    customerId: string;
    customerName: string;
    staffId: string;
    staffName: string;
    messages: ChatMessage[];
    status: 'active' | 'waiting' | 'closed';
    createdAt: string;
}

const StaffDashboard: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chats' | 'staff' | 'add'>('chats');
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
    const [message, setMessage] = useState('');
    const [staff, setStaff] = useState<Staff[]>([]);
    const [newStaff, setNewStaff] = useState({ username: '', password: '', name: '', role: 'support' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mock data for demo
        const mockStaff: Staff[] = [
            { id: '1', username: 'admin', name: 'Admin User', role: 'admin', status: 'online', lastSeen: new Date().toISOString() },
            { id: '2', username: 'john', name: 'John Support', role: 'support', status: 'online', lastSeen: new Date().toISOString() },
            { id: '3', username: 'sarah', name: 'Sarah Agent', role: 'support', status: 'busy', lastSeen: new Date(Date.now() - 30 * 60000).toISOString() }
        ];

        const mockChats: ChatRoom[] = [
            {
                id: '1',
                customerId: 'cust1',
                customerName: 'Alice Johnson',
                staffId: '2',
                staffName: 'John Support',
                messages: [
                    { id: '1', senderId: 'cust1', senderName: 'Alice Johnson', message: 'Hi, I need help with my order', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), isStaff: false },
                    { id: '2', senderId: '2', senderName: 'John Support', message: 'Hello! I\'d be happy to help you with your order. Can you provide your order number?', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), isStaff: true },
                ],
                status: 'active',
                createdAt: new Date(Date.now() - 15 * 60000).toISOString()
            },
            {
                id: '2',
                customerId: 'cust2',
                customerName: 'Bob Smith',
                staffId: '',
                staffName: '',
                messages: [
                    { id: '1', senderId: 'cust2', senderName: 'Bob Smith', message: 'Payment issue with order #12345', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), isStaff: false },
                ],
                status: 'waiting',
                createdAt: new Date(Date.now() - 5 * 60000).toISOString()
            }
        ];

        setStaff(mockStaff);
        setChatRooms(mockChats);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedChat) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: user?.id || 'staff',
            senderName: user?.name || 'Staff',
            message: message.trim(),
            timestamp: new Date().toISOString(),
            isStaff: true
        };

        const updatedChat = {
            ...selectedChat,
            messages: [...selectedChat.messages, newMessage],
            staffId: user?.id || 'staff',
            staffName: user?.name || 'Staff'
        };

        setSelectedChat(updatedChat);
        setChatRooms(prev => prev.map(chat =>
            chat.id === updatedChat.id ? updatedChat : chat
        ));
        setMessage('');
    };

    const handleAddStaff = () => {
        // Special logic: if username and password are both "callcenter", create staff account
        if (newStaff.username === 'callcenter' && newStaff.password === 'callcenter') {
            const staffMember: Staff = {
                id: Date.now().toString(),
                username: newStaff.username,
                name: newStaff.name || 'Call Center Staff',
                role: newStaff.role,
                status: 'online',
                lastSeen: new Date().toISOString()
            };

            setStaff(prev => [...prev, staffMember]);
            setNewStaff({ username: '', password: '', name: '', role: 'support' });
            alert('Staff account created successfully!');
        } else {
            alert('Invalid credentials. Please use "callcenter" for both username and password.');
        }
    };

    const handleSelectChat = (chat: ChatRoom) => {
        setSelectedChat(chat);
        if (chat.status === 'waiting' && user) {
            const updatedChat = {
                ...chat,
                status: 'active' as const,
                staffId: user.id,
                staffName: user.name || 'Staff'
            };
            setSelectedChat(updatedChat);
            setChatRooms(prev => prev.map(c => c.id === chat.id ? updatedChat : c));
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div style={{
                padding: '40px 20px',
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <h2>{t('access_denied')}</h2>
                <p>{t('admin_only')}</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
            color: '#fff'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{t('staff_dashboard')}</h1>
                    <p style={{ color: '#aaa', fontSize: '1.1rem' }}>{t('staff_dashboard_desc')}</p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    borderBottom: '2px solid #333',
                    paddingBottom: '0'
                }}>
                    {[
                        { id: 'chats', label: t('chat_rooms') },
                        { id: 'staff', label: t('staff_members') },
                        { id: 'add', label: t('add_staff') }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '15px 25px',
                                background: activeTab === tab.id ? '#FF5722' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : '#aaa',
                                border: 'none',
                                borderRadius: '10px 10px 0 0',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    background: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '30px',
                    border: '1px solid #333',
                    minHeight: '600px'
                }}>
                    {activeTab === 'chats' && (
                        <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
                            {/* Chat List */}
                            <div style={{ flex: '0 0 350px', borderRight: '1px solid #333', paddingRight: '20px' }}>
                                <h3 style={{ marginBottom: '20px' }}>{t('active_chats')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {chatRooms.map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => handleSelectChat(chat)}
                                            style={{
                                                padding: '15px',
                                                background: selectedChat?.id === chat.id ? '#252525' : '#333',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: '1px solid #444',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, color: '#fff' }}>{chat.customerName}</h4>
                                                    <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                                                        {chat.status === 'waiting' ? t('waiting_for_staff') :
                                                            chat.staffName ? `${t('chatting_with')} ${chat.staffName}` :
                                                                t('no_staff_assigned')}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: chat.status === 'active' ? '#4CAF50' : '#FF9800'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Window */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {selectedChat ? (
                                    <>
                                        <div style={{
                                            padding: '15px',
                                            background: '#252525',
                                            borderRadius: '8px 8px 0 0',
                                            border: '1px solid #333',
                                            borderBottom: 'none'
                                        }}>
                                            <h3 style={{ margin: 0, color: '#fff' }}>{selectedChat.customerName}</h3>
                                            <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                                                {selectedChat.status === 'waiting' ? t('waiting_for_staff') :
                                                    selectedChat.staffName ? `${t('chatting_with')} ${selectedChat.staffName}` :
                                                        t('no_staff_assigned')}
                                            </p>
                                        </div>

                                        <div style={{
                                            flex: 1,
                                            padding: '20px',
                                            background: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderTop: 'none',
                                            borderBottom: 'none',
                                            overflowY: 'auto'
                                        }}>
                                            {selectedChat.messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: msg.isStaff ? 'flex-end' : 'flex-start',
                                                        marginBottom: '15px'
                                                    }}
                                                >
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        padding: '12px 16px',
                                                        borderRadius: '18px',
                                                        background: msg.isStaff ? '#FF5722' : '#333',
                                                        color: '#fff'
                                                    }}>
                                                        <div style={{ marginBottom: '5px' }}>{msg.message}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#ccc', textAlign: 'right' }}>
                                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div style={{
                                            padding: '15px',
                                            background: '#252525',
                                            borderRadius: '0 0 8px 8px',
                                            border: '1px solid #333',
                                            borderTop: 'none',
                                            display: 'flex',
                                            gap: '10px'
                                        }}>
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder={t('type_message')}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid #444',
                                                    background: '#333',
                                                    color: '#fff',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: '#FF5722',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {t('send')}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: '#aaa'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <p>{t('select_chat')}</p>
                                            <p style={{ fontSize: '0.9rem' }}>{t('select_chat_desc')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div>
                            <h3 style={{ marginBottom: '20px' }}>{t('staff_members')}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {staff.map(member => (
                                    <div
                                        key={member.id}
                                        style={{
                                            padding: '20px',
                                            background: '#252525',
                                            borderRadius: '10px',
                                            border: '1px solid #333'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                            <div>
                                                <h4 style={{ margin: 0, color: '#fff' }}>{member.name}</h4>
                                                <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                                                    @{member.username} • {member.role}
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: member.status === 'online' ? '#4CAF50' :
                                                    member.status === 'busy' ? '#FF9800' : '#9E9E9E'
                                            }} />
                                        </div>
                                        <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                                            <p>{t('last_seen')}: {new Date(member.lastSeen).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div>
                            <h3 style={{ marginBottom: '20px' }}>{t('add_staff_member')}</h3>
                            <div style={{ maxWidth: '400px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>
                                            {t('username')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newStaff.username}
                                            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                background: '#333',
                                                color: '#fff'
                                            }}
                                            placeholder="Enter username"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>
                                            {t('password')}
                                        </label>
                                        <input
                                            type="password"
                                            value={newStaff.password}
                                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                background: '#333',
                                                color: '#fff'
                                            }}
                                            placeholder="Enter password"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>
                                            {t('full_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={newStaff.name}
                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                background: '#333',
                                                color: '#fff'
                                            }}
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>
                                            {t('role')}
                                        </label>
                                        <select
                                            value={newStaff.role}
                                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                background: '#333',
                                                color: '#fff'
                                            }}
                                        >
                                            <option value="support">{t('support_staff')}</option>
                                            <option value="admin">{t('admin')}</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleAddStaff}
                                        style={{
                                            padding: '12px 20px',
                                            background: '#FF5722',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {t('add_staff')}
                                    </button>
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    padding: '15px',
                                    background: 'rgba(255, 87, 34, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid #FF5722'
                                }}>
                                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                                        <strong>Hint:</strong> Use "callcenter" for both username and password to create a staff account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
