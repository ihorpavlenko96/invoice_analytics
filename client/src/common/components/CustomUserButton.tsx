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
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useClerk, useUser } from '@clerk/clerk-react';

type CustomUserButtonProps = {
  afterSignOutUrl: string;
};

const CustomUserButton: React.FC<CustomUserButtonProps> = ({ afterSignOutUrl }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { signOut, client, setActive } = useClerk();
  const { user } = useUser();
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

  const handleManageAccount = (): void => {
    handleClose();
  };

  const handleSwitchSession = async (sessionId: string): Promise<void> => {
    try {
      await setActive({ session: sessionId });
      handleClose();
    } catch (error) {
      console.error('Failed to switch session:', error);
    }
  };

  const handleAddAccount = (): void => {
    client?.signIn.create({});
    handleClose();
  };

  const open = Boolean(anchorEl);
  const sessions = client?.sessions || [];
  const currentSessionId = client?.session?.id;

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
          {sessions.length > 1 && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                  Switch Account
                </Typography>
              </Box>
              {sessions.map((session) => {
                const isCurrentSession = session.id === currentSessionId;
                const sessionUser = session.user;
                const sessionEmail =
                  sessionUser?.primaryEmailAddress?.emailAddress ||
                  sessionUser?.emailAddresses?.[0]?.emailAddress ||
                  'Unknown';

                return (
                  <ListItem key={session.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSwitchSession(session.id)}
                      disabled={isCurrentSession}
                      sx={{
                        px: 2,
                        backgroundColor: isCurrentSession
                          ? theme.palette.action.selected
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: isCurrentSession
                            ? theme.palette.action.selected
                            : theme.palette.action.hover,
                        },
                      }}>
                      <Avatar
                        src={sessionUser?.imageUrl}
                        alt={sessionUser?.firstName || 'User'}
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1.5,
                        }}
                      />
                      <ListItemText
                        primary={sessionEmail}
                        primaryTypographyProps={{
                          sx: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                      {isCurrentSession && (
                        <CheckCircleIcon
                          fontSize="small"
                          sx={{ color: theme.palette.primary.main, ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
              <Divider sx={{ my: 1 }} />
            </>
          )}

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleAddAccount}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <PersonAddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add another account" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleManageAccount}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Manage account" />
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
