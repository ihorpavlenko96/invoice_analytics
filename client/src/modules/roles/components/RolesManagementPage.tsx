import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRoles, getRolePermissions } from '../roleQueries';
import { updateRolePermissions } from '../roleMutations';
import { ROLE_QUERY_KEYS } from '../roleQueryKeys';
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  PermissionResource,
  PermissionAction,
} from '../../../common/constants/permissions';
import { Permission } from '../types/permission';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

const RolesManagementPage: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });
  const roles = rolesData?.data ?? [];

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedRoleId && roles.length) setSelectedRoleId(roles[0].id);
  }, [roles, selectedRoleId]);

  const {
    data: permsData,
    isLoading: permsLoading,
    error: permsError,
  } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLE_PERMISSIONS, selectedRoleId],
    queryFn: () => getRolePermissions(selectedRoleId as string),
    enabled: !!selectedRoleId,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const [draft, setDraft] = useState<Set<string>>(new Set());
  useEffect(() => {
    const perms = permsData?.data ?? [];
    setDraft(new Set(perms.map((p) => `${p.resource}:${p.action}`)));
  }, [permsData]);

  const toggle = (resource: PermissionResource, action: PermissionAction) =>
    setDraft((prev) => {
      const next = new Set(prev);
      const k = `${resource}:${action}`;
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }

      return next;
    });

  useEffect(() => {
    if (permsError) {
      enqueueSnackbar(
        (permsError as Error)?.message || 'An error occurred while fetching permissions',
        { variant: 'error' },
      );
    }
  }, [permsError, enqueueSnackbar]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_QUERY_KEYS.GET_ROLE_PERMISSIONS, selectedRoleId],
      });
      enqueueSnackbar('Permissions updated', { variant: 'success' });
    },
    onError: (e: Error) =>
      enqueueSnackbar(e.message || 'Failed to update permissions', { variant: 'error' }),
  });

  const handleSave = () => {
    if (!selectedRoleId) return;
    const permissions = Array.from(draft).map((k) => {
      const [resource, action] = k.split(':');

      return { resource, action } as Permission;
    });

    return save({ roleId: selectedRoleId, permissions });
  };

  const resources = Object.values(PERMISSION_RESOURCES);
  const actions = Object.values(PERMISSION_ACTIONS);

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
              Role Permissions
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isPending || !selectedRoleId}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}>
              {isPending ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          }
        />
        <CardContent>
          {rolesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : roles.length === 0 ? (
            <Typography align="center" sx={{ py: 3 }}>
              No roles found.
            </Typography>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 3, maxWidth: 320 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  label="Role"
                  value={selectedRoleId ?? ''}
                  onChange={(e: SelectChangeEvent<string>) => setSelectedRoleId(e.target.value)}>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {permsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table aria-label="permissions table">
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
                        <TableCell>Resource</TableCell>
                        {actions.map((action) => (
                          <TableCell key={action} align="center" sx={{ textTransform: 'capitalize' }}>
                            {action}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resources.map((resource) => (
                        <TableRow key={resource}>
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{ textTransform: 'capitalize' }}>
                            {resource}
                          </TableCell>
                          {actions.map((action) => (
                            <TableCell key={action} align="center">
                              <Checkbox
                                checked={draft.has(`${resource}:${action}`)}
                                onChange={() => toggle(resource, action)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RolesManagementPage;
