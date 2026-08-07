# Implementation Plan: IA-408 — Map All XPaths from the Invoice Details Page

## Overview

This document provides a comprehensive mapping of all XPath selectors for every UI element on the Invoice Details page (`client/src/modules/invoices/components/InvoiceDetails.tsx`).

The XPaths are designed for test automation and element identification. They use a hybrid approach combining:
- MUI class names (e.g., `MuiChip-root`, `MuiTab-root`, `MuiButton-root`)
- ARIA attributes (e.g., `role`, `aria-labelledby`)
- Text content matchers (e.g., `contains(text(), ...)`, `normalize-space()`)
- Structural position (e.g., `[1]`, `[last()]`)

**Note:** No `data-testid` attributes exist in this codebase. All selectors rely on MUI v5/v6 DOM conventions, ARIA roles, and visible text.

---

## Assumptions and Rules

- MUI v5/v6 is in use (per `CLAUDE.md` and `package.json`).
- The XPaths below target the **fully-loaded state** of the page (i.e., `isLoading = false` and `invoice` is defined).
- Elements marked **[CONDITIONAL]** are only present under specific data conditions.
- Dynamic content (invoice number, dates, amounts, line items) uses placeholder patterns; adapt to actual values at test runtime.
- All XPaths are written as **absolute-from-context** (use within the page root or prepend `//body` for full document XPaths).

---

## Section 1: Header

The header is the top `Box` (`div`) containing the back button, invoice title, status chip, and action buttons.

### 1.1 Header Container

```xpath
//div[.//button[.//*[@data-testid='KeyboardBackspaceIcon']] and .//h1]
```

| Purpose | Header wrapper `div` (flex row, space-between) |
|---------|------------------------------------------------|
| Element | `<Box>` → `<div>` |

---

### 1.2 Back Button (IconButton)

```xpath
//button[.//*[@data-testid='KeyboardBackspaceIcon']]
```

| Purpose | Navigates back to the invoice list |
|---------|-------------------------------------|
| Element | `<IconButton>` → `<button>` |
| Icon | `KeyboardBackspace` (MUI icon, renders as `<svg data-testid="KeyboardBackspaceIcon">`) |
| Notes | No visible label text; must target by icon SVG test ID |

Alternative (by MUI class):
```xpath
//button[contains(@class,'MuiIconButton-root')][.//*[@data-testid='KeyboardBackspaceIcon']]
```

---

### 1.3 Invoice Number Title

```xpath
//h1[contains(normalize-space(text()),'Invoice #')]
```

| Purpose | Displays the invoice number (e.g., "Invoice #INV-001") |
|---------|--------------------------------------------------------|
| Element | `<Typography variant="h5" component="h1">` → `<h1>` |
| Data field | `invoice.invoiceNumber` |

Target with specific invoice number (substitute actual number):
```xpath
//h1[normalize-space(text())='Invoice #INV-001']
```

---

### 1.4 Status Chip

```xpath
//h1[contains(text(),'Invoice #')]/following-sibling::div[contains(@class,'MuiChip-root')]
```

| Purpose | Displays the invoice status (Paid / Unpaid / Overdue) |
|---------|-------------------------------------------------------|
| Element | `<Chip size="small">` → `<div class="MuiChip-root MuiChip-sizeSmall ...">` |
| Data field | `invoice.status` |

Target the chip label text (the rendered status):
```xpath
//h1[contains(text(),'Invoice #')]/following-sibling::div[contains(@class,'MuiChip-root')]//span[contains(@class,'MuiChip-label')]
```

Specific status variants:

- **Paid:**
  ```xpath
  //div[contains(@class,'MuiChip-root')]//span[contains(@class,'MuiChip-label') and normalize-space(text())='Paid']
  ```

- **Unpaid:**
  ```xpath
  //div[contains(@class,'MuiChip-root')]//span[contains(@class,'MuiChip-label') and normalize-space(text())='Unpaid']
  ```

- **Overdue:**
  ```xpath
  //div[contains(@class,'MuiChip-root')]//span[contains(@class,'MuiChip-label') and normalize-space(text())='Overdue']
  ```

---

### 1.5 Print Button

```xpath
//button[contains(@class,'MuiButton-root') and .//*[@data-testid='PrintIcon']]
```

| Purpose | Triggers `window.print()` |
|---------|--------------------------|
| Element | `<Button variant="outlined" size="small">` → `<button class="MuiButton-root MuiButton-outlined MuiButton-sizeSmall ...">` |
| Icon | `Print` MUI icon |

Alternative (by visible button text):
```xpath
//button[contains(@class,'MuiButton-root') and .//span[normalize-space(text())='Print']]
```

---

### 1.6 Download Button

```xpath
//button[contains(@class,'MuiButton-root') and .//*[@data-testid='DownloadIcon']]
```

| Purpose | Triggers PDF download (alert in current implementation) |
|---------|--------------------------------------------------------|
| Element | `<Button variant="outlined" size="small">` → `<button>` |
| Icon | `Download` MUI icon |

Alternative (by visible button text):
```xpath
//button[contains(@class,'MuiButton-root') and .//span[normalize-space(text())='Download']]
```

---

### 1.7 AI Assistant Button [CONDITIONAL]

> **Conditional:** Only rendered when `onToggleAIAssistant` prop is provided.

```xpath
//button[contains(@class,'MuiButton-root') and .//*[@data-testid='SmartToyIcon']]
```

| Purpose | Toggles the AI Assistant panel |
|---------|-------------------------------|
| Element | `<Button variant="outlined" color="primary" size="small">` → `<button>` |
| Icon | `SmartToy` MUI icon |

Alternative (by visible button text):
```xpath
//button[contains(@class,'MuiButton-root') and .//span[normalize-space(text())='AI Assistant']]
```

---

### 1.8 Header Divider

```xpath
//hr[contains(@class,'MuiDivider-root')]
```

| Purpose | Horizontal rule separating the header from the summary row |
|---------|-----------------------------------------------------------|
| Element | `<Divider>` → `<hr class="MuiDivider-root ...">` |

---

## Section 2: Summary Row (4 Cards)

The summary row is a 4-column MUI Grid containing cards for Issue Date, Due Date, Subtotal, and Total.

### 2.1 Summary Row Container

```xpath
//div[contains(@class,'MuiGrid-container') and .//p[normalize-space(text())='Issue Date']]
```

---

### 2.2 Issue Date Card

**Card wrapper:**
```xpath
//div[contains(@class,'MuiGrid-container')]//div[.//span[normalize-space(text())='Issue Date']]
```

**Label ("Issue Date"):**
```xpath
//span[normalize-space(text())='Issue Date']
```

| Purpose | Static label for the issue date field |
|---------|---------------------------------------|
| Element | `<Typography variant="caption">` → `<span>` |

**Value (formatted date):**
```xpath
//span[normalize-space(text())='Issue Date']/following-sibling::p
```

| Purpose | Displays formatted issue date (e.g., "January 1, 2025") |
|---------|--------------------------------------------------------|
| Element | `<Typography variant="body2">` → `<p>` |
| Data field | `invoice.issueDate` |

---

### 2.3 Due Date Card

**Card wrapper:**
```xpath
//div[contains(@class,'MuiGrid-container')]//div[.//span[normalize-space(text())='Due Date']]
```

**Label ("Due Date"):**
```xpath
//span[normalize-space(text())='Due Date']
```

**Value (formatted date):**
```xpath
//span[normalize-space(text())='Due Date']/following-sibling::p
```

| Purpose | Displays formatted due date; turns red (`error.main`) if overdue |
|---------|------------------------------------------------------------------|
| Element | `<Typography variant="body2">` → `<p>` |
| Data field | `invoice.dueDate` |
| Notes | When overdue, the `<p>` element will have a red color style applied |

---

### 2.4 Subtotal Card

**Card wrapper:**
```xpath
//div[contains(@class,'MuiGrid-container')]//div[.//span[normalize-space(text())='Subtotal']]
```

**Label ("Subtotal"):**
```xpath
//span[normalize-space(text())='Subtotal']
```

**Value (currency amount):**
```xpath
//span[normalize-space(text())='Subtotal']/following-sibling::p
```

| Purpose | Displays formatted subtotal amount |
|---------|-----------------------------------|
| Element | `<Typography variant="body2">` → `<p>` |
| Data field | `invoice.subtotal` |

---

### 2.5 Total Card (Highlighted)

The Total card has a dark primary background (`bgcolor: 'primary.dark'`) differentiating it visually.

**Card wrapper:**
```xpath
//div[contains(@class,'MuiGrid-container')]//div[.//span[normalize-space(text())='Total']]
```

**Label ("Total"):**
```xpath
//span[normalize-space(text())='Total']
```

**Value (currency amount):**
```xpath
//span[normalize-space(text())='Total']/following-sibling::p
```

| Purpose | Displays formatted total amount (bold, highlighted card) |
|---------|----------------------------------------------------------|
| Element | `<Typography variant="body1">` → `<p>` |
| Data field | `invoice.totalAmount` |
| Notes | This `<p>` uses `variant="body1"` (maps to `<p class="MuiTypography-body1">`) while others use `variant="body2"` |

---

## Section 3: Tabs

### 3.1 Tabs Container (Tab Bar)

```xpath
//div[contains(@class,'MuiTabs-root')]
```

| Purpose | Container holding the three navigation tabs |
|---------|---------------------------------------------|
| Element | `<Tabs variant="scrollable" scrollButtons="auto">` → `<div class="MuiTabs-root MuiTabs-scrollable ...">` |

---

### 3.2 Tab: "Line Items" (Tab 0)

```xpath
//button[contains(@class,'MuiTab-root') and normalize-space(text())='Line Items']
```

| Purpose | First tab — shows the line items table |
|---------|----------------------------------------|
| Element | `<Tab label="Line Items">` → `<button class="MuiTab-root ..." id="invoice-tab-0" aria-controls="invoice-tabpanel-0">` |
| ARIA | `id="invoice-tab-0"`, `aria-controls="invoice-tabpanel-0"` |

By ARIA id:
```xpath
//button[@id='invoice-tab-0']
```

---

### 3.3 Tab: "Vendor & Customer" (Tab 1)

```xpath
//button[contains(@class,'MuiTab-root') and normalize-space(text())='Vendor & Customer']
```

| Purpose | Second tab — shows vendor and customer information |
|---------|---------------------------------------------------|
| Element | `<Tab label="Vendor & Customer">` → `<button class="MuiTab-root ..." id="invoice-tab-1">` |

By ARIA id:
```xpath
//button[@id='invoice-tab-1']
```

---

### 3.4 Tab: "Terms & Conditions" (Tab 2)

```xpath
//button[contains(@class,'MuiTab-root') and normalize-space(text())='Terms & Conditions']
```

| Purpose | Third tab — shows terms and conditions text |
|---------|---------------------------------------------|
| Element | `<Tab label="Terms & Conditions">` → `<button class="MuiTab-root ..." id="invoice-tab-2">` |

By ARIA id:
```xpath
//button[@id='invoice-tab-2']
```

---

## Section 4: Line Items Tab (Tab Panel 0)

The tab panel is rendered as a `<div>` with `role="tabpanel"`.

### 4.1 Line Items Tab Panel Container

```xpath
//div[@role='tabpanel' and @id='invoice-tabpanel-0']
```

| Element | `<TabPanel index={0}>` → `<div role="tabpanel" id="invoice-tabpanel-0" aria-labelledby="invoice-tab-0">` |

---

### 4.2 Line Items Table

```xpath
//div[@id='invoice-tabpanel-0']//table[contains(@class,'MuiTable-root')]
```

| Element | `<Table size="small" stickyHeader>` → `<table class="MuiTable-root MuiTable-stickyHeader MuiTable-sizeSmall ...">` |

---

### 4.3 Table Header Row

```xpath
//div[@id='invoice-tabpanel-0']//thead[contains(@class,'MuiTableHead-root')]/tr
```

---

### 4.4 Table Header Cells

**Header: "#" (line number)**
```xpath
//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='#']
```

**Header: "Description"**
```xpath
//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Description']
```

**Header: "Qty"**
```xpath
//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Qty']
```

**Header: "Unit Price"**
```xpath
//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Unit Price']
```

**Header: "Amount"**
```xpath
//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Amount']
```

---

### 4.5 Line Item Rows (Dynamic)

**All line item rows (data rows, excludes summary rows):**
```xpath
//div[@id='invoice-tabpanel-0']//tbody[contains(@class,'MuiTableBody-root')]/tr[not(.//p[contains(@class,'MuiTypography-root')])]
```

**Nth line item row (by position, 1-based index):**
```xpath
(//div[@id='invoice-tabpanel-0']//tbody[contains(@class,'MuiTableBody-root')]/tr)[{N}]
```
Example for row 1:
```xpath
(//div[@id='invoice-tabpanel-0']//tbody[contains(@class,'MuiTableBody-root')]/tr)[1]
```

**Row by description text:**
```xpath
//div[@id='invoice-tabpanel-0']//tbody/tr[td[2][normalize-space(text())='{description}']]
```

**Cells within the Nth line item row:**

- Line number (`item.lineNumber`):
  ```xpath
  (//div[@id='invoice-tabpanel-0']//tbody/tr)[{N}]/td[1]
  ```

- Description (`item.description`):
  ```xpath
  (//div[@id='invoice-tabpanel-0']//tbody/tr)[{N}]/td[2]
  ```

- Quantity (`item.quantity`):
  ```xpath
  (//div[@id='invoice-tabpanel-0']//tbody/tr)[{N}]/td[3]
  ```

- Unit Price (`item.unitPrice`):
  ```xpath
  (//div[@id='invoice-tabpanel-0']//tbody/tr)[{N}]/td[4]
  ```

- Amount (`item.amount`):
  ```xpath
  (//div[@id='invoice-tabpanel-0']//tbody/tr)[{N}]/td[5]
  ```

---

### 4.6 Summary Rows (Bottom of Line Items Table)

These rows follow the data rows and contain financial totals.

**Subtotal summary row:**
```xpath
//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Subtotal']]
```

- Label cell:
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Subtotal']]//p[normalize-space(text())='Subtotal']
  ```
- Value cell:
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Subtotal']]/td[last()]
  ```

---

**Discount summary row [CONDITIONAL]:**

> **Conditional:** Only rendered when `invoice.discount > 0`.

```xpath
//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Discount']]
```

- Label cell:
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Discount']]//p[normalize-space(text())='Discount']
  ```
- Value cell (prefixed with `-`):
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Discount']]/td[last()]
  ```

---

**Tax summary row:**
```xpath
//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[starts-with(normalize-space(text()),'Tax')]]
```

- Label cell (e.g., "Tax (8.00%)"):
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[starts-with(normalize-space(text()),'Tax')]]//p[starts-with(normalize-space(text()),'Tax')]
  ```
- Value cell:
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[starts-with(normalize-space(text()),'Tax')]]/td[last()]
  ```

---

**Total summary row:**
```xpath
//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Total']]
```

- Label cell:
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Total']]//p[normalize-space(text())='Total']
  ```
- Value cell (bold, primary color):
  ```xpath
  //div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Total']]/td[last()]/p
  ```

---

## Section 5: Vendor & Customer Tab (Tab Panel 1)

### 5.1 Vendor & Customer Tab Panel Container

```xpath
//div[@role='tabpanel' and @id='invoice-tabpanel-1']
```

| Element | `<TabPanel index={1}>` → `<div role="tabpanel" id="invoice-tabpanel-1" aria-labelledby="invoice-tab-1">` |

---

### 5.2 Vendor Card

**Vendor section container:**
```xpath
//div[@id='invoice-tabpanel-1']//div[.//h6[normalize-space(text())='Vendor']]
```

**"Vendor" heading:**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']
```

| Element | `<Typography variant="subtitle1" fontWeight="bold">` → `<h6 class="MuiTypography-subtitle1 ...">` |

**Vendor name (`invoice.vendorName`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::p[1]
```

| Element | `<Typography variant="body2" fontWeight="medium">` → `<p>` |

**Vendor address (`invoice.vendorAddress`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::p[2]
```

| Element | `<Typography variant="body2" color="text.secondary">` → `<p>` |

**Vendor phone (`invoice.vendorPhone`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::div//p[.//strong[normalize-space(text())='Phone:']]
```

Full text node of vendor phone (e.g., "Phone: +1 555-0100"):
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::div//p[.//strong[normalize-space(text())='Phone:']]
```

**Vendor email (`invoice.vendorEmail`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::div//p[.//strong[normalize-space(text())='Email:']]
```

---

### 5.3 Customer Card

**Customer section container:**
```xpath
//div[@id='invoice-tabpanel-1']//div[.//h6[normalize-space(text())='Customer']]
```

**"Customer" heading:**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']
```

| Element | `<Typography variant="subtitle1" fontWeight="bold">` → `<h6 class="MuiTypography-subtitle1 ...">` |

**Customer name (`invoice.customerName`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::p[1]
```

**Customer address (`invoice.customerAddress`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::p[2]
```

**Customer phone (`invoice.customerPhone`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::div//p[.//strong[normalize-space(text())='Phone:']]
```

**Customer email (`invoice.customerEmail`):**
```xpath
//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::div//p[.//strong[normalize-space(text())='Email:']]
```

---

## Section 6: Terms & Conditions Tab (Tab Panel 2)

### 6.1 Terms & Conditions Tab Panel Container

```xpath
//div[@role='tabpanel' and @id='invoice-tabpanel-2']
```

| Element | `<TabPanel index={2}>` → `<div role="tabpanel" id="invoice-tabpanel-2" aria-labelledby="invoice-tab-2">` |

---

### 6.2 Terms Content Box [CONDITIONAL — has terms]

> **Conditional:** Only rendered when `invoice.terms` is a non-empty string.

**Content box container:**
```xpath
//div[@id='invoice-tabpanel-2']//div[.//h6[normalize-space(text())='Terms & Conditions']]
```

**"Terms & Conditions" heading:**
```xpath
//div[@id='invoice-tabpanel-2']//h6[normalize-space(text())='Terms & Conditions']
```

| Element | `<Typography variant="subtitle1" fontWeight="bold">` → `<h6 class="MuiTypography-subtitle1 ...">` |

**Terms body text (`invoice.terms`):**
```xpath
//div[@id='invoice-tabpanel-2']//h6[normalize-space(text())='Terms & Conditions']/following-sibling::p
```

| Element | `<Typography variant="body2" color="text.secondary">` → `<p>` |

---

### 6.3 Empty State Message [CONDITIONAL — no terms]

> **Conditional:** Only rendered when `invoice.terms` is falsy (null, undefined, or empty string).

```xpath
//div[@id='invoice-tabpanel-2']//p[normalize-space(text())='No terms and conditions specified for this invoice.']
```

| Element | `<Typography variant="body2" color="text.secondary">` → `<p>` |

---

## Complete XPath Reference Table

The following table summarises every mapped XPath for quick reference.

| # | Section | Element Purpose | Data Field | Conditional | XPath |
|---|---------|-----------------|------------|-------------|-------|
| 1 | Header | Back button | — | No | `//button[.//*[@data-testid='KeyboardBackspaceIcon']]` |
| 2 | Header | Invoice number title | `invoiceNumber` | No | `//h1[contains(normalize-space(text()),'Invoice #')]` |
| 3 | Header | Status chip (root element) | `status` | No | `//h1[contains(text(),'Invoice #')]/following-sibling::div[contains(@class,'MuiChip-root')]` |
| 4 | Header | Status chip label text | `status` | No | `//div[contains(@class,'MuiChip-root')]//span[contains(@class,'MuiChip-label')]` |
| 5 | Header | Print button | — | No | `//button[contains(@class,'MuiButton-root') and .//*[@data-testid='PrintIcon']]` |
| 6 | Header | Download button | — | No | `//button[contains(@class,'MuiButton-root') and .//*[@data-testid='DownloadIcon']]` |
| 7 | Header | AI Assistant button | — | Yes (prop) | `//button[contains(@class,'MuiButton-root') and .//*[@data-testid='SmartToyIcon']]` |
| 8 | Header | Divider | — | No | `//hr[contains(@class,'MuiDivider-root')]` |
| 9 | Summary | Issue Date label | — | No | `//span[normalize-space(text())='Issue Date']` |
| 10 | Summary | Issue Date value | `issueDate` | No | `//span[normalize-space(text())='Issue Date']/following-sibling::p` |
| 11 | Summary | Due Date label | — | No | `//span[normalize-space(text())='Due Date']` |
| 12 | Summary | Due Date value | `dueDate` | No | `//span[normalize-space(text())='Due Date']/following-sibling::p` |
| 13 | Summary | Subtotal label | — | No | `//span[normalize-space(text())='Subtotal']` |
| 14 | Summary | Subtotal value | `subtotal` | No | `//span[normalize-space(text())='Subtotal']/following-sibling::p` |
| 15 | Summary | Total label | — | No | `//span[normalize-space(text())='Total']` |
| 16 | Summary | Total value | `totalAmount` | No | `//span[normalize-space(text())='Total']/following-sibling::p` |
| 17 | Tabs | Tab bar container | — | No | `//div[contains(@class,'MuiTabs-root')]` |
| 18 | Tabs | "Line Items" tab | — | No | `//button[@id='invoice-tab-0']` |
| 19 | Tabs | "Vendor & Customer" tab | — | No | `//button[@id='invoice-tab-1']` |
| 20 | Tabs | "Terms & Conditions" tab | — | No | `//button[@id='invoice-tab-2']` |
| 21 | Line Items | Tab panel container | — | No | `//div[@role='tabpanel' and @id='invoice-tabpanel-0']` |
| 22 | Line Items | Table element | — | No | `//div[@id='invoice-tabpanel-0']//table[contains(@class,'MuiTable-root')]` |
| 23 | Line Items | Header: "#" | — | No | `//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='#']` |
| 24 | Line Items | Header: "Description" | — | No | `//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Description']` |
| 25 | Line Items | Header: "Qty" | — | No | `//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Qty']` |
| 26 | Line Items | Header: "Unit Price" | — | No | `//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Unit Price']` |
| 27 | Line Items | Header: "Amount" | — | No | `//div[@id='invoice-tabpanel-0']//th[contains(@class,'MuiTableCell-head') and normalize-space(text())='Amount']` |
| 28 | Line Items | Row N — line number cell | `items[N].lineNumber` | No | `(//div[@id='invoice-tabpanel-0']//tbody/tr)[N]/td[1]` |
| 29 | Line Items | Row N — description cell | `items[N].description` | No | `(//div[@id='invoice-tabpanel-0']//tbody/tr)[N]/td[2]` |
| 30 | Line Items | Row N — quantity cell | `items[N].quantity` | No | `(//div[@id='invoice-tabpanel-0']//tbody/tr)[N]/td[3]` |
| 31 | Line Items | Row N — unit price cell | `items[N].unitPrice` | No | `(//div[@id='invoice-tabpanel-0']//tbody/tr)[N]/td[4]` |
| 32 | Line Items | Row N — amount cell | `items[N].amount` | No | `(//div[@id='invoice-tabpanel-0']//tbody/tr)[N]/td[5]` |
| 33 | Line Items | Summary: Subtotal label | — | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Subtotal']]//p[normalize-space(text())='Subtotal']` |
| 34 | Line Items | Summary: Subtotal value | `subtotal` | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Subtotal']]/td[last()]` |
| 35 | Line Items | Summary: Discount label | — | Yes (discount > 0) | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Discount']]//p[normalize-space(text())='Discount']` |
| 36 | Line Items | Summary: Discount value | `discount` | Yes (discount > 0) | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Discount']]/td[last()]` |
| 37 | Line Items | Summary: Tax label | — | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[starts-with(normalize-space(text()),'Tax')]]//p[starts-with(normalize-space(text()),'Tax')]` |
| 38 | Line Items | Summary: Tax value | `taxAmount` | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[starts-with(normalize-space(text()),'Tax')]]/td[last()]` |
| 39 | Line Items | Summary: Total label | — | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Total']]//p[normalize-space(text())='Total']` |
| 40 | Line Items | Summary: Total value | `totalAmount` | No | `//div[@id='invoice-tabpanel-0']//tbody/tr[.//p[normalize-space(text())='Total']]/td[last()]/p` |
| 41 | Vendor & Customer | Tab panel container | — | No | `//div[@role='tabpanel' and @id='invoice-tabpanel-1']` |
| 42 | Vendor & Customer | "Vendor" heading | — | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']` |
| 43 | Vendor & Customer | Vendor name | `vendorName` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::p[1]` |
| 44 | Vendor & Customer | Vendor address | `vendorAddress` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::p[2]` |
| 45 | Vendor & Customer | Vendor phone | `vendorPhone` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::div//p[.//strong[normalize-space(text())='Phone:']]` |
| 46 | Vendor & Customer | Vendor email | `vendorEmail` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Vendor']/following-sibling::div//p[.//strong[normalize-space(text())='Email:']]` |
| 47 | Vendor & Customer | "Customer" heading | — | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']` |
| 48 | Vendor & Customer | Customer name | `customerName` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::p[1]` |
| 49 | Vendor & Customer | Customer address | `customerAddress` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::p[2]` |
| 50 | Vendor & Customer | Customer phone | `customerPhone` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::div//p[.//strong[normalize-space(text())='Phone:']]` |
| 51 | Vendor & Customer | Customer email | `customerEmail` | No | `//div[@id='invoice-tabpanel-1']//h6[normalize-space(text())='Customer']/following-sibling::div//p[.//strong[normalize-space(text())='Email:']]` |
| 52 | Terms & Conditions | Tab panel container | — | No | `//div[@role='tabpanel' and @id='invoice-tabpanel-2']` |
| 53 | Terms & Conditions | "Terms & Conditions" heading | — | Yes (has terms) | `//div[@id='invoice-tabpanel-2']//h6[normalize-space(text())='Terms & Conditions']` |
| 54 | Terms & Conditions | Terms body text | `terms` | Yes (has terms) | `//div[@id='invoice-tabpanel-2']//h6[normalize-space(text())='Terms & Conditions']/following-sibling::p` |
| 55 | Terms & Conditions | Empty state message | — | Yes (no terms) | `//div[@id='invoice-tabpanel-2']//p[normalize-space(text())='No terms and conditions specified for this invoice.']` |

---

## Notes on MUI DOM Structure

### Component → DOM Tag Mapping

| MUI Component | Rendered Tag | Key Classes |
|---------------|-------------|-------------|
| `<Box>` | `<div>` | (no MUI class, just inline styles) |
| `<Typography variant="h5" component="h1">` | `<h1>` | `MuiTypography-root MuiTypography-h5` |
| `<Typography variant="subtitle1">` | `<h6>` | `MuiTypography-root MuiTypography-subtitle1` |
| `<Typography variant="body1">` | `<p>` | `MuiTypography-root MuiTypography-body1` |
| `<Typography variant="body2">` | `<p>` | `MuiTypography-root MuiTypography-body2` |
| `<Typography variant="caption">` | `<span>` | `MuiTypography-root MuiTypography-caption` |
| `<Button>` | `<button>` | `MuiButtonBase-root MuiButton-root MuiButton-outlined` |
| `<IconButton>` | `<button>` | `MuiButtonBase-root MuiIconButton-root` |
| `<Chip size="small">` | `<div>` | `MuiChip-root MuiChip-filled MuiChip-sizeSmall` |
| `<Chip>` label span | `<span>` | `MuiChip-label MuiChip-labelSmall` |
| `<Tabs>` | `<div>` | `MuiTabs-root MuiTabs-scrollable` |
| `<Tab>` | `<button>` | `MuiButtonBase-root MuiTab-root` |
| `<Divider>` | `<hr>` | `MuiDivider-root` |
| `<Table>` | `<table>` | `MuiTable-root MuiTable-stickyHeader MuiTable-sizeSmall` |
| `<TableHead>` | `<thead>` | `MuiTableHead-root` |
| `<TableBody>` | `<tbody>` | `MuiTableBody-root` |
| `<TableRow>` | `<tr>` | `MuiTableRow-root` |
| `<TableCell>` (head) | `<th>` | `MuiTableCell-root MuiTableCell-head` |
| `<TableCell>` (body) | `<td>` | `MuiTableCell-root MuiTableCell-body` |

### Tab Panel ARIA IDs

The `TabPanel` component assigns deterministic ARIA IDs via:
```tsx
id={`invoice-tabpanel-${index}`}
aria-labelledby={`invoice-tab-${index}`}
```

And the MUI `<Tab>` components receive corresponding IDs from MUI's internal tab management, resulting in:
- `id="invoice-tab-0"` / `aria-controls="invoice-tabpanel-0"` — Line Items
- `id="invoice-tab-1"` / `aria-controls="invoice-tabpanel-1"` — Vendor & Customer
- `id="invoice-tab-2"` / `aria-controls="invoice-tabpanel-2"` — Terms & Conditions

### Hidden vs Visible Tab Panels

MUI `TabPanel` uses `hidden` attribute on inactive panels:
```tsx
hidden={value !== index}
```

When a tab is not active, `hidden={true}` is set on the panel `<div>`. To select only the **visible** panel:
```xpath
//div[@role='tabpanel' and not(@hidden)]
```
