import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import { useClerk, useUser, useSignIn } from '@clerk/clerk-react';
import { useSnackbar } from 'notistack';

type CustomUserButtonProps = {
  afterSignOutUrl: string;
};

const CustomUserButton: React.FC<CustomUserButtonProps> = ({ afterSignOutUrl }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const { user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { enqueueSnackbar } = useSnackbar();
  const [isResetting, setIsResetting] = useState(false);
  const theme = useTheme();

  const handleClick = (): void => {
    setAnchorEl(buttonRef.current);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleSignOut = (): void => {
    signOut(() => {
      window.location.href = afterSignOutUrl;
    });
    handleClose();
  };

  const handleResetPassword = async (): Promise<void> => {
    handleClose();

    if (!isSignInLoaded || !signIn) return;

    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) return;

    setIsResetting(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      enqueueSnackbar('Password reset email sent. Check your inbox.', {
        variant: 'success',
      });
    } catch (err) {
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      const message =
        clerkError?.errors?.[0]?.longMessage ||
        (err as Error).message ||
        'Failed to send password reset email. Please try again.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        ref={buttonRef}
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          borderRadius: '50%',
          padding: '2px',
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}>
        <Avatar
          src={user?.imageUrl}
          alt={user?.firstName || 'User'}
          sx={{
            width: 36,
            height: 36,
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            mt: 1,
            px: 0,
            pt: 2,
            pb: 1,
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            backgroundImage: 'none',
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1.5,
            pl: 2,
          }}>
          <Avatar
            src={user?.imageUrl}
            alt={user?.firstName || 'User'}
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          />
          <Box>
            <Tooltip title={user?.emailAddresses[0]?.emailAddress || ''}>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.primary,
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  textShadow: 'none',
                }}>
                {user?.emailAddresses[0]?.emailAddress}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleResetPassword}
              disabled={isResetting}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <LockResetIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Reset password" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleSignOut}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  );
};

export default CustomUserButton;
