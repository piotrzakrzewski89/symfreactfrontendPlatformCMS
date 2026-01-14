import React from 'react';
import { useCart } from '../contexts/CartContext';
import { formatPrice, getAvailabilityStatus, getCoverImage } from '../utils/bookUtils';
import type { Book } from '../types/book.types';

interface BookRowProps {
    book: Book;
}

const BookRow = React.memo<BookRowProps>(({ book }) => {
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
        <div className="list-group-item book-row">
            <div className="row align-items-center">
                {/* Miniatura okładki */}
                <div className="col-auto">
                    <div className="book-cover-mini" style={{ width: '60px', height: '80px' }}>
                        {book.coverImage ? (
                            <img 
                                src={getCoverImage(book)} 
                                className="img-fluid rounded" 
                                alt={book.title}
                                style={{ objectFit: 'cover', width: '60px', height: '80px' }}
                            />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ width: '60px', height: '80px' }}>
                                <i className="bi bi-book text-muted"></i>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Informacje o książce */}
                <div className="col">
                    <div className="row align-items-center">
                        <div className="col-md-4">
                            <h6 className="mb-1">{book.title}</h6>
                            {book.category && (
                                <span className="badge bg-secondary me-2">{book.category}</span>
                            )}
                            <small className="text-muted">
                                <i className="bi bi-person"></i> {book.ownerName}
                            </small>
                        </div>
                        
                        <div className="col-md-3">
                            {book.description && (
                                <small className="text-muted d-block text-truncate" title={book.description}>
                                    {book.description}
                                </small>
                            )}
                        </div>
                        
                        <div className="col-md-2">
                            <div className="h5 text-primary mb-0">
                                {formatPrice(book.price)}
                            </div>
                        </div>
                        
                        <div className="col-md-2">
                            <span className={`badge ${availability.className}`}>
                                {availability.text}
                            </span>
                        </div>
                        
                        <div className="col-md-1">
                            <div className="btn-group btn-group-sm" role="group">
                                <button 
                                    className="btn btn-outline-primary"
                                    disabled={!availability.text.includes('Dostępne')}
                                    title="Do koszyka"
                                    onClick={handleAddToCart}
                                >
                                    <i className="bi bi-cart-plus"></i>
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    disabled={!availability.text.includes('Dostępne')}
                                    title="Kup teraz"
                                    onClick={handleBuyNow}
                                >
                                    <i className="bi bi-lightning"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

BookRow.displayName = 'BookRow';

export default BookRow;
