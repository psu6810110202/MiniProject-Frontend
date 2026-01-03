import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';

const FandomList: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const { fandoms, addFandom } = useProducts();
    const [newFandomName, setNewFandomName] = useState('');

    React.useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    const handleAddFandom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFandomName.trim()) {
            addFandom(newFandomName.trim());
            setNewFandomName('');
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile')}
                style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1rem' }}
            >
                ← Back to Profile
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                Manage Fandoms 🎭
            </h1>

            {/* Add New Fandom Section */}
            <div style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }}>
                <h3>Add New Fandom</h3>
                <form onSubmit={handleAddFandom} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="Enter fandom name..."
                        value={newFandomName}
                        onChange={(e) => setNewFandomName(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #444',
                            background: '#222',
                            color: 'white'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '12px 25px',
                        background: '#FF5722',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Add
                    </button>
                </form>
            </div>

            {/* List of Fandoms */}
            <h3>Available Fandoms ({fandoms.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {fandoms.map(fandom => (
                    <div key={fandom} style={{
                        background: '#333',
                        padding: '20px',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center' }}>{fandom}</span>
                        <button
                            onClick={() => navigate(`/admin/fandom/${fandom}`)}
                            style={{
                                padding: '8px 20px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px'
                            }}>
                            Edit <span>✎</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FandomList;
