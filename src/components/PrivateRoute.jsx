import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const PrivateRoute = ({ children }) => {
    const { admin, isAdmin } = useAuth();
    
    if (!admin) {
        return <Navigate to="/login" replace />;
    }
    
    // Sprawdzamy czy użytkownik ma rolę ROLE_ADMIN_CMS
    if (!isAdmin()) {
        return <Navigate to="/user" replace />;
    }
    
    return children;
};

export default PrivateRoute;