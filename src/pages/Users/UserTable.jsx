import { MaterialReactTable } from 'material-react-table';
import { Box, Button, Typography, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import DeleteIcon from '@mui/icons-material/Delete';
import { parseBackendDate } from '../../utils/dateUtils';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';

const UserTable = ({
  title,
  users,
  loading,
  view,
  sorting = [],
  onSortingChange,
  onCreateClick,
  onReview,
  onEdit,
  onToggleActive,
  onDelete,
}) => {

  const columns = [
    { accessorKey: 'id', header: 'ID', size: 100, minSize: 50 },
    { accessorKey: 'uuid', header: 'UUID', size: 310, minSize: 200 },
    { accessorKey: 'firstName', header: 'Imię', minSize: 120 },
    { accessorKey: 'lastName', header: 'Nazwisko', grow: 1, minSize: 120 },
    { accessorKey: 'employeeNumber', header: 'Nr Kadrowy', minSize: 100 },
    {
      accessorKey: 'createdAt',
      header: 'Utworzony',
      Cell: ({ cell }) => { return cell.getValue() ? parseBackendDate(cell.getValue()) : '-'; },
      minSize: 150,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Zaktualizowany',
      Cell: ({ cell }) => { return cell.getValue() ? parseBackendDate(cell.getValue()) : '-'; },
      minSize: 150,
    },
    {
      accessorKey: 'deletedAt',
      header: 'Usunięty',
      Cell: ({ cell }) => { return cell.getValue() ? parseBackendDate(cell.getValue()) : '-'; },
      minSize: 150,
    },
    { accessorKey: 'isActive', header: 'Aktywny', Cell: ({ cell }) => (cell.getValue() ? '✅' : '❌'), minSize: 150, },
    {
      id: 'actions',
      header: 'Akcje',
      size: 220,
      minSize: 150,
      Cell: ({ row }) => {
        const isActive = row.original.isActive;

        return (
          <Box sx={{ display: 'flex', gap: '0.25rem' }}>
            {/* Podgląd – dostępny wszędzie */}
            <IconButton
              size="small"
              onClick={() => onReview?.(row.original.id)}
              title="Podgląd"
            >
              <VisibilityIcon />
            </IconButton>

            {/* Edycja / aktywacja / usuwanie – tylko w widoku aktywnych */}
            {view === 'active' && (
              <>
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() => onEdit?.(row.original.id)}
                  title="Edytuj"
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  onClick={() => onToggleActive?.(row.original.id)}
                  title={isActive ? 'Dezaktywuj' : 'Aktywuj'}
                >
                  {isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                </IconButton>

                <IconButton
                  color="error"
                  size="small"
                  onClick={() => onDelete?.(row.original.id)}
                  title="Usuń"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        );
      }
    },
  ];

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title || 'Lista Firm'}
        </Typography>

        {onCreateClick && view === 'active' && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" onClick={onCreateClick}>
              ➕ Utwórz nowego Pracownika
            </Button>
          </Box>
        )}

        <MaterialReactTable
          columns={columns}
          data={users}
          localization={MRT_Localization_PL}
          state={{ 
            isLoading: loading,
            sorting: sorting
          }}
          onSortingChange={onSortingChange}
          enableColumnResizing
          enableColumnOrdering
          enableColumnFilters
          enableHiding
          manualSorting
          muiTableContainerProps={{
            sx: {
              overflowX: 'auto',
              maxWidth: '100%',
              position: 'relative',
            },
          }}
          enableHorizontalScroll
          initialState={{
            columnVisibility: {
              id: true,
              uuid: true,
              firstName: true,
              lastName: true,
              employeeNumber: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              isActive: true,
              actions: true,
            },
          }}
        />
      </Box>
    </>
  );
};

export default UserTable;
