import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import CartWidget from './CartWidget';

interface UserLayoutProps {
    children: React.ReactNode;
}

interface MenuItem {
    path: string;
    label: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
    const { admin, logout } = useAuth();
    const location = useLocation();

    const menuItems: MenuItem[] = [
        { path: "/user", label: "Strona główna" },
        { path: "/user/profile", label: "Mój profil" },
        { path: "/user/points", label: "Moje punkty" },
        { path: "/user/my-books", label: "Moje książki" },
        { path: "/user/purchase-history", label: "Historia zakupów" },
    ];

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
    };

    return (
        <div>
            {/* Nawigacja dla użytkownika */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link to="/user" className="navbar-brand">Portal Pracownica</Link>
                    
                    <div className="navbar-nav ms-auto">
                        <div className="nav-item dropdown">
                            <a 
                                className="nav-link dropdown-toggle" 
                                href="#" 
                                role="button" 
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {admin?.email}
                            </a>
                            <ul className="dropdown-menu">
                                {menuItems.map((item) => (
                                    <li key={item.path}>
                                        <Link 
                                            to={item.path} 
                                            className={`dropdown-item ${location.pathname === item.path ? "active" : ""}`}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <a className="dropdown-item" href="#" onClick={handleLogout}>
                                        Wyloguj
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Główna treść */}
            <main>
                {children}
            </main>
            
            {/* Widget koszyka */}
            <CartWidget />
        </div>
    );
};

export default UserLayout;
