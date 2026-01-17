import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import CompanyTable from './CompanyTable';
import CompanyModal from './CompanyModal';
import {
  getActiveCompanies,
  getDeletedCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  toggleCompanyActive,
  reviewCompany,
} from '../../api/company';

const CompanyPage = () => {
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [deletedCompanies, setDeletedCompanies] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [view, setView] = useState('active');
  const [sorting, setSorting] = useState([{ id: 'id', desc: false }]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('review'); // 'create' | 'view' | 'edit'
  const [modalData, setModalData] = useState({});

  const fetchActiveCompanies = async () => {
    setLoadingActive(true);
    try {
      const sortBy = sorting[0]?.id || 'id';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
      const data = await getActiveCompanies(sortBy, sortOrder);
      setActiveCompanies(data);
    } finally {
      setLoadingActive(false);
    }
  };

  const fetchDeletedCompanies = async () => {
    setLoadingDeleted(true);
    try {
      const sortBy = sorting[0]?.id || 'id';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
      const data = await getDeletedCompanies(sortBy, sortOrder);
      setDeletedCompanies(data);
    } finally {
      setLoadingDeleted(false);
    }
  };

  const refreshCurrent = () => {
    if (view === 'active') fetchActiveCompanies();
    else fetchDeletedCompanies();
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

  const handleReview = async (company) => {
    setModalMode('review');
    try {
      const data = await reviewCompany(company);
      setModalData(data);
      setModalOpen(true);
    } catch (error) {
      console.error("Błąd podczas pobierania danych firmy:", error);
    }
  };

  const handleEdit = async (company) => {
    setModalMode('edit');
    try {
      const data = await reviewCompany(company);
      setModalData(data);
      setModalOpen(true);
    } catch (error) {
      console.error("Błąd podczas pobierania danych firmy:", error);
    }
  };

  const handleCreateCompany = async (payload) => {
    await createCompany(payload);
    fetchActiveCompanies();
    setModalOpen(false);
  };

  const handleUpdateCompany = async (payload) => {
    await updateCompany(payload.id, payload);
    refreshCurrent();
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteCompany(id);
    refreshCurrent();
  };

  const handleToggleActive = async (id) => {
    await toggleCompanyActive(id);
    refreshCurrent();
  };

  return (
    <Box sx={{ p: 5, textAlign: 'center' }}>
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

      {view === 'active' && (
        <CompanyTable
          title="Aktywne firmy"
          companies={activeCompanies}
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
        <CompanyTable
          title="Usunięte firmy"
          companies={deletedCompanies}
          loading={loadingDeleted}
          view={view}
          sorting={sorting}
          onSortingChange={setSorting}
          onReview={handleReview}
        />
      )}

      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={modalData}
        onCreate={handleCreateCompany}
        onSave={handleUpdateCompany}
      />
    </Box>
  );
};

export default CompanyPage;
