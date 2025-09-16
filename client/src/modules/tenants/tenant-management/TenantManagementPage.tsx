import React, { useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TenantForm from '../components/TenantForm.tsx';
import BulkEditForm from '../components/BulkEditForm.tsx';
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
    isBulkEditOpen,
    isBulkDeleteDialogOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    toggleTenantSelection,
    selectAllTenants,
    openBulkEditDialog,
    closeBulkEditDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
  } = useTenantManagementStore();

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

  const { mutateAsync: bulkDelete } = useMutation({
    mutationFn: bulkDeleteTenants,
    onSuccess: (response) => {
      const { data } = response;
      if (data.successCount > 0) {
        enqueueSnackbar(`Successfully deleted ${data.successCount} tenant(s)`, {
          variant: 'success',
        });
      }
      if (data.failureCount > 0) {
        enqueueSnackbar(`Failed to delete ${data.failureCount} tenant(s)`, {
          variant: 'error',
        });
      }
      queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete tenants', {
        variant: 'error',
      });
    },
    onSettled: () => closeBulkDeleteDialog(),
  });

  const tenants = tenantsData?.data ?? [];

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
    const idsToDelete = Array.from(selectedTenantIds);
    await bulkDelete({ ids: idsToDelete });
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedTenantIds.size > 0 && (
                <>
                  <Button
                    variant="outlined"
                    onClick={openBulkEditDialog}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}>
                    Bulk Edit ({selectedTenantIds.size})
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={openBulkDeleteDialog}
                    sx={{
                      borderColor: theme.palette.error.main,
                      color: theme.palette.error.main,
                      '&:hover': {
                        borderColor: theme.palette.error.dark,
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}>
                    Bulk Delete ({selectedTenantIds.size})
                  </Button>
                </>
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
                        indeterminate={selectedTenantIds.size > 0 && selectedTenantIds.size < tenants.length}
                        checked={tenants.length > 0 && selectedTenantIds.size === tenants.length}
                        onChange={() => selectAllTenants(tenants.map(t => t.id))}
                        inputProps={{ 'aria-label': 'select all tenants' }}
                      />
                    </TableCell>
                    <TableCell>Tenant Name</TableCell>
                    <TableCell>Alias</TableCell>
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
                  {tenants.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No tenants found.
                      </TableCell>
                    </TableRow>
                  )}
                  {tenants.map((tenant) => {
                    const isSelected = selectedTenantIds.has(tenant.id);
                    return (
                      <TableRow key={tenant.id} selected={isSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleTenantSelection(tenant.id)}
                            inputProps={{ 'aria-labelledby': `tenant-${tenant.id}` }}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" id={`tenant-${tenant.id}`}>
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

      <Dialog open={isBulkEditOpen} onClose={closeBulkEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Edit Tenants</DialogTitle>
        <DialogContent>
          <BulkEditForm
            selectedTenants={tenants.filter(t => selectedTenantIds.has(t.id))}
            onClose={closeBulkEditDialog}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        title="Confirm Bulk Deletion"
        message={`Are you sure you want to delete ${selectedTenantIds.size} selected tenant(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default TenantManagementPage;
