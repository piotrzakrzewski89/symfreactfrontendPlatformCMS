// Typy danych dla książek
export interface Book {
    id: string; // UUID książki z API
    title: string;
    ownerUuid: string;
    ownerName: string;
    price: number;
    coverImage?: string | null;
    description?: string | null;
    quantity: number;
    category?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    formattedPrice?: string;
    isAvailable?: boolean;
    availabilityStatus?: string;
}

// Typy dla koszyka
export interface CartItem extends Book {
    quantity: number;
    uuid: string; // UUID używane w koszyku (to samo co book.id)
}

// Typy dla filtrów
export interface BookFilters {
    search: string;
    category: string;
    availableOnly: boolean;
    priceRange?: {
        min: number;
        max: number;
    };
}

// Typy dla sortowania
export type SortBy = 'title' | 'price_asc' | 'price_desc' | 'date' | 'quantity';

// Typy dla widoku
export type ViewMode = 'grid' | 'list';

// Typy dla statusu zakupu
export type PurchaseStatus = 'completed' | 'pending' | 'cancelled';

// Typ dla zakupu
export interface BookPurchase {
    id: string;
    bookTitle: string;
    bookUuid: string;
    sellerName: string;
    sellerUuid: string;
    quantity: number;
    purchasePrice: number;
    totalPrice: number;
    purchaseDate: string;
    status: PurchaseStatus;
}
