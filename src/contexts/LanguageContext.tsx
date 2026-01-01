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
        orders: 'Orders',
        login: 'Login',
        logout: 'Logout',
<<<<<<< HEAD
        // Call Center
=======
        welcome: 'Welcome to',
        description: 'Your ultimate gateway to the fandom universe.',
        explore: 'Explore Now',
        points: 'pts',
>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        call_center: 'Call Center',
        help_center: 'Help center',
        help_center_desc: 'We are here to help you 24/7',
        my_tickets: 'My Tickets',
        new_ticket: 'New Ticket',
        faq: 'FAQ',
        create_new_ticket: 'Create New Ticket',
        ticket_subject: 'Subject',
        ticket_category_field: 'Category',
        ticket_priority_field: 'Priority',
        ticket_message_field: 'Message',
        submit_ticket: 'Submit Ticket',
        ticket_messages: 'messages',
        created: 'Created',
        last_updated: 'Last Updated',
        frequently_asked_questions: 'Frequently Asked Questions',
        still_need_help: 'Still need help?',
        contact_support_desc: 'Our support team is ready to assist you',
        create_ticket: 'Create Ticket',
        live_chat: 'Live Chat',
        call_us: 'Call Us',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Staff Dashboard
        staff_dashboard: 'Staff Dashboard',
        staff_dashboard_desc: 'Manage customer support and staff members',
        chat_rooms: 'Chat Rooms',
        staff_members: 'Staff Members',
        add_staff: 'Add Staff',
        add_staff_member: 'Add Staff Member',
        active_chats: 'Active Chats',
        chatting_with: 'Chatting with',
        waiting_for_staff: 'Waiting for staff',
        no_staff_assigned: 'No staff assigned',
        select_chat: 'Select a chat room',
        select_chat_desc: 'Choose a chat room to start helping customers',
        type_message: 'Type your message...',
        send: 'Send',
        end_chat: 'End Chat',
        online: 'Online',
        connecting: 'Connecting',
        finding_available_staff: 'Finding available staff...',
        connecting_to_staff: 'Connecting to staff...',
        live_chat_support: 'Live Chat Support',
        you: 'You',
        chat_ended: 'Chat has ended',
        back_to_help_center: 'Back to Help Center',
        welcome_message: 'Hello! How can I help you today?',
        staff_typing_response: 'I understand. Let me help you with that.',
        please_login: 'Please login to access this feature',
        go_to_login: 'Go to Login',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Status
        status_open: 'Open',
        status_in_progress: 'In Progress',
        status_resolved: 'Resolved',
        status_closed: 'Closed',
        status_active: 'Active',
        status_waiting: 'Waiting',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Priority
        priority_low: 'Low',
        priority_medium: 'Medium',
        priority_high: 'High',
        priority_urgent: 'Urgent',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Categories
        category_general: 'General',
        category_shipping: 'Shipping',
        category_payment: 'Payment',
        category_product: 'Product',
        category_account: 'Account',
        category_technical: 'Technical',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Staff
        support_staff: 'Support Staff',
        admin: 'Administrator',
        last_seen: 'Last Seen',
        full_name: 'Full Name',
        role: 'Role',
<<<<<<< HEAD
        
=======

>>>>>>> ce5247acd0af640dafc87b8aa34c27fc5cdb17a3
        // Access
        access_denied: 'Access Denied',
        admin_only: 'This page is for administrators only',
        // About Us Page specific
        about_title: 'About DomPort',
        about_desc: 'One-stop service for art toy lovers.',
        contact: 'Contact Us',
        location: 'Location',
        // Orders Page specific
        order_id: 'Order ID',
        date: 'Date',
        status: 'Status',
        total: 'Total',
        items: 'Items',
        // Profile/Settings
        profile: 'Profile',
        settings: 'Settings',
        theme: 'Theme',
        dark_mode: 'Dark Mode',
        light_mode: 'Light Mode',
        language: 'Language',
        your_cart: 'Your Cart',
        cart_empty: 'Your cart is empty',
        // Features
        what_we_offer: 'What We Offer',
        feature_merch_title: 'Official Merchandise',
        feature_merch_desc: '100% Authentic products directly from the studio',
        feature_loyalty_title: 'Loyalty Points',
        feature_loyalty_desc: 'Earn points with every purchase, redeem for instant discounts',
        feature_preorder_title: 'Pre-order System',
        feature_preorder_desc: 'Pre-order items, guaranteed delivery',

        // Footer
        shop: 'Shop',
        who_we_are: 'Who is DomPort?',
        support: 'Support',
        all_products: 'All Products',
        vinyl_figures: 'Vinyl Figures',
        for_creators: 'For Creators',
        track_order: 'Track Your Order',

        // Login/Register
        welcome_back: 'Welcome Back',
        sign_in_desc: 'Sign in to manage your collection',
        username: 'Username',
        password: 'Password',
        email: 'Email',
        confirm_password: 'Confirm Password',
        remember_me: 'Remember Me',
        sign_in: 'Sign In',
        signing_in: 'Signing In...',
        dont_have_account: "Don't have an account?",
        sign_up: 'Sign Up',
        create_account: 'Create Account',
        join_us: 'Join DomPort today',
        creating_account: 'Creating Account...',
        already_have_account: 'Already have an account?',
        login_here: 'Login here',

        // Statuses
        status_delivered: 'Delivered',
        status_shipped: 'Shipped',
        status_pending: 'Pending',
        status_cancelled: 'Cancelled',

        // Profile specific
        order_history: 'Order History & Tracking',

        // PreOrder
        exclusive_preorders: 'Exclusive Pre-Orders',
        preorder_subtitle: 'Secure the most anticipated items before anyone else.',
        release_date: 'Release',
        total_price: 'Total Price',
        deposit: 'Deposit',
        preorder_now: 'Pre-order Now',

        // Catalog
        explore_fandoms: 'Explore Fandoms',
        catalog_subtitle: 'Search items by your favorite series.',
        search_placeholder: 'Search items...',
        max_price: 'Max Price',
        no_items_found: 'No items found matching your criteria.',
        reset_filters: 'Reset Filters',
        view_details: 'View',
    },
    th: {
        home: 'หน้าหลัก',
        catalog: 'แคตตาล็อก',
        preorder: 'สั่งจองล่วงหน้า',
        updates: 'อัปเดต',
        about: 'เกี่ยวกับเรา',
        orders: 'รายการคำสั่งซื้อ',
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
        location: 'สถานที่ตั้ง',
        // Orders Page specific
        order_id: 'รหัสคำสั่งซื้อ',
        date: 'วันที่',
        status: 'สถานะ',
        total: 'ยอดรวม',
        items: 'รายการสินค้า',
        // Profile/Settings
        profile: 'โปรไฟล์',
        settings: 'การตั้งค่า',
        theme: 'ธีม',
        dark_mode: 'โหมดมืด',
        light_mode: 'โหมดสว่าง',
        language: 'ภาษา',
        your_cart: 'ตะกร้าของคุณ',
        cart_empty: 'ตะกร้าของคุณว่างเปล่า',
        // Features
        what_we_offer: 'สิ่งที่เรามอบให้',
        feature_merch_title: 'สินค้าลิขสิทธิ์แท้',
        feature_merch_desc: 'สินค้าลิขสิทธิ์แท้ 100% จากค่ายโดยตรง',
        feature_loyalty_title: 'ระบบสะสมแต้ม',
        feature_loyalty_desc: 'ทุกยอดซื้อสะสมแต้ม แลกส่วนลดได้ทันที',
        feature_preorder_title: 'ระบบสั่งจองล่วงหน้า',
        feature_preorder_desc: 'จองสินค้าล่วงหน้า การันตีได้รับของแน่นอน',

        // Footer
        shop: 'เลือกซื้อสินค้า',
        who_we_are: 'DomPort คือใคร?',
        support: 'ช่วยเหลือ',
        all_products: 'สินค้าทั้งหมด',
        vinyl_figures: 'หุ่นไวนิล',
        for_creators: 'สำหรับศิลปิน',
        help_center: 'Help center',
        track_order: 'ติดตามคำสั่งซื้อ',

        // Login/Register
        welcome_back: 'ยินดีต้อนรับกลับมา',
        sign_in_desc: 'เข้าสู่ระบบเพื่อจัดการคอลเลกชันของคุณ',
        username: 'ชื่อผู้ใช้',
        password: 'รหัสผ่าน',
        email: 'อีเมล',
        confirm_password: 'ยืนยันรหัสผ่าน',
        remember_me: 'จำฉันไว้',
        sign_in: 'เข้าสู่ระบบ',
        signing_in: 'กำลังเข้าสู่ระบบ...',
        dont_have_account: "ยังไม่มีบัญชี?",
        sign_up: 'สมัครสมาชิก',
        create_account: 'สร้างบัญชีใหม่',
        join_us: 'เข้าร่วม DomPort วันนี้',
        creating_account: 'กำลังสร้างบัญชี...',
        already_have_account: 'มีบัญชีอยู่แล้ว?',
        login_here: 'เข้าสู่ระบบที่นี่',

        // Statuses
        status_delivered: 'จัดส่งแล้ว',
        status_shipped: 'กำลังจัดส่ง',
        status_pending: 'รอดำเนินการ',
        status_cancelled: 'ยกเลิก',

        // Profile specific
        order_history: 'ประวัติและการติดตามคำสั่งซื้อ',

        // PreOrder
        exclusive_preorders: 'พรีออเดอร์สุดพิเศษ',
        preorder_subtitle: 'จองไอเท็มที่ทุกคนรอคอยก่อนใคร',
        release_date: 'วางจำหน่าย',
        total_price: 'ราคาทั้งหมด',
        deposit: 'มัดจำ',
        preorder_now: 'จองเลย',

        // Catalog
        explore_fandoms: 'สำรวจโลกแฟนดอม',
        catalog_subtitle: 'ค้นหาสินค้าจากซีรีส์โปรดของคุณ',
        search_placeholder: 'ค้นหาสินค้า...',
        max_price: 'ราคาสูงสุด',
        no_items_found: 'ไม่พบสินค้าที่ตรงกับเงื่อนไข',
        reset_filters: 'ล้างตัวกรอง',
        view_details: 'ดูรายละเอียด',
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
