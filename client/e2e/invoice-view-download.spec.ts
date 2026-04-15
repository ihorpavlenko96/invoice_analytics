/**
 * E2E Tests — Invoice View and Download Flow
 *
 * Task: IA-406
 * Route under test: /invoice-management
 * Components: InvoiceManagementPage > InvoiceTable > InvoiceDetails
 *
 * Auth strategy:
 *   Clerk is mocked via page.addInitScript so no real authentication occurs.
 *   The injected stub satisfies both <SignedIn>/<SignedOut> gates (App.tsx) and
 *   ProtectedRoute + InvoiceManagementPage role checks.
 *
 * API strategy:
 *   All HTTP calls from React Query (axios) are intercepted with page.route so
 *   the real backend is never contacted.
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mock data — mirrors client/src/modules/invoices/types/invoice.ts
// ---------------------------------------------------------------------------

const MOCK_INVOICE = {
  id: 'inv-001',
  invoiceNumber: 'INV-2024-001',
  issueDate: '2024-01-15',
  dueDate: '2024-02-15',
  vendorName: 'Acme Corp',
  vendorAddress: '123 Main St\nSpringfield, IL 62701',
  vendorPhone: '+1-555-100-2000',
  vendorEmail: 'billing@acme.com',
  customerName: 'Globex Inc',
  customerAddress: '456 Oak Ave\nShelbyville, IL 62565',
  customerPhone: '+1-555-300-4000',
  customerEmail: 'accounts@globex.com',
  subtotal: 1000.0,
  discount: 0,
  taxRate: 0.1,
  taxAmount: 100.0,
  totalAmount: 1100.0,
  currency: 'USD',
  daysOverdue: 0,
  status: 'UNPAID',
  terms: 'Net 30',
  items: [
    {
      id: 'item-001',
      lineNumber: 1,
      description: 'Consulting Services',
      quantity: 10,
      unitPrice: 100.0,
      amount: 1000.0,
    },
  ],
  isArchived: false,
};

const MOCK_PAGINATED_RESPONSE = {
  items: [MOCK_INVOICE],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const EMPTY_PAGINATED_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Injects a Clerk stub into the page so that:
 *  - <SignedIn> renders its children
 *  - <SignedOut> renders nothing
 *  - useAuth() returns { isSignedIn: true, isLoaded: true }
 *  - useUser() returns a user with the given roles in publicMetadata
 *  - ProtectedRoute and InvoiceManagementPage role guards pass for 'Super Admin'
 */
async function mockClerkAuth(page: Page, roles: string[] = ['Super Admin']): Promise<void> {
  await page.addInitScript((userRoles: string[]) => {
    // Build a minimal Clerk user object that satisfies all Clerk React hooks
    const mockUser = {
      id: 'user_mock_001',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      publicMetadata: { roles: userRoles },
    };

    const mockSession = {
      id: 'sess_mock_001',
      status: 'active',
      user: mockUser,
    };

    // Expose on window so Clerk's internal bootstrap picks it up
    (window as Record<string, unknown>).__clerk_mock_user = mockUser;
    (window as Record<string, unknown>).__clerk_mock_session = mockSession;

    // Override the module-level Clerk object that the React SDK reads
    (window as Record<string, unknown>).Clerk = {
      isReady: () => true,
      session: mockSession,
      user: mockUser,
      client: { sessions: [mockSession] },
      addListener: (_cb: unknown) => () => {},
      load: () => Promise.resolve(),
      // Minimal publishable-key stub
      frontendApi: 'mock.clerk.accounts.dev',
    };

    /**
     * Patch React module resolution so @clerk/clerk-react hooks
     * return our mock values synchronously.
     *
     * This works when Vite bundles the app in dev mode and exposes
     * modules on __vite_ssr_exports__ or window.__modules__.
     * For production builds use the route-intercept approach instead.
     */
    const originalDefineProperty = Object.defineProperty.bind(Object);
    (window as Record<string, unknown>).__patchClerk = () => {
      // Attempt to patch the module registry if Vite exposes it
      const registry = (window as Record<string, unknown>).__vite_plugin_react_preamble_installed__;
      if (registry) {
        // Nothing to do here — Vite dev mode reuses the live module graph
      }
    };
  }, roles);

  /**
   * Intercept the Clerk React SDK bundle and replace it with a lightweight
   * stub that exports mocked hooks and components.  This is the most reliable
   * approach when the page uses ESM imports.
   */
  await page.route('**/@clerk/clerk-react**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        import React from 'react';

        const mockUser = {
          id: 'user_mock_001',
          firstName: 'Test',
          lastName: 'User',
          publicMetadata: { roles: ${JSON.stringify(roles)} },
        };

        export const useAuth = () => ({
          isSignedIn: true,
          isLoaded: true,
          userId: 'user_mock_001',
          sessionId: 'sess_mock_001',
          getToken: async () => 'mock_token',
        });

        export const useUser = () => ({
          isLoaded: true,
          isSignedIn: true,
          user: mockUser,
        });

        export const useClerk = () => ({
          signOut: async () => {},
        });

        export const SignedIn = ({ children }) => children ?? null;
        export const SignedOut = () => null;
        export const ClerkProvider = ({ children }) => children ?? null;
        export const UserButton = () => null;
        export const SignIn = () => null;
        export const SignUp = () => null;
      `,
    });
  });
}

/**
 * Intercepts the two invoice API endpoints used by the page.
 * axios base URL is relative so the path is just /invoices.
 */
async function mockInvoiceApis(
  page: Page,
  options: {
    listResponse?: typeof MOCK_PAGINATED_RESPONSE | typeof EMPTY_PAGINATED_RESPONSE;
    detailResponse?: typeof MOCK_INVOICE;
  } = {},
): Promise<void> {
  const { listResponse = MOCK_PAGINATED_RESPONSE, detailResponse = MOCK_INVOICE } = options;

  // GET /invoices — paginated list
  await page.route('**/invoices?**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(listResponse),
    });
  });

  // Fallback for /invoices without query string
  await page.route('**/invoices', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(listResponse),
      });
    } else {
      route.continue();
    }
  });

  // GET /invoices/:id — single invoice detail
  await page.route(`**/invoices/${MOCK_INVOICE.id}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(detailResponse),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Navigates to the invoice management page and waits for the table to appear.
 */
async function goToInvoicePage(page: Page): Promise<void> {
  await page.goto('/invoice-management');
  // Wait for the invoice table to be rendered
  await page.waitForSelector('table[aria-label="invoice table"]', { timeout: 15_000 });
}

/**
 * Clicks the View Details button for the first invoice row.
 * The button uses stopPropagation, so we must click the icon button directly.
 */
async function clickViewButton(page: Page): Promise<void> {
  // The Tooltip wrapping the view button has title="View Details"
  // MUI renders this as an aria-label on the wrapped button.
  const viewBtn = page.locator('[aria-label="View Details"]').first();
  await viewBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await viewBtn.click();
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

test.describe('Invoice View and Download Flow', () => {
  // -------------------------------------------------------------------------
  // Test 1 — Invoice list is displayed
  // -------------------------------------------------------------------------
  test('should display the invoice list on the management page', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page);

    await page.goto('/invoice-management');

    // Table must be present
    const table = page.locator('table[aria-label="invoice table"]');
    await expect(table).toBeVisible({ timeout: 15_000 });

    // Invoice number is rendered in the table
    await expect(page.getByText('INV-2024-001')).toBeVisible();

    // Vendor name is rendered
    await expect(page.getByText('Acme Corp')).toBeVisible();

    // Status chip "Unpaid" is rendered (MUI Chip label text)
    await expect(page.locator('.MuiChip-label', { hasText: 'Unpaid' }).first()).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 2 — Clicking View opens Invoice Details
  // -------------------------------------------------------------------------
  test('should navigate to invoice details when View button is clicked', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page);

    await goToInvoicePage(page);
    await clickViewButton(page);

    // Details heading should include the invoice number
    const heading = page.getByRole('heading', { name: /Invoice #INV-2024-001/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Status chip should be shown in the details header
    await expect(page.locator('.MuiChip-label', { hasText: 'Unpaid' }).first()).toBeVisible();

    // Download button is present
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();

    // Print button is present
    await expect(page.getByRole('button', { name: /print/i })).toBeVisible();

    // Back button (icon button before the heading)
    // The back IconButton has aria-label inferred from its icon; we use its position
    const backBtn = page
      .locator('button')
      .filter({ has: page.locator('[data-testid="KeyboardBackspaceIcon"]') })
      .first();
    await expect(backBtn).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 3 — Download button triggers placeholder alert
  // -------------------------------------------------------------------------
  test('should show a placeholder alert when the Download button is clicked', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page);

    await goToInvoicePage(page);
    await clickViewButton(page);

    // Wait for the Download button to be rendered in the details view
    const downloadBtn = page.getByRole('button', { name: /download/i });
    await expect(downloadBtn).toBeVisible({ timeout: 10_000 });

    // Capture the alert dialog message before clicking
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await downloadBtn.click();

    // Give the event loop a tick to process the dialog handler
    await page.waitForTimeout(500);

    // Assert the alert text matches the placeholder message in InvoiceDetails.tsx
    expect(dialogMessage).toBe('PDF generation would happen here in a real app');

    // The details view should still be visible after dismissing the alert
    await expect(page.getByRole('heading', { name: /Invoice #INV-2024-001/i })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 4 — Back button returns to invoice list
  // -------------------------------------------------------------------------
  test('should return to the invoice list when Back button is clicked', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page);

    await goToInvoicePage(page);
    await clickViewButton(page);

    // Verify we are on the details page
    const heading = page.getByRole('heading', { name: /Invoice #INV-2024-001/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Click the Back icon button.
    // It is the first icon button in the details header — look for the one that
    // contains the KeyboardBackspace (back arrow) icon.
    const backBtn = page
      .locator('button')
      .filter({ has: page.locator('[data-testid="KeyboardBackspaceIcon"]') })
      .first();
    await backBtn.click();

    // Details heading is gone
    await expect(heading).not.toBeVisible({ timeout: 10_000 });

    // Invoice table is back
    const table = page.locator('table[aria-label="invoice table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Invoice number still appears in the list
    await expect(page.getByText('INV-2024-001')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 5 — Invoice Details: Line Items tab is active by default
  // -------------------------------------------------------------------------
  test('should display line items in the details view', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page);

    await goToInvoicePage(page);
    await clickViewButton(page);

    // "Line Items" tab is selected by default (tabIndex 0 is active)
    const lineItemsTab = page.getByRole('tab', { name: 'Line Items' });
    await expect(lineItemsTab).toBeVisible({ timeout: 10_000 });
    await expect(lineItemsTab).toHaveAttribute('aria-selected', 'true');

    // Line item data from MOCK_INVOICE.items[0]
    await expect(page.getByText('Consulting Services')).toBeVisible();
    await expect(page.getByText('10')).toBeVisible();

    // unitPrice formatted by Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    await expect(page.getByText('$100.00')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 6 — Negative: Empty invoice list shows "No invoices found."
  // -------------------------------------------------------------------------
  test('should display "No invoices found." when the list is empty', async ({ page }) => {
    await mockClerkAuth(page, ['Super Admin']);
    await mockInvoiceApis(page, { listResponse: EMPTY_PAGINATED_RESPONSE });

    await page.goto('/invoice-management');

    // Wait for the table to render with the empty-state row
    const table = page.locator('table[aria-label="invoice table"]');
    await expect(table).toBeVisible({ timeout: 15_000 });

    // Empty state text from InvoiceTable.tsx
    await expect(page.getByText('No invoices found.')).toBeVisible({ timeout: 10_000 });

    // No invoice number cells should be present
    await expect(page.getByText('INV-2024-001')).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 7 — Negative: Access denied for non-Super Admin user
  // -------------------------------------------------------------------------
  test('should show Access Denied for a user without Super Admin role', async ({ page }) => {
    // Mock as Admin only — not 'Super Admin'
    await mockClerkAuth(page, ['Admin']);
    await mockInvoiceApis(page);

    await page.goto('/invoice-management');

    // InvoiceManagementPage renders "Access Denied" when isSuperAdmin is false,
    // or ProtectedRoute redirects to '/'.
    const accessDenied = page.getByRole('heading', { name: /access denied/i });
    const redirectedToHome = page.url();

    try {
      await expect(accessDenied).toBeVisible({ timeout: 10_000 });
    } catch {
      // Fallback: ProtectedRoute may have redirected to '/'
      expect(redirectedToHome).toMatch(/\/$/);
    }
  });
});
