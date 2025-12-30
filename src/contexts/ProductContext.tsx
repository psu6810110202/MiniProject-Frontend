import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { mockItems, type Item } from '../data/mockItem';
import { preorderItems, type PreOrderItem } from '../data/preorderData';

interface ProductContextType {
    items: Item[];
    fandoms: string[];
    preOrders: PreOrderItem[];
    addItem: (item: Item) => void;
    updateItem: (item: Item) => void;
    deleteItem: (id: number) => void;
    addFandom: (name: string) => void;
    deleteFandom: (name: string) => void;
    updateFandomName: (oldName: string, newName: string) => void;
    addPreOrder: (item: PreOrderItem) => void;
    updatePreOrder: (item: PreOrderItem) => void;
    deletePreOrder: (id: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Item[]>(mockItems);
    const [preOrders, setPreOrders] = useState<PreOrderItem[]>(preorderItems);
    // Initialize fandoms from unique items, but keep it as state so we can add empty ones
    const [fandoms, setFandoms] = useState<string[]>(() => Array.from(new Set(mockItems.map(i => i.fandom))));

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

    const deleteFandom = (name: string) => {
        setFandoms(fandoms.filter(f => f !== name));
        // Also delete all items in this fandom
        setItems(items.filter(item => item.fandom !== name));
    };

    const updateFandomName = (oldName: string, newName: string) => {
        setFandoms(fandoms.map(f => f === oldName ? newName : f));
        setItems(items.map(item =>
            item.fandom === oldName
                ? { ...item, fandom: newName }
                : item
        ));
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
            items, fandoms, preOrders,
            addItem, updateItem, deleteItem,
            addFandom, deleteFandom, updateFandomName,
            addPreOrder, updatePreOrder, deletePreOrder
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
