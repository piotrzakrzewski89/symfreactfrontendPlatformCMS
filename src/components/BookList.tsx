import React, { useState, useMemo, useCallback } from 'react';
import BookCard from './BookCard';
import BookRow from './BookRow';
import { filterBooks, sortBooks, getCategories } from '../utils/bookUtils';
import type { Book, ViewMode, SortBy } from '../types/book.types';

interface BookListProps {
    books: Book[];
}

const BookList = React.memo<BookListProps>(({ books }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<SortBy>('title');
    const [availableOnly, setAvailableOnly] = useState(false);

    // Pobieranie kategorii - memoized
    const categories = useMemo(() => getCategories(books), [books]);

    // Filtrowanie i sortowanie książek - memoized
    const filteredAndSortedBooks = useMemo(() => {
        const filters = {
            search: searchTerm,
            category: selectedCategory,
            availableOnly: availableOnly
        };
        
        const filtered = filterBooks(books, filters);
        return sortBooks(filtered, sortBy);
    }, [books, searchTerm, selectedCategory, sortBy, availableOnly]);

    // Callbacki dla form controls - zapobiegają niepotrzebnym renderowaniom
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    }, []);

    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortBy);
    }, []);

    const handleAvailableChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAvailableOnly(e.target.checked);
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setViewMode(mode);
    }, []);

    return (
        <div className="book-list">
            {/* Sekcja filtrów i sterowania */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="row g-3">
                                {/* Wyszukiwarka */}
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Szukaj książki..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                
                                {/* Filtr kategorii */}
                                <div className="col-md-2">
                                    <select 
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="all">Wszystkie kategorie</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Sortowanie */}
                                <div className="col-md-2">
                                    <select 
                                        className="form-select"
                                        value={sortBy}
                                        onChange={handleSortChange}
                                    >
                                        <option value="title">Tytuł</option>
                                        <option value="price_asc">Cena rosnąco</option>
                                        <option value="price_desc">Cena malejąco</option>
                                        <option value="date">Data dodania</option>
                                        <option value="quantity">Dostępność</option>
                                    </select>
                                </div>
                                
                                {/* Checkbox dostępnych */}
                                <div className="col-md-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="availableOnly"
                                            checked={availableOnly}
                                            onChange={handleAvailableChange}
                                        />
                                        <label className="form-check-label" htmlFor="availableOnly">
                                            Tylko dostępne
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Przełącznik widoku */}
                                <div className="col-md-2">
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            type="button"
                                            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handleViewModeChange('grid')}
                                        >
                                            <i className="bi bi-grid-3x3-gap"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handleViewModeChange('list')}
                                        >
                                            <i className="bi bi-list-ul"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liczba wyników */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Znaleziono książek: {filteredAndSortedBooks.length}</h5>
            </div>

            {/* Renderowanie książek w wybranym widoku */}
            {viewMode === 'grid' ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {filteredAndSortedBooks.map((book) => (
                        <div key={book.id} className="col">
                            <BookCard book={book} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="list-group">
                    {filteredAndSortedBooks.map((book) => (
                        <BookRow key={book.id} book={book} />
                    ))}
                </div>
            )}

            {filteredAndSortedBooks.length === 0 && (
                <div className="text-center py-5">
                    <i className="bi bi-book display-1 text-muted"></i>
                    <p className="text-muted mt-3">Brak dostępnych książek dla podanych kryteriów</p>
                </div>
            )}
        </div>
    );
});

BookList.displayName = 'BookList';

export default BookList;
