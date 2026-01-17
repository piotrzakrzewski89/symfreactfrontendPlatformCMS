import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/useAuth';

const AddressBook = () => {
    const { admin } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Polska',
        isDefault: false
    });

    // Pobieranie adresów
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const userUuid = admin?.sub || admin?.user_uuid || admin?.uuid;
                const token = admin?.token?.access_token || admin?.token;
                
                if (!userUuid || !token) {
                    throw new Error('User UUID or token not found');
                }

                const response = await fetch(`http://localhost:8084/api/shipping-addresses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch addresses');
                }

                const data = await response.json();
                setAddresses(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [admin?.sub, admin?.user_uuid, admin?.uuid, admin?.token?.access_token, admin?.token]);

    // Reset form
    const resetForm = () => {
        setFormData({
            label: '',
            firstName: admin?.firstName || '',
            lastName: admin?.lastName || '',
            email: admin?.email || '',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: 'Polska',
            isDefault: false
        });
        setEditingAddress(null);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const userUuid = admin?.sub || admin?.user_uuid || admin?.uuid;
            const token = admin?.token?.access_token || admin?.token;
            
            const url = editingAddress 
                ? `http://localhost:8084/api/shipping-addresses/${editingAddress.id}`
                : 'http://localhost:8084/api/shipping-addresses';
            
            const method = editingAddress ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userUuid
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save address');
            }

            // Refresh addresses
            const fetchResponse = await fetch(`http://localhost:8084/api/shipping-addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const fetchData = await fetchResponse.json();
            setAddresses(fetchData.data || []);
            
            // Close form and reset
            setShowForm(false);
            resetForm();
            
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle delete
    const handleDelete = async (addressId) => {
        if (!confirm('Czy na pewno chcesz usunąć ten adres?')) {
            return;
        }

        try {
            const token = admin?.token?.access_token || admin?.token;
            
            const response = await fetch(`http://localhost:8084/api/shipping-addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete address');
            }

            // Refresh addresses
            const fetchResponse = await fetch(`http://localhost:8084/api/shipping-addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const fetchData = await fetchResponse.json();
            setAddresses(fetchData.data || []);
            
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle set as default
    const handleSetDefault = async (addressId) => {
        try {
            const token = admin?.token?.access_token || admin?.token;
            
            const response = await fetch(`http://localhost:8084/api/shipping-addresses/${addressId}/set-default`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to set default address');
            }

            // Refresh addresses
            const fetchResponse = await fetch(`http://localhost:8084/api/shipping-addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const fetchData = await fetchResponse.json();
            setAddresses(fetchData.data || []);
            
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle edit
    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: address.phone || '',
            address: address.address,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Ładowanie adresów...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <h4>Błąd ładowania</h4>
                    <p>Nie udało się załadować adresów: {error}</p>
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
                    <h2>Książka Adresów</h2>
                    <p className="text-muted">Zarządzaj swoimi adresami dostawy</p>
                </div>
            </div>

            {/* Przyciski */}
            <div className="row mb-4">
                <div className="col-12">
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Dodaj nowy adres
                    </button>
                </div>
            </div>

            {/* Formularz */}
            {showForm && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5>{editingAddress ? 'Edytuj adres' : 'Dodaj nowy adres'}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Etykieta</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.label}
                                                onChange={(e) => setFormData({...formData, label: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Domyślny adres</label>
                                            <div className="form-check">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input"
                                                    checked={formData.isDefault}
                                                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                                                />
                                                <label className="form-check-label">
                                                    Ustaw jako domyślny
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Imię</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Nazwisko</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Telefon</label>
                                            <input 
                                                type="tel" 
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Adres</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Miasto</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.city}
                                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Kod pocztowy</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                value={formData.postalCode}
                                                onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Kraj</label>
                                            <select 
                                                className="form-select"
                                                value={formData.country}
                                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                            >
                                                <option value="Polska">Polska</option>
                                                <option value="Niemcy">Niemcy</option>
                                                <option value="Czechy">Czechy</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary me-2">
                                                {editingAddress ? 'Zapisz zmiany' : 'Dodaj adres'}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    resetForm();
                                                }}
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista adresów */}
            {addresses.length > 0 ? (
                <div className="row">
                    {addresses.map((address) => (
                        <div key={address.id} className="col-md-6 mb-3">
                            <div className={`card ${address.isDefault ? 'border-primary' : ''}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            {address.isDefault && (
                                                <span className="badge bg-primary mb-2">Domyślny</span>
                                            )}
                                            <h6 className="card-title">{address.label}</h6>
                                            <p className="card-text">
                                                <strong>{address.firstName} {address.lastName}</strong><br />
                                                {address.address}<br />
                                                {address.postalCode} {address.city}<br />
                                                {address.country}
                                            </p>
                                            <small className="text-muted">
                                                {address.email} | {address.phone || 'Brak telefonu'}
                                            </small>
                                        </div>
                                        <div className="dropdown">
                                            <button 
                                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                            >
                                                <i className="bi bi-three-dots"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => handleEdit(address)}
                                                    >
                                                        <i className="bi bi-pencil me-2"></i>
                                                        Edytuj
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={() => handleSetDefault(address.id)}
                                                        disabled={address.isDefault}
                                                    >
                                                        <i className="bi bi-star me-2"></i>
                                                        {address.isDefault ? 'Jest domyślny' : 'Ustaw jako domyślny'}
                                                    </button>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item text-danger"
                                                        onClick={() => handleDelete(address.id)}
                                                    >
                                                        <i className="bi bi-trash me-2"></i>
                                                        Usuń
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-house display-1 text-muted"></i>
                    <h4 className="text-muted mt-3">Brak adresów</h4>
                    <p className="text-muted">Nie masz jeszcze żadnych zapisanych adresów dostawy</p>
                </div>
            )}
        </div>
    );
};

export default AddressBook;
