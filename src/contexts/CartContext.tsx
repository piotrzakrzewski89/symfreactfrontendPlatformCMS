import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Book, CartItem } from '../types/book.types';

interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (book: Book, quantity?: number) => void;
    removeFromCart: (bookUuid: string) => void;
    updateQuantity: (bookUuid: string, newQuantity: number) => void;
    clearCart: () => void;
    getTotalPrice: number;
    getTotalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Dodawanie do koszyka - useCallback
    const addToCart = useCallback((book: Book, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.uuid === book.id);
            
            if (existingItem) {
                // Aktualizacja ilości jeśli produkt już jest w koszyku
                return prevItems.map(item =>
                    item.uuid === book.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Dodanie nowego produktu - używamy book.id jako uuid
                return [...prevItems, { ...book, quantity, uuid: book.id }];
            }
        });
    }, []);

    // Usuwanie z koszyka - useCallback
    const removeFromCart = useCallback((bookUuid: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.uuid !== bookUuid));
    }, []);

    // Aktualizacja ilości - useCallback
    const updateQuantity = useCallback((bookUuid: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(bookUuid);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.uuid === bookUuid
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        }
    }, [removeFromCart]);

    // Czyszczenie koszyka - useCallback
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Obliczanie sumy - useMemo
    const getTotalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    // Obliczanie ilości produktów - useMemo
    const getTotalItems = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const value: CartContextType = useMemo(() => ({
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
    }), [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
