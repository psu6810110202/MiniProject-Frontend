import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    role: 'user' | 'admin' | null;
    login: (token: string, role: 'user' | 'admin', rememberMe: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [role, setRole] = useState<'user' | 'admin' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check for token on mount
        const savedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const savedRole = (localStorage.getItem('role') || sessionStorage.getItem('role')) as 'user' | 'admin';

        if (savedToken) {
            setToken(savedToken);
            setRole(savedRole || 'user'); // Default to user if not found but token exists
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newRole: 'user' | 'admin', rememberMe: boolean) => {
        setToken(newToken);
        setRole(newRole);
        setIsLoggedIn(true);
        if (rememberMe) {
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('role', newRole);
        } else {
            sessionStorage.setItem('access_token', newToken);
            sessionStorage.setItem('role', newRole);
        }
    };

    const logout = () => {
        setToken(null);
        setIsLoggedIn(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('role');
    };

    if (isLoading) {
        // You could render a loading spinner here
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#FF5722' }}>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, role, login, logout }}>
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
