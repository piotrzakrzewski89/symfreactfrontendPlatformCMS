import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
    const { admin } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [bookData, setBookData] = useState({
        title: '',
        description: '',
        price: '',
        quantity: 1,
        category: '',
        coverImage: ''
    });
    
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [uploadingCover, setUploadingCover] = useState(false);

    const getToken = () => {
        return typeof admin?.token === 'string' ? admin.token : admin?.token?.access_token;
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8084/api/categories');
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
            } else {
                console.error('Categories API error:', data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadCover = async () => {
        if (!coverFile) {
            throw new Error('Okładka jest wymagana');
        }

        const token = getToken();
        const formData = new FormData();
        formData.append('cover', coverFile);

        setUploadingCover(true);
        const response = await fetch('http://localhost:8084/api/upload/book-cover', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        setUploadingCover(false);

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Nie udało się przesłać okładki');
        }

        const data = await response.json();
        return data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getToken();
        
        if (!token) {
            setError('Brak autoryzacji');
            return;
        }

        if (!coverFile) {
            setError('Okładka jest wymagana');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Upload cover first
            const coverUrl = await uploadCover();
            // Create book with uploaded cover URL
            const response = await fetch('http://localhost:8084/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: bookData.title,
                    description: bookData.description,
                    price: parseFloat(bookData.price),
                    quantity: parseInt(bookData.quantity),
                    category: bookData.category,
                    coverImage: coverUrl,
                    ownerUuid: admin?.user_uuid || admin?.uuid,
                    ownerName: `${admin?.firstName || ''} ${admin?.lastName || ''}`.trim() || admin?.email
                })
            });

            const data = await response.json();

            if (response.ok && data.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/user/my-books');
                }, 2000);
            } else {
                setError(data.error || 'Nie udało się dodać książki');
            }
        } catch (err) {
            setError('Błąd podczas dodawania książki');
            console.error('Error adding book:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h3>Dodaj nową książkę</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    Książka została dodana pomyślnie! Przekierowywanie...
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tytuł książki *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={bookData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Wprowadź tytuł książki"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Kategoria *</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={bookData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Wybierz kategorię</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Opis</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={bookData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Opisz książkę..."
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Cena (PLN) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={bookData.price}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Ilość *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="quantity"
                                            value={bookData.quantity}
                                            onChange={handleChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Okładka książki *</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <small className="text-muted">Dozwolone formaty: JPG, PNG, WEBP (max 5MB)</small>
                                    {coverPreview && (
                                        <div className="mt-3">
                                            <img 
                                                src={coverPreview} 
                                                alt="Podgląd okładki" 
                                                className="img-thumbnail"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/user/my-books')}
                                        disabled={loading}
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || uploadingCover}
                                    >
                                        {uploadingCover ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Przesyłanie okładki...
                                            </>
                                        ) : loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Dodawanie książki...
                                            </>
                                        ) : (
                                            'Dodaj książkę'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBook;
