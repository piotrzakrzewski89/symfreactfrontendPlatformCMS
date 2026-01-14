import React from 'react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/bookUtils';
import type { CartItem } from '../types/book.types';

const CartWidget = () => {
    const { cartItems, isCartOpen, setIsCartOpen, getTotalPrice, getTotalItems, removeFromCart, clearCart } = useCart();

    const handleCheckout = () => {
        alert('Funkcja płatności zostanie zaimplementowana w przyszłości!');
        // Tutaj będzie logika płatności
    };

    const handleRemoveItem = (bookUuid: string) => {
        removeFromCart(bookUuid);
    };

    if (!isCartOpen) {
        return (
            <div className="cart-widget position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
                <button 
                    className="btn btn-primary btn-lg rounded-circle position-relative"
                    onClick={() => setIsCartOpen(true)}
                    aria-label="Otwórz koszyk"
                >
                    <i className="bi bi-cart3"></i>
                    {getTotalItems > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {getTotalItems}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="cart-widget position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className="card" style={{ width: '350px', maxHeight: '500px' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-cart3"></i> Koszyk ({getTotalItems})
                    </h5>
                    <button 
                        className="btn-close"
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Zamknij koszyk"
                    ></button>
                </div>
                
                <div className="card-body" style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    {cartItems.length === 0 ? (
                        <div className="text-center py-3">
                            <i className="bi bi-cart-x display-4 text-muted"></i>
                            <p className="text-muted mt-2">Koszyk jest pusty</p>
                        </div>
                    ) : (
                        cartItems.map((item: CartItem) => (
                            <div key={item.uuid} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.title}</h6>
                                    <small className="text-muted">
                                        {formatPrice(item.price)} × {item.quantity}
                                    </small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="fw-bold me-3">
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
                    <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Suma:</h5>
                            <h4 className="text-primary mb-0">{formatPrice(getTotalPrice)}</h4>
                        </div>
                        <div className="btn-group w-100" role="group">
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={clearCart}
                            >
                                Wyczyść
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleCheckout}
                            >
                                <i className="bi bi-lightning"></i> Kup teraz
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartWidget;
