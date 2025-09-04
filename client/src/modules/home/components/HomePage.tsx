import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Container,
  Grid,
  Typography,
  Paper,
  Stack,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Group as UsersIcon,
  Business as TenantsIcon,
  Receipt as InvoiceIcon,
  VpnKey as SecretsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { useUser } from '@clerk/clerk-react';
import InvoiceFileUpload from '../../invoices/components/InvoiceFileUpload';

type QuickActionCard = {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
  roles?: string[];
};

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userRoles = useUserRoles();
  const { user } = useUser();

  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);
  const isAdmin = userRoles.includes(ROLES.ADMIN);

  const quickActions: QuickActionCard[] = [
    {
      title: 'Invoice Management',
      description: 'Process and analyze invoices with AI',
      icon: <InvoiceIcon fontSize="large" />,
      path: '/invoice-management',
      color: theme.palette.primary.main,
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      title: 'Tenant Management',
      description: 'Manage tenants and organizations',
      icon: <TenantsIcon fontSize="large" />,
      path: '/tenant-management',
      color: theme.palette.secondary.main,
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <UsersIcon fontSize="large" />,
      path: '/user-management',
      color: theme.palette.info.main,
      roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
    {
      title: 'Secrets Management',
      description: 'Manage API keys and secrets',
      icon: <SecretsIcon fontSize="large" />,
      path: '/secrets',
      color: theme.palette.warning.main,
      roles: [ROLES.ADMIN],
    },
  ];

  const filteredQuickActions = quickActions.filter((action) => {
    if (!action.roles) return true;
    return action.roles.some((role) => userRoles.includes(role));
  });

  const userGreeting = user?.firstName ? `Welcome back, ${user.firstName}!` : 'Welcome back!';
  
  const getRoleDisplay = () => {
    if (isSuperAdmin) return 'Super Administrator';
    if (isAdmin) return 'Administrator';
    return 'User';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        mb: 6, 
        textAlign: 'center',
        pt: 4 
      }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          {userGreeting}
        </Typography>
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <AdminIcon color="action" />
          <Typography variant="h6" color="text.secondary">
            {getRoleDisplay()}
          </Typography>
        </Stack>
      </Box>

      {filteredQuickActions.length > 0 && (
        <>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              Quick Actions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access your available features
            </Typography>
          </Box>

          <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            {filteredQuickActions.map((action) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={action.path}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                      borderColor: action.color,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(action.path)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          margin: '0 auto',
                          mb: 2,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(action.color, 0.1),
                          color: action.color,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight="medium">
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {!isSuperAdmin && !isAdmin && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 6 
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              maxWidth: 500,
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <InvoiceIcon sx={{ fontSize: 72, color: 'primary.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom fontWeight="medium">
              Invoice Processing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Upload your invoices for AI-powered analysis and insights
            </Typography>
            <InvoiceFileUpload variant="contained" />
          </Paper>
        </Box>
      )}

      {isSuperAdmin && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 6 
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
            }}
          >
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={2} 
              mb={3}
              justifyContent="center"
            >
              <SecurityIcon color="info" fontSize="large" />
              <Typography variant="h5" fontWeight="medium">
                Administrator Tools
              </Typography>
            </Stack>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              gutterBottom
              textAlign="center"
              sx={{ mb: 3 }}
            >
              As a Super Administrator, you have full access to all system features and settings.
            </Typography>
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center"
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/tenant-management')}
              >
                Manage Tenants
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/invoice-management')}
              >
                Process Invoices
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;