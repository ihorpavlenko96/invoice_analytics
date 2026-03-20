# Playwright E2E Test Generation Prompt — Invoice View & Download Flow

## Task

Generate a complete, runnable Playwright E2E test file at:

```
client/e2e/invoice-view-download.spec.ts
```

This file must test the **Invoice View and Download** user flow in a React 19 + TypeScript
frontend application. The test suite must be automatable without any manual intervention (no
real login, no real backend).

---

## Project Context

### Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, React Router v7 (`BrowserRouter`)
- **Auth:** Clerk (`@clerk/clerk-react` v5) — JWT-based, no real auth in tests
- **State:** React Query (`@tanstack/react-query` v5) for server state
- **UI:** Material UI v7 (`@mui/material`) + MUI Icons
- **Testing:** Playwright (new — no existing config yet)
- **Dev server:** `http://localhost:3000`

### Project Structure (relevant paths)

```
client/
  src/
    App.tsx                                         # Uses <SignedIn>/<SignedOut> Clerk gates
    routes/AppRoutes.tsx                            # BrowserRouter + protected routes
    common/
      constants/roles.ts                           # ROLES.SUPER_ADMIN = 'Super Admin'
      hooks/useUserRoles.ts                        # reads user.publicMetadata.roles[]
      components/ProtectedRoute.tsx                # redirects to '/' if not signed in or missing role
    modules/
      invoices/
        types/invoice.ts                           # Invoice + InvoiceItem interfaces (see below)
        services/invoiceService.ts                 # axios calls to /invoices and /invoices/:id
        invoiceQueries.ts                          # useInvoices + useInvoice React Query hooks
        invoiceQueryKeys.ts                        # invoiceKeys query key factory
        invoiceMutations.ts                        # useDeleteInvoice, useDeleteMultipleInvoices, etc.
        components/
          InvoiceManagementPage.tsx                # Main page — route: /invoice-management
          InvoiceTable.tsx                         # Table with View (eye icon) and Delete buttons
          InvoiceDetails.tsx                       # Details view with Download button
          ChatDrawer.tsx                           # AI assistant drawer
          ThemeToggle.tsx
          UnifiedSearchBar.tsx
  e2e/
    invoice-view-download.spec.ts                  # <-- file to generate
```

### Route

The Invoice Management page is served at:

```
/invoice-management
```

It is protected by `ProtectedRoute` requiring the `'Super Admin'` role
(`ROLES.SUPER_ADMIN = 'Super Admin'`).

---

## TypeScript Types

```typescript
// client/src/modules/invoices/types/invoice.ts

export interface InvoiceItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;       // YYYY-MM-DD
  dueDate: string;         // YYYY-MM-DD
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  daysOverdue: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  terms?: string;
  items: InvoiceItem[];
  isArchived: boolean;
}
```

---

## API Endpoints (to mock)

| Method | Path                | Used by                 | Returns                        |
|--------|---------------------|-------------------------|--------------------------------|
| GET    | `/invoices`         | `useInvoices` hook      | `PaginatedResponseDto<Invoice>`|
| GET    | `/invoices/:id`     | `useInvoice` hook       | `Invoice`                      |

### `PaginatedResponseDto<Invoice>` shape

```json
{
  "items": [ /* Invoice[] */ ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## Mock Data

Use the following fixture objects in the test file:

```typescript
const MOCK_INVOICE: Invoice = {
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
  subtotal: 1000.00,
  discount: 0,
  taxRate: 0.1,
  taxAmount: 100.00,
  totalAmount: 1100.00,
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
      unitPrice: 100.00,
      amount: 1000.00,
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
```

---

## Auth Mocking Strategy

Clerk auth **must not** be real. Mock it with `page.addInitScript` to inject
`window.__clerk_mock` and intercept Clerk's internal state so that:

- `useAuth()` returns `{ isSignedIn: true }`
- `useUser()` returns a user with `publicMetadata.roles = ['Super Admin']`
- `<SignedIn>` renders its children
- `<SignedOut>` renders nothing

The recommended approach is to add a Playwright global setup file that calls
`page.addInitScript` before each test, injecting a script that stubs the Clerk
singleton. For example:

```typescript
await page.addInitScript(() => {
  // Stub window.__clerk so Clerk hooks resolve synchronously
  (window as any).__clerk_frontend_api = 'mock';
  (window as any).Clerk = {
    session: { id: 'sess_mock', status: 'active' },
    user: {
      id: 'user_mock',
      publicMetadata: { roles: ['Super Admin'] },
      firstName: 'Test',
      lastName: 'User',
    },
    isReady: () => true,
    addListener: () => () => {},
    load: () => Promise.resolve(),
  };
});
```

If Clerk still renders `<SignedOut>` after the script above, fall back to
**intercepting the Clerk JS bundle** via `page.route('**/clerk.browser.js*', ...)`
and replacing it with a minimal stub that exports mocked hooks:

```typescript
await page.route('**/@clerk/**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `
      export const useAuth = () => ({ isSignedIn: true, isLoaded: true });
      export const useUser = () => ({
        isLoaded: true,
        user: { id: 'user_mock', publicMetadata: { roles: ['Super Admin'] } },
      });
      export const SignedIn = ({ children }) => children;
      export const SignedOut = () => null;
      export const ClerkProvider = ({ children }) => children;
    `,
  })
);
```

---

## Playwright Setup Instructions

### 1. Install dependencies

```bash
cd client
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 2. Create `client/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the Vite dev server before running tests
  webServer: {
    command: 'npm run dev -- --mode test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### 3. Add a test script to `client/package.json`

```json
"test:e2e": "playwright test"
```

### 4. Run tests

```bash
cd client
npm run test:e2e
```

---

## Test Cases to Generate

Generate **all** of the following test cases inside a single `test.describe` block
named `'Invoice View and Download Flow'`.

Each test must use `page.route` to intercept the following HTTP calls made by
React Query (axios base URL is relative, so routes match `**/invoices**`):

- `GET /invoices` → respond with `MOCK_PAGINATED_RESPONSE`
- `GET /invoices/inv-001` → respond with `MOCK_INVOICE`

---

### Test 1 — Happy Path: Invoice list is displayed

**Name:** `'should display the invoice list on the management page'`

**Steps:**
1. Mock auth (Super Admin).
2. Mock `GET /invoices` → `MOCK_PAGINATED_RESPONSE`.
3. Navigate to `/invoice-management`.
4. Assert:
   - The table is visible (look for `aria-label="invoice table"` on the `<table>` element).
   - The invoice number `'INV-2024-001'` appears in the table.
   - The vendor name `'Acme Corp'` appears in the table.
   - The status chip `'Unpaid'` appears in the table.

---

### Test 2 — Happy Path: Clicking View opens Invoice Details

**Name:** `'should navigate to invoice details when View button is clicked'`

**Steps:**
1. Mock auth (Super Admin).
2. Mock `GET /invoices` → `MOCK_PAGINATED_RESPONSE`.
3. Mock `GET /invoices/inv-001` → `MOCK_INVOICE`.
4. Navigate to `/invoice-management`.
5. Find the **View Details** icon button for the first row.
   - The tooltip title is `'View Details'`; the button wraps `<ViewIcon />` (Visibility icon).
   - Selector hint: `[data-testid="view-invoice-btn"]` if you add test IDs, otherwise use
     `page.getByRole('button', { name: /view details/i })` or
     `page.locator('button[aria-label="View Details"]')`.
   - **Important:** The View button has `e.stopPropagation()` so clicking the row itself
     selects it (checkbox), not opens details. Click the icon button directly.
6. Click the View button.
7. Assert:
   - The details view heading `'Invoice #INV-2024-001'` is visible (h5 element).
   - The status chip `'Unpaid'` is visible in the details header.
   - The **Download** button is visible (`button` containing text `'Download'`).
   - The **Print** button is visible (`button` containing text `'Print'`).
   - The **Back** icon button is visible (BackIcon / KeyboardBackspace).

---

### Test 3 — Happy Path: Download button triggers placeholder alert

**Name:** `'should show a placeholder alert when the Download button is clicked'`

**Steps:**
1. Mock auth (Super Admin).
2. Mock `GET /invoices` → `MOCK_PAGINATED_RESPONSE`.
3. Mock `GET /invoices/inv-001` → `MOCK_INVOICE`.
4. Navigate to `/invoice-management`.
5. Click the View button for the first invoice row to open details.
6. Listen for the browser `dialog` event and auto-accept it:
   ```typescript
   page.once('dialog', dialog => dialog.accept());
   ```
7. Click the **Download** button.
8. Assert:
   - The dialog was triggered (capture the dialog message and assert it equals
     `'PDF generation would happen here in a real app'`).
   - After dismissing, the details view is still visible (assert heading still present).

---

### Test 4 — Happy Path: Back button returns to invoice list

**Name:** `'should return to the invoice list when Back button is clicked'`

**Steps:**
1. Mock auth (Super Admin).
2. Mock `GET /invoices` → `MOCK_PAGINATED_RESPONSE`.
3. Mock `GET /invoices/inv-001` → `MOCK_INVOICE`.
4. Navigate to `/invoice-management`.
5. Click the View button to open details.
6. Click the Back button (IconButton with `<BackIcon />`; locate via
   `page.getByRole('button', { name: /back/i })` or by its position as the first
   icon button before the invoice heading).
7. Assert:
   - The invoice details heading is **no longer** visible.
   - The invoice table is visible again (`aria-label="invoice table"`).
   - The invoice number `'INV-2024-001'` appears again in the table.

---

### Test 5 — Invoice Details: Line Items tab is active by default

**Name:** `'should display line items in the details view'`

**Steps:**
1. Mock auth and both API endpoints.
2. Navigate to details (view the first invoice).
3. Assert:
   - The tab `'Line Items'` is selected (active).
   - The description `'Consulting Services'` appears in the line items table.
   - The quantity `'10'` appears.
   - The unit price `'$100.00'` appears (formatted by `Intl.NumberFormat`).

---

### Test 6 — Negative: Empty invoice list shows "No invoices found"

**Name:** `'should display "No invoices found." when the list is empty'`

**Steps:**
1. Mock auth (Super Admin).
2. Mock `GET /invoices` → empty paginated response:
   ```json
   { "items": [], "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
   ```
3. Navigate to `/invoice-management`.
4. Assert:
   - The text `'No invoices found.'` is visible in the table body.
   - No invoice rows with real data are present.

---

### Test 7 — Negative: Access denied for non-Super Admin user

**Name:** `'should show Access Denied for a user without Super Admin role'`

**Steps:**
1. Mock auth with a user who has roles `['Admin']` (not `'Super Admin'`).
   - The `InvoiceManagementPage` checks
     `user?.publicMetadata?.roles.includes('Super Admin')` directly.
   - `ProtectedRoute` also checks `useUserRoles()` which reads the same field.
2. Mock `GET /invoices` (optional — the page may redirect before fetching).
3. Navigate to `/invoice-management`.
4. Assert:
   - Either the text `'Access Denied'` is visible (rendered by `InvoiceManagementPage`),
   - OR the user is redirected to `'/'` (assert `page.url()` ends with `'/'`).

---

## Selector Reference

These are the key selectors derived from the current component source:

| Element                        | Suggested Selector                                                        |
|-------------------------------|---------------------------------------------------------------------------|
| Invoice table                  | `table[aria-label="invoice table"]`                                       |
| View Details icon button       | `[title="View Details"]` tooltip or `button` near `VisibilityIcon`        |
| Delete icon button             | `[title="Delete Invoice"]`                                                |
| Invoice details heading        | `h1:has-text("Invoice #INV-2024-001")` or `role=heading level=5`          |
| Download button                | `button:has-text("Download")`                                             |
| Print button                   | `button:has-text("Print")`                                                |
| Back icon button               | First `IconButton` before the heading, or `button[aria-label="back"]`     |
| Status chip (Unpaid)           | `.MuiChip-label:has-text("Unpaid")`                                       |
| Line Items tab                 | `role=tab name="Line Items"`                                              |
| No invoices text               | `text="No invoices found."`                                               |
| Access Denied heading          | `role=heading name="Access Denied"`                                       |
| Invoice number cell            | `text="INV-2024-001"`                                                     |

---

## Notes for the Generator

1. **Do not use real Clerk auth** — always stub it via `page.addInitScript` or route
   interception before navigating.
2. **Axios uses relative URLs** — the base URL is configured at runtime via Vite proxy or
   `VITE_API_URL`. In tests, intercept `**/invoices**` patterns.
3. **React Query caching** — if tests share state, clear query cache between tests using
   `queryClient.clear()` or ensure each test navigates fresh.
4. **`e.stopPropagation()` on View button** — clicking the table row toggles its checkbox.
   Always click the `<IconButton>` for the View action, not the row.
5. **Download is a `window.alert()`** — listen with `page.once('dialog', ...)` before
   clicking.
6. **MUI Tooltip** — the tooltip title `"View Details"` is not an HTML `title` attribute
   but an ARIA tooltip; prefer role or text selectors.
7. **Test file naming** — the file must be named `invoice-view-download.spec.ts` to match
   the `*.spec.ts` convention in `CLAUDE.md`.
8. **No `--passWithNoTests`** — Playwright uses its own config; the Jest `--passWithNoTests`
   flag in `package.json` is for unit tests only.
