import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Item } from '../data/mockItem';
import { preorderItems, type PreOrderItem } from '../data/preorderData';
import { useAuth } from './AuthContext';

interface ProductContextType {
    items: Item[];
    fandoms: string[];
    categories: string[];
    fandomImages: Record<string, string>;
    preOrders: PreOrderItem[];
    addItem: (item: Item) => void;
    updateItem: (item: Item) => void;
    deleteItem: (id: number | string) => void;
    addFandom: (name: string) => void;
    setFandomImage: (name: string, image: string) => void;
    deleteFandom: (name: string) => void;
    updateFandomName: (oldName: string, newName: string) => void;
    addPreOrder: (item: PreOrderItem) => void;
    updatePreOrder: (item: PreOrderItem) => void;
    deletePreOrder: (id: number) => void;
    likedProductIds: (number | string)[];
    likedFandoms: string[];
    toggleLikeProduct: (id: number | string) => void;
    toggleLikeFandom: (name: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';
    const getStorageKey = (key: string) => `${key}_v4_${userId}`;

    const [items, setItems] = useState<Item[]>([]);
    const [preOrders, setPreOrders] = useState<PreOrderItem[]>(preorderItems);
    const [fandoms, setFandoms] = useState<string[]>([]);
    const [fandomImages, setFandomImages] = useState<Record<string, string>>({});

    // Fetch Data from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const prodRes = await fetch(`${API_URL}/products`);
                if (prodRes.ok) {
                    const products = await prodRes.json();
                    const mappedItems: Item[] = products.map((p: any) => ({
                        id: p.product_id,
                        name: p.name,
                        price: `฿${p.price}`,
                        category: p.category_id,
                        fandom: p.fandom || 'Other',
                        image: p.image || 'https://placehold.co/300x300?text=No+Image'
                    }));
                    setItems(mappedItems);
                }

                // Fetch Fandoms
                const fanRes = await fetch(`${API_URL}/fandoms`);
                if (fanRes.ok) {
                    const fandomList = await fanRes.json();
                    setFandoms(fandomList.map((f: any) => f.name));
                    const images: Record<string, string> = {};
                    fandomList.forEach((f: any) => {
                        if (f.image) images[f.name] = f.image;
                    });
                    setFandomImages(images);
                }
            } catch (error) {
                console.error("Failed to fetch data from API:", error);
            }
        };

        fetchData();
    }, []);

    // --- Like System ---
    const [likedProductIds, setLikedProductIds] = useState<(number | string)[]>(() => {
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
        localStorage.setItem(getStorageKey('likedProductIds'), JSON.stringify(likedProductIds));
    }, [likedProductIds]);

    useEffect(() => {
        localStorage.setItem(getStorageKey('likedFandoms'), JSON.stringify(likedFandoms));
    }, [likedFandoms]);

    const toggleLikeProduct = (id: number | string) => {
        setLikedProductIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const toggleLikeFandom = (name: string) => {
        setLikedFandoms(prev =>
            prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
        );
    };

    // --- Actions ---

    const addItem = async (item: Item) => {
        // Optimistic update
        const tempId = item.id || Date.now();
        setItems([...items, { ...item, id: tempId }]);

        try {
            await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    price: parseFloat(item.price.replace(/[^\d.]/g, '')),
                    stock_qty: 10, // Default stock
                    category_id: item.category,
                    supplier_id: 'default',
                    image: item.image,
                    fandom: item.fandom
                })
            });
            // Ideally we re-fetch here to get real ID
        } catch (e) {
            console.error("Add item failed", e);
        }

        if (!fandoms.includes(item.fandom)) {
            setFandoms([...fandoms, item.fandom]);
        }
    };

    const updateItem = async (updatedItem: Item) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
        // API Call usually requires ID. Since we are moving to backend, specific implementation depends on endpoint.
        // Assuming PATCH /products/:id exists is standard, but check valid endpoints.
    };

    const deleteItem = async (id: number | string) => {
        setItems(items.filter(item => item.id !== id));
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const addFandom = async (name: string) => {
        if (!fandoms.includes(name)) {
            setFandoms([...fandoms, name]);
            // API Call
            try {
                await fetch(`${API_URL}/fandoms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, product_count: 0 })
                });
            } catch (e) { }
        }
    };

    const setFandomImage = (name: string, image: string) => {
        setFandomImages(prev => ({ ...prev, [name]: image }));
    };

    const deleteFandom = (name: string) => {
        setFandoms(fandoms.filter(f => f !== name));
        setItems(items.filter(item => item.fandom !== name));
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
            categories: Array.from(new Set([...items.map(i => i.category || 'Other'), ...preOrders.map(() => 'Pre-Order')])).filter(Boolean),
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
