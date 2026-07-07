import React from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogContent,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  useFeedbackDialogStore,
  type FeedbackRating,
  type FeedbackCategory,
} from '../stores/feedbackDialogStore';

/** Rating options displayed as a full-width button group, matching Figma order */
const RATING_OPTIONS: FeedbackRating[] = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

/** Category options for the select dropdown */
const CATEGORY_OPTIONS: FeedbackCategory[] = [
  'Bug / unexpected behavior',
  'Feature request',
  'General feedback',
  'Performance issue',
  'UI / UX feedback',
  'Other',
];

const FeedbackDialog: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { isOpen, rating, category, message, canContact, closeDialog, setRating, setCategory, setMessage, toggleCanContact } =
    useFeedbackDialogStore();

  /** Show textarea once a category has been selected (matching Figma Show Textarea variant) */
  const showTextarea = Boolean(category);

  /** Submit is only enabled once a rating has been selected */
  const isSubmitDisabled = !rating;

  const handleRatingClick = (value: FeedbackRating): void => {
    setRating(value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    setCategory(event.target.value as FeedbackCategory | '');
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value);
  };

  const handleSubmit = (): void => {
    if (!rating) return;

    enqueueSnackbar('Your feedback has been send to the team', {
      variant: 'success',
    });
    closeDialog();
  };

  const handleDismiss = (): void => {
    closeDialog();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleDismiss}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 512,
          borderRadius: '10px',
          boxShadow:
            '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
          border: '1px solid #E5E5E5',
          overflow: 'visible',
        },
      }}>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          position: 'relative',
          '&.MuiDialogContent-root': { p: 3 },
        }}>
        {/* Close button – positioned top-right per Figma (absolute at x:480, y:16 within 512px dialog) */}
        <IconButton
          aria-label="close feedback dialog"
          onClick={handleDismiss}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 16,
            height: 16,
            color: 'text.primary',
            opacity: 0.7,
            p: 0,
          }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>

        {/* Dialog Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', pr: 3 }}>
          <Typography
            sx={{
              fontFamily: 'Geist, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1,
              color: '#0A0A0A',
            }}>
            How was your experience?
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Geist, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '1.4285714285714286em',
              color: '#737373',
            }}>
            Your feedback helps us improve Beezi.
          </Typography>
        </Box>

        {/* Content Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Inner content: rating + category + optional textarea */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Rating ButtonGroup – 5 equal-width outlined buttons */}
            <ButtonGroup
              fullWidth
              variant="outlined"
              aria-label="feedback rating"
              sx={{
                '& .MuiButtonGroup-grouped': {
                  borderColor: '#E5E5E5',
                  textTransform: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                  fontSize: 14,
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: '#171717',
                    backgroundColor: 'transparent',
                    zIndex: 1,
                  },
                },
              }}>
              {RATING_OPTIONS.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleRatingClick(option)}
                  sx={{
                    fontWeight: rating === option ? 600 : 400,
                    backgroundColor: rating === option ? '#171717' : 'transparent',
                    color: rating === option ? '#FFFFFF' : 'text.primary',
                    borderColor: rating === option ? '#171717' : '#E5E5E5',
                    '&:hover': {
                      backgroundColor: rating === option ? '#171717' : 'transparent',
                      borderColor: '#171717',
                      color: rating === option ? '#FFFFFF' : 'text.primary',
                    },
                  }}>
                  {option}
                </Button>
              ))}
            </ButtonGroup>

            {/* Category Select with label */}
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  fontFamily: 'Geist, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  color: 'text.primary',
                  mb: '6px',
                  '&.Mui-focused': { color: 'text.primary' },
                }}>
                Feedback category
              </FormLabel>
              <Select
                value={category}
                onChange={handleCategoryChange as never}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: 'text.disabled', fontSize: 14 }}>
                        Select a category
                      </Typography>
                    );
                  }
                  return selected as string;
                }}
                sx={{
                  borderRadius: '8px',
                  fontSize: 14,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E5E5' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#171717' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#171717' },
                }}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: 14 }}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Textarea – shown only after a category is selected (Figma: Show Textarea=true) */}
            {showTextarea && (
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    fontFamily: 'Geist, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    color: 'text.primary',
                    mb: '6px',
                    '&.Mui-focused': { color: 'text.primary' },
                  }}>
                  Describe the issue (optional)
                </FormLabel>
                <TextField
                  multiline
                  rows={4}
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Steps, expected vs actual result, error messages"
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: 14,
                      '& fieldset': { borderColor: '#E5E5E5' },
                      '&:hover fieldset': { borderColor: '#171717' },
                      '&.Mui-focused fieldset': { borderColor: '#171717' },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#737373',
                      opacity: 1,
                    },
                  }}
                />
              </FormControl>
            )}
          </Box>

          {/* Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={canContact}
                onChange={toggleCanContact}
                size="small"
                sx={{
                  color: '#E5E5E5',
                  borderRadius: '4px',
                  p: '2px',
                  '&.Mui-checked': { color: '#171717' },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontFamily: 'Geist, sans-serif' }}>
                Beezi may contact me to follow up on this feedback
              </Typography>
            }
            sx={{ m: 0, gap: 1, alignItems: 'center' }}
          />
        </Box>

        {/* Dialog Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
          }}>
          {/* Dismiss – Outline variant */}
          <Button
            variant="outlined"
            onClick={handleDismiss}
            sx={{
              textTransform: 'none',
              fontFamily: 'Geist, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              height: 36,
              px: 2,
              borderRadius: '8px',
              borderColor: '#E5E5E5',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#171717',
                backgroundColor: 'transparent',
              },
            }}>
            Dismiss
          </Button>

          {/* Submit – Neutral Primary (dark) variant, disabled at 0.5 opacity until rating selected */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            sx={{
              textTransform: 'none',
              fontFamily: 'Geist, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              height: 36,
              px: 2,
              borderRadius: '8px',
              backgroundColor: '#171717',
              color: '#FFFFFF',
              boxShadow: 'none',
              opacity: isSubmitDisabled ? 0.5 : 1,
              '&:hover': {
                backgroundColor: '#171717',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                backgroundColor: '#171717',
                color: '#FFFFFF',
                opacity: 0.5,
              },
            }}>
            Submit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
