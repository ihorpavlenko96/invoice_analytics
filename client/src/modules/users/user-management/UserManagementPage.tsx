import React, { useEffect, useState, useMemo } from 'react';
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
  TableSortLabel,
  Tooltip,
  Typography,
  useTheme,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types/user.ts';
import UserForm from '../components/UserForm.tsx';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog.tsx';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { getUsers } from '../userQueries.ts';
import { deleteUser, activateUser, deactivateUser } from '../userMutations.ts';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes.ts';
import { useUserManagementStore } from '../stores/userManagementStore';
import { USER_QUERY_KEYS } from '../userQueryKeys.ts';

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

const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const {
    isFormOpen,
    selectedUser,
    isConfirmDeleteDialogOpen,
    userToDeleteId,
    isConfirmToggleStatusDialogOpen,
    userToToggleStatus,
    filters,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
    setFilter,
    clearFilters,
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

  type SortableColumns = 'email' | 'name' | 'tenant' | 'status' | 'createdAt';
  type SortOrder = 'asc' | 'desc';

  const [sortBy, setSortBy] = useState<SortableColumns | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const users: User[] = usersData?.data ?? [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }

      if (filters.name) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) {
          return false;
        }
      }

      if (filters.tenant && user.tenant?.name &&
          !user.tenant.name.toLowerCase().includes(filters.tenant.toLowerCase())) {
        return false;
      }

      if (filters.role) {
        const hasRole = user.roles.some(role => role.name === filters.role);
        if (!hasRole) {
          return false;
        }
      }

      if (filters.status) {
        const userStatus = user.isActive ? 'active' : 'inactive';
        if (userStatus !== filters.status) {
          return false;
        }
      }

      if (filters.createdAtFrom || filters.createdAtTo) {
        const createdDate = new Date(user.createdAt);
        if (filters.createdAtFrom) {
          const fromDate = new Date(filters.createdAtFrom);
          if (createdDate < fromDate) {
            return false;
          }
        }
        if (filters.createdAtTo) {
          const toDate = new Date(filters.createdAtTo);
          toDate.setHours(23, 59, 59, 999);
          if (createdDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [users, filters]);

  const sortedUsers = useMemo(() => {
    if (!sortBy) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
          break;
        case 'tenant':
          aValue = a.tenant?.name?.toLowerCase() || '';
          bValue = b.tenant?.name?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.isActive ? 'active' : 'inactive';
          bValue = b.isActive ? 'active' : 'inactive';
          break;
        case 'createdAt':
          aValue = a.createdAt || '';
          bValue = b.createdAt || '';
          break;
        default:
          return 0;
      }

      if (sortBy === 'createdAt') {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredUsers, sortBy, sortOrder]);

  const handleSort = (column: SortableColumns) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

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

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const extractUniqueRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    users.forEach(user => {
      user.roles.forEach(role => rolesSet.add(role.name));
    });
    return Array.from(rolesSet).sort();
  }, [users]);

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
            <Stack direction="row" spacing={2}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ borderColor: theme.palette.divider }}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant="contained"
                onClick={openCreateForm}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                + Add User
              </Button>
            </Stack>
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
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'email'}
                        direction={sortBy === 'email' ? sortOrder : 'asc'}
                        onClick={() => handleSort('email')}>
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}>
                        Name
                      </TableSortLabel>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === 'tenant'}
                          direction={sortBy === 'tenant' ? sortOrder : 'asc'}
                          onClick={() => handleSort('tenant')}>
                          Tenant
                        </TableSortLabel>
                      </TableCell>
                    )}
                    <TableCell>Roles</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'status'}
                        direction={sortBy === 'status' ? sortOrder : 'asc'}
                        onClick={() => handleSort('status')}>
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'createdAt'}
                        direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                        onClick={() => handleSort('createdAt')}>
                        Created At
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                  <TableRow
                    sx={{
                      '& th': {
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        padding: '8px',
                      },
                    }}>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Filter by email"
                        value={filters.email}
                        onChange={(e) => setFilter('email', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: '100%' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Filter by name"
                        value={filters.name}
                        onChange={(e) => setFilter('name', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: '100%' }}
                      />
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter by tenant"
                          value={filters.tenant}
                          onChange={(e) => setFilter('tenant', e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: '100%' }}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <FormControl size="small" sx={{ width: '100%' }}>
                        <Select
                          value={filters.role}
                          onChange={(e) => setFilter('role', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All Roles</MenuItem>
                          {extractUniqueRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ width: '100%' }}>
                        <Select
                          value={filters.status}
                          onChange={(e) => setFilter('status', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          type="date"
                          placeholder="From"
                          value={filters.createdAtFrom}
                          onChange={(e) => setFilter('createdAtFrom', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: '50%' }}
                        />
                        <TextField
                          size="small"
                          type="date"
                          placeholder="To"
                          value={filters.createdAtTo}
                          onChange={(e) => setFilter('createdAtTo', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: '50%' }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell></TableCell>
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
                  {sortedUsers.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 9 : 8} align="center" sx={{ py: 3 }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedUsers.map((user) => (
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
