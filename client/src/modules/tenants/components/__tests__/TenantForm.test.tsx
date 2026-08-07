/**
 * Integration tests for TenantForm.
 *
 * Strategy:
 * - axios is mocked at the module level so no real HTTP calls are made.
 * - The form is rendered inside the full provider tree via renderWithProviders.
 * - userEvent is used for realistic interactions (typing, clicking).
 *
 * Test coverage:
 *   Happy path
 *     ✓ renders empty fields in create mode
 *     ✓ renders pre-filled fields in edit mode (alias disabled)
 *     ✓ calls createTenant and closes dialog on successful create
 *     ✓ calls updateTenant and closes dialog on successful update
 *   Validation
 *     ✓ shows error when name is empty
 *     ✓ shows error when alias is empty
 *     ✓ shows error when alias contains uppercase letters
 *     ✓ shows error when alias has leading/trailing hyphens
 *   Error handling
 *     ✓ shows error snackbar when API call fails
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import { renderWithProviders } from '../../../../test/test-utils';
import TenantForm from '../TenantForm';
import { Tenant } from '../../types/tenant';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Mock axios so mutations do not issue real HTTP requests.
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXISTING_TENANT: Tenant = {
  id: 'tenant-123',
  name: 'Acme Corp',
  alias: 'acme-corp',
};

function renderForm(props: Partial<React.ComponentProps<typeof TenantForm>> = {}) {
  const onClose = jest.fn();
  const result = renderWithProviders(
    <TenantForm tenant={null} onClose={onClose} {...props} />,
  );
  return { ...result, onClose };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TenantForm', () => {
  // Reset axios mocks between tests so they don't bleed into each other.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Happy path — rendering
  // -------------------------------------------------------------------------

  describe('create mode (no tenant prop)', () => {
    it('renders both fields empty', () => {
      renderForm();

      const nameInput = screen.getByRole('textbox', { name: /tenant name/i });
      const aliasInput = screen.getByRole('textbox', { name: /tenant alias/i });

      expect(nameInput).toHaveValue('');
      expect(aliasInput).toHaveValue('');
    });

    it('shows "Create Tenant" on the submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /create tenant/i })).toBeInTheDocument();
    });

    it('alias field is enabled in create mode', () => {
      renderForm();
      expect(screen.getByRole('textbox', { name: /tenant alias/i })).not.toBeDisabled();
    });
  });

  describe('edit mode (tenant prop provided)', () => {
    it('pre-fills name and alias from the existing tenant', () => {
      renderForm({ tenant: EXISTING_TENANT });

      expect(screen.getByRole('textbox', { name: /tenant name/i })).toHaveValue('Acme Corp');
      expect(screen.getByRole('textbox', { name: /tenant alias/i })).toHaveValue('acme-corp');
    });

    it('shows "Update Tenant" on the submit button', () => {
      renderForm({ tenant: EXISTING_TENANT });
      expect(screen.getByRole('button', { name: /update tenant/i })).toBeInTheDocument();
    });

    it('alias field is disabled in edit mode', () => {
      renderForm({ tenant: EXISTING_TENANT });
      expect(screen.getByRole('textbox', { name: /tenant alias/i })).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Happy path — successful mutations
  // -------------------------------------------------------------------------

  describe('successful create', () => {
    it('calls POST /tenants and invokes onClose', async () => {
      const user = userEvent.setup();
      const createdTenant: Tenant = { id: 'new-id', name: 'New Co', alias: 'new-co' };
      mockedAxios.post.mockResolvedValueOnce({ data: createdTenant });

      const { onClose } = renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'New Co');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'new-co');
      await user.click(screen.getByRole('button', { name: /create tenant/i }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/tenants', {
          name: 'New Co',
          alias: 'new-co',
        });
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('successful update', () => {
    it('calls PATCH /tenants/:id and invokes onClose', async () => {
      const user = userEvent.setup();
      const updatedTenant: Tenant = { ...EXISTING_TENANT, name: 'Acme Updated' };
      mockedAxios.patch.mockResolvedValueOnce({ data: updatedTenant });

      const { onClose } = renderForm({ tenant: EXISTING_TENANT });

      // Clear existing name and type the updated value
      const nameInput = screen.getByRole('textbox', { name: /tenant name/i });
      await user.clear(nameInput);
      await user.type(nameInput, 'Acme Updated');
      await user.click(screen.getByRole('button', { name: /update tenant/i }));

      await waitFor(() => {
        expect(mockedAxios.patch).toHaveBeenCalledWith(`/tenants/${EXISTING_TENANT.id}`, {
          name: 'Acme Updated',
        });
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------

  describe('validation', () => {
    it('shows required error when name is submitted empty', async () => {
      const user = userEvent.setup();
      renderForm();

      // Submit without filling anything in
      await user.click(screen.getByRole('button', { name: /create tenant/i }));

      await waitFor(() => {
        // Yup fires "Required" for both fields; assert at least the name one
        const errors = screen.getAllByText('Required');
        expect(errors.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows required error when alias is submitted empty', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Valid Name');
      await user.click(screen.getByRole('button', { name: /create tenant/i }));

      await waitFor(() => {
        expect(screen.getByText('Required')).toBeInTheDocument();
      });
    });

    it('shows error when alias contains uppercase letters', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Valid Name');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'MyAlias');

      // Trigger validation by moving focus away (blur)
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/alias must be lowercase alphanumeric with hyphens/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when alias has a trailing hyphen', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Valid Name');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'invalid-');

      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/alias must be lowercase alphanumeric with hyphens/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when alias has a leading hyphen', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Valid Name');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), '-invalid');

      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/alias must be lowercase alphanumeric with hyphens/i),
        ).toBeInTheDocument();
      });
    });

    it('does not show errors for a valid alias', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'valid-alias-123');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText(/alias must be lowercase alphanumeric with hyphens/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  describe('API error handling', () => {
    it('shows an error snackbar when createTenant API call fails', async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'New Co');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'new-co');
      await user.click(screen.getByRole('button', { name: /create tenant/i }));

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    it('shows fallback error message when API error has no message', async () => {
      const user = userEvent.setup();
      // Reject with an error that has no human-readable message
      mockedAxios.post.mockRejectedValueOnce(new Error(''));

      renderForm();

      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Co');
      // name "Co" is too short — use longer one to avoid validation blocking submit
      await user.clear(screen.getByRole('textbox', { name: /tenant name/i }));
      await user.type(screen.getByRole('textbox', { name: /tenant name/i }), 'Valid Corp');
      await user.type(screen.getByRole('textbox', { name: /tenant alias/i }), 'valid-corp');
      await user.click(screen.getByRole('button', { name: /create tenant/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create tenant/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Cancel button
  // -------------------------------------------------------------------------

  describe('cancel button', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderForm();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
