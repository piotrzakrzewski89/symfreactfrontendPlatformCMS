import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { API_PLATFORM_URL } from '../../config';
import { Link } from 'react-router-dom';
import AddressBook from './AddressBook';

const UserProfile = () => {
    const { admin } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses'

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Token może być stringiem lub obiektem z access_token
                const token = typeof admin?.token === 'string' 
                    ? admin.token 
                    : admin?.token?.access_token;
                
                if (!token) {
                    console.error('UserProfile: No token available');
                    setError('Brak tokena autoryzacji');
                    setLoading(false);
                    return;
                }
                
                setLoading(true);
                const url = `${API_PLATFORM_URL}/profile`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Nie udało się pobrać danych profilu (${response.status})`);
                }

                const data = await response.json();
                
                if (data.success) {
                    setUserData(data.user);
                } else {
                    throw new Error(data.error || 'Błąd pobierania danych');
                }
            } catch (err) {
                setError(err.message);
                console.error('UserProfile: Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (admin?.token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [admin?.token]);

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

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* Nawigacja */}
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Dane profilu
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('addresses')}
                    >
                        Adresy dostawy
                    </button>
                </li>
            </ul>

            {/* Treść */}
            {activeTab === 'profile' && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Moje dane</h5>
                        {userData ? (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Imię:</strong> {userData.firstName}</p>
                                    <p><strong>Nazwisko:</strong> {userData.lastName}</p>
                                    <p><strong>Email:</strong> {userData.email}</p>
                                    <p><strong>Numer pracownika:</strong> {userData.employeeNumber}</p>
                                    <p><strong>Role:</strong> {userData.roles?.join(', ')}</p>
                                    <p><strong>Status:</strong> {userData.isActive ? 'Aktywny' : 'Nieaktywny'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>UUID:</strong> {userData.uuid}</p>
                                    <p><strong>UUID Firmy:</strong> {userData.companyUuid}</p>
                                    {userData.companyName && (
                                        <p><strong>Nazwa Firmy:</strong> {userData.companyName}</p>
                                    )}
                                    {userData.createdByUser && (
                                        <>
                                            <p><strong>Utworzony przez (UUID):</strong> {userData.createdByUser.uuid}</p>
                                            <p><strong>Utworzony przez:</strong> {userData.createdByUser.firstName} {userData.createdByUser.lastName}</p>
                                        </>
                                    )}
                                    {userData.createdAt && (
                                        <p><strong>Data utworzenia:</strong> {new Date(userData.createdAt.date).toLocaleDateString('pl-PL')}</p>
                                    )}
                                    {userData.lastLogin && (
                                        <p><strong>Ostatnie logowanie:</strong> {new Date(userData.lastLogin).toLocaleDateString('pl-PL')}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p>Brak danych użytkownika</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'addresses' && (
                <AddressBook />
            )}
        </div>
    );
};

export default UserProfile;
