import type { Book } from '../types/book.types';

// Statyczne dane przykładowych książek do testowania UI
export const mockBooks: Book[] = [
    {
        id: '1',
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Wiedźmin: Ostatnie życzenie',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440100',
        ownerName: 'Jan Kowalski',
        price: 45.99,
        coverImage: null, // Można dodać URL do okładki
        description: 'Pierwszy zbiór opowiadań o wiedźminie Geralcie z Rivii',
        quantity: 3,
        category: 'Fantasy',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: null
    },
    {
        id: '2',
        uuid: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Pan Tadeusz',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440101',
        ownerName: 'Anna Nowak',
        price: 29.50,
        coverImage: null,
        description: 'Epopeja narodowa Adama Mickiewicza',
        quantity: 5,
        category: 'Klasyka',
        createdAt: '2024-01-11T14:30:00Z',
        updatedAt: null
    },
    {
        id: '3',
        uuid: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Hobbit',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440102',
        ownerName: 'Piotr Wiśniewski',
        price: 39.99,
        coverImage: null,
        description: 'Opowieść o podróży Bilba Bagginsa do Samotnej Góry',
        quantity: 2,
        category: 'Fantasy',
        createdAt: '2024-01-12T09:15:00Z',
        updatedAt: null
    },
    {
        id: '4',
        uuid: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Lalka',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440103',
        ownerName: 'Katarzyna Dąbrowska',
        price: 35.00,
        coverImage: null,
        description: 'Powieść realistyczna Bolesława Prusa',
        quantity: 0, // Brak dostępnych sztuk
        category: 'Klasyka',
        createdAt: '2024-01-13T16:45:00Z',
        updatedAt: null
    },
    {
        id: '5',
        uuid: '550e8400-e29b-41d4-a716-446655440005',
        title: 'Duma i uprzedzenie',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440104',
        ownerName: 'Tomasz Lewandowski',
        price: 42.50,
        coverImage: null,
        description: 'Romans Jane Austen o miłości Elżbiety Bennet i pana Darcy\'ego',
        quantity: 4,
        category: 'Romans',
        createdAt: '2024-01-14T11:20:00Z',
        updatedAt: null
    },
    {
        id: '6',
        uuid: '550e8400-e29b-41d4-a716-446655440006',
        title: '1984',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440105',
        ownerName: 'Magdalena Zielińska',
        price: 31.99,
        coverImage: null,
        description: 'Antyutopia George\'a Orwella o totalitarnej przyszłości',
        quantity: 7,
        category: 'Sci-Fi',
        createdAt: '2024-01-15T13:10:00Z',
        updatedAt: null
    },
    {
        id: '7',
        uuid: '550e8400-e29b-41d4-a716-446655440007',
        title: 'Krzyżacy',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440106',
        ownerName: 'Robert Wójcik',
        price: 55.00,
        coverImage: null,
        description: 'Historyczna powieść Henryka Sienkiewicza',
        quantity: 1,
        category: 'Historyczna',
        createdAt: '2024-01-16T10:30:00Z',
        updatedAt: null
    },
    {
        id: '8',
        uuid: '550e8400-e29b-41d4-a716-446655440008',
        title: 'Mały Książę',
        ownerUuid: '550e8400-e29b-41d4-a716-446655440107',
        ownerName: 'Joanna Kowalczyk',
        price: 25.99,
        coverImage: null,
        description: 'Opowieść Antoine\'a de Saint-Exupéry\'ego o małym księciu',
        quantity: 6,
        category: 'Dla dzieci',
        createdAt: '2024-01-17T15:45:00Z',
        updatedAt: null
    }
];
