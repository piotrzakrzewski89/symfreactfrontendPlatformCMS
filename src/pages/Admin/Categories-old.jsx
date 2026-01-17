import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';

const Categories = () => {
    const { admin } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingCategory, setEditingCategory] = useState(null);

    const API_URL = 'http://localhost:8084/api/categories';

    const getToken = () => {
        return typeof admin?.token === 'string' ? admin.token : admin?.token?.access_token;
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
            } else {
                setError('Nie udało się pobrać kategorii');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const token = getToken();
        
        if (!token) {
            setError('Brak autoryzacji');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCategory)
            });

            const data = await response.json();

            if (data.success) {
                setCategories([...categories, data.data]);
                setNewCategory({ name: '', description: '' });
                setShowAddForm(false);
                setError(null);
            } else {
                setError(data.error || 'Nie udało się dodać kategorii');
            }
        } catch (err) {
            setError('Błąd podczas dodawania kategorii');
            console.error('Error adding category:', err);
        }
    };

    const handleUpdateCategory = async (id) => {
        const token = getToken();
        
        if (!token) {
            setError('Brak autoryzacji');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingCategory)
            });

            const data = await response.json();

            if (data.success) {
                setCategories(categories.map(cat => 
                    cat.id === id ? data.data : cat
                ));
                setEditingCategory(null);
                setError(null);
            } else {
                setError(data.error || 'Nie udało się zaktualizować kategorii');
            }
        } catch (err) {
            setError('Błąd podczas aktualizacji kategorii');
            console.error('Error updating category:', err);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę kategorię?')) {
            return;
        }

        const token = getToken();
        
        if (!token) {
            setError('Brak autoryzacji');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setCategories(categories.filter(cat => cat.id !== id));
                setError(null);
            } else {
                setError(data.error || 'Nie udało się usunąć kategorii');
            }
        } catch (err) {
            setError('Błąd podczas usuwania kategorii');
            console.error('Error deleting category:', err);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Zarządzanie Kategoriami</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Anuluj' : '+ Dodaj kategorię'}
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {showAddForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Nowa kategoria</h5>
                        <form onSubmit={handleAddCategory}>
                            <div className="mb-3">
                                <label className="form-label">Nazwa kategorii *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Opis</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn btn-success">Dodaj kategorię</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Lista kategorii ({categories.length})</h5>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Nazwa</th>
                                    <th>Opis</th>
                                    <th>Typ</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(category => (
                                    <tr key={category.id}>
                                        <td>
                                            {editingCategory?.id === category.id ? (
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={editingCategory.name}
                                                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                                />
                                            ) : (
                                                <strong>{category.name}</strong>
                                            )}
                                        </td>
                                        <td>
                                            {editingCategory?.id === category.id ? (
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows="2"
                                                    value={editingCategory.description || ''}
                                                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                                                />
                                            ) : (
                                                category.description || '-'
                                            )}
                                        </td>
                                        <td>
                                            {category.isDefault ? (
                                                <span className="badge bg-primary">Domyślna</span>
                                            ) : (
                                                <span className="badge bg-secondary">Własna</span>
                                            )}
                                        </td>
                                        <td>
                                            {editingCategory?.id === category.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success me-2"
                                                        onClick={() => handleUpdateCategory(category.id)}
                                                    >
                                                        Zapisz
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => setEditingCategory(null)}
                                                    >
                                                        Anuluj
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {!category.isDefault && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-warning me-2"
                                                                onClick={() => setEditingCategory(category)}
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeleteCategory(category.id)}
                                                            >
                                                                Usuń
                                                            </button>
                                                        </>
                                                    )}
                                                    {category.isDefault && (
                                                        <span className="text-muted small">Nie można edytować</span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
