import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";

function Footer() {
    const { t } = useLanguage();
    return (
        <footer style={{
            backgroundColor: '#0a0a0a',
            borderTop: '2px solid #FF5722',
            padding: '60px 40px',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '40px'
            }}>
                {/* Brand Section */}
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-1px' }}>
                        <span style={{ color: '#FFFFFF' }}>DOM</span>
                        <span style={{ color: '#FF5722' }}>PORT</span>
                    </h2>
                </div>

                {/* Links Container */}
                <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
                    {/* Shop Column */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: '#FFFFFF' }}>{t('shop')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link to="/request-custom-product" style={{ textDecoration: 'none', color: '#a1a1a1', transition: 'color 0.2s' }}>{'Request Custom Product'}</Link>
                            <Link to="/fandoms" style={{ textDecoration: 'none', color: '#a1a1a1', transition: 'color 0.2s' }}>{'Fandoms'}</Link>
                        </div>
                    </div>

                    {/* About Column */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: '#FFFFFF' }}>{t('who_we_are')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link to="/about" style={{ textDecoration: 'none', color: '#a1a1a1', transition: 'color 0.2s' }}>{t('about')}</Link>
                        </div>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: '#FFFFFF' }}>{t('support')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link to="/call-center" style={{ textDecoration: 'none', color: '#a1a1a1', transition: 'color 0.2s' }}>{t('help_center')}</Link>
                            <a href="https://track.thailandpost.co.th/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#a1a1a1', transition: 'color 0.2s' }}>{t('track_order')}</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;