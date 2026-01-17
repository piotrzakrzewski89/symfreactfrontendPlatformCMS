// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ActivityTrackerProvider } from "./hooks/useActivityTracker";
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
import Categories from "./pages/Admin/Categories";

import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";
import UserPoints from "./pages/User/UserPoints";
import MyBooks from "./pages/User/MyBooks";
import AddBook from "./pages/User/AddBook";
import PurchaseHistory from "./pages/User/PurchaseHistory";
import Checkout from "./pages/User/Checkout";
import ChatWidget from "./components/ChatWidget";

function App() {
    return (
        <AuthProvider>
            <ActivityTrackerProvider>
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
                                                <Route path="/categories" element={<Categories />} />
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
                                                <Route path="add-book" element={<AddBook />} />
                                                <Route path="checkout" element={<Checkout />} />
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
            </ActivityTrackerProvider>
        </AuthProvider>
    );
}

export default App;
