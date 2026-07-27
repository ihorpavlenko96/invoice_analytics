import React, { useMemo } from 'react';
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputLabel,
  FormHelperText,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Role } from '../../users/types/user';
import { ROLES } from '../../../common/constants/roles';

type RoleSelectorProps = {
  allRoles: Role[];
  value: string[];
  onChange: (roleIds: string[]) => void;
  isSuperAdmin: boolean;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
};

const RoleSelector: React.FC<RoleSelectorProps> = ({
  allRoles,
  value,
  onChange,
  isSuperAdmin,
  loading = false,
  disabled = false,
  error = false,
  helperText,
}) => {
  const theme = useTheme();

  const superAdminRole = useMemo(
    () => allRoles.find((r) => r.name === ROLES.SUPER_ADMIN),
    [allRoles],
  );

  const availableRoles: Role[] = allRoles.filter((role: Role) => {
    if (isSuperAdmin) return true;

    return role.name !== ROLES.SUPER_ADMIN;
  });

  const isSuperAdminSelected = value.includes(superAdminRole?.id ?? '');
  const isOtherRoleSelected = value.some((id) => id !== superAdminRole?.id);

  const handleToggle = (roleId: string, checked: boolean) => {
    if (roleId === superAdminRole?.id) {
      onChange(checked ? [roleId] : []);

      return;
    }

    onChange(
      checked
        ? [...value.filter((id) => id !== superAdminRole?.id), roleId]
        : value.filter((id) => id !== roleId),
    );
  };

  return (
    <FormControl
      component="fieldset"
      variant="standard"
      required
      error={error}
      disabled={loading || disabled}
      sx={{
        width: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
        mt: 1,
      }}>
      <InputLabel
        shrink
        htmlFor="roles-group-label"
        sx={{
          position: 'relative',
          transform: 'none',
          mb: 1,
          fontWeight: 'medium',
        }}>
        Roles
      </InputLabel>
      <FormGroup id="roles-group-label" sx={{ pl: 1 }}>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          availableRoles.map((role) => {
            const isThisSuperAdmin = role.id === superAdminRole?.id;

            const isDisabled =
              (isThisSuperAdmin && isOtherRoleSelected) ||
              (!isThisSuperAdmin && isSuperAdminSelected);

            return (
              <FormControlLabel
                key={role.id}
                control={
                  <Checkbox
                    checked={value.includes(role.id)}
                    disabled={isDisabled || loading || disabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleToggle(role.id, e.target.checked);
                    }}
                  />
                }
                label={role.name}
                disabled={isDisabled || loading || disabled}
              />
            );
          })
        )}
      </FormGroup>
      {error && helperText && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RoleSelector;
