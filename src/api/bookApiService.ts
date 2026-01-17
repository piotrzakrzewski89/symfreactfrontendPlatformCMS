import { BOOK_ENDPOINTS } from './bookApi';
import { useAuth } from '../auth/useAuth';

// Types for API responses
export interface Book {
    id: string;
    uuid: string;
    title: string;
    description?: string;
    price: number;
    formattedPrice: string;
    quantity: number;
    coverImage?: string;
    category?: string;
    ownerUuid: string;
    ownerName: string;
    createdAt: string;
    updatedAt?: string;
    isAvailable: boolean;
    availabilityStatus: {
        status: string;
        text: string;
        class: string;
    };
}

export interface BookPurchase {
    id: string;
    bookUuid: string;
    bookTitle: string;
    bookCoverImage?: string;
    bookCategory?: string;
    buyerUuid: string;
    buyerName: string;
    buyerEmail: string;
    quantity: number;
    purchasePrice: number;
    totalPrice: number;
    formattedPurchasePrice: string;
    formattedTotalPrice: string;
    status: string;
    statusDisplay: {
        text: string;
        class: string;
        icon: string;
    };
    notes?: string;
    paymentMethod?: string;
    transactionId?: string;
    purchaseDate: string;
    completedAt?: string;
    isPending: boolean;
    isCompleted: boolean;
    isCancelled: boolean;
    isRefunded: boolean;
}

export interface BookFilters {
    search?: string;
    category?: string;
    availableOnly?: boolean;
    priceMin?: number;
    priceMax?: number;
    ownerUuid?: string;
    sortBy?: string;
    sortOrder?: string;
    companyFilter?: 'company' | 'all';
    excludeOwn?: boolean;
}

export interface PurchaseFilters {
    buyerUuid?: string;
    sellerUuid?: string;
    bookUuid?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    sortOrder?: string;
}

// API Service class
class BookApiService {
    private getAuthHeaders(): Record<string, string> {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            const admin = JSON.parse(adminData);
            const token = typeof admin.token === 'string' 
                ? admin.token 
                : admin.token?.access_token;
            
            if (token) {
                return {
                    'Authorization': `Bearer ${token}`
                };
            }
        }
        return {};
    }

    private async fetchApi(url: string, options?: RequestInit): Promise<any> {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...this.getAuthHeaders(),
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Books API
    async getBooks(filters: BookFilters = {}): Promise<{ data: Book[]; meta: any }> {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const url = params.toString() ? `${BOOK_ENDPOINTS.BOOKS}?${params}` : BOOK_ENDPOINTS.BOOKS;
        return this.fetchApi(url);
    }

    async getBook(uuid: string): Promise<{ data: Book }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOK(uuid));
    }

    async createBook(bookData: Partial<Book>): Promise<{ data: Book }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS, {
            method: 'POST',
            body: JSON.stringify(bookData),
        });
    }

    async updateBook(uuid: string, bookData: Partial<Book>): Promise<{ data: Book }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOK(uuid), {
            method: 'PUT',
            body: JSON.stringify(bookData),
        });
    }

    async deleteBook(uuid: string): Promise<void> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOK(uuid), {
            method: 'DELETE',
        });
    }

    async getAvailableBooks(): Promise<{ data: Book[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_AVAILABLE);
    }

    async searchBooks(query: string): Promise<{ data: Book[] }> {
        return this.fetchApi(`${BOOK_ENDPOINTS.BOOKS_SEARCH}?q=${encodeURIComponent(query)}`);
    }

    async getBooksByCategory(category: string): Promise<{ data: Book[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_BY_CATEGORY(category));
    }

    async getCategories(): Promise<{ data: string[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_CATEGORIES);
    }

    async getRecentBooks(limit: number = 10): Promise<{ data: Book[] }> {
        return this.fetchApi(`${BOOK_ENDPOINTS.BOOKS_RECENT}?limit=${limit}`);
    }

    async getBooksByOwner(ownerUuid: string): Promise<{ data: Book[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_BY_OWNER(ownerUuid));
    }

    async getPlatformStatistics(): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_STATISTICS);
    }

    async getOwnerStatistics(ownerUuid: string): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.BOOKS_OWNER_STATISTICS(ownerUuid));
    }

    async checkBookAvailability(uuid: string, quantity: number = 1): Promise<{ data: any }> {
        return this.fetchApi(`${BOOK_ENDPOINTS.BOOKS_AVAILABILITY(uuid)}?quantity=${quantity}`);
    }

    // Purchases API
    async getPurchases(filters: PurchaseFilters = {}): Promise<{ data: BookPurchase[]; meta: any }> {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const url = params.toString() ? `${BOOK_ENDPOINTS.PURCHASES}?${params}` : BOOK_ENDPOINTS.PURCHASES;
        return this.fetchApi(url);
    }

    async getPurchase(uuid: string): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE(uuid));
    }

    async createPurchase(purchaseData: Partial<BookPurchase>): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES, {
            method: 'POST',
            body: JSON.stringify(purchaseData),
        });
    }

    async updatePurchaseStatus(uuid: string, status: string): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE_UPDATE_STATUS(uuid), {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async completePurchase(uuid: string, transactionId?: string): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE_COMPLETE(uuid), {
            method: 'POST',
            body: JSON.stringify({ transactionId }),
        });
    }

    async cancelPurchase(uuid: string): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE_CANCEL(uuid), {
            method: 'POST',
        });
    }

    async refundPurchase(uuid: string): Promise<{ data: BookPurchase }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE_REFUND(uuid), {
            method: 'POST',
        });
    }

    async getPurchasesByBuyer(buyerUuid: string): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_BY_BUYER(buyerUuid));
    }

    async getPurchasesBySeller(sellerUuid: string): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_BY_SELLER(sellerUuid));
    }

    async getPurchasesByBook(bookUuid: string): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_BY_BOOK(bookUuid));
    }

    async getPurchasesByStatus(status: string): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_BY_STATUS(status));
    }

    async getPendingPurchases(): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_PENDING);
    }

    async getRecentPurchases(limit: number = 10): Promise<{ data: BookPurchase[] }> {
        return this.fetchApi(`${BOOK_ENDPOINTS.PURCHASES_RECENT}?limit=${limit}`);
    }

    async getPurchaseStatistics(): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_STATISTICS);
    }

    async getBuyerStatistics(buyerUuid: string): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_BUYER_STATISTICS(buyerUuid));
    }

    async getSellerStatistics(sellerUuid: string): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASES_SELLER_STATISTICS(sellerUuid));
    }

    async getPurchaseAnalytics(from: string, to: string): Promise<{ data: any }> {
        return this.fetchApi(`${BOOK_ENDPOINTS.PURCHASES_ANALYTICS}?from=${from}&to=${to}`);
    }

    async bulkCompletePurchases(purchaseUuids: string[]): Promise<{ data: any }> {
        return this.fetchApi(BOOK_ENDPOINTS.PURCHASE_BULK_COMPLETE, {
            method: 'POST',
            body: JSON.stringify({ purchaseUuids }),
        });
    }
}

// Export singleton instance
export const bookApiService = new BookApiService();
export default bookApiService;
