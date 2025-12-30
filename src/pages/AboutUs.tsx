import React from 'react';
import './AboutUs.css';
import type { TeamMember, Feature } from '../types';

import { useLanguage } from '../contexts/LanguageContext';

const AboutUs: React.FC = () => {
  const { t } = useLanguage();
  // ข้อมูลสมาชิก (แก้ไขเป็นข้อมูลจริง)
  const members: TeamMember[] = [
    {
      studentId: '64xxxxxxxx',
      name: 'Member Name 1',
      role: 'Backend Developer',
      imageUrl: 'A',
    },
    {
      studentId: '64xxxxxxxx',
      name: 'Member Name 2',
      role: 'Frontend Developer',
      imageUrl: 'B',
    },
  ];

  // ข้อมูลฟีเจอร์
  const features: Feature[] = [
    {
      id: 1,
      title: t('feature_merch_title'),
      description: t('feature_merch_desc'),
      icon: '🛍️',
    },
    {
      id: 2,
      title: t('feature_loyalty_title'),
      description: t('feature_loyalty_desc'),
      icon: '💎',
    },
    {
      id: 3,
      title: t('feature_preorder_title'),
      description: t('feature_preorder_desc'),
      icon: '📦',
    },
  ];

  return (
    <div className="about-container">
      {/* Hero Section เต็มจอ */}
      <section className="about-hero">
        <h1>{t('about_title')}</h1>
        <p>
          {t('about_desc')}
        </p>
      </section>

      <div className="section-content">
        {/* Features */}
        <section>
          <h2 className="section-title">{t('what_we_offer')}</h2>
          <div className="features-grid">
            {features.map((item) => (
              <div key={item.id} className="feature-card">
                <span className="feature-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;