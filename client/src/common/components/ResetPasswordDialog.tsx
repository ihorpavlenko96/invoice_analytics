import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type ResetPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

type ResetPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const resetPasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required')
    .test(
      'not-same-as-current',
      'New password must be different from current password',
      function (value) {
        return value !== this.parent.currentPassword;
      },
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

const initialValues: ResetPasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, onClose }) => {
  const { user } = useUser();
  const theme = useTheme();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up pending auto-close timer when component unmounts
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current !== null) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleClose = (): void => {
    // Cancel any pending auto-close to avoid calling onClose twice
    if (autoCloseTimerRef.current !== null) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setSuccessMessage(null);
    setApiError(null);
    onClose();
  };

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    { resetForm }: { resetForm: () => void },
  ): Promise<void> => {
    setApiError(null);
    setSuccessMessage(null);

    // Guard: user must be loaded before attempting password update
    if (!user) {
      setApiError('Unable to update password. Please try again later.');
      return;
    }

    try {
      await user.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccessMessage('Password updated successfully.');
      resetForm();

      // Auto-close dialog after showing success message; store timer to allow cancellation
      autoCloseTimerRef.current = setTimeout(() => {
        autoCloseTimerRef.current = null;
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      // Handle Clerk API errors which carry an `errors` array
      if (
        err !== null &&
        typeof err === 'object' &&
        'errors' in err &&
        Array.isArray((err as { errors: unknown[] }).errors) &&
        (err as { errors: unknown[] }).errors.length > 0
      ) {
        const clerkErrors = (
          err as { errors: Array<{ longMessage?: string; message?: string }> }
        ).errors;
        const firstError = clerkErrors[0];
        setApiError(firstError.longMessage ?? firstError.message ?? 'Password update failed.');
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="reset-password-dialog-title">
      <DialogTitle
        id="reset-password-dialog-title"
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        Reset Password
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={resetPasswordSchema}
        onSubmit={handleSubmit}
        enableReinitialize>
        {({ errors, touched, isSubmitting }) => (
          <Form noValidate>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {apiError && (
                  <Alert severity="error" sx={{ mb: 0.5 }}>
                    {apiError}
                  </Alert>
                )}

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 0.5 }}>
                    {successMessage}
                  </Alert>
                )}

                <Field
                  as={TextField}
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={touched.currentPassword && !!errors.currentPassword}
                  helperText={touched.currentPassword && errors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          edge="end"
                          size="small">
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Field
                  as={TextField}
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={touched.newPassword && !!errors.newPassword}
                  helperText={touched.newPassword && errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                          size="small">
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Field
                  as={TextField}
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions
              sx={{ px: 3, pb: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ResetPasswordDialog;
