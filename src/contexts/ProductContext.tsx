import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mockItems, type Item } from '../data/mockItem';
import { preorderItems, type PreOrderItem } from '../data/preorderData';
import { useAuth } from './AuthContext';

interface ProductContextType {
    items: Item[];
    fandoms: string[];
    fandomImages: Record<string, string>;
    preOrders: PreOrderItem[];
    addItem: (item: Item) => void;
    updateItem: (item: Item) => void;
    deleteItem: (id: number) => void;
    addFandom: (name: string) => void;
    setFandomImage: (name: string, image: string) => void;
    deleteFandom: (name: string) => void;
    updateFandomName: (oldName: string, newName: string) => void;
    addPreOrder: (item: PreOrderItem) => void;
    updatePreOrder: (item: PreOrderItem) => void;
    deletePreOrder: (id: number) => void;
    likedProductIds: number[];
    likedFandoms: string[];
    toggleLikeProduct: (id: number) => void;
    toggleLikeFandom: (name: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ... (Pre-existing imports like mockItems, etc)

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';
    const getStorageKey = (key: string) => `${key}_v2_${userId}`;

    const [items, setItems] = useState<Item[]>(mockItems);
    const [preOrders, setPreOrders] = useState<PreOrderItem[]>(preorderItems);
    const [fandoms, setFandoms] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('fandoms'));
            const initial = Array.from(new Set(mockItems.map(i => i.fandom)));
            return saved ? Array.from(new Set([...initial, ...JSON.parse(saved)])) : initial;
        } catch {
            return Array.from(new Set(mockItems.map(i => i.fandom)));
        }
    });

    const [fandomImages, setFandomImages] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('fandomImages'));
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    // Save Fandoms & Images
    useEffect(() => {
        localStorage.setItem(getStorageKey('fandoms'), JSON.stringify(fandoms));
    }, [fandoms]);

    useEffect(() => {
        localStorage.setItem(getStorageKey('fandomImages'), JSON.stringify(fandomImages));
    }, [fandomImages]);

    // --- Like System ---
    const [likedProductIds, setLikedProductIds] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('likedProductIds'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [likedFandoms, setLikedFandoms] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('likedFandoms'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Load Likes when user changes
    useEffect(() => {
        try {
            const savedProducts = localStorage.getItem(getStorageKey('likedProductIds'));
            const savedFandoms = localStorage.getItem(getStorageKey('likedFandoms'));
            setLikedProductIds(savedProducts ? JSON.parse(savedProducts) : []);
            setLikedFandoms(savedFandoms ? JSON.parse(savedFandoms) : []);
        } catch (e) { }
    }, [userId]);

    // Save Likes
    useEffect(() => {
        if (likedProductIds.length > 0 || localStorage.getItem(getStorageKey('likedProductIds'))) {
            localStorage.setItem(getStorageKey('likedProductIds'), JSON.stringify(likedProductIds));
        }
    }, [likedProductIds]);

    useEffect(() => {
        if (likedFandoms.length > 0 || localStorage.getItem(getStorageKey('likedFandoms'))) {
            localStorage.setItem(getStorageKey('likedFandoms'), JSON.stringify(likedFandoms));
        }
    }, [likedFandoms]);

    const toggleLikeProduct = (id: number) => {
        setLikedProductIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const toggleLikeFandom = (name: string) => {
        setLikedFandoms(prev =>
            prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
        );
    };

    const addItem = (item: Item) => {
        setItems([...items, item]);
        if (!fandoms.includes(item.fandom)) {
            setFandoms([...fandoms, item.fandom]);
        }
    };

    const updateItem = (updatedItem: Item) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
        if (!fandoms.includes(updatedItem.fandom)) {
            setFandoms([...fandoms, updatedItem.fandom]);
        }
    };

    const deleteItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const addFandom = (name: string) => {
        if (!fandoms.includes(name)) {
            setFandoms([...fandoms, name]);
        }
    };

    const setFandomImage = (name: string, image: string) => {
        setFandomImages(prev => ({ ...prev, [name]: image }));
    };

    const deleteFandom = (name: string) => {
        setFandoms(fandoms.filter(f => f !== name));
        // Also delete all items in this fandom
        setItems(items.filter(item => item.fandom !== name));
        // Delete image
        const newImages = { ...fandomImages };
        delete newImages[name];
        setFandomImages(newImages);
    };

    const updateFandomName = (oldName: string, newName: string) => {
        setFandoms(fandoms.map(f => f === oldName ? newName : f));
        setItems(items.map(item =>
            item.fandom === oldName
                ? { ...item, fandom: newName }
                : item
        ));
        // Migrate image
        if (fandomImages[oldName]) {
            const newImages = { ...fandomImages, [newName]: fandomImages[oldName] };
            delete newImages[oldName];
            setFandomImages(newImages);
        }
    };

    const addPreOrder = (item: PreOrderItem) => {
        setPreOrders([...preOrders, item]);
    };

    const updatePreOrder = (updatedItem: PreOrderItem) => {
        setPreOrders(preOrders.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const deletePreOrder = (id: number) => {
        setPreOrders(preOrders.filter(item => item.id !== id));
    };

    return (
        <ProductContext.Provider value={{
            items, fandoms, fandomImages, preOrders,
            addItem, updateItem, deleteItem,
            addFandom, deleteFandom, updateFandomName, setFandomImage,
            addPreOrder, updatePreOrder, deletePreOrder,
            likedProductIds, likedFandoms, toggleLikeProduct, toggleLikeFandom
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
