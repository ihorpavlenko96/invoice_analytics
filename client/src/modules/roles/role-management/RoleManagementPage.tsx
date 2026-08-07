import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Role } from '../types/role';
import RoleForm from '../components/RoleForm';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { getRoles } from '../roleQueries';
import { deleteRole } from '../roleMutations';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useRoleManagementStore } from '../stores/roleManagementStore';
import { ROLE_QUERY_KEYS } from '../roleQueryKeys';

const RoleManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const {
    isFormOpen,
    selectedRole,
    isConfirmDeleteDialogOpen,
    roleToDelete,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
  } = useRoleManagementStore();

  const {
    data: rolesData,
    isLoading,
    error: rolesError,
  } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (rolesError) {
      enqueueSnackbar(rolesError.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [rolesError, enqueueSnackbar]);

  const roles: Role[] = rolesData?.data ?? [];

  const { mutateAsync: removeRoleMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLE_QUERY_KEYS.GET_ROLES] });
    },
    onError: (e: Error) => {
      enqueueSnackbar(e.message || 'Failed to delete role', { variant: 'error' });
    },
    onSettled: () => closeConfirmDeleteDialog(),
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (roleToDelete) {
      await removeRoleMutate(roleToDelete.id);
    }
  };

  const formatPermissions = (role: Role): React.ReactNode => {
    if (!role.permissions || role.permissions.length === 0) {
      return '-';
    }
    return (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {role.permissions.map((p) => (
          <Chip key={p.id} label={`${p.resource}:${p.action}`} size="small" />
        ))}
      </Stack>
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
              Role Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={openCreateForm}
              sx={{
                backgroundColor: '#8B5CF6',
                '&:hover': { backgroundColor: '#7C3AED' },
              }}>
              + Add Role
            </Button>
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
              <Table stickyHeader aria-label="role table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                  }}>
                  {roles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No roles found.
                      </TableCell>
                    </TableRow>
                  )}
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell component="th" scope="row">
                        {role.name}
                      </TableCell>
                      <TableCell>{formatPermissions(role)}</TableCell>
                      <TableCell>
                        <Chip
                          label={role.isBuiltIn ? 'Built-in' : 'Custom'}
                          size="small"
                          color={role.isBuiltIn ? 'default' : 'primary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {!role.isBuiltIn && (
                          <>
                            <Tooltip title="Edit Role">
                              <IconButton
                                onClick={() => openEditForm(role)}
                                size="small"
                                color="primary"
                                sx={{ mr: 0.5 }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Role">
                              <IconButton
                                onClick={() => openConfirmDeleteDialog(role)}
                                size="small"
                                color="primary"
                                disabled={isDeleting && roleToDelete?.id === role.id}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <RoleForm role={selectedRole} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message={`Are you sure you want to delete role "${roleToDelete?.name ?? ''}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{
          variant: 'contained',
          disabled: isDeleting,
          sx: {
            backgroundColor: '#F87171',
            color: '#000000',
            '&:hover': { backgroundColor: '#DC2626' },
          },
        }}
      />
    </Box>
  );
};

export default RoleManagementPage;
