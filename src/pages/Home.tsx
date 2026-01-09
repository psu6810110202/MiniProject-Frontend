import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const { t } = useLanguage();
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const checkTheme = () => {
            const t = document.documentElement.getAttribute('data-theme');
            if (t) setCurrentTheme(t);
        };
        const interval = setInterval(checkTheme, 100);
        return () => clearInterval(interval);
    }, []);



    // ส่วนเนื้อหา Home ยังเปลี่ยนโลโก้ตามพื้นหลัง (เพราะพื้นหลัง Home เปลี่ยนสีได้)
    const logoSrc = currentTheme === 'dark' ? 'http://localhost:3000/images/DomPort_DarkTone.png' : 'http://localhost:3000/images/DomPort.png';

    const homeBackground = currentTheme === 'dark'
        ? 'radial-gradient(circle at center, #2e1005 0%, #000000 80%)'
        : 'radial-gradient(circle at center, #fff3e0 0%, #ffffff 80%)';

    return (
        <div>
            <div style={{
                padding: '80px 20px',
                textAlign: 'center',
                minHeight: '80vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: homeBackground,
                transition: 'background 0.3s'
            }}>
                <img
                    src={logoSrc}
                    alt="DomPort Giant Logo"
                    style={{
                        width: '220px',
                        marginBottom: '30px',
                        transition: 'all 0.3s',
                        filter: 'drop-shadow(0 0 15px rgba(255,87,34,0.4))'
                    }}
                />
                <h1 style={{ fontSize: '4rem', marginBottom: '20px', fontWeight: '900', color: 'var(--text-main)' }}>
                    {t('welcome')} <span style={{ color: '#FF5722', textShadow: '0 0 15px rgba(255,87,34,0.6)' }}>Dom</span>Port
                </h1>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6' }}>
                    {t('description')}
                </p>

                <div style={{ marginTop: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/fandoms" style={{
                        padding: '15px 40px',
                        fontSize: '1.1rem',
                        background: '#FF5722',
                        color: 'white',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        boxShadow: '0 0 20px rgba(255, 87, 34, 0.4)',
                        transition: 'transform 0.2s'
                    }}>
                        {t('explore')}
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Home;
