import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const CreateTicket: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
    });

    const handleCreateTicket = () => {
        if (!newTicket.subject || !newTicket.message) {
            alert(t('please_fill_required_fields'));
            return;
        }
        // Mock ticket creation
        alert(t('ticket_created_successfully'));
        setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' });
        navigate('/call-center');
    };

    return (
        <div style={{
            padding: '40px 20px',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
            color: '#fff'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/call-center')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FF5722',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    ← {t('back_to_help_center')}
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#fff' }}>{t('create_new_ticket')}</h1>

                <div style={{
                    background: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '30px',
                    border: '1px solid #333'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                                {t('ticket_subject')} *
                            </label>
                            <input
                                type="text"
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #444',
                                    background: '#333',
                                    color: '#fff',
                                    fontSize: '1rem'
                                }}
                                placeholder={t('ticket_subject_placeholder')}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                                    {t('ticket_category_field')}
                                </label>
                                <select
                                    value={newTicket.category}
                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                        background: '#333',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="general">{t('general')}</option>
                                    <option value="shipping">{t('shipping')}</option>
                                    <option value="payment">{t('payment')}</option>
                                    <option value="product">{t('product')}</option>
                                    <option value="account">{t('account')}</option>
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                                    {t('ticket_priority_field')}
                                </label>
                                <select
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #444',
                                        background: '#333',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="low">{t('low')}</option>
                                    <option value="medium">{t('medium')}</option>
                                    <option value="high">{t('high')}</option>
                                    <option value="urgent">{t('urgent')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                                {t('ticket_message_field')} *
                            </label>
                            <textarea
                                value={newTicket.message}
                                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #444',
                                    background: '#333',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    minHeight: '150px',
                                    resize: 'vertical'
                                }}
                                placeholder={t('ticket_message_placeholder')}
                            />
                        </div>

                        <button
                            onClick={handleCreateTicket}
                            style={{
                                padding: '15px 30px',
                                background: '#FF5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {t('submit_ticket')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;
