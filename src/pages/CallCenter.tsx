import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface CallCenterProps {
  initialTab?: 'tickets' | 'faq';
}

const CallCenter: React.FC<CallCenterProps> = ({ initialTab = 'tickets' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>(initialTab);

  // Mock data for tickets
  const [tickets] = useState([
    {
      id: 'TKT-001',
      subject: t('order_not_received'),
      category: t('shipping'),
      priority: t('high'),
      status: t('open'),
      messages: 3,
      created: '2024-01-15',
      lastUpdated: '2024-01-16'
    },
    {
      id: 'TKT-002',
      subject: t('payment_issue'),
      category: t('payment'),
      priority: t('medium'),
      status: t('in_progress'),
      messages: 5,
      created: '2024-01-14',
      lastUpdated: '2024-01-15'
    }
  ]);



  const getStatusColor = (status: string) => {
    switch (status) {
      case t('open'): return '#4CAF50';
      case t('in_progress'): return '#FF9800';
      case t('resolved'): return '#2196F3';
      case t('closed'): return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case t('low'): return '#4CAF50';
      case t('medium'): return '#FF9800';
      case t('high'): return '#F44336';
      case t('urgent'): return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const faqData = [
    {
      question: t('faq_track_order_question'),
      answer: t('faq_track_order_answer')
    },
    {
      question: t('faq_return_policy_question'),
      answer: t('faq_return_policy_answer')
    },
    {
      question: t('faq_preorder_question'),
      answer: t('faq_preorder_answer')
    },
    {
      question: t('faq_contact_support_question'),
      answer: t('faq_contact_support_answer')
    }
  ];

  return (
    <div style={{
      padding: '40px 20px',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #121212, #1f1f1f)',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>
            {t('help_center')}
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
            {t('help_center_desc')}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/call-center/new-ticket')}
            style={{
              padding: '15px 30px',
              background: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)'
            }}
          >
            🎫 {t('create_ticket')}
          </button>
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
            { id: 'tickets', label: t('my_tickets') },
            { id: 'faq', label: t('faq') }
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
                transition: 'all 0.3s',
                borderBottom: activeTab === tab.id ? '2px solid #FF5722' : '2px solid transparent'
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
          border: '1px solid #333'
        }}>
          {activeTab === 'tickets' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: '#fff' }}>{t('my_tickets')}</h2>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                  <p>{t('no_tickets_found')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      style={{
                        background: '#252525',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid #333',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                            {ticket.subject}
                          </h3>
                          <p style={{ margin: '5px 0', color: '#aaa', fontSize: '0.9rem' }}>
                            {ticket.id} • {ticket.category}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '5px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            background: getStatusColor(ticket.status),
                            color: '#fff'
                          }}>
                            {ticket.status}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            background: getPriorityColor(ticket.priority),
                            color: '#fff'
                          }}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#aaa', fontSize: '0.9rem' }}>
                        <span>{t('created')}: {ticket.created}</span>
                        <span>{t('last_updated')}: {ticket.lastUpdated}</span>
                        <span>{ticket.messages} {t('ticket_messages')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}



          {activeTab === 'faq' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: '#fff' }}>{t('frequently_asked_questions')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#252525',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333'
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem' }}>
                      {faq.question}
                    </h3>
                    <p style={{ margin: 0, color: '#aaa', lineHeight: '1.6' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(255, 87, 34, 0.1)',
                borderRadius: '10px',
                border: '1px solid #FF5722',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>
                  {t('still_need_help')}
                </h3>
                <p style={{ margin: '0 0 20px 0', color: '#aaa' }}>
                  {t('contact_support_desc')}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/customer-chat')}
                    style={{
                      padding: '12px 25px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {t('live_chat')}
                  </button>
                  <button
                    onClick={() => navigate('/call-center/new-ticket')}
                    style={{
                      padding: '12px 25px',
                      background: '#FF5722',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {t('create_ticket')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallCenter;
