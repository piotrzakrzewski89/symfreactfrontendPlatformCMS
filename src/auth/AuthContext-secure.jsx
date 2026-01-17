import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(() => {
        try {
            const stored = sessionStorage.getItem('admin');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error parsing stored admin data:', error);
            sessionStorage.removeItem('admin');
            return null;
        }
    });

    const login = (adminData) => {
        try {
            // Validate input
            if (!adminData || !adminData.token || !adminData.email) {
                throw new Error('Invalid admin data');
            }

            const expiry = Date.now() + 30 * 60 * 1000; // 30 min
            const updatedAdmin = { ...adminData, expiresAt: expiry };
            setAdmin(updatedAdmin);
            
            // Use sessionStorage instead of localStorage for better security
            sessionStorage.setItem('admin', JSON.stringify(updatedAdmin));
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Mark user as offline in Redis via backend
            if (admin?.token) {
                await fetch('http://localhost:8084/api/platform/presence/offline', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${admin.token}`
                    }
                }).catch(err => console.error('Failed to update presence:', err));
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Always clear session and redirect
            setAdmin(null);
            sessionStorage.removeItem('admin');
            window.location.href = '/login';
        }
    };

    // Reset expiry przy każdym request
    const resetExpiry = () => {
        if (!admin) return;
        
        try {
            const expiry = Date.now() + 30 * 60 * 1000;
            const updatedAdmin = { ...admin, expiresAt: expiry };
            setAdmin(updatedAdmin);
            sessionStorage.setItem('admin', JSON.stringify(updatedAdmin));
        } catch (error) {
            console.error('Error resetting expiry:', error);
            logout();
        }
    };

    // Auto logout when token expires
    useEffect(() => {
        if (!admin || !admin.expiresAt) return;

        const timeUntilExpiry = admin.expiresAt - Date.now();
        
        if (timeUntilExpiry <= 0) {
            logout();
            return;
        }

        const timer = setTimeout(() => {
            logout();
        }, timeUntilExpiry);

        return () => clearTimeout(timer);
    }, [admin]);

    // Validate token format
    const isAuthenticated = () => {
        if (!admin || !admin.token) return false;
        
        // Check if token is expired
        if (admin.expiresAt && Date.now() > admin.expiresAt) {
            logout();
            return false;
        }
        
        return true;
    };

    const value = {
        admin,
        login,
        logout,
        resetExpiry,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
