// Funkcje pomocnicze dla książek
import type { Book, BookFilters, SortBy } from '../types/book.types';

// Formatowanie ceny
export const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2) + ' zł';
};

// Formatowanie daty
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Sprawdzanie dostępności książki
export const isBookAvailable = (book: Book): boolean => {
    return book.quantity > 0;
};

// Pobieranie statusu dostępności
export const getAvailabilityStatus = (book: Book) => {
    if (book.quantity === 0) {
        return { text: 'Brak w magazynie', className: 'bg-danger' };
    }
    return { text: `Dostępne: ${book.quantity}`, className: 'bg-success' };
};

// Filtrowanie książek
export const filterBooks = (books: Book[], filters: BookFilters): Book[] => {
    let filteredBooks = [...books];
    
    if (filters.category && filters.category !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.category === filters.category);
    }
    
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            (book.description?.toLowerCase().includes(searchTerm) || false) ||
            book.ownerName.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filters.priceRange) {
        filteredBooks = filteredBooks.filter(book => 
            book.price >= filters.priceRange!.min && 
            book.price <= filters.priceRange!.max
        );
    }
    
    if (filters.availableOnly) {
        filteredBooks = filteredBooks.filter(book => book.quantity > 0);
    }
    
    return filteredBooks;
};

// Sortowanie książek
export const sortBooks = (books: Book[], sortBy: SortBy): Book[] => {
    const sortedBooks = [...books];
    
    switch (sortBy) {
        case 'title':
            return sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        case 'price_asc':
            return sortedBooks.sort((a, b) => a.price - b.price);
        case 'price_desc':
            return sortedBooks.sort((a, b) => b.price - a.price);
        case 'date':
            return sortedBooks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'quantity':
            return sortedBooks.sort((a, b) => b.quantity - a.quantity);
        default:
            return sortedBooks;
    }
};

// Pobieranie unikalnych kategorii
export const getCategories = (books: Book[]): string[] => {
    const categories = [...new Set(books.map(book => book.category).filter(Boolean) as string[])];
    return categories.sort();
};

// Generowanie placeholdera dla okładki
export const getCoverImage = (book: Book): string => {
    if (book.coverImage) {
        // Jeśli coverImage zaczyna się od /, dodaj pełny URL backendu
        if (book.coverImage.startsWith('/')) {
            return `http://localhost:8084${book.coverImage}`;
        }
        return book.coverImage;
    }
    // Można dodać domyślny placeholder lub URL do serwisu z placeholderami
    return `https://via.placeholder.com/200x300/6c757d/ffffff?text=${encodeURIComponent(book.title)}`;
};
