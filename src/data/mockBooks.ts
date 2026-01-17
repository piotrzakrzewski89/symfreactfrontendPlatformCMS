import type { Book as BookType, BookFilters as BookFiltersType } from '../types/book.types';

// Import API service
import { bookApiService, type Book, type BookFilters } from '../api/bookApiService';

// Mock data fallback (used when API is unavailable)
export const mockBooksData: Book[] = [
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Wiedźmin: Ostatnie życzenie',
        description: 'Pierwszy zbiór opowiadań o wiedźminie Geralcie z Rivii',
        price: 45.99,
        formattedPrice: '45.99 zł',
        quantity: 3,
        coverImage: null,
        category: 'Fantasy',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440100',
        ownerName: 'Jan Kowalski',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 3',
            class: 'success'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        uuid: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Pan Tadeusz',
        description: 'Epopeja narodowa Adama Mickiewicza',
        price: 29.50,
        formattedPrice: '29.50 zł',
        quantity: 5,
        coverImage: null,
        category: 'Klasyka',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440101',
        ownerName: 'Anna Nowak',
        createdAt: '2024-01-11T14:30:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 5',
            class: 'success'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        uuid: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Hobbit',
        description: 'Opowieść o podróży Bilba Bagginsa do Samotnej Góry',
        price: 39.99,
        formattedPrice: '39.99 zł',
        quantity: 2,
        coverImage: null,
        category: 'Fantasy',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440102',
        ownerName: 'Piotr Wiśniewski',
        createdAt: '2024-01-12T09:15:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 2',
            class: 'success'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        uuid: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Lalka',
        description: 'Powieść realistyczna Bolesława Prusa',
        price: 35.00,
        formattedPrice: '35.00 zł',
        quantity: 0,
        coverImage: null,
        category: 'Klasyka',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440103',
        ownerName: 'Katarzyna Dąbrowska',
        createdAt: '2024-01-13T16:45:00Z',
        updatedAt: null,
        isAvailable: false,
        availabilityStatus: {
            status: 'unavailable',
            text: 'Brak w magazynie',
            class: 'danger'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440005',
        uuid: '550e8400-e29b-41d4-a716-446655440005',
        title: 'Duma i uprzedzenie',
        description: 'Romans Jane Austen o miłości Elżbiety Bennet i pana Darcy\'ego',
        price: 42.50,
        formattedPrice: '42.50 zł',
        quantity: 4,
        coverImage: null,
        category: 'Romans',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440104',
        ownerName: 'Tomasz Lewandowski',
        createdAt: '2024-01-14T11:20:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 4',
            class: 'success'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440006',
        uuid: '550e8400-e29b-41d4-a716-446655440006',
        title: '1984',
        description: 'Antyutopia George\'a Orwella o totalitarnej przyszłości',
        price: 31.99,
        formattedPrice: '31.99 zł',
        quantity: 7,
        coverImage: null,
        category: 'Sci-Fi',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440105',
        ownerName: 'Magdalena Zielińska',
        createdAt: '2024-01-15T13:10:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 7',
            class: 'success'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440007',
        uuid: '550e8400-e29b-41d4-a716-446655440007',
        title: 'Krzyżacy',
        description: 'Historyczna powieść Henryka Sienkiewicza',
        price: 55.00,
        formattedPrice: '55.00 zł',
        quantity: 1,
        coverImage: null,
        category: 'Historyczna',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440106',
        ownerName: 'Robert Wójcik',
        createdAt: '2024-01-16T10:30:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'low',
            text: 'Ostatnie sztuki: 1',
            class: 'warning'
        }
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440008',
        uuid: '550e8400-e29b-41d4-a716-446655440008',
        title: 'Mały Książę',
        description: 'Opowieść Antoine\'a de Saint-Exupéry\'ego o małym księciu',
        price: 25.99,
        formattedPrice: '25.99 zł',
        quantity: 6,
        coverImage: null,
        category: 'Dla dzieci',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440107',
        ownerName: 'Joanna Kowalczyk',
        createdAt: '2024-01-17T15:45:00Z',
        updatedAt: null,
        isAvailable: true,
        availabilityStatus: {
            status: 'available',
            text: 'Dostępne: 6',
            class: 'success'
        }
    }
];

// API-based functions
export const getBooks = async (filters: BookFilters = {}): Promise<Book[]> => {
    try {
        const response = await bookApiService.getBooks(filters);
        return response.data;
    } catch (error) {
        console.warn('API unavailable:', error);
        return [];
    }
};

export const getCategories = async (): Promise<string[]> => {
    try {
        const response = await bookApiService.getCategories();
        return response.data;
    } catch (error) {
        console.warn('API unavailable:', error);
        return [];
    }
};

// Legacy functions for backward compatibility
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
    
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        filteredBooks = filteredBooks.filter(book => 
            (filters.priceMin === undefined || book.price >= filters.priceMin) && 
            (filters.priceMax === undefined || book.price <= filters.priceMax)
        );
    }
    
    if (filters.availableOnly) {
        filteredBooks = filteredBooks.filter(book => book.quantity > 0);
    }
    
    return filteredBooks;
};

export const sortBooks = (books: Book[], sortBy: string): Book[] => {
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

// Export mock data for testing
export const mockBooks = mockBooksData;
