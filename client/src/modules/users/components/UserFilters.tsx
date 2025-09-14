import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Chip,
  useTheme,
} from '@mui/material';
import { useUserManagementStore } from '../stores/userManagementStore';
import { User } from '../types/user';
import { ROLES } from '../../../common/constants/roles';
import useUserRoles from '../../../common/hooks/useUserRoles';

interface UserFiltersProps {
  users: User[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const UserFilters: React.FC<UserFiltersProps> = ({ users }) => {
  const theme = useTheme();
  const { filters, updateFilters, clearFilters } = useUserManagementStore();
  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const availableOptions = useMemo(() => {
    const tenants = Array.from(new Set(users.map(u => u.tenant?.name).filter(Boolean)))
      .sort();
    const roles = Array.from(new Set(users.flatMap(u => u.roles?.map(r => r.name) || [])))
      .sort();
    
    return { tenants, roles };
  }, [users]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ email: event.target.value });
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ name: event.target.value });
  };

  const handleTenantChange = (event: SelectChangeEvent) => {
    updateFilters({ tenant: event.target.value });
  };

  const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateFilters({ roles: typeof value === 'string' ? value.split(',') : value });
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    updateFilters({ status: event.target.value as 'all' | 'active' | 'inactive' });
  };

  const handleDateFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ dateFrom: event.target.value });
  };

  const handleDateToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ dateTo: event.target.value });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== '' && value !== 'all'
  );

  return (
    <Card 
      sx={{ 
        mb: 2,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                value={filters.email}
                onChange={handleEmailChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={filters.name}
                onChange={handleNameChange}
                variant="outlined"
              />
            </Grid>

            {isSuperAdmin && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={filters.tenant}
                    onChange={handleTenantChange}
                    input={<OutlinedInput label="Tenant" />}
                  >
                    <MenuItem value="">All</MenuItem>
                    {availableOptions.tenants.map((tenant) => (
                      <MenuItem key={tenant} value={tenant}>
                        {tenant}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={filters.roles}
                  onChange={handleRolesChange}
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {availableOptions.roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleStatusChange}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Created From"
                type="date"
                value={filters.dateFrom}
                onChange={handleDateFromChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Created To"
                type="date"
                value={filters.dateTo}
                onChange={handleDateToChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                sx={{ height: '40px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
      </CardContent>
    </Card>
  );
};

export default UserFilters;