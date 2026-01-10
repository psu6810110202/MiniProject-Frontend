import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const FandomManager: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const { fandoms, addFandom, updateFandomName, deleteFandom, fandomImages, setFandomImage, items } = useProducts();
    const { t } = useLanguage();

    // State for creating new fandom
    const [newFandomName, setNewFandomName] = useState('');
    const [newFandomImage, setNewFandomImage] = useState('');

    // State for editing mode
    const [editingFandom, setEditingFandom] = useState<string | null>(null); // Name of fandom being edited
    const [editName, setEditName] = useState('');
    const [currentImage, setCurrentImage] = useState<string>('');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Handle selecting a fandom to edit
    const handleEditClick = (fandomName: string) => {
        setEditingFandom(fandomName);
        setEditName(fandomName);

        // Load image
        if (fandomImages && fandomImages[fandomName]) {
            setCurrentImage(fandomImages[fandomName]);
        } else {
            // Fallback to first item image
            const firstItem = items.find(i => i.fandom === fandomName);
            setCurrentImage(firstItem?.image || '');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingFandom(null);
        setEditName('');
        setCurrentImage('');
    };

    // --- Actions ---

    const handleAddFandom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFandomName.trim()) {
            addFandom(newFandomName.trim(), newFandomImage);

            setNewFandomName('');
            setNewFandomImage('');
            alert(t('fandom_added_success') || 'Fandom added successfully');
        }
    };

    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewFandomImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateFandom = () => {
        if (!editingFandom || !editName) return;

        if (editName !== editingFandom) {
            updateFandomName(editingFandom, editName);
        }

        if (currentImage) {
            setFandomImage(editName, currentImage); // Use new name if renamed
        }

        alert(t('save_success') || 'Saved successfully');
        setEditingFandom(null); // Exit edit mode
    };

    const handleDeleteFandom = () => {
        if (!editingFandom) return;
        if (window.confirm(`Are you sure you want to delete fandom "${editingFandom}"? This action cannot be undone.`)) {
            deleteFandom(editingFandom);
            setEditingFandom(null);
        }
    };

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
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-main)', minHeight: '80vh' }}>
            <button
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#FF5722', cursor: 'pointer', fontSize: '1rem' }}
            >
                ← {t('back_to_admin')}
            </button>

            <h1 style={{ marginBottom: '30px', borderBottom: '2px solid #FF5722', paddingBottom: '10px' }}>
                {editingFandom ? `Editing: ${editingFandom}` : t('manage_fandoms') + ' 🎭'}
            </h1>

            {/* --- EDITOR / CREATOR SECTION --- */}
            <div style={{
                marginBottom: '40px',
                background: editingFandom ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255,255,255,0.05)',
                padding: '30px',
                borderRadius: '15px',
                border: editingFandom ? '1px solid #2196F3' : '1px solid transparent',
                transition: 'all 0.3s'
            }}>
                {editingFandom ? (
                    // EDIT MODE
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#2196F3' }}>Edit Fandom Details</h3>
                            <button onClick={handleCancelEdit} style={{ background: 'transparent', border: '1px solid #666', color: '#888', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>Cancel</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '30px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>Fandom Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1a1a1a', border: '1px solid #444', color: 'white', marginBottom: '20px' }}
                                />
                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    <button onClick={handleUpdateFandom} style={{ padding: '12px 25px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Save Changes
                                    </button>
                                    <button onClick={handleDeleteFandom} style={{ padding: '12px 25px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Delete Fandom
                                    </button>
                                </div>
                            </div>

                            {/* Image Uploader */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>Cover Image</label>
                                <div style={{
                                    width: '100%', aspectRatio: '16/9', background: '#111', borderRadius: '10px', overflow: 'hidden', border: '1px dashed #555',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '10px'
                                }}>
                                    {currentImage ? (
                                        <img src={currentImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: '#555' }}>No Image</span>
                                    )}
                                </div>
                                <input id="cover-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                <label htmlFor="cover-upload" style={{
                                    display: 'block', width: '100%', padding: '8px', textAlign: 'center', background: '#333', color: '#ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem'
                                }}>
                                    Change Image
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    // CREATE MODE
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <h3 style={{ marginBottom: '15px' }}>{t('add_new_fandom')}</h3>
                        <form onSubmit={handleAddFandom} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="new-fandom-image"
                                    accept="image/*"
                                    onChange={handleNewImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="new-fandom-image"
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        background: newFandomImage ? `url(${newFandomImage}) center/cover` : '#333',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        border: '1px dashed #555',
                                        color: '#888',
                                        fontSize: '1.2rem',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Upload Cover Image"
                                >
                                    {!newFandomImage && '+'}
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder={t('enter_fandom_name')}
                                value={newFandomName}
                                onChange={(e) => setNewFandomName(e.target.value)}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: 'white' }}
                            />
                            <button type="submit" style={{ padding: '12px 25px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {t('add')}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* --- LIST SECTION --- */}
            <h3 style={{ borderLeft: '4px solid #FF5722', paddingLeft: '15px', marginBottom: '20px' }}>
                {t('available_fandoms')} ({fandoms.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {fandoms.map(fandom => {
                    const isEditing = editingFandom === fandom;
                    const itemsInFandom = items.filter(i => i.fandom === fandom).length;

                    // Specific logic for getting image for list display
                    let displayImage = '';
                    if (fandomImages && fandomImages[fandom]) {
                        displayImage = fandomImages[fandom];
                    } else {
                        const firstItem = items.find(i => i.fandom === fandom);
                        displayImage = firstItem?.image || '';
                    }

                    return (
                        <div key={fandom} style={{
                            background: isEditing ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255,255,255,0.03)',
                            border: isEditing ? '1px solid #2196F3' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                            onClick={() => handleEditClick(fandom)}
                        >
                            <div style={{ height: '120px', background: '#111', overflow: 'hidden', position: 'relative' }}>
                                {displayImage ? (
                                    <img src={displayImage} alt={fandom} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>No Cover</div>
                                )}
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', color: '#fff' }}>
                                    {itemsInFandom} items
                                </div>
                            </div>

                            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{fandom}</span>
                                <span style={{ color: isEditing ? '#2196F3' : '#666' }}>{isEditing ? 'Editing...' : 'Edit ✎'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FandomManager;
