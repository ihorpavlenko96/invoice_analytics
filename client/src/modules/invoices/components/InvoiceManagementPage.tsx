import React, { useState, useEffect } from 'react';
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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { SmartToy as AIIcon, Search as SearchIcon } from '@mui/icons-material';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterAmountRange, setFilterAmountRange] = useState<string>('all');
  const [filterIssueDateFrom, setFilterIssueDateFrom] = useState<string>('');
  const [filterIssueDateTo, setFilterIssueDateTo] = useState<string>('');
  const [filterDueDateFrom, setFilterDueDateFrom] = useState<string>('');
  const [filterDueDateTo, setFilterDueDateTo] = useState<string>('');

  const theme = useTheme();

  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('Super Admin');

  // Fetch all invoices with pagination and filters
  const {
    data: paginatedInvoices = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    } as PaginatedResponseDto<Invoice>,
    isLoading: isInvoicesLoading,
  } = useInvoices(searchTerm, page, limit, {
    status: filterStatus,
    vendor: filterVendor,
    customer: filterCustomer,
    amountRange: filterAmountRange,
    issueDateFrom: filterIssueDateFrom,
    issueDateTo: filterIssueDateTo,
    dueDateFrom: filterDueDateFrom,
    dueDateTo: filterDueDateTo,
  });

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

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterVendor('');
    setFilterCustomer('');
    setFilterAmountRange('all');
    setFilterIssueDateFrom('');
    setFilterIssueDateTo('');
    setFilterDueDateFrom('');
    setFilterDueDateTo('');
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

          {/* Filter section */}
          <Box sx={{ p: 2, pt: 1 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Vendor Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Vendor"
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  placeholder="Filter by vendor"
                />
              </Grid>

              {/* Customer Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  placeholder="Filter by customer"
                />
              </Grid>

              {/* Amount Range Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Amount</InputLabel>
                  <Select
                    value={filterAmountRange}
                    onChange={(e) => setFilterAmountRange(e.target.value)}
                    label="Amount"
                  >
                    <MenuItem value="all">All Amounts</MenuItem>
                    <MenuItem value="0-100">$0 - $100</MenuItem>
                    <MenuItem value="100-1000">$100 - $1,000</MenuItem>
                    <MenuItem value="1000-10000">$1,000 - $10,000</MenuItem>
                    <MenuItem value="10000+">$10,000+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Issue Date Range */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Issue Date From"
                  type="date"
                  value={filterIssueDateFrom}
                  onChange={(e) => setFilterIssueDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Issue Date To"
                  type="date"
                  value={filterIssueDateTo}
                  onChange={(e) => setFilterIssueDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Due Date Range */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Due Date From"
                  type="date"
                  value={filterDueDateFrom}
                  onChange={(e) => setFilterDueDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Due Date To"
                  type="date"
                  value={filterDueDateTo}
                  onChange={(e) => setFilterDueDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Clear Filters Button */}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
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
