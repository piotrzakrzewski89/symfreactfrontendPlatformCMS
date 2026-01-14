// Stałe konfiguracyjne dla aplikacji

export const APP_CONFIG = {
    // Konfiguracja API
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    
    // Konfiguracja koszyka
    CART: {
        STORAGE_KEY: 'book_cart',
        MAX_ITEMS: 50,
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minut
    },
    
    // Konfiguracja UI
    UI: {
        BOOKS_PER_PAGE: 12,
        DEBOUNCE_DELAY: 300,
        IMAGE_PLACEHOLDER_SIZE: { width: 200, height: 300 },
    },
    
    // Walidacja formularzy
    VALIDATION: {
        BOOK_TITLE: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 255,
        },
        BOOK_PRICE: {
            MIN: 0.01,
            MAX: 9999.99,
        },
        BOOK_QUANTITY: {
            MIN: 0,
            MAX: 999,
        },
        BOOK_DESCRIPTION: {
            MAX_LENGTH: 1000,
        },
    },
    
    // Komunikaty
    MESSAGES: {
        BOOK_ADDED: 'Książka dodana do koszyka',
        BOOK_REMOVED: 'Książka usunięta z koszyka',
        CART_CLEARED: 'Koszyk wyczyszczony',
        CHECKOUT_SUCCESS: 'Zakup zakończony sukcesem',
        CHECKOUT_ERROR: 'Błąd podczas zakupu',
        NO_BOOKS: 'Brak dostępnych książek',
        FILTER_NO_RESULTS: 'Brak książek dla podanych kryteriów',
    },
} as const;

// Typy dla stałych
export type SortBy = typeof APP_CONFIG.VALIDATION[keyof typeof APP_CONFIG.VALIDATION];
export type MessageKey = keyof typeof APP_CONFIG.MESSAGES;
