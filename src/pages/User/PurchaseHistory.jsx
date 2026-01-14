import React, { useState } from 'react';

// Symulacja danych historii zakupów
const mockPurchaseHistory = [
    {
        id: '1',
        bookTitle: 'Wiedźmin: Ostatnie życzenie',
        bookUuid: '550e8400-e29b-41d4-a716-446655440001',
        sellerName: 'Jan Kowalski',
        sellerUuid: '550e8400-e29b-41d4-a716-446655440100',
        quantity: 1,
        purchasePrice: 45.99,
        totalPrice: 45.99,
        purchaseDate: '2024-01-15T14:30:00Z',
        status: 'completed' // completed, pending, cancelled
    },
    {
        id: '2',
        bookTitle: 'Hobbit',
        bookUuid: '550e8400-e29b-41d4-a716-446655440003',
        sellerName: 'Piotr Wiśniewski',
        sellerUuid: '550e8400-e29b-41d4-a716-446655440102',
        quantity: 2,
        purchasePrice: 39.99,
        totalPrice: 79.98,
        purchaseDate: '2024-01-14T10:15:00Z',
        status: 'completed'
    },
    {
        id: '3',
        bookTitle: '1984',
        bookUuid: '550e8400-e29b-41d4-a716-446655440006',
        sellerName: 'Magdalena Zielińska',
        sellerUuid: '550e8400-e29b-41d4-a716-446655440105',
        quantity: 1,
        purchasePrice: 31.99,
        totalPrice: 31.99,
        purchaseDate: '2024-01-13T16:45:00Z',
        status: 'pending'
    },
    {
        id: '4',
        bookTitle: 'Pan Tadeusz',
        bookUuid: '550e8400-e29b-41d4-a716-446655440002',
        sellerName: 'Anna Nowak',
        sellerUuid: '550e8400-e29b-41d4-a716-446655440101',
        quantity: 3,
        purchasePrice: 29.50,
        totalPrice: 88.50,
        purchaseDate: '2024-01-12T09:20:00Z',
        status: 'completed'
    },
    {
        id: '5',
        bookTitle: 'Duma i uprzedzenie',
        bookUuid: '550e8400-e29b-41d4-a716-446655440005',
        sellerName: 'Tomasz Lewandowski',
        sellerUuid: '550e8400-e29b-41d4-a716-446655440104',
        quantity: 1,
        purchasePrice: 42.50,
        totalPrice: 42.50,
        purchaseDate: '2024-01-10T11:30:00Z',
        status: 'cancelled'
    }
];

const PurchaseHistory = () => {
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, cancelled
    const [sortBy, setSortBy] = useState('date'); // date, price, title

    // Filtrowanie historii
    const filteredHistory = mockPurchaseHistory.filter(purchase => {
        if (filterStatus === 'all') return true;
        return purchase.status === filterStatus;
    });

    // Sortowanie
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.purchaseDate) - new Date(a.purchaseDate);
            case 'price':
                return b.totalPrice - a.totalPrice;
            case 'title':
                return a.bookTitle.localeCompare(b.bookTitle);
            default:
                return 0;
        }
    });

    // Obliczenia statystyk
    const totalSpent = filteredHistory
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.totalPrice, 0);
    
    const totalBooks = filteredHistory
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.quantity, 0);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="badge bg-success">Zakończone</span>;
            case 'pending':
                return <span className="badge bg-warning">Oczekujące</span>;
            case 'cancelled':
                return <span className="badge bg-danger">Anulowane</span>;
            default:
                return <span className="badge bg-secondary">Nieznany</span>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mt-4">
            {/* Nagłówek */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2>Historia Zakupów</h2>
                    <p className="text-muted">Przeglądaj historię swoich zakupów książek</p>
                </div>
            </div>

            {/* Statystyki */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">{totalBooks}</h5>
                            <p className="card-text">Kupionych książek</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-primary">{totalSpent.toFixed(2)} zł</h5>
                            <p className="card-text">Całkowity wydatek</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-info">
                                {filteredHistory.filter(p => p.status === 'pending').length}
                            </h5>
                            <p className="card-text">Oczekujące transakcje</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtry */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Status transakcji</label>
                                    <select 
                                        className="form-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">Wszystkie</option>
                                        <option value="completed">Zakończone</option>
                                        <option value="pending">Oczekujące</option>
                                        <option value="cancelled">Anulowane</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Sortuj według</label>
                                    <select 
                                        className="form-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="date">Daty zakupu</option>
                                        <option value="price">Ceny</option>
                                        <option value="title">Tytułu</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista transakcji */}
            {sortedHistory.length > 0 ? (
                <div className="list-group">
                    {sortedHistory.map((purchase) => (
                        <div key={purchase.id} className="list-group-item">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <h6 className="mb-1">{purchase.bookTitle}</h6>
                                    <small className="text-muted">
                                        Sprzedawca: {purchase.sellerName}
                                    </small>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        <div className="fw-bold">{purchase.quantity} szt.</div>
                                        <small className="text-muted">
                                            {purchase.purchasePrice.toFixed(2)} zł/szt.
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        <div className="h5 text-primary mb-0">
                                            {purchase.totalPrice.toFixed(2)} zł
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        {getStatusBadge(purchase.status)}
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        <small className="text-muted">
                                            {formatDate(purchase.purchaseDate)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-receipt display-1 text-muted"></i>
                    <h4 className="text-muted mt-3">Brak transakcji</h4>
                    <p className="text-muted">Nie masz jeszcze żadnych zakupów</p>
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;
