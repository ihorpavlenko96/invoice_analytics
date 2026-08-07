import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormHelperText,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Permission, Role } from '../types/role';
import { getPermissions } from '../roleQueries';
import { createRole, updateRole } from '../roleMutations';
import { ROLE_QUERY_KEYS } from '../roleQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

type RoleFormProps = {
  role?: Role | null;
  onClose: () => void;
};

type RoleFormValues = {
  name: string;
  permissionIds: string[];
};

const roleSchema = Yup.object().shape({
  name: Yup.string().trim().max(100, 'Too Long!').required('Role name is required'),
  permissionIds: Yup.array().of(Yup.string().required()).default([]),
});

const RoleForm: React.FC<RoleFormProps> = ({ role, onClose }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = !!role;

  const { data: permsData, isLoading: permsLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_PERMISSIONS],
    queryFn: getPermissions,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const permissions: Permission[] = useMemo(() => permsData?.data ?? [], [permsData]);

  const groupedPermissions = useMemo(
    () =>
      permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
        (acc[permission.resource] = acc[permission.resource] ?? []).push(permission);
        return acc;
      }, {}),
    [permissions],
  );

  const initialValues: RoleFormValues = useMemo(
    () => ({
      name: role?.name ?? '',
      permissionIds: role?.permissions?.map((p) => p.id) ?? [],
    }),
    [role],
  );

  const { mutateAsync: saveRole, isPending: isSaving } = useMutation({
    mutationFn: (values: RoleFormValues) =>
      isEditing && role ? updateRole({ id: role.id, data: values }) : createRole(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLE_QUERY_KEYS.GET_ROLES] });
      onClose();
    },
    onError: (e: Error) => {
      enqueueSnackbar(e.message || 'Failed to save role', { variant: 'error' });
    },
  });

  const handleSubmit = async (values: RoleFormValues): Promise<void> => {
    await saveRole(values);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={roleSchema}
      onSubmit={handleSubmit}>
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Role Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              fullWidth
              autoFocus
            />

            <FormControl component="fieldset" variant="standard">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Permissions
              </Typography>

              {permsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {!permsLoading && permissions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No permissions available.
                </Typography>
              )}

              {!permsLoading &&
                Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <Box key={resource} sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: 'capitalize',
                        color: theme.palette.text.secondary,
                      }}>
                      {resource}
                    </Typography>
                    <FormGroup row>
                      {perms.map((p) => (
                        <FormControlLabel
                          key={p.id}
                          control={
                            <Checkbox
                              checked={values.permissionIds.includes(p.id)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...values.permissionIds, p.id]
                                  : values.permissionIds.filter((id) => id !== p.id);
                                setFieldValue('permissionIds', next);
                              }}
                            />
                          }
                          label={p.action}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ))}

              {touched.permissionIds && typeof errors.permissionIds === 'string' && (
                <FormHelperText error>{errors.permissionIds}</FormHelperText>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              <Button onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Create Role'
                )}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default RoleForm;
