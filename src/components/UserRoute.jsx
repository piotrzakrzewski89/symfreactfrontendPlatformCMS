import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const UserRoute = ({ children }) => {
    const { admin, hasRole } = useAuth();
    
    // Tymczasowo wyłączone do testowania
    // if (!admin || hasRole('ROLE_ADMIN_CMS')) {
    //     return <Navigate to="/login" replace />;
    // }
    
    return children;
};

export default UserRoute;
