import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CallCenterProps {
}

const CallCenter: React.FC<CallCenterProps> = () => {
  const { t } = useLanguage();

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
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      padding: 0,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        padding: '100px 20px',
        background: 'linear-gradient(180deg, rgba(255,87,34,0.15) 0%, var(--bg-color) 100%)',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '60px',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)', marginTop: '0' }}>
          {t('help_center')}
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
          {t('help_center_desc')}
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px 20px' }}>
        <div>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.25rem',
            fontWeight: '700',
            marginBottom: '50px',
            color: 'var(--text-main)',
            position: 'relative'
          }}>
            {t('frequently_asked_questions')}
            <span style={{
              display: 'block', width: '60px', height: '4px', background: '#FF5722',
              margin: '15px auto 0', borderRadius: '2px'
            }}></span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {faqData.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--card-bg)',
                  padding: '40px 30px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.3s, border-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#FF5722';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{
                  fontSize: '2rem', marginBottom: '20px', display: 'inline-block',
                  padding: '15px', background: 'rgba(255, 87, 34, 0.1)',
                  borderRadius: '50%', color: '#FF5722'
                }}>
                  ?
                </div>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {faq.question}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallCenter;
