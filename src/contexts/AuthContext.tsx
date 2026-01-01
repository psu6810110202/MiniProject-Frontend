import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    points: number;
    phone?: string;
    address?: string;
    house_number?: string;
    sub_district?: string;
    district?: string;
    province?: string;
    postal_code?: string;
    facebook?: string;
    twitter?: string;
    line?: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    user: User | null;
    role: 'user' | 'admin' | null;
    login: (token: string, user: User, rememberMe: boolean) => void;
    updateUser: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'user' | 'admin' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for token on mount
        const savedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const savedUserStr = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (savedToken) {
            setToken(savedToken);
            if (savedUserStr) {
                const savedUser = JSON.parse(savedUserStr);

                // Migration: Reset points for mock users if they match old defaults
                if ((savedUser.id === 'mock-1' && savedUser.points === 100) ||
                    (savedUser.id === 'mock-2' && savedUser.points === 999)) {
                    savedUser.points = 0;
                    if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(savedUser));
                    if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(savedUser));
                }

                setUser(savedUser);
                setRole(savedUser.role);
            }
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    // Auto-save Mock User changes to DB
    useEffect(() => {
        if (user && String(user.id).startsWith('mock-')) {
            try {
                const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
                // Only update if changed
                if (JSON.stringify(db[user.id]) !== JSON.stringify(user)) {
                    db[user.id] = user;
                    localStorage.setItem('mock_users_db', JSON.stringify(db));
                }
            } catch (e) {
                console.error('Auto-save mock DB failed', e);
            }
        }
    }, [user]);

    const login = (newToken: string, newUser: User, rememberMe: boolean) => {
        setToken(newToken);
        setUser(newUser);
        setRole(newUser.role);
        setIsLoggedIn(true);

        if (rememberMe) {
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            sessionStorage.setItem('access_token', newToken);
            sessionStorage.setItem('user', JSON.stringify(newUser));
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);

        // Update session storage
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Update Mock Database (Persistent across Logouts)
        try {
            const db = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
            db[updatedUser.id] = updatedUser;
            localStorage.setItem('mock_users_db', JSON.stringify(db));
        } catch (e) {
            console.error('Failed to update mock DB', e);
        }
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
    };

    if (isLoading) {
        // You could render a loading spinner here
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#FF5722' }}>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, user, role, login, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
