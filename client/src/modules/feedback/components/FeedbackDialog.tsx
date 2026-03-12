import React from 'react';
import { useSnackbar } from 'notistack';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useFeedbackDialogStore } from '../stores/feedbackDialogStore';

type FeedbackType = 'Bug' | 'Feature' | 'General';

const FEEDBACK_TYPES: FeedbackType[] = ['Bug', 'Feature', 'General'];

interface FeedbackFormValues {
  type: FeedbackType;
  description: string;
}

const FeedbackSchema = Yup.object().shape({
  type: Yup.string().oneOf(FEEDBACK_TYPES, 'Invalid feedback type').required('Required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
});

const FeedbackDialog: React.FC = () => {
  const { isOpen, closeDialog } = useFeedbackDialogStore();
  const { enqueueSnackbar } = useSnackbar();

  const initialValues: FeedbackFormValues = {
    type: 'General',
    description: '',
  };

  const handleSubmit = async (
    values: FeedbackFormValues,
    { resetForm }: { resetForm: () => void },
  ): Promise<void> => {
    // Frontend-only: show success notification and close dialog
    // Structure allows easy backend mutation addition later
    console.info('Feedback submitted:', values);
    enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
    resetForm();
    closeDialog();
  };

  const handleClose = (resetForm: () => void): void => {
    resetForm();
    closeDialog();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={FeedbackSchema}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ errors, touched, isSubmitting, resetForm, values, handleChange, handleBlur }) => (
        <Dialog open={isOpen} onClose={() => handleClose(resetForm)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" component="span">
              Submit Feedback
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Form noValidate id="feedback-form">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Field
                  as={TextField}
                  select
                  name="type"
                  label="Feedback Type"
                  variant="outlined"
                  fullWidth
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.type && !!errors.type}
                  helperText={touched.type && errors.type}>
                  {FEEDBACK_TYPES.map((feedbackType) => (
                    <MenuItem key={feedbackType} value={feedbackType}>
                      {feedbackType}
                    </MenuItem>
                  ))}
                </Field>

                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Please describe your feedback..."
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
              </Box>
            </Form>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => handleClose(resetForm)} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="feedback-form"
              variant="contained"
              color="primary"
              disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
};

export default FeedbackDialog;
