import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, Typography, Alert } from '@mui/material';
import CategoriesTable from './CategoriesTable';
import CategoriesModal from './CategoriesModal';
import { useAuth } from '../../auth/useAuth';

const Categories = () => {
    const { admin } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('review'); // 'create' | 'view' | 'edit'
    const [modalData, setModalData] = useState({});

    const API_URL = 'http://localhost:8084/api/categories';

    const getToken = () => {
        return typeof admin?.token === 'string' ? admin.token : admin?.token?.access_token;
    };

    const fetchCategories = async (sortBy = 'id', sortOrder = 'asc') => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}?sortBy=${sortBy}&sortOrder=${sortOrder}`);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.data);
                setError(null);
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

    useEffect(() => {
        fetchCategories();
    }, []);

    // Modal functions
    const openCreateModal = () => {
        setModalMode('create');
        setModalData({ isDefault: false });
        setModalOpen(true);
    };

    const handleReview = async (categoryId) => {
        setModalMode('review');
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setModalData(data.data);
                setModalOpen(true);
            } else {
                setError(data.error || 'Nie udało się pobrać danych kategorii');
            }
        } catch (error) {
            console.error("Błąd podczas pobierania danych kategorii:", error);
            setError('Błąd podczas pobierania danych kategorii');
        }
    };

    const handleEdit = async (categoryId) => {
        setModalMode('edit');
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setModalData(data.data);
                setModalOpen(true);
            } else {
                setError(data.error || 'Nie udało się pobrać danych kategorii');
            }
        } catch (error) {
            console.error("Błąd podczas pobierania danych kategorii:", error);
            setError('Błąd podczas pobierania danych kategorii');
        }
    };

    const handleCreateCategory = async (payload) => {
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
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setCategories([...categories, data.data]);
                setModalOpen(false);
                setError(null);
            } else {
                throw new Error(data.error || 'Nie udało się dodać kategorii');
            }
        } catch (err) {
            console.error('Error adding category:', err);
            throw err;
        }
    };

    const handleUpdateCategory = async (payload) => {
        const token = getToken();
        
        if (!token) {
            setError('Brak autoryzacji');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${payload.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setCategories(categories.map(cat => 
                    cat.id === payload.id ? data.data : cat
                ));
                setModalOpen(false);
                setError(null);
            } else {
                throw new Error(data.error || 'Nie udało się zaktualizować kategorii');
            }
        } catch (err) {
            console.error('Error updating category:', err);
            throw err;
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

    if (loading && categories.length === 0) {
        return (
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Ładowanie...</span>
                </div>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Zarządzanie Kategoriami
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <CategoriesTable
                title="Lista Kategorii"
                categories={categories}
                loading={loading}
                onCreateClick={openCreateModal}
                onReview={handleReview}
                onEdit={handleEdit}
                onDelete={handleDeleteCategory}
            />

            <CategoriesModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                initialData={modalData}
                onCreate={handleCreateCategory}
                onSave={handleUpdateCategory}
            />
        </Box>
    );
};

export default Categories;
