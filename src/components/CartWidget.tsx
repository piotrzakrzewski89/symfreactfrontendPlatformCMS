import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/bookUtils';
import type { CartItem } from '../types/book.types';
import './CartWidget.css';

const CartWidget = () => {
    const navigate = useNavigate();
    const { cartItems, isCartOpen, setIsCartOpen, getTotalPrice, getTotalItems, removeFromCart, clearCart } = useCart();

    const handleCheckout = () => {
        // Zamknij koszyk i przekieruj do strony checkout
        setIsCartOpen(false);
        navigate('/user/checkout');
    };

    const handleRemoveItem = (bookUuid: string) => {
        removeFromCart(bookUuid);
    };

    return (
        <div className="cart-widget-navbar">
            <button 
                className="cart-icon-btn"
                onClick={() => setIsCartOpen(!isCartOpen)}
                aria-label="Otwórz koszyk"
                type="button"
            >
                <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="cart-icon"
                >
                    <path 
                        d="M7 18C5.89543 18 5 18.8954 5 20C5 21.1046 5.89543 22 7 22C8.10457 22 9 21.1046 9 20C9 18.8954 8.10457 18 7 18Z" 
                        fill="currentColor"
                    />
                    <path 
                        d="M17 18C15.8954 18 15 18.8954 15 20C15 21.1046 15.8954 22 17 22C18.1046 22 19 21.1046 19 20C19 18.8954 18.1046 18 17 18Z" 
                        fill="currentColor"
                    />
                    <path 
                        d="M3 3H5L5.4 5M6.6 13H17L21 5H5.4M6.6 13L5.4 5M6.6 13L4.7 15.3C4.3 15.8 4.7 16.5 5.3 16.5H17" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                {getTotalItems > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
                        style={{ 
                            fontSize: '10px', 
                            minWidth: '16px', 
                            height: '16px',
                            lineHeight: '16px',
                            padding: '0 4px'
                        }}
                    >
                        {getTotalItems}
                    </span>
                )}
            </button>
            
            {isCartOpen && (
                <div className="cart-widget-dropdown">
                    <div className="card" style={{ width: '320px', maxHeight: '400px' }}>
                        <div className="card-header d-flex justify-content-between align-items-center py-2">
                            <h6 className="mb-0 d-flex align-items-center">
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="me-2"
                                >
                                    <path 
                                        d="M7 18C5.89543 18 5 18.8954 5 20C5 21.1046 5.89543 22 7 22C8.10457 22 9 21.1046 9 20C9 18.8954 8.10457 18 7 18Z" 
                                        fill="currentColor"
                                    />
                                    <path 
                                        d="M17 18C15.8954 18 15 18.8954 15 20C15 21.1046 15.8954 22 17 22C18.1046 22 19 21.1046 19 20C19 18.8954 18.1046 18 17 18Z" 
                                        fill="currentColor"
                                    />
                                    <path 
                                        d="M3 3H5L5.4 5M6.6 13H17L21 5H5.4M6.6 13L5.4 5M6.6 13L4.7 15.3C4.3 15.8 4.7 16.5 5.3 16.5H17" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Koszyk ({getTotalItems})
                            </h6>
                            <button 
                                className="btn-close btn-sm"
                                onClick={() => setIsCartOpen(false)}
                                aria-label="Zamknij koszyk"
                            ></button>
                        </div>
                        
                        <div className="card-body" style={{ overflowY: 'auto', maxHeight: '250px' }}>
                            {cartItems.length === 0 ? (
                                <div className="text-center py-3">
                                    <i className="bi bi-cart-x text-muted"></i>
                                    <p className="text-muted mt-2 mb-0">Koszyk jest pusty</p>
                                </div>
                            ) : (
                                cartItems.map((item: CartItem) => (
                                    <div key={item.uuid} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1 small">{item.title}</h6>
                                            <small className="text-muted">
                                                {formatPrice(item.price)} × {item.quantity}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="fw-bold me-2 small">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveItem(item.uuid)}
                                                aria-label={`Usuń ${item.title} z koszyka`}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {cartItems.length > 0 && (
                            <div className="card-footer py-2">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold">Suma:</span>
                                    <span className="fw-bold text-primary">{formatPrice(getTotalPrice)}</span>
                                </div>
                                <div className="btn-group w-100" role="group">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={clearCart}
                                    >
                                        Wyczyść
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={handleCheckout}
                                    >
                                        <i className="bi bi-lightning"></i> Kup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartWidget;
