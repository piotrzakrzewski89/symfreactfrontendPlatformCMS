// API configuration for book platform
const API_BASE_URL = 'http://localhost:8084/api';

// Book API endpoints
export const BOOK_ENDPOINTS = {
    // Books
    BOOKS: `${API_BASE_URL}/books`,
    BOOK: (uuid) => `${API_BASE_URL}/books/${uuid}`,
    BOOKS_AVAILABLE: `${API_BASE_URL}/books/available`,
    BOOKS_SEARCH: `${API_BASE_URL}/books/search`,
    BOOKS_CATEGORIES: `${API_BASE_URL}/books/categories`,
    BOOKS_RECENT: `${API_BASE_URL}/books/recent`,
    BOOKS_BY_CATEGORY: (category) => `${API_BASE_URL}/books/category/${category}`,
    BOOKS_BY_OWNER: (ownerUuid) => `${API_BASE_URL}/books/owner/${ownerUuid}`,
    BOOKS_STATISTICS: `${API_BASE_URL}/books/statistics`,
    BOOKS_OWNER_STATISTICS: (ownerUuid) => `${API_BASE_URL}/books/owner/${ownerUuid}/statistics`,
    BOOKS_AVAILABILITY: (uuid) => `${API_BASE_URL}/books/${uuid}/availability`,
    
    // Purchases
    PURCHASES: `${API_BASE_URL}/purchases`,
    PURCHASE: (uuid) => `${API_BASE_URL}/purchases/${uuid}`,
    PURCHASES_BY_BUYER: (buyerUuid) => `${API_BASE_URL}/purchases/buyer/${buyerUuid}`,
    PURCHASES_BY_SELLER: (sellerUuid) => `${API_BASE_URL}/purchases/seller/${sellerUuid}`,
    PURCHASES_BY_BOOK: (bookUuid) => `${API_BASE_URL}/purchases/book/${bookUuid}`,
    PURCHASES_BY_STATUS: (status) => `${API_BASE_URL}/purchases/status/${status}`,
    PURCHASES_PENDING: `${API_BASE_URL}/purchases/pending`,
    PURCHASES_RECENT: `${API_BASE_URL}/purchases/recent`,
    PURCHASES_STATISTICS: `${API_BASE_URL}/purchases/statistics`,
    PURCHASES_BUYER_STATISTICS: (buyerUuid) => `${API_BASE_URL}/purchases/buyer/${buyerUuid}/statistics`,
    PURCHASES_SELLER_STATISTICS: (sellerUuid) => `${API_BASE_URL}/purchases/seller/${sellerUuid}/statistics`,
    PURCHASES_ANALYTICS: `${API_BASE_URL}/purchases/analytics`,
    
    // Purchase actions
    PURCHASE_COMPLETE: (uuid) => `${API_BASE_URL}/purchases/${uuid}/complete`,
    PURCHASE_CANCEL: (uuid) => `${API_BASE_URL}/purchases/${uuid}/cancel`,
    PURCHASE_REFUND: (uuid) => `${API_BASE_URL}/purchases/${uuid}/refund`,
    PURCHASE_UPDATE_STATUS: (uuid) => `${API_BASE_URL}/purchases/${uuid}/status`,
    PURCHASE_BULK_COMPLETE: `${API_BASE_URL}/purchases/bulk-complete`,
};

export default API_BASE_URL;
