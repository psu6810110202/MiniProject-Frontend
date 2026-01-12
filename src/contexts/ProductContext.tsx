import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Item, type PreOrderItem } from '../types';
import { useAuth } from './AuthContext';
import { productAPI, fandomAPI, categoryAPI } from '../services/api';

interface ProductContextType {
    items: Item[];
    fandoms: string[];
    categories: string[];
    fandomImages: Record<string, string>;
    preOrders: PreOrderItem[];
    addItem: (item: Item) => Promise<Item>;
    updateItem: (item: Item) => Promise<void>;
    deleteItem: (id: number | string) => Promise<void>;
    addFandom: (name: string, image?: string) => Promise<void>;
    setFandomImage: (name: string, image: string) => void;
    deleteFandom: (name: string) => Promise<void>;
    updateFandomName: (oldName: string, newName: string) => Promise<void>;
    addPreOrder: (item: PreOrderItem) => Promise<void>;
    updatePreOrder: (item: PreOrderItem) => Promise<void>;
    deletePreOrder: (id: number) => Promise<void>;
    likedFandoms: string[];
    toggleLikeFandom: (name: string) => void;
    deductStock: (id: number | string, quantity: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';
    const getStorageKey = (key: string) => `${key}_v4_${userId}`;

    const [items, setItems] = useState<Item[]>([]);
    const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
    const [fandoms, setFandoms] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [fandomImages, setFandomImages] = useState<Record<string, string>>({});

    // Fetch Data from Backend
    useEffect(() => {
        const fetchData = async () => {
            let loadedItems: Item[] = [];
            let loadedPreOrders: PreOrderItem[] = [];

            try {
                // Fetch Products
                const products = await productAPI.getAll();
                if (products && products.length > 0) {
                    products.forEach((p: any) => {
                        if (p.is_preorder) {
                            loadedPreOrders.push({
                                id: p.product_id as any,
                                name: p.name,
                                price: p.price,
                                deposit: p.deposit_amount || 0,
                                preOrderCloseDate: p.release_date || 'TBA',
                                image: p.image || 'https://placehold.co/300x300?text=No+Image',
                                description: p.description,
                                fandom: p.fandom || 'Other',
                                category: p.category_id || p.category || 'PreOrder',
                                gallery: p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : [],
                                domesticShipping: Number(p.domestic_shipping_cost) || 0,
                            });
                        } else {
                            loadedItems.push({
                                id: p.product_id,
                                name: p.name,
                                price: `฿${p.price}`,
                                category: p.category_id || p.category,
                                fandom: p.fandom || 'Other',
                                image: p.image || 'https://placehold.co/300x300?text=No+Image',
                                description: p.description,
                                stock: p.stock_qty || 0,
                                gallery: p.gallery ? (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery) : []
                            });
                        }
                    });
                    setItems(loadedItems);
                    setPreOrders(loadedPreOrders);
                }

                // Fetch Categories
                try {
                    const cats = await categoryAPI.getAll();
                    if (cats && cats.length > 0) {
                        setCategories(cats.map((c: any) => c.category_name || c.name || c));
                    }
                } catch (e) {
                    console.error("DEBUG: Failed to fetch categories:", e);
                }

                // Fetch Fandoms
                const fandomList = await fandomAPI.getAll();
                console.log("DEBUG: Fetched Fandoms from API:", fandomList);
                let apiFandomNames: string[] = [];

                if (fandomList && fandomList.length > 0) {
                    apiFandomNames = fandomList.map((f: any) => f.name);
                    const images: Record<string, string> = {};
                    fandomList.forEach((f: any) => {
                        if (f.image) images[f.name] = f.image;
                    });
                    setFandomImages(images);
                } else {
                    console.log("DEBUG: No fandoms returned from API.");
                }

                // No LocalStorage fallback requested. Relying purely on API.
                setFandoms(apiFandomNames);
            } catch (error) {
                console.error("DEBUG: Failed to fetch data from API:", error);
            }
        };

        fetchData();
    }, []);

    // --- Like System ---
    const [likedFandoms, setLikedFandoms] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('likedFandoms'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Load Likes when user changes
    useEffect(() => {
        try {
            const savedFandoms = localStorage.getItem(getStorageKey('likedFandoms'));
            setLikedFandoms(savedFandoms ? JSON.parse(savedFandoms) : []);
        } catch (e) { }
    }, [userId]);

    // Save Likes
    useEffect(() => {
        localStorage.setItem(getStorageKey('likedFandoms'), JSON.stringify(likedFandoms));
    }, [likedFandoms]);

    const toggleLikeFandom = (name: string) => {
        setLikedFandoms(prev =>
            prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
        );
    };

    // --- Actions ---

    const addItem = async (item: Item) => {
        try {
            const response = await productAPI.create({
                name: item.name,
                price: parseFloat(item.price.replace(/[^\d.]/g, '')),
                category_id: item.category,
                supplier_id: 'internal',
                image: item.image,
                fandom: item.fandom,
                stock_qty: item.stock || 0,
                description: item.description,
                gallery: JSON.stringify(item.gallery || [])
            });

            // Add the REAL item from DB to state
            const newItem: Item = {
                id: response.product_id ? (Number(response.product_id) || response.product_id) : Date.now(),
                name: response.name,
                price: `฿${response.price.toLocaleString()}`,
                category: response.category || response.category_id || item.category,
                fandom: response.fandom,
                image: response.image,
                description: response.description,
                stock: response.stock_qty || 0,
                gallery: response.gallery ? (typeof response.gallery === 'string' ? JSON.parse(response.gallery) : response.gallery) : []
            };

            setItems(prev => [...prev, newItem]);

            if (!fandoms.includes(item.fandom)) {
                setFandoms(prev => [...prev, item.fandom]);
            }

            return newItem;
        } catch (e) {
            console.error("Add item failed", e);
            throw e;
        }
    };

    const updateItem = async (updatedItem: Item) => {
        try {
            // Assuming we have the numeric/string ID that matches
            const response = await productAPI.update(String(updatedItem.id), {
                name: updatedItem.name,
                price: parseFloat(updatedItem.price.replace(/[^\d.]/g, '')),
                category_id: updatedItem.category,
                image: updatedItem.image,
                fandom: updatedItem.fandom,
                stock_qty: updatedItem.stock,
                description: updatedItem.description,
                gallery: JSON.stringify(updatedItem.gallery || [])
            });

            const newItem: Item = {
                id: response.product_id ? (Number(response.product_id) || response.product_id) : updatedItem.id,
                name: response.name,
                price: `฿${response.price.toLocaleString()}`,
                category: response.category || response.category_id || updatedItem.category,
                fandom: response.fandom,
                image: response.image,
                description: response.description,
                stock: response.stock_qty || 0,
                gallery: response.gallery ? (typeof response.gallery === 'string' ? JSON.parse(response.gallery) : response.gallery) : []
            };

            setItems(prev => prev.map(item => item.id === updatedItem.id ? newItem : item));
        } catch (e) {
            console.error("Update item failed", e);
            throw e;
        }
    };

    const deleteItem = async (id: number | string) => {
        setItems(items.filter(item => item.id !== id));
        try {
            await productAPI.delete(String(id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const addFandom = async (name: string, image?: string) => {
        if (!fandoms.includes(name)) {
            try {
                console.log("DEBUG: Adding fandom to API:", name, image ? "(with image)" : "");
                await fandomAPI.create({ name, image });
                console.log("DEBUG: Fandom added successfully via API.");

                // Update State ONLY after success
                setFandoms(prev => [...prev, name]);
                if (image) {
                    setFandomImages(prev => ({ ...prev, [name]: image }));
                }
            } catch (error: any) {
                console.error("DEBUG: Failed to add fandom via API:", error);
                alert(`Failed to save Fandom to Database: ${error.message || 'Unknown Error'}`);
            }
        }
    };

    const setFandomImage = (name: string, image: string) => {
        setFandomImages(prev => ({ ...prev, [name]: image }));
    };

    const deleteFandom = async (name: string) => {
        // Optimistic updates
        const newFandoms = fandoms.filter(f => f !== name);
        setFandoms(newFandoms);

        setItems(items.filter(item => item.fandom !== name));
        setFandomImages(prev => {
            const newImages = { ...prev };
            delete newImages[name];
            return newImages;
        });

        try {
            // We only have name, but API needs ID (probably).
            // Strategy: Fetch all to find ID, then delete. (Inefficient but robust for current architecture)
            const allFandoms = await fandomAPI.getAll();
            const target = allFandoms.find((f: any) => f.name === name);
            if (target) {
                await fandomAPI.delete(target.id);
            }
        } catch (e) {
            console.error("Failed to delete fandom via API", e);
            // Rollback state if API call fails and optimistic update was made
            // (More complex for this scenario, but good practice)
        }
    };

    const updateFandomName = async (oldName: string, newName: string) => {
        // Optimistic Updates
        setFandoms(fandoms.map(f => f === oldName ? newName : f));

        // Also update local list of items to reflect the change visually
        setItems(items.map(item =>
            item.fandom === oldName
                ? { ...item, fandom: newName }
                : item
        ));

        setPreOrders(preOrders.map(item =>
            item.fandom === oldName
                ? { ...item, fandom: newName }
                : item
        ));

        if (fandomImages[oldName]) {
            setFandomImages(prev => {
                const newImages = { ...prev, [newName]: prev[oldName] };
                delete newImages[oldName];
                return newImages;
            });
        }

        try {
            // Find ID by name and update
            const allFandoms = await fandomAPI.getAll();
            const target = allFandoms.find((f: any) => f.name === oldName);
            if (target) {
                await fandomAPI.update(target.id, { name: newName });
            }
        } catch (e) {
            console.error("Failed to update fandom name API", e);
        }
    };

    const addPreOrder = async (item: PreOrderItem) => {
        try {
            const response = await productAPI.create({
                name: item.name,
                price: item.price,
                description: item.description,
                fandom: item.fandom,
                category_id: item.category,
                supplier_id: 'internal',
                image: item.image,
                is_preorder: true,
                deposit_amount: item.deposit,
                release_date: item.preOrderCloseDate,
                stock_qty: 999,
                gallery: JSON.stringify(item.gallery || []),
                domestic_shipping_cost: item.domesticShipping || 0
            });

            // Convert response (Product) to PreOrderItem
            const newPreOrder: PreOrderItem = {
                id: Number(response.product_id.replace(/^P/i, '')) || Date.now(), // Handle ID conversion if needed
                name: response.name,
                price: response.price,
                description: response.description,
                fandom: response.fandom,
                category: response.category || item.category, // Use response or fallback
                image: response.image,
                preOrderCloseDate: response.release_date || '',
                deposit: response.deposit_amount || 0,
                gallery: response.gallery ? JSON.parse(response.gallery) : [],
                domesticShipping: Number(response.domestic_shipping_cost) || 0
            };

            setPreOrders(prev => [...prev, newPreOrder]);
        } catch (e) {
            console.error("Failed to add pre-order via API", e);
            alert("Failed to add pre-order. Please try again.");
        }
    };

    const updatePreOrder = async (updatedItem: PreOrderItem) => {
        try {
            await productAPI.update(String(updatedItem.id), {
                name: updatedItem.name,
                price: updatedItem.price,
                description: updatedItem.description,
                fandom: updatedItem.fandom,
                category_id: updatedItem.category,
                image: updatedItem.image,
                deposit_amount: updatedItem.deposit,
                release_date: updatedItem.preOrderCloseDate,
                stock_qty: 999,
                gallery: JSON.stringify(updatedItem.gallery || []),
                domestic_shipping_cost: updatedItem.domesticShipping || 0
            });

            // Update state after success
            setPreOrders(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        } catch (e) {
            console.error("Failed to update pre-order via API", e);
            alert("Failed to update pre-order.");
            throw e;
        }
    };

    const deletePreOrder = async (id: number) => {
        try {
            await productAPI.delete(String(id));
            // Update state after success
            setPreOrders(prev => prev.filter(item => item.id !== id));
        } catch (e: any) {
            console.error("Failed to delete pre-order via API", e);
            const msg = e.response?.data?.message || e.message || "Unknown error";
            alert(`Failed to delete pre-order: ${msg}\n(It may be linked to existing orders)`);
        }
    };

    const deductStock = async (id: number | string, quantity: number) => {
        // Optimistic update
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const newStock = Math.max(0, (item.stock || 0) - quantity);
                return { ...item, stock: newStock };
            }
            return item;
        }));

        try {
            // Find the item to get its current details for the API call
            const currentItem = items.find(i => i.id === id);
            if (!currentItem) return;

            const newStock = Math.max(0, (currentItem.stock || 0) - quantity);

            // API Update
            await productAPI.update(String(id), {
                name: currentItem.name,
                price: parseFloat(currentItem.price.replace(/[^\d.]/g, '')),
                description: currentItem.description,
                category_id: currentItem.category,
                fandom: currentItem.fandom,
                image: currentItem.image,
                stock_qty: newStock,
                gallery: JSON.stringify(currentItem.gallery || [])
            });
        } catch (e) {
            console.error("Failed to deduct stock via API", e);
            // Revert on failure (optional but good practice, though user specifically wanted 'immediate' feel)
            // For now, we prioritize the optimistic UI update.
        }
    };

    return (
        <ProductContext.Provider value={{
            items, fandoms, fandomImages, preOrders,
            categories,
            addItem, updateItem, deleteItem,
            addFandom, deleteFandom, updateFandomName, setFandomImage,
            addPreOrder, updatePreOrder, deletePreOrder,
            likedFandoms, toggleLikeFandom,
            deductStock
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
