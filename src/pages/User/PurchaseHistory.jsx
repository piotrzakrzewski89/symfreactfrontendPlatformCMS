import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { formatPrice } from '../../utils/bookUtils';

const PurchaseHistory = () => {
    const { admin } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, cancelled
    const [sortBy, setSortBy] = useState('date'); // date, price, title

    // Pobieranie danych z backendu
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userUuid = admin?.sub || admin?.user_uuid || admin?.uuid;
                const token = admin?.token?.access_token || admin?.token;
                
                if (!userUuid || !token) {
                    throw new Error('User UUID or token not found');
                }

                // Pobierz zakupy
                const purchasesResponse = await fetch(`http://localhost:8084/api/purchases?buyerUuid=${userUuid}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!purchasesResponse.ok) {
                    throw new Error('Failed to fetch purchases');
                }

                const purchasesData = await purchasesResponse.json();
                setPurchases(purchasesData.data || []);

                // Pobierz statystyki
                const statsResponse = await fetch(`http://localhost:8084/api/purchases/buyer/${userUuid}/statistics`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStatistics(statsData.data);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [admin?.sub, admin?.user_uuid, admin?.uuid, admin?.token?.access_token, admin?.token]);

    // Filtrowanie historii
    const filteredHistory = purchases.filter(purchase => {
        if (filterStatus === 'all') return true;
        return purchase.status === filterStatus;
    });

    // Sortowanie
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'price':
                return b.totalPrice - a.totalPrice;
            case 'title':
                return a.bookTitle.localeCompare(b.bookTitle);
            default:
                return 0;
        }
    });

    // Obliczenia statystyk z backendu lub frontendu
    const totalSpent = statistics?.totalSpent || 
        filteredHistory
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.totalPrice, 0);
    
    const totalBooks = statistics?.totalBooks || 
        filteredHistory
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.quantity, 0);

    const pendingCount = statistics?.pendingPurchases || 
        filteredHistory.filter(p => p.status === 'pending').length;

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

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Ładowanie historii zakupów...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h4>Błąd ładowania</h4>
                    <p>Nie udało się załadować historii zakupów: {error}</p>
                    <button 
                        className="btn btn-outline-danger"
                        onClick={() => window.location.reload()}
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

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
                            <h5 className="card-title text-primary">{formatPrice(totalSpent)}</h5>
                            <p className="card-text">Całkowity wydatek</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-info">{pendingCount}</h5>
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
                        <div key={purchase.uuid} className="list-group-item">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <h6 className="mb-1">{purchase.bookTitle}</h6>
                                    <small className="text-muted">
                                        ID: {purchase.uuid.substring(0, 8)}...
                                    </small>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        <div className="fw-bold">{purchase.quantity} szt.</div>
                                        <small className="text-muted">
                                            {formatPrice(purchase.purchasePrice)}/szt.
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="text-center">
                                        <div className="h5 text-primary mb-0">
                                            {formatPrice(purchase.totalPrice)}
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
                                            {formatDate(purchase.createdAt)}
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
