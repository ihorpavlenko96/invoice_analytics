import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  TextField,
  InputAdornment,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { SmartToy as AIIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useInvoices } from '../invoiceQueries';
import InvoiceTable from './InvoiceTable';
import InvoiceDetails from './InvoiceDetails';
import ChatDrawer from './ChatDrawer';
import { useInvoice } from '../invoiceQueries';
import { useUser } from '@clerk/clerk-react';
import { PaginatedResponseDto } from '../services/invoiceService';
import { Invoice } from '../types/invoice';

/**
 * Main invoice management page
 * Only accessible to users with 'Super Admin' role
 */
const InvoiceManagementPage: React.FC = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState<string | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterVendor, setFilterVendor] = useState<string>('');
  const theme = useTheme();

  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('Super Admin');

  // Extract unique customers and vendors for filter dropdowns
  const uniqueCustomers = useMemo(() => {
    const customers = paginatedInvoices.items.map(invoice => invoice.customerName);
    return [...new Set(customers)].filter(Boolean).sort();
  }, [paginatedInvoices.items]);

  const uniqueVendors = useMemo(() => {
    const vendors = paginatedInvoices.items.map(invoice => invoice.vendorName);
    return [...new Set(vendors)].filter(Boolean).sort();
  }, [paginatedInvoices.items]);

  // Fetch all invoices with pagination
  const {
    data: paginatedInvoices = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    } as PaginatedResponseDto<Invoice>,
    isLoading: isInvoicesLoading,
  } = useInvoices(searchTerm, page, limit, filterStatus, filterCustomer, filterVendor);

  // Fetch selected invoice details
  const { data: selectedInvoice, isLoading: isInvoiceLoading } = useInvoice(
    selectedInvoiceId || '',
  );

  // Reset highlighted invoice after animation
  useEffect(() => {
    if (highlightedInvoiceId) {
      const timer = setTimeout(() => {
        setHighlightedInvoiceId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightedInvoiceId]);

  // Handle view invoice
  const handleViewInvoice = (id: string) => {
    setSelectedInvoiceId(id);
  };

  // Handle back to invoice list
  const handleBackToList = () => {
    setSelectedInvoiceId(null);
  };

  // Handle AI assistant drawer toggle
  const handleToggleChatDrawer = () => {
    setIsChatDrawerOpen(!isChatDrawerOpen);
  };

  // Handle highlighting invoice
  const handleHighlightInvoice = (id: string) => {
    setHighlightedInvoiceId(id);
    setSelectedInvoiceId(null);
    setIsChatDrawerOpen(false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterCustomer('');
    setFilterVendor('');
  };

  // Apply custom styles to fix pagination alignment
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select {
        display: flex;
        align-items: center;
        margin: 0;
      }
      .MuiTablePagination-selectLabel {
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // If user is not a Super Admin, show access denied message
  if (!isSuperAdmin) {
    return (
      <Box sx={{ backgroundColor: theme.palette.background.default, p: 3 }}>
        <Card sx={{ backgroundColor: theme.palette.background.paper }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1">
              You don't have permission to access the Invoice Management page. Please contact your
              administrator.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // If an invoice is selected, show only the details
  if (selectedInvoiceId) {
    return (
      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <InvoiceDetails
          invoice={selectedInvoice}
          isLoading={isInvoiceLoading}
          onBack={handleBackToList}
          onToggleAIAssistant={handleToggleChatDrawer}
        />

        {/* Chat Drawer */}
        <ChatDrawer
          open={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          onHighlightInvoice={handleHighlightInvoice}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Invoice Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              onClick={handleToggleChatDrawer}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}>
              AI Assistant
            </Button>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Search field */}
          <Box sx={{ p: 2, pb: 0 }}>
            <TextField
              fullWidth
              placeholder="Search invoices by number, vendor or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filter controls */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  label="Customer"
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {uniqueCustomers.map((customer) => (
                    <MenuItem key={customer} value={customer}>
                      {customer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  label="Vendor"
                >
                  <MenuItem value="">All Vendors</MenuItem>
                  {uniqueVendors.map((vendor) => (
                    <MenuItem key={vendor} value={vendor}>
                      {vendor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={filterStatus === '' && filterCustomer === '' && filterVendor === ''}
                sx={{
                  minWidth: 120,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.text.secondary,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Clear Filters
              </Button>
            </Stack>
          </Box>

          {isInvoicesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!isInvoicesLoading && (
            <InvoiceTable
              paginatedData={paginatedInvoices}
              isLoading={isInvoicesLoading}
              onViewInvoice={handleViewInvoice}
              highlightedInvoiceId={highlightedInvoiceId}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Chat Drawer */}
      <ChatDrawer
        open={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onHighlightInvoice={handleHighlightInvoice}
      />
    </Box>
  );
};

export default InvoiceManagementPage;
