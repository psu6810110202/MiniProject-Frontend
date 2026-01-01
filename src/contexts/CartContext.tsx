import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Item } from '../data/mockItem';

export interface CartItem extends Item {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Item) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    updateQuantity: (id: number, quantity: number) => void;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: Item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
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

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, clearCart, updateQuantity, totalAmount, totalItems
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
