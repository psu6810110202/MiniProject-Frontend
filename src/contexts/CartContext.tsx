import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Item } from '../data/mockItem';
import { useAuth } from './AuthContext';

export interface CartItem extends Item {
    quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    totalAmount: number;
    date: string;
    status: string;
    // Add other properties if needed
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Item) => void;
    removeFromCart: (id: number | string) => void;
    clearCart: () => void;
    updateQuantity: (id: number | string, quantity: number) => void;
    totalAmount: number;
    totalItems: number;
    purchasedItems: (number | string)[];
    addToHistory: (items: CartItem[]) => void;
    removePurchasedItems: (itemIds: (number | string)[]) => void;
    userOrders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, newStatus: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?.id || 'guest';

    // Helper keys based on current user
    const getStorageKey = (key: string) => `${key}_${userId}`;

    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('cartItems'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [purchasedItems, setPurchasedItems] = useState<(number | string)[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('purchasedItems'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [userOrders, setUserOrders] = useState<Order[]>(() => {
        try {
            const saved = localStorage.getItem(getStorageKey('userOrders'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Load data when user changes (handling login/logout)
    useEffect(() => {
        try {
            const savedPurchased = localStorage.getItem(getStorageKey('purchasedItems'));
            const savedOrders = localStorage.getItem(getStorageKey('userOrders'));

            setPurchasedItems(savedPurchased ? JSON.parse(savedPurchased) : []);
            setUserOrders(savedOrders ? JSON.parse(savedOrders) : []);

            // Cart Merge Logic
            const currentUserCartKey = getStorageKey('cartItems');
            const savedUserCartStr = localStorage.getItem(currentUserCartKey);
            let finalCart: CartItem[] = savedUserCartStr ? JSON.parse(savedUserCartStr) : [];

            if (userId !== 'guest') {
                const guestCartKey = 'cartItems_guest';
                const savedGuestCartStr = localStorage.getItem(guestCartKey);

                if (savedGuestCartStr) {
                    const guestCart: CartItem[] = JSON.parse(savedGuestCartStr);
                    if (guestCart.length > 0) {
                        const mergedCart = [...finalCart];
                        guestCart.forEach(guestItem => {
                            const existingIndex = mergedCart.findIndex(i => i.id === guestItem.id);
                            if (existingIndex >= 0) {
                                mergedCart[existingIndex].quantity += guestItem.quantity;
                            } else {
                                mergedCart.push(guestItem);
                            }
                        });

                        finalCart = mergedCart;
                        // Save merged result immediately
                        localStorage.setItem(currentUserCartKey, JSON.stringify(finalCart));
                        // Remove guest cart to avoid duplicate merges
                        localStorage.removeItem(guestCartKey);
                    }
                }
            }

            setCartItems(finalCart);
        } catch (error) {
            console.error('Failed to load cart data', error);
        }
    }, [userId]);

    // Save data when it changes
    useEffect(() => {
        if (cartItems.length > 0 || localStorage.getItem(getStorageKey('cartItems'))) {
            localStorage.setItem(getStorageKey('cartItems'), JSON.stringify(cartItems));
        }
    }, [cartItems]); // Save logic depends on scope

    useEffect(() => {
        if (purchasedItems.length > 0 || localStorage.getItem(getStorageKey('purchasedItems'))) {
            localStorage.setItem(getStorageKey('purchasedItems'), JSON.stringify(purchasedItems));
        }
    }, [purchasedItems]);

    useEffect(() => {
        if (userOrders.length > 0 || localStorage.getItem(getStorageKey('userOrders'))) {
            localStorage.setItem(getStorageKey('userOrders'), JSON.stringify(userOrders));
        }
    }, [userOrders]);

    const addToCart = (item: Item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number | string) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number | string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const parsePrice = (priceStr: string | number) => {
        if (typeof priceStr === 'number') return priceStr;
        if (typeof priceStr !== 'string') return 0;
        // Remove currency symbol and commas
        return Number(priceStr.replace(/[^0-9.-]+/g, ""));
    };

    const totalAmount = cartItems.reduce((acc, item) => {
        return acc + (parsePrice(item.price) * item.quantity);
    }, 0);

    const addToHistory = (items: CartItem[]) => {
        const ids = items.map(i => i.id);
        setPurchasedItems(prev => [...prev, ...ids]);
    };

    const removePurchasedItems = (itemIds: (number | string)[]) => {
        setPurchasedItems(prev => prev.filter(id => !itemIds.includes(id)));
    };

    const addOrder = (order: Order) => {
        setUserOrders(prev => {
            const newOrders = [order, ...prev];
            localStorage.setItem(getStorageKey('userOrders'), JSON.stringify(newOrders));
            return newOrders;
        });
    };

    const updateOrderStatus = (orderId: string, newStatus: string) => {
        setUserOrders(prevOrders => {
            const updated = prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            localStorage.setItem(getStorageKey('userOrders'), JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, clearCart, updateQuantity, totalAmount, totalItems,
            purchasedItems, addToHistory, removePurchasedItems,
            userOrders,
            addOrder,
            updateOrderStatus
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
