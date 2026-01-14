import React, { useState } from 'react';
import BookCard from '../../components/BookCard';
import BookRow from '../../components/BookRow';
import { mockBooks } from '../../data/mockBooks';

const MyBooks = () => {
    const [viewMode, setViewMode] = useState('list'); // Domyślnie lista dla szczegółów
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Symulacja - książki należące do zalogowanego użytkownika
    // W prawdziwej aplikacji pobrane z API na podstawie UUID użytkownika
    const myBooks = mockBooks.filter(book => 
        book.ownerUuid === '550e8400-e29b-41d4-a716-446655440100' // Przykładowe UUID
    );

    return (
        <div className="container mt-4">
            {/* Nagłówek */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Moje Książki</h2>
                            <p className="text-muted">Zarządzaj swoimi książkami</p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            <i className="bi bi-plus-circle"></i> Dodaj nową książkę
                        </button>
                    </div>
                </div>
            </div>

            {/* Formularz dodawania książki */}
            {showAddForm && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5>Dodaj nową książkę</h5>
                            </div>
                            <div className="card-body">
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Tytuł *</label>
                                            <input type="text" className="form-control" placeholder="Wprowadź tytuł" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Kategoria</label>
                                            <select className="form-select">
                                                <option value="">Wybierz kategorię</option>
                                                <option value="Fantasy">Fantasy</option>
                                                <option value="Klasyka">Klasyka</option>
                                                <option value="Sci-Fi">Sci-Fi</option>
                                                <option value="Romans">Romans</option>
                                                <option value="Historyczna">Historyczna</option>
                                                <option value="Dla dzieci">Dla dzieci</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Cena (zł) *</label>
                                            <input type="number" step="0.01" className="form-control" placeholder="0.00" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Ilość sztuk *</label>
                                            <input type="number" className="form-control" placeholder="1" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Opis</label>
                                            <textarea className="form-control" rows="3" placeholder="Krótki opis książki..."></textarea>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">URL okładki (opcjonalnie)</label>
                                            <input type="url" className="form-control" placeholder="https://..." />
                                        </div>
                                        <div className="col-12">
                                            <div className="btn-group">
                                                <button type="submit" className="btn btn-primary">
                                                    <i className="bi bi-check-circle"></i> Dodaj książkę
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowAddForm(false)}
                                                >
                                                    <i className="bi bi-x-circle"></i> Anuluj
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
