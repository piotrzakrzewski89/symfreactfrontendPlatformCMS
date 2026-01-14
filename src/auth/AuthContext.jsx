
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(() => {
        const stored = localStorage.getItem('admin');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (!admin?.expiresAt) return;

        const now = Date.now();
        const remaining = admin.expiresAt - now;

        if (remaining <= 0) {
            logout();
            return;
        }

        const timer = setTimeout(logout, remaining);
        return () => clearTimeout(timer);
    }, [admin]);

    const login = (adminData) => {
        const expiry = Date.now() + 30 * 60 * 1000; // 30 min
        const updatedAdmin = { ...adminData, expiresAt: expiry };
        setAdmin(updatedAdmin);
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    };

    const isAdmin = () => {
        return admin?.roles?.includes('ROLE_ADMIN_CMS') || false;
    };

    const hasRole = (role) => {
        return admin?.roles?.includes(role) || false;
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('admin');
    };

    // reset expiry przy każdym request
    const refreshExpiry = () => {
        if (!admin) return;
        const expiry = Date.now() + 30 * 60 * 1000;
        const updatedAdmin = { ...admin, expiresAt: expiry };
        setAdmin(updatedAdmin);
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, refreshExpiry, isAdmin, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
