import React, { useEffect, useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TenantForm from '../components/TenantForm.tsx';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTenants } from '../tenantQueries.ts';
import { deleteTenant, bulkDeleteTenants } from '../tenantMutations.ts';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes.ts';
import { useTenantManagementStore } from '../stores/tenantManagementStore';
import { TENANT_QUERY_KEYS } from '../tenantQueryKeys.ts';

type TenantManagementPageProps = Record<string, unknown>;

const TenantManagementPage: React.FC<TenantManagementPageProps> = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    isFormOpen,
    selectedTenant,
    isConfirmDeleteDialogOpen,
    tenantToDeleteId,
    selectedTenantIds,
    isConfirmBulkDeleteDialogOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    toggleTenantSelection,
    selectAllTenants,
    clearSelection,
    openConfirmBulkDeleteDialog,
    closeConfirmBulkDeleteDialog,
  } = useTenantManagementStore();

  // Sorting state
  type SortableColumns = 'name' | 'alias';
  type SortOrder = 'asc' | 'desc';
  const [sortBy, setSortBy] = useState<SortableColumns | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const {
    data: tenantsData,
    isLoading: isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [TENANT_QUERY_KEYS.GET_TENANTS],
    queryFn: getTenants,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { mutateAsync: removeTenant } = useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] }),
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete tenant', {
        variant: 'error',
      });
    },
    onSettled: () => resetDeleteState(),
  });

  const { mutateAsync: removeBulkTenants } = useMutation({
    mutationFn: bulkDeleteTenants,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] });
      enqueueSnackbar(`${selectedTenantIds.size} tenants deleted successfully`, {
        variant: 'success',
      });
      clearSelection();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete tenants', {
        variant: 'error',
      });
    },
    onSettled: () => closeConfirmBulkDeleteDialog(),
  });

  const tenants = tenantsData?.data ?? [];

  // Sorting logic
  const sortedTenants = useMemo(() => {
    if (!sortBy) return tenants;

    return [...tenants].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'alias':
          aValue = a.alias?.toLowerCase() || '';
          bValue = b.alias?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [tenants, sortBy, sortOrder]);

  const handleSort = (column: SortableColumns) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    if (queryError) {
      enqueueSnackbar(queryError?.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [queryError, enqueueSnackbar]);

  const handleConfirmDelete = async (): Promise<void> => {
    if (tenantToDeleteId === null) return;
    await removeTenant(tenantToDeleteId);
  };

  const handleConfirmBulkDelete = async (): Promise<void> => {
    if (selectedTenantIds.size === 0) return;
    await removeBulkTenants(Array.from(selectedTenantIds));
  };

  const handleSelectAll = (): void => {
    const allIds = sortedTenants.map(tenant => tenant.id);
    selectAllTenants(allIds);
  };

  const isAllSelected = sortedTenants.length > 0 &&
    sortedTenants.every(tenant => selectedTenantIds.has(tenant.id));
  const isIndeterminate = sortedTenants.some(tenant => selectedTenantIds.has(tenant.id)) && !isAllSelected;

  const getBulkDeleteMessage = (): React.ReactNode => {
    const selectedTenants = sortedTenants.filter(tenant => selectedTenantIds.has(tenant.id));
    const tenantCount = selectedTenants.length;

    if (tenantCount === 0) return null;

    const displayLimit = 10;
    const tenantsToShow = selectedTenants.slice(0, displayLimit);
    const hasMore = tenantCount > displayLimit;

    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete {tenantCount} tenant{tenantCount === 1 ? '' : 's'}? This action cannot be undone.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          Tenants to be deleted:
        </Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {tenantsToShow.map((tenant) => (
            <ListItem key={tenant.id} sx={{ py: 0 }}>
              <ListItemText
                primary={tenant.name}
                secondary={`Alias: ${tenant.alias}`}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
          {hasMore && (
            <ListItem sx={{ py: 0 }}>
              <ListItemText
                primary={`...and ${tenantCount - displayLimit} more`}
                primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Management
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              {selectedTenantIds.size > 0 && (
                <Button
                  variant="contained"
                  onClick={openConfirmBulkDeleteDialog}
                  sx={{
                    backgroundColor: theme.palette.error.main,
                    '&:hover': { backgroundColor: theme.palette.error.dark },
                  }}>
                  Delete ({selectedTenantIds.size})
                </Button>
              )}
              <Button
                variant="contained"
                onClick={openCreateForm}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                + Add Tenant
              </Button>
            </Box>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <TableContainer>
              <Table stickyHeader aria-label="tenant table">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 'bold',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}>
                        Tenant Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'alias'}
                        direction={sortBy === 'alias' ? sortOrder : 'asc'}
                        onClick={() => handleSort('alias')}>
                        Alias
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& tr': {
                      '&:hover': {},
                    },
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                    '& tr:last-child td, & tr:last-child th': {
                      borderBottom: 0,
                    },
                  }}>
                  {sortedTenants.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No tenants found.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedTenants.map((tenant) => {
                    const isSelected = selectedTenantIds.has(tenant.id);
                    return (
                      <TableRow
                        key={tenant.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onChange={() => toggleTenantSelection(tenant.id)}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {tenant.name}
                        </TableCell>
                      <TableCell>{tenant.alias}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="text"
                          startIcon={<EditIcon />}
                          onClick={() => openEditForm(tenant)}
                          aria-label="edit"
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            textTransform: 'none',
                            mr: 1,
                            '& .MuiButton-startIcon': { mr: 0.5 },
                          }}>
                          Edit
                        </Button>
                        <Button
                          variant="text"
                          startIcon={<DeleteIcon />}
                          onClick={() => openConfirmDeleteDialog(tenant.id)}
                          aria-label="delete"
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            textTransform: 'none',
                            '& .MuiButton-startIcon': { mr: 0.5 },
                          }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTenant ? 'Edit Tenant' : 'Create Tenant'}</DialogTitle>
        <DialogContent>
          <TenantForm tenant={selectedTenant} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete tenant ID: ${tenantToDeleteId}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={isConfirmBulkDeleteDialogOpen}
        onClose={closeConfirmBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        title="Confirm Bulk Deletion"
        message={getBulkDeleteMessage()}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default TenantManagementPage;
