import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField } from 'formik-mui';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkUpdateTenants } from '../tenantMutations';
import { TENANT_QUERY_KEYS } from '../tenantQueryKeys';
import { useSnackbar } from 'notistack';
import { useTenantManagementStore } from '../stores/tenantManagementStore';
import { Tenant } from '../types/tenant';

interface BulkEditFormProps {
  selectedTenants: Tenant[];
  onClose: () => void;
}

interface BulkEditFormValues {
  name?: string;
  alias?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().max(255, 'Name must be 255 characters or less'),
  alias: Yup.string().max(50, 'Alias must be 50 characters or less'),
});

const BulkEditForm: React.FC<BulkEditFormProps> = ({ selectedTenants, onClose }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { clearSelection } = useTenantManagementStore();

  const { mutateAsync: bulkUpdate, isPending } = useMutation({
    mutationFn: bulkUpdateTenants,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] });

      if (result.data.successCount > 0) {
        enqueueSnackbar(
          `Successfully updated ${result.data.successCount} of ${result.data.total} tenants`,
          { variant: 'success' }
        );
      }

      if (result.data.failureCount > 0) {
        result.data.failed.forEach(failure => {
          enqueueSnackbar(
            `Failed to update tenant ${failure.id}: ${failure.error}`,
            { variant: 'error' }
          );
        });
      }

      clearSelection();
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update tenants', {
        variant: 'error',
      });
    },
  });

  const handleSubmit = async (values: BulkEditFormValues): Promise<void> => {
    const updates = selectedTenants.map(tenant => ({
      id: tenant.id,
      ...(values.name && { name: values.name }),
      ...(values.alias && { alias: values.alias }),
    }));

    await bulkUpdate({ updates });
  };

  const initialValues: BulkEditFormValues = {
    name: '',
    alias: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={true}>
      {({ isValid, dirty }) => (
        <Form>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              You are editing {selectedTenants.length} tenant{selectedTenants.length > 1 ? 's' : ''}.
              Leave fields empty to keep existing values unchanged.
            </Alert>

            <Field
              component={TextField}
              name="name"
              label="Tenant Name"
              fullWidth
              margin="normal"
              placeholder="Leave empty to keep existing names"
            />

            <Field
              component={TextField}
              name="alias"
              label="Alias"
              fullWidth
              margin="normal"
              placeholder="Leave empty to keep existing aliases"
            />

            {selectedTenants.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Updating large number of tenants may take some time.
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isPending || !dirty}
                color="primary">
                {isPending ? 'Updating...' : 'Update All'}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default BulkEditForm;