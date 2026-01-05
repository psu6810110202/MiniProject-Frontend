import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';

const FandomManager: React.FC = () => {
    // Support both :name and :id params
    const { name, id } = useParams<{ name?: string; id?: string }>();
    const navigate = useNavigate();
    const { role } = useAuth();
    const { items, updateFandomName, deleteFandom, fandomImages, setFandomImage } = useProducts();

    // Mapping ID back to Name for lookup
    const idToFandomMap: Record<string, string> = {
        '1': 'Hazbin hotel',
        '2': 'Undertale',
        '3': 'Genshin impact',
        '4': 'Identity V',
        '5': 'Alien stage',
        '6': 'Cookie run kingdom',
        '7': 'Project sekai',
        '8': 'Milgram'
    };

    // Determine target fandom name
    const targetName = name || (id ? idToFandomMap[id] : '');

    const [fandomName, setFandomName] = useState(targetName || '');
    const [relatedItems, setRelatedItems] = useState<any[]>([]);

    // Initialize image: explicitly set fandom image OR first item image OR placeholder
    const [currentImage, setCurrentImage] = useState<string>('');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    useEffect(() => {
        if (targetName) {
            setFandomName(targetName);
            setRelatedItems(items.filter(i => i.fandom === targetName));

            // Logic to determine initial image
            if (fandomImages && fandomImages[targetName]) {
                setCurrentImage(fandomImages[targetName]);
            } else {
                const firstItem = items.find(i => i.fandom === targetName);
                setCurrentImage(firstItem?.image || '');
            }
        }
    }, [targetName, items, fandomImages]);


    const handleSave = () => {
        if (targetName && fandomName) {
            if (fandomName !== targetName) {
                updateFandomName(targetName, fandomName);
                // Redirect to new URL if name changed to maintain correct state
                navigate(`/profile/fandoms/${fandomName}`, { replace: true });
            }
            // Save image if it changed/exists
            if (currentImage) {
                setFandomImage(fandomName, currentImage);
            }
            alert('บันทึกสำเร็จ');
        }
    };


    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete fandom "${targetName}" and all its items?`)) {
            if (targetName) {
                deleteFandom(targetName);
                navigate('/profile/fandoms');
            }
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <button
                onClick={() => navigate('/profile/fandoms')}
                style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1rem' }}
            >
                ← Back to Fandom List
            </button>

            <h1 style={{ marginBottom: '30px' }}>Edit Fandom: <span style={{ color: '#FF5722' }}>{targetName}</span></h1>

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

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Fandom Cover Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px dashed #444',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: '#1a1a1a'
                        }}>
                            {currentImage ? (
                                <img src={currentImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ color: '#666' }}>No Image</span>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                id="fandom-image"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="fandom-image"
                                style={{
                                    padding: '10px 20px',
                                    background: '#333',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    border: '1px solid #555'
                                }}
                            >
                                Choose Image
                            </label>
                            <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                                Recommended size: 16:9 ratio (e.g., 1280x720)
                            </p>
                        </div>
                    </div>
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
