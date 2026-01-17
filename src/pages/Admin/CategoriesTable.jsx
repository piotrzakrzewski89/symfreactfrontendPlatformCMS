import { MaterialReactTable } from 'material-react-table';
import { Box, Button, Typography, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { parseBackendDate } from '../../utils/dateUtils';
import { MRT_Localization_PL } from 'material-react-table/locales/pl';

const CategoriesTable = ({
  title,
  categories,
  loading,
  view,
  onCreateClick,
  onReview,
  onEdit,
  onDelete,
}) => {

  const columns = [
    { accessorKey: 'id', header: 'ID', size: 100 },
    { accessorKey: 'uuid', header: 'UUID', size: 310 },
    { accessorKey: 'name', header: 'Nazwa kategorii', grow: 1 },
    { accessorKey: 'description', header: 'Opis', grow: 2 },
    {
      accessorKey: 'createdAt',
      header: 'Utworzony',
      Cell: ({ cell }) => { return cell.getValue() ? parseBackendDate(cell.getValue()) : '-'; }
    },
    {
      accessorKey: 'updatedAt',
      header: 'Zaktualizowany',
      Cell: ({ cell }) => { return cell.getValue() ? parseBackendDate(cell.getValue()) : '-'; }
    },
    {
      accessorKey: 'isDefault',
      header: 'Typ',
      Cell: ({ cell }) => (
        cell.getValue() ? (
          <span style={{ color: '#1976d2', fontWeight: 'bold' }}>Domyślna</span>
        ) : (
          <span style={{ color: '#666' }}>Własna</span>
        )
      )
    },
    {
      id: 'actions',
      header: 'Akcje',
      size: 180,
      Cell: ({ row }) => {
        const isDefault = row.original.isDefault;

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

            {/* Edycja i usuwanie – tylko dla kategorii własnych */}
            {!isDefault && (
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
                  color="error"
                  size="small"
                  onClick={() => onDelete?.(row.original.id)}
                  title="Usuń"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}

            {/* Info o niemożności edycji dla kategorii domyślnych */}
            {isDefault && (
              <span style={{ 
                color: '#999', 
                fontSize: '12px', 
                alignSelf: 'center',
                marginLeft: '8px'
              }}>
                Nie można edytować
              </span>
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
          {title || 'Lista Kategorii'}
        </Typography>

        {onCreateClick && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" onClick={onCreateClick}>
              ➕ Utwórz nową kategorię
            </Button>
          </Box>
        )}

        <MaterialReactTable
          columns={columns}
          data={categories}
          localization={MRT_Localization_PL}
          state={{ isLoading: loading }}
          enableColumnResizing
          enableColumnOrdering
          enableColumnFilters
          enableHiding
          initialState={{
            columnVisibility: {
              id: true,
              uuid: false,
              name: true,
              description: true,
              createdAt: false,
              updatedAt: false,
              isDefault: true,
              actions: true,
            },
            density: 'compact',
          }}
        />
      </Box>
    </>
  );
};

export default CategoriesTable;
