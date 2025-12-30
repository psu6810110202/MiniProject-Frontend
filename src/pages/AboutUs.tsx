import React from 'react';
import './AboutUs.css';
import type { TeamMember, Feature } from '../types';

const AboutUs: React.FC = () => {
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
      title: 'Official Merchandise',
      description: 'สินค้าลิขสิทธิ์แท้ 100% จากค่ายโดยตรง',
      icon: '🛍️',
    },
    {
      id: 2,
      title: 'Loyalty Points',
      description: 'ทุกยอดซื้อสะสมแต้ม แลกส่วนลดได้ทันที',
      icon: '💎',
    },
    {
      id: 3,
      title: 'Pre-order System',
      description: 'จองสินค้าล่วงหน้า การันตีได้รับของแน่นอน',
      icon: '📦',
    },
  ];

  return (
    <div className="about-container">
      {/* Hero Section เต็มจอ */}
      <section className="about-hero">
        <h1>Welcome to DomPort</h1>
        <p>
          The ultimate marketplace for fans. Connect with your favorite universe.
        </p>
      </section>

      <div className="section-content">
        {/* Features */}
        <section>
          <h2 className="section-title">What We Offer</h2>
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

        {/* Team */}
        <section>
          <h2 className="section-title">Our Team</h2>
          <div className="team-grid">
            {members.map((member) => (
              <div key={member.studentId} className="team-card">
                <div className="team-image-placeholder">
                  {member.imageUrl}
                </div>
                <div className="team-info">
                  <span className="team-role">{member.role}</span>
                  <h3>{member.name}</h3>
                  <p style={{ color: '#718096' }}>ID: {member.studentId}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;