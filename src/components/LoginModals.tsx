import React from 'react';
import '../pages/Login.css';

// --- Types ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    // isDark is deprecated as it is handled by CSS, but kept optional for compatibility if needed.
    isDark?: boolean;
}

export interface BlacklistModalProps extends ModalProps { }

export interface DeletedWarningModalProps extends ModalProps {
    onRestore: () => void;
}

export interface RestoreModalProps extends ModalProps {
    onSubmit: (e: React.FormEvent) => void;
    data: { username: string, password: string };
    setData: (data: any) => void;
}

// --- Components ---

export const BlacklistModal: React.FC<BlacklistModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay blacklist-modal">
            <div className="modal-content">
                <div className="modal-icon-wrapper">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <h2 className="modal-title">บัญชีของคุณถูกระงับ</h2>
                <p className="modal-desc">คุณถูก Blacklist ข้อหาผิดกฎที่คุณได้ตกลงและยอมรับไว้กับทางระบบ</p>
                <button onClick={onClose} className="modal-btn">ตกลง</button>
            </div>
        </div>
    );
};

export const DeletedWarningModal: React.FC<DeletedWarningModalProps> = ({ isOpen, onClose, onRestore }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay warning-modal">
            <div className="modal-content">
                <div className="modal-icon-wrapper">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h2 className="modal-title">Account Pending Deletion</h2>
                <p className="modal-desc">
                    This account is scheduled for deletion within 30 days.<br />Do you want to restore it?
                </p>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-btn cancel-btn" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={onRestore} className="modal-btn restore-btn" style={{ flex: 1 }}>Restore Account</button>
                </div>
            </div>
        </div>
    );
};

export const RestoreModal: React.FC<RestoreModalProps> = ({ isOpen, onClose, onSubmit, data, setData }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay restore-modal">
            <div className="modal-content">
                <h3 className="modal-title">Restore Account</h3>
                <form onSubmit={onSubmit}>
                    <label className="login-label">Username / Email</label>
                    <input type="text" value={data.username} onChange={e => setData({ ...data, username: e.target.value })} className="login-input" style={{ marginBottom: '15px' }} required />
                    <label className="login-label">Password</label>
                    <input type="password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} className="login-input" style={{ marginBottom: '20px' }} required />
                    <button type="submit" className="login-btn restore-submit-btn">Restore & Login</button>
                    <button type="button" onClick={onClose} className="login-btn cancel-btn">Cancel</button>
                </form>
            </div>
        </div>
    );
};
