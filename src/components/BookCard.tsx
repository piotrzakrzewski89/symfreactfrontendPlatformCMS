import React from 'react';
import { useCart } from '../contexts/CartContext';
import { formatPrice, getAvailabilityStatus, getCoverImage } from '../utils/bookUtils';
import type { Book } from '../types/book.types';

interface BookCardProps {
    book: Book;
}

const BookCard = React.memo<BookCardProps>(({ book }) => {
    const { addToCart } = useCart();
    const availability = getAvailabilityStatus(book);

    const handleAddToCart = () => {
        addToCart(book, 1);
    };

    const handleBuyNow = () => {
        addToCart(book, 1);
        // Tutaj będzie przekierowanie do płatności
        alert('Funkcja "Kup teraz" zostanie zaimplementowana!');
    };

    return (
        <div className="card h-100 book-card">
            {/* Okładka książki */}
            <div className="book-cover-container" style={{ height: '200px', overflow: 'hidden' }}>
                {book.coverImage ? (
                    <img 
                        src={getCoverImage(book)} 
                        className="card-img-top h-100" 
                        alt={book.title}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                        <i className="bi bi-book display-4 text-muted"></i>
                    </div>
                )}
            </div>
            
            {/* Informacje o książce */}
            <div className="card-body d-flex flex-column">
                <h5 className="card-title text-truncate" title={book.title}>
                    {book.title}
                </h5>
                
                {book.category && (
                    <span className="badge bg-secondary mb-2">{book.category}</span>
                )}
                
                <p className="card-text text-muted small mb-2">
                    <i className="bi bi-person"></i> {book.ownerName || 'Właściciel'}
                </p>
                
                {book.description && (
                    <p className="card-text text-truncate" title={book.description}>
                        {book.description}
                    </p>
                )}
                
                {/* Cena i ilość */}
                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h5 text-primary mb-0">
                            {formatPrice(book.price)}
                        </span>
                        <span className={`badge ${availability.className}`}>
                            {availability.text}
                        </span>
                    </div>
                    
                    {/* Przyciski akcji */}
                    <div className="btn-group w-100" role="group">
                        <button 
                            className="btn btn-outline-primary btn-sm"
                            disabled={!availability.text.includes('Dostępne')}
                            onClick={handleAddToCart}
                        >
                            <i className="bi bi-cart-plus"></i> Do koszyka
                        </button>
                        <button 
                            className="btn btn-primary btn-sm"
                            disabled={!availability.text.includes('Dostępne')}
                            onClick={handleBuyNow}
                        >
                            <i className="bi bi-lightning"></i> Kup teraz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

BookCard.displayName = 'BookCard';

export default BookCard;
