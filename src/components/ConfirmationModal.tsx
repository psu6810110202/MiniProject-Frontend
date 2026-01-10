import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    isDark?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
    isDark = false
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
        }}>
            <div style={{
                background: 'var(--card-bg, #1e1e1e)', // Fallback to dark if var not set
                border: '1px solid var(--border-color, #333)',
                padding: '30px',
                borderRadius: '20px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                textAlign: 'center',
                transform: isOpen ? 'scale(1)' : 'scale(0.9)',
                transition: 'transform 0.2s ease-in-out'
            }}>
                <h2 style={{
                    color: isDangerous ? '#f44336' : 'var(--text-main, #fff)',
                    marginTop: 0,
                    marginBottom: '15px',
                    fontSize: '1.5rem'
                }}>
                    {title}
                </h2>
                <p style={{
                    color: 'var(--text-muted, #aaa)',
                    marginBottom: '30px',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            border: '1px solid var(--border-color, #555)',
                            borderRadius: '10px',
                            color: 'var(--text-main, #fff)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500,
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '12px 24px',
                            background: isDangerous ? '#f44336' : '#4CAF50',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: `0 4px 15px ${isDangerous ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                            transition: 'transform 0.1s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 6px 20px ${isDangerous ? 'rgba(244, 67, 54, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 15px ${isDangerous ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`;
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
