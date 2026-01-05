import React, { useEffect, useState } from 'react';

interface ThemeNotificationProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    show: boolean;
    onClose: () => void;
}

const ThemeNotification: React.FC<ThemeNotificationProps> = ({
    message,
    type = 'success',
    duration = 3000,
    show,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'var(--card-bg)',
                    border: 'var(--primary-color)',
                    text: 'var(--text-main)',
                    icon: 'var(--primary-color)'
                };
            case 'error':
                return {
                    bg: 'var(--card-bg)',
                    border: '#f44336',
                    text: 'var(--text-main)',
                    icon: '#f44336'
                };
            case 'warning':
                return {
                    bg: 'var(--card-bg)',
                    border: '#ff9800',
                    text: 'var(--text-main)',
                    icon: '#ff9800'
                };
            case 'info':
                return {
                    bg: 'var(--card-bg)',
                    border: '#2196f3',
                    text: 'var(--text-main)',
                    icon: '#2196f3'
                };
            default:
                return {
                    bg: 'var(--card-bg)',
                    border: 'var(--primary-color)',
                    text: 'var(--text-main)',
                    icon: 'var(--primary-color)'
                };
        }
    };

    const colors = getColors();
    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return '✓';
        }
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: colors.bg,
                color: colors.text,
                padding: '15px 20px',
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                boxShadow: `0 4px 20px ${colors.border}33`,
                zIndex: 1000,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                maxWidth: '300px',
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: colors.icon, fontSize: '1.2rem' }}>
                        {getIcon()}
                    </span>
                    <span>{message}</span>
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default ThemeNotification;
