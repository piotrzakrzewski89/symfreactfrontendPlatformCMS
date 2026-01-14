// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import LoginForm from "./components/LoginForm";
import PrivateRoute from "./components/PrivateRoute";
import UserRoute from "./components/UserRoute";

import Layout from "./components/Layout";
import UserLayout from "./components/UserLayout";
import BookList from "./components/BookList";

import Home from "./pages/Home/Home";
import Company from "./pages/Company/Company";
import Users from "./pages/Users/Users";
import PointsBank from "./pages/BankPoints/BankPoints";

import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";
import UserPoints from "./pages/User/UserPoints";
import MyBooks from "./pages/User/MyBooks";
import PurchaseHistory from "./pages/User/PurchaseHistory";
import ChatWidget from "./components/ChatWidget";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        
                        {/* Routing dla Admina (CMS) */}
                        <Route
                            path="/*"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/company" element={<Company />} />
                                            <Route path="/users" element={<Users />} />
                                            <Route path="/points-bank" element={<PointsBank />} />
                                        </Routes>
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        
                        {/* Routing dla zwykłego użytkownika (Frontend) */}
                        <Route
                            path="/user/*"
                            element={
                                <UserRoute>
                                    <UserLayout>
                                        <Routes>
                                            <Route path="" element={<UserDashboard />} />
                                            <Route path="profile" element={<UserProfile />} />
                                            <Route path="points" element={<UserPoints />} />
                                            <Route path="my-books" element={<MyBooks />} />
                                            <Route path="purchase-history" element={<PurchaseHistory />} />
                                        </Routes>
                                    </UserLayout>
                                    <ChatWidget />
                                </UserRoute>
                            }
                        />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
