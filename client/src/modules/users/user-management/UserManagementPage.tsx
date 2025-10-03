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
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
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
import DraggableTableHead from '../components/DraggableTableHead';

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
    columnOrder,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
    setColumnOrder,
    loadColumnOrder,
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

  type SortOrder = 'asc' | 'desc';

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter states
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  const users: User[] = usersData?.data ?? [];

  useEffect(() => {
    loadColumnOrder();
  }, [loadColumnOrder]);

  const columns = useMemo(() => {
    const baseColumns = [
      { id: 'email', label: 'Email', sortable: true },
      { id: 'name', label: 'Name', sortable: true },
      { id: 'roles', label: 'Roles', sortable: false },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'createdAt', label: 'Created At', sortable: true },
      { id: 'actions', label: 'Actions', sortable: false, align: 'right' as const },
    ];

    if (isSuperAdmin) {
      baseColumns.splice(2, 0, { id: 'tenant', label: 'Tenant', sortable: true });
    }

    return baseColumns;
  }, [isSuperAdmin]);

  useEffect(() => {
    if (columnOrder.length === 0 && columns.length > 0) {
      setColumnOrder(columns.map(col => col.id));
    }
  }, [columns, columnOrder.length, setColumnOrder]);

  const sortedUsers = useMemo(() => {
    // First apply filters
    const filteredUsers = users.filter((user) => {
      // Email filter
      if (filterEmail && !user.email?.toLowerCase().includes(filterEmail.toLowerCase())) {
        return false;
      }

      // Name filter
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      if (filterName && !fullName.includes(filterName.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        const isActive = filterStatus === 'active';
        if (user.isActive !== isActive) {
          return false;
        }
      }

      // Role filter
      if (filterRole !== 'all' && user.roles) {
        const hasRole = user.roles.some((role) => role.name === filterRole);
        if (!hasRole) {
          return false;
        }
      }

      return true;
    });

    // Then apply sorting
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
  }, [users, sortBy, sortOrder, filterEmail, filterName, filterStatus, filterRole]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setFilterEmail('');
    setFilterName('');
    setFilterStatus('all');
    setFilterRole('all');
  };

  // Get unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    users.forEach((user) => {
      user.roles?.forEach((role) => rolesSet.add(role.name));
    });
    return Array.from(rolesSet).sort();
  }, [users]);

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
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Filter Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Filter by Email"
                variant="outlined"
                size="small"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="Filter by Name"
                variant="outlined"
                size="small"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150, height: '40px' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{ height: '40px' }}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150, height: '40px' }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="Role"
                  sx={{ height: '40px' }}>
                  <MenuItem value="all">All Roles</MenuItem>
                  {uniqueRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={filterEmail === '' && filterName === '' && filterStatus === 'all' && filterRole === 'all'}
                sx={{
                  minWidth: 120,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                }}>
                Clear Filters
              </Button>
            </Stack>
          </Box>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!isLoading && (
            <TableContainer>
              <Table stickyHeader aria-label="user table">
                <DraggableTableHead
                  columns={columns}
                  columnOrder={columnOrder}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onReorder={setColumnOrder}
                />
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
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedUsers.map((user) => {
                    const orderedColumns = columnOrder.length > 0
                      ? columnOrder.map(id => columns.find(col => col.id === id)).filter(Boolean)
                      : columns;

                    return (
                      <TableRow key={user.id}>
                        {orderedColumns.map((column) => {
                          if (!column) return null;

                          switch (column.id) {
                            case 'email':
                              return (
                                <TableCell key={column.id} component="th" scope="row">
                                  {user.email}
                                </TableCell>
                              );
                            case 'name':
                              return (
                                <TableCell key={column.id}>
                                  {`${user.firstName ?? '-'} ${user.lastName ?? ''}`.trim()}
                                </TableCell>
                              );
                            case 'tenant':
                              return (
                                <TableCell key={column.id}>
                                  {user.tenant?.name ?? '-'}
                                </TableCell>
                              );
                            case 'roles':
                              return (
                                <TableCell key={column.id}>
                                  {formatRoles(user.roles)}
                                </TableCell>
                              );
                            case 'status':
                              return (
                                <TableCell key={column.id}>
                                  <Chip
                                    icon={user.isActive ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
                                    label={user.isActive ? 'Active' : 'Inactive'}
                                    color={user.isActive ? 'success' : 'error'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                              );
                            case 'createdAt':
                              return (
                                <TableCell key={column.id}>
                                  {formatDate(user.createdAt)}
                                </TableCell>
                              );
                            case 'actions':
                              return (
                                <TableCell key={column.id} align="right">
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
                              );
                            default:
                              return null;
                          }
                        })}
                      </TableRow>
                    );
                  })}
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
