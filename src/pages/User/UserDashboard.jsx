import React from 'react';
import { useAuth } from '../../auth/useAuth';
import BookList from '../../components/BookList';
import { mockBooks } from '../../data/mockBooks';

const UserDashboard = () => {
    const { admin, logout } = useAuth();

    return (
        <div className="container mt-4">
            {/* Nagłówek z tytułem */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-3">Platforma Książek Firmowych</h2>
                    <p className="text-muted">Przeglądaj i kupuj książki oferowane przez pracowników</p>
                </div>
            </div>

            {/* Lista książek */}
            <div className="row">
                <div className="col-12">
                    <BookList books={mockBooks} />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
