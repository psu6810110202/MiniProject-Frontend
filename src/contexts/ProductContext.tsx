import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { mockItems, type Item } from '../data/mockItem';

interface ProductContextType {
    items: Item[];
    addItem: (item: Item) => void;
    updateItem: (item: Item) => void;
    deleteItem: (id: number) => void;
    updateFandomName: (oldName: string, newName: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Item[]>(mockItems);

    const addItem = (item: Item) => {
        setItems([...items, item]);
    };

    const updateItem = (updatedItem: Item) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const deleteItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateFandomName = (oldName: string, newName: string) => {
        setItems(items.map(item =>
            item.fandom === oldName
                ? { ...item, fandom: newName }
                : item
        ));
    };

    return (
        <ProductContext.Provider value={{ items, addItem, updateItem, deleteItem, updateFandomName }}>
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
