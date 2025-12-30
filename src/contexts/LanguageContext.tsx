import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'th';

// Define the shape of our translations
// Extending index signature to allow string keys
type Translations = {
    [key: string]: string;
}

const translations: Record<Language, Translations> = {
    en: {
        home: 'Home',
        catalog: 'Catalog',
        preorder: 'Pre-Order',
        updates: 'Updates',
        about: 'About Us',
        login: 'Login',
        logout: 'Logout',
        welcome: 'Welcome to',
        description: 'Your ultimate gateway to the fandom universe.',
        explore: 'Explore Now',
        points: 'pts',
        // About Us Page specific
        about_title: 'About DomPort',
        about_desc: 'One-stop service for art toy lovers.',
        contact: 'Contact Us',
        location: 'Location'
    },
    th: {
        home: 'หน้าหลัก',
        catalog: 'แคตตาล็อก',
        preorder: 'สั่งจองล่วงหน้า',
        updates: 'อัปเดต',
        about: 'เกี่ยวกับเรา',
        login: 'เข้าสู่ระบบ',
        logout: 'ออกจากระบบ',
        welcome: 'ยินดีต้อนรับสู่',
        description: 'ประตูสู่จักรวาลแฟนดอมที่ดีที่สุดของคุณ',
        explore: 'สำรวจเลย',
        points: 'แต้ม',
        // About Us Page specific
        about_title: 'เกี่ยวกับ DomPort',
        about_desc: 'บริการครบวงจรสำหรับคนรักอาร์ตทอย',
        contact: 'ติดต่อเรา',
        location: 'สถานที่ตั้ง'
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'th')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
