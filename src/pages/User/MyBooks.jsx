import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import BookCard from '../../components/BookCard';
import BookRow from '../../components/BookRow';

const MyBooks = () => {
    const { admin } = useAuth();
    const [viewMode, setViewMode] = useState('list');
    const [myBooks, setMyBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return typeof admin?.token === 'string' ? admin.token : admin?.token?.access_token;
    };

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        try {
            setLoading(true);
            const token = getToken();
            
            if (!token) {
                setError('Brak autoryzacji');
                setLoading(false);
                return;
            }

            // Pobierz wszystkie książki i filtruj po ownerUuid
            const response = await fetch('http://localhost:8084/api/books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się pobrać książek');
            }

            const data = await response.json();
            const books = data.data || [];
            
            // Filtruj książki należące do zalogowanego użytkownika
            const userUuid = admin?.user_uuid || admin?.uuid;
            const userBooks = books.filter(book => book.ownerUuid === userUuid);
            
            setMyBooks(userBooks);
            setError(null);
        } catch (err) {
            setError('Błąd podczas pobierania książek');
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Ładowanie...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Nagłówek */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Moje Książki</h2>
                            <p className="text-muted">Zarządzaj swoimi książkami</p>
                        </div>
                        <Link to="/user/add-book" className="btn btn-primary">
                            <i className="bi bi-plus-circle"></i> Dodaj nową książkę
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statystyki */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">{myBooks.length}</h5>
                            <p className="card-text">Wszystkie książki</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-success">
                                {myBooks.reduce((sum, book) => sum + book.quantity, 0)}
                            </h5>
                            <p className="card-text">Dostępne sztuki</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-primary">
                                {myBooks.reduce((sum, book) => sum + (book.price * book.quantity), 0).toFixed(2)} zł
                            </h5>
                            <p className="card-text">Wartość magazynu</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title text-info">
                                {myBooks.filter(book => book.quantity === 0).length}
                            </h5>
                            <p className="card-text">Niedostępne</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Przełącznik widoku */}
            <div className="row mb-3">
                <div className="col-12">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <i className="bi bi-list-ul"></i> Lista
                        </button>
                        <button
                            type="button"
                            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <i className="bi bi-grid-3x3-gap"></i> Kafelki
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista książek */}
            {myBooks.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                        {myBooks.map((book) => (
                            <div key={book.id} className="col">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="list-group">
                        {myBooks.map((book) => (
                            <BookRow key={book.id} book={book} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-book display-1 text-muted"></i>
                    <h4 className="text-muted mt-3">Nie dodałeś jeszcze żadnych książek</h4>
                    <p className="text-muted">Kliknij "Dodaj nową książkę", aby rozpocząć</p>
                </div>
            )}
        </div>
    );
};

export default MyBooks;
