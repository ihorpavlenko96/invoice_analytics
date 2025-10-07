import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getCurrentUser } from '../accountQueries';
import { updateProfile, UpdateProfilePayload } from '../accountMutations';
import { ACCOUNT_QUERY_KEYS } from '../accountQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

const profileValidationSchema = Yup.object({
  firstName: Yup.string().max(50, 'First name must be at most 50 characters'),
  lastName: Yup.string().max(50, 'Last name must be at most 50 characters'),
});

const AccountPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();

  const userId = clerkUser?.publicMetadata?.userId as string | undefined;

  const {
    data: userData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.currentUser(userId || ''),
    queryFn: () => getCurrentUser(userId!),
    enabled: !!userId,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const user = userData?.data;

  useEffect(() => {
    if (queryError) {
      enqueueSnackbar(queryError?.message || 'Failed to load user data', {
        variant: 'error',
      });
    }
  }, [queryError, enqueueSnackbar]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.currentUser(userId || '') });
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' });
    },
  });

  const handlePasswordChange = () => {
    window.open('https://accounts.clerk.dev/user', '_blank');
    enqueueSnackbar('Opening Clerk account settings in a new tab', { variant: 'info' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error">
          Unable to load user data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', p: 2 }}>
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Manage Account
            </Typography>
          }
        />
        <CardContent>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Profile Information
              </Typography>
              <Formik
                initialValues={{
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                }}
                validationSchema={profileValidationSchema}
                onSubmit={(values) => {
                  const payload: UpdateProfilePayload = {
                    id: user.id,
                    data: {
                      firstName: values.firstName || undefined,
                      lastName: values.lastName || undefined,
                    },
                  };
                  updateProfileMutation.mutate(payload);
                }}
                enableReinitialize>
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Stack spacing={2}>
                      <Field name="firstName">
                        {({ field }: { field: { name: string; value: string; onChange: (e: React.ChangeEvent) => void; onBlur: (e: React.FocusEvent) => void } }) => (
                          <TextField
                            {...field}
                            label="First Name"
                            fullWidth
                            error={touched.firstName && Boolean(errors.firstName)}
                            helperText={touched.firstName && errors.firstName}
                          />
                        )}
                      </Field>
                      <Field name="lastName">
                        {({ field }: { field: { name: string; value: string; onChange: (e: React.ChangeEvent) => void; onBlur: (e: React.FocusEvent) => void } }) => (
                          <TextField
                            {...field}
                            label="Last Name"
                            fullWidth
                            error={touched.lastName && Boolean(errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                          />
                        )}
                      </Field>
                      <TextField
                        label="Email"
                        value={user.email}
                        fullWidth
                        disabled
                        helperText="Email cannot be changed"
                      />
                      <Box>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || updateProfileMutation.isPending}
                          sx={{ minWidth: 120 }}>
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Account Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tenant
                  </Typography>
                  <Typography variant="body1">{user.tenant.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Roles
                  </Typography>
                  <Typography variant="body1">
                    {user.roles.map((role) => role.name).join(', ')}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Security
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Password
                  </Typography>
                  <Button variant="outlined" onClick={handlePasswordChange}>
                    Change Password
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    Opens Clerk account settings in a new tab
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountPage;
