import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';

const FandomManager: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { role } = useAuth();
    const { items, updateFandomName, deleteFandom } = useProducts();

    const [fandomName, setFandomName] = useState(name || '');
    const [relatedItems, setRelatedItems] = useState(items.filter(i => i.fandom === name));

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    useEffect(() => {
        if (name) {
            setFandomName(name);
            setRelatedItems(items.filter(i => i.fandom === name));
        }
    }, [name, items]);


    const handleSave = () => {
        if (name && fandomName && fandomName !== name) {
            updateFandomName(name, fandomName);
            navigate('/admin');
        } else {
            navigate('/admin');
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete fandom "${name}" and all its items?`)) {
            if (name) {
                deleteFandom(name);
                navigate('/admin');
            }
        }
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1rem' }}
            >
                ← Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '30px' }}>Edit Fandom: <span style={{ color: '#FF5722' }}>{name}</span></h1>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', border: '1px solid #333' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Fandom Name</label>
                    <input
                        type="text"
                        value={fandomName}
                        onChange={(e) => setFandomName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: '#222',
                            border: '1px solid #444',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '12px 25px',
                            background: '#FF5722',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}>
                        Save Changes
                    </button>

                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '12px 25px',
                            background: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}>
                        Delete Fandom
                    </button>
                </div>
            </div>

            <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Items in this Fandom ({relatedItems.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {relatedItems.map(item => (
                    <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>{item.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FandomManager;
