import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import UserTable from './UserTable';
import UserModal from './UserModal';
import {
    getActiveUsers,
    getDeletedUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    reviewUser,
} from '../../api/user';

const UserPage = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [loadingActive, setLoadingActive] = useState(false);
    const [loadingDeleted, setLoadingDeleted] = useState(false);
    const [view, setView] = useState('active');
    const [sorting, setSorting] = useState([{ id: 'id', desc: false }]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('review'); // 'create' | 'view' | 'edit'
    const [modalData, setModalData] = useState({});

    const fetchActiveUsers = async () => {
        setLoadingActive(true);
        try {
            const sortBy = sorting[0]?.id || 'id';
            const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
            const data = await getActiveUsers(sortBy, sortOrder);
            setActiveUsers(data);
        } finally {
            setLoadingActive(false);
        }
    };

    const fetchDeletedUsers = async () => {
        setLoadingDeleted(true);
        try {
            const sortBy = sorting[0]?.id || 'id';
            const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
            const data = await getDeletedUsers(sortBy, sortOrder);
            setDeletedUsers(data);
        } finally {
            setLoadingDeleted(false);
        }
    };

    const refreshCurrent = () => {
        if (view === 'active') fetchActiveUsers();
        else fetchDeletedUsers();
    };

    useEffect(() => {
        refreshCurrent();
    }, [view, sorting]);

    // Modal
    const openCreateModal = () => {
        setModalMode('create');
        setModalData({ isActive: true });
        setModalOpen(true);
    };

    const handleReview = async (user) => {
        setModalMode('review');
        try {
            const data = await reviewUser(user);
            setModalData(data);
            setModalOpen(true);
        } catch (error) {
            console.error("Błąd podczas pobierania danych uzytkownika:", error);
        }
    };

    const handleEdit = async (user) => {
        setModalMode('edit');
        try {
            const data = await reviewUser(user);
            setModalData(data);
            setModalOpen(true);
        } catch (error) {
            console.error("Błąd podczas pobierania danych uzytkownika:", error);
        }
    };

    const handleCreateUser = async (payload) => {
        await createUser(payload);
        fetchActiveUsers();
        setModalOpen(false);
    };

    const handleUpdateUser = async (payload) => {
        await updateUser(payload.id, payload);
        refreshCurrent();
        setModalOpen(false);
    };

    const handleDelete = async (id) => {
        await deleteUser(id);
        refreshCurrent();
    };

    const handleToggleActive = async (id) => {
        await toggleUserActive(id);
        refreshCurrent();
    };

    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ButtonGroup variant="contained">
                    <Button onClick={() => setView('active')} color={view === 'active' ? 'primary' : 'inherit'}>
                        Aktywne
                    </Button>
                    <Button onClick={() => setView('deleted')} color={view === 'deleted' ? 'primary' : 'inherit'}>
                        Usunięte
                    </Button>
                </ButtonGroup>
            </Box>

 <div style={{ overflowX: 'auto', width: '100%' }}>
            {view === 'active' && (
                <UserTable
                    title="Aktywni Pracownicy"
                    users={activeUsers}
                    loading={loadingActive}
                    view={view}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    onCreateClick={openCreateModal}
                    onReview={handleReview}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                />
            )}

            {view === 'deleted' && (
                <UserTable
                    title="Usunięci Pracownicy"
                    users={deletedUsers}
                    loading={loadingDeleted}
                    view={view}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    onReview={handleReview}
                />
            )}
</div>
            <UserModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                initialData={modalData}
                onCreate={handleCreateUser}
                onSave={handleUpdateUser}
            />
        
        </Box>
    );
};

export default UserPage;
