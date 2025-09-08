import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types/user.ts';
import UserForm from '../components/UserForm.tsx';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog.tsx';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES, RoleValue } from '../../../common/constants/roles';
import { getUsers } from '../userQueries.ts';
import { deleteUser, activateUser, deactivateUser } from '../userMutations.ts';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes.ts';
import { useUserManagementStore } from '../stores/userManagementStore';
import { USER_QUERY_KEYS } from '../userQueryKeys.ts';
import { getTenants } from '../../tenants/tenantQueries.ts';
import { TENANT_QUERY_KEYS } from '../../tenants/tenantQueryKeys.ts';
import { debounce } from 'lodash';

type UserManagementPageProps = Record<string, unknown>;

const formatRoles = (roles: User['roles']): React.ReactNode => {
  if (!roles || roles.length === 0) {
    return '-';
  }
  return (
    <Stack direction="row" spacing={1}>
      {roles.map((role) => (
        <Chip key={role.id} label={role.name} size="small" />
      ))}
    </Stack>
  );
};

type FilterState = {
  email: string;
  name: string;
  tenant: string;
  roles: string[];
  status: string;
  createdAt: Date | null;
};

const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const [filters, setFilters] = useState<FilterState>({
    email: '',
    name: '',
    tenant: '',
    roles: [],
    status: '',
    createdAt: null,
  });

  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters);

  const {
    isFormOpen,
    selectedUser,
    isConfirmDeleteDialogOpen,
    userToDeleteId,
    isConfirmToggleStatusDialogOpen,
    userToToggleStatus,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
  } = useUserManagementStore();

  const {
    data: usersData,
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  const users: User[] = usersData?.data ?? [];

  const { data: tenantsData } = useQuery({
    queryKey: [TENANT_QUERY_KEYS.GET_TENANTS],
    queryFn: getTenants,
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: isSuperAdmin,
  });

  const tenants = tenantsData?.data ?? [];

  // Debounced update for text filters
  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters: FilterState) => {
        setDebouncedFilters(newFilters);
      }, 300),
    []
  );

  useEffect(() => {
    debouncedUpdate(filters);
  }, [filters, debouncedUpdate]);

  // Filter users based on current filter state
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Email filter
      if (debouncedFilters.email && !user.email.toLowerCase().includes(debouncedFilters.email.toLowerCase())) {
        return false;
      }

      // Name filter
      if (debouncedFilters.name) {
        const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase();
        if (!fullName.includes(debouncedFilters.name.toLowerCase())) {
          return false;
        }
      }

      // Tenant filter
      if (debouncedFilters.tenant && user.tenant?.id !== debouncedFilters.tenant) {
        return false;
      }

      // Roles filter
      if (debouncedFilters.roles.length > 0) {
        const userRoleNames = user.roles.map(r => r.name);
        const hasMatchingRole = debouncedFilters.roles.some(filterRole => 
          userRoleNames.includes(filterRole as RoleValue)
        );
        if (!hasMatchingRole) {
          return false;
        }
      }

      // Status filter
      if (debouncedFilters.status !== '') {
        const isActiveFilter = debouncedFilters.status === 'active';
        if (user.isActive !== isActiveFilter) {
          return false;
        }
      }

      // Created date filter
      if (debouncedFilters.createdAt) {
        const userDate = new Date(user.createdAt);
        const filterDate = new Date(debouncedFilters.createdAt);
        // Compare dates (year, month, day)
        if (
          userDate.getFullYear() !== filterDate.getFullYear() ||
          userDate.getMonth() !== filterDate.getMonth() ||
          userDate.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [users, debouncedFilters]);

  const handleTextFilterChange = useCallback((field: keyof FilterState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [field]: event.target.value }));
  }, []);

  const handleSelectFilterChange = useCallback((field: keyof FilterState) => (event: SelectChangeEvent<string>) => {
    setFilters(prev => ({ ...prev, [field]: event.target.value }));
  }, []);

  const handleMultiSelectFilterChange = useCallback((field: keyof FilterState) => (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, [field]: typeof value === 'string' ? value.split(',') : value }));
  }, []);

  const handleDateFilterChange = useCallback((value: Date | null) => {
    setFilters(prev => ({ ...prev, createdAt: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      email: '',
      name: '',
      tenant: '',
      roles: [],
      status: '',
      createdAt: null,
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.email !== '' ||
      filters.name !== '' ||
      filters.tenant !== '' ||
      filters.roles.length > 0 ||
      filters.status !== '' ||
      filters.createdAt !== null
    );
  }, [filters]);

  const { mutateAsync: removeUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to delete user', {
        variant: 'error',
      });
    },
    onSettled: () => resetDeleteState(),
  });

  const { mutateAsync: toggleUserStatusMutate, isPending: isTogglingStatus } = useMutation({
    mutationFn: (variables: { id: string; activate: boolean }) =>
      variables.activate ? activateUser(variables.id) : deactivateUser(variables.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to update user status', {
        variant: 'error',
      });
    },
    onSettled: () => resetToggleStatusState(),
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (userToDeleteId === null) return;

    await removeUserMutate(userToDeleteId);
  };

  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!userToToggleStatus) return;

    const activate = !userToToggleStatus.isActive;
    await toggleUserStatusMutate({ id: userToToggleStatus.id, activate });
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';

    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
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
              User Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={openCreateForm}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}>
              + Add User
            </Button>
          }
        />
        <CardContent>
          {/* Filter Controls */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Email"
                variant="outlined"
                size="small"
                value={filters.email}
                onChange={handleTextFilterChange('email')}
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Name"
                variant="outlined"
                size="small"
                value={filters.name}
                onChange={handleTextFilterChange('name')}
                sx={{ minWidth: 200 }}
              />
              {isSuperAdmin && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={filters.tenant}
                    onChange={handleSelectFilterChange('tenant')}
                    label="Tenant"
                  >
                    <MenuItem value="">All</MenuItem>
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={filters.roles}
                  onChange={handleMultiSelectFilterChange('roles')}
                  label="Roles"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(ROLES).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleSelectFilterChange('status')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Created At"
                  value={filters.createdAt}
                  onChange={handleDateFilterChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { minWidth: 200 },
                    },
                  }}
                />
              </LocalizationProvider>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              )}
            </Stack>
            {hasActiveFilters && (
              <Typography variant="body2" color="text.secondary">
                Showing {filteredUsers.length} of {users.length} users
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!isLoading && (
            <TableContainer>
              <Table stickyHeader aria-label="user table">
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
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    {isSuperAdmin && <TableCell>Tenant</TableCell>}
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
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
                  {filteredUsers.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 9 : 8} align="center" sx={{ py: 3 }}>
                        {hasActiveFilters ? 'No users match the current filters.' : 'No users found.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell component="th" scope="row">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {`${user.firstName ?? '-'} ${user.lastName ?? ''}`.trim()}
                      </TableCell>
                      {isSuperAdmin && <TableCell>{user.tenant?.name ?? '-'}</TableCell>}
                      <TableCell>{formatRoles(user.roles)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isActive ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                          <IconButton
                            onClick={() => openConfirmToggleStatusDialog(user)}
                            size="small"
                            color={user.isActive ? 'warning' : 'success'}
                            sx={{ mr: 0.5 }}
                            disabled={isTogglingStatus && userToToggleStatus?.id === user.id}>
                            {user.isActive ? <HighlightOffIcon /> : <CheckCircleOutlineIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            onClick={() => openEditForm(user)}
                            size="small"
                            color="primary"
                            sx={{ mr: 0.5 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            onClick={() => openConfirmDeleteDialog(user.id)}
                            size="small"
                            color="error"
                            disabled={isDeleting && userToDeleteId === user.id}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <UserForm user={selectedUser} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user #${userToDeleteId}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />

      <ConfirmationDialog
        open={isConfirmToggleStatusDialogOpen}
        onClose={closeConfirmToggleStatusDialog}
        onConfirm={handleConfirmToggleStatus}
        title={userToToggleStatus?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${userToToggleStatus?.isActive ? 'deactivate' : 'activate'} user ${userToToggleStatus?.email ?? ''}?`}
        confirmText={userToToggleStatus?.isActive ? 'Deactivate' : 'Activate'}
        confirmButtonProps={{
          color: userToToggleStatus?.isActive ? 'warning' : 'success',
          disabled: isTogglingStatus,
        }}
      />
    </Box>
  );
};

export default UserManagementPage;
