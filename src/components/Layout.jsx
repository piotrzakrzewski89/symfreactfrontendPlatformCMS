// components/Layout.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "./Navbar";

const Layout = ({ children }) => {
    const location = useLocation();
    const menuItems = [
        { path: "/", label: "Strona Główna" },
        { path: "/company", label: "Firma" },
        { path: "/users", label: "Pracownicy" },
        { path: "/points-bank", label: "Bank Punktów" },
        { path: "/categories", label: "Kategorie" },
    ];

    return (
        <div>
            <NavBar />
            <div className="d-flex">
                <aside className="bg-light border-end" style={{ width: "200px", minHeight: "100vh" }}>
                    <ul className="nav flex-column p-2">
                        {menuItems.map((item) => (
                            <li className="nav-item mb-1" key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? "active fw-bold" : ""}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="p-3" style={{ flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
