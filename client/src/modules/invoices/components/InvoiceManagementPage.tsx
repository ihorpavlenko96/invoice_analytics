import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SmartToy as AIIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useInvoices } from '../invoiceQueries';
import UnifiedSearchBar from './UnifiedSearchBar';
import InvoiceTable from './InvoiceTable';
import InvoiceDetails from './InvoiceDetails';
import ChatDrawer from './ChatDrawer';
import { useInvoice } from '../invoiceQueries';
import { useUser } from '@clerk/clerk-react';
import { PaginatedResponseDto, invoiceService } from '../services/invoiceService';
import { Invoice } from '../types/invoice';
import { useDeleteMultipleInvoices } from '../invoiceMutations';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { useSnackbar } from 'notistack';

/**
 * Main invoice management page
 * Only accessible to users with 'Super Admin' role
 */
const InvoiceManagementPage: React.FC = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState<string | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isConfirmBulkDeleteDialogOpen, setIsConfirmBulkDeleteDialogOpen] = useState(false);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const deleteMultipleInvoicesMutation = useDeleteMultipleInvoices();

  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('Super Admin');

  // Prepare date filters (YYYY-MM-DD)
  const fromDateStr = useMemo(() => (fromDate ? fromDate.format('YYYY-MM-DD') : undefined), [fromDate]);
  const toDateStr = useMemo(() => (toDate ? toDate.format('YYYY-MM-DD') : undefined), [toDate]);

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
  } = useInvoices(searchQuery, page, limit, fromDateStr, toDateStr);

  // Fetch selected invoice details
  const { data: selectedInvoice, isLoading: isInvoiceLoading } = useInvoice(
    selectedInvoiceId || '',
  );

  // Date filtering moved to data layer (via useInvoices)

  // Reset highlighted invoice after animation
  useEffect(() => {
    if (highlightedInvoiceId) {
      const timer = setTimeout(() => {
        setHighlightedInvoiceId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightedInvoiceId]);

  // Handle select all click
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredInvoices.items.map((invoice) => invoice.id);
      setSelectedInvoiceIds(newSelecteds);
      return;
    }
    setSelectedInvoiceIds([]);
  };

  // Handle select one invoice
  const handleSelectOneClick = (id: string) => {
    const selectedIndex = selectedInvoiceIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedInvoiceIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedInvoiceIds.slice(1));
    } else if (selectedIndex === selectedInvoiceIds.length - 1) {
      newSelected = newSelected.concat(selectedInvoiceIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedInvoiceIds.slice(0, selectedIndex),
        selectedInvoiceIds.slice(selectedIndex + 1),
      );
    }
    setSelectedInvoiceIds(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    deleteMultipleInvoicesMutation.mutate(selectedInvoiceIds, {
      onSuccess: () => {
        enqueueSnackbar(`${selectedInvoiceIds.length} invoices deleted successfully.`, {
          variant: 'success',
        });
        setSelectedInvoiceIds([]);
      },
      onError: (error) => {
        console.error('Error deleting invoices:', error);
        enqueueSnackbar('Failed to delete invoices.', { variant: 'error' });
      },
      onSettled: () => {
        setIsConfirmBulkDeleteDialogOpen(false);
      },
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAiSearch = (query: string) => {
    setAiSearchQuery(query);
    setIsChatDrawerOpen(true);
  };

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

  // Handle export to Excel
  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await invoiceService.exportInvoices(page, limit);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting invoices:', error);
    } finally {
      setIsExporting(false);
    }
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
            selectedInvoiceIds.length === 0 ? (
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                Invoices
              </Typography>
            ) : (
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                {`${selectedInvoiceIds.length} selected`}
              </Typography>
            )
          }
          action={
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              {selectedInvoiceIds.length > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={() => setIsConfirmBulkDeleteDialogOpen(true)}
                  sx={{
                    backgroundColor: '#E91E63',
                    '&:hover': { backgroundColor: '#C2185B' },
                  }}>
                  Delete ({selectedInvoiceIds.length})
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                startIcon={<AIIcon />}
                onClick={handleToggleChatDrawer}
                sx={{
                  backgroundColor: '#E91E63',
                  '&:hover': { backgroundColor: '#C2185B' },
                }}>
                AI Assistant
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportToExcel}
                disabled={isExporting}
                sx={{
                  backgroundColor: '#E91E63',
                  '&:hover': { backgroundColor: '#C2185B' },
                }}>
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </Box>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Filter controls */}
          <Box sx={{ p: 2, pb: 0, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search + Date Range in one line */}
              <Grid item xs={12} md={6}>
                <UnifiedSearchBar onSearch={handleSearch} onAiSearch={handleAiSearch} />
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    maxDate={toDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'YYYY-MM-DD',
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#E91E63 !important',
                            '&:hover': {
                              backgroundColor: '#C2185B !important',
                            },
                          },
                          '&:hover': {
                            backgroundColor: '#FFC0CB',
                          },
                        },
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-switchViewButton': {
                            color: '#E91E63',
                          },
                          '& .MuiPickersArrowSwitcher-button': {
                            color: '#E91E63',
                          },
                        },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#E91E63',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FFC0CB',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#E91E63',
                      },
                      '& .MuiIconButton-root': {
                        color: '#E91E63',
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#E91E63',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    minDate={fromDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'YYYY-MM-DD',
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#E91E63 !important',
                            '&:hover': {
                              backgroundColor: '#C2185B !important',
                            },
                          },
                          '&:hover': {
                            backgroundColor: '#FFC0CB',
                          },
                        },
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-switchViewButton': {
                            color: '#E91E63',
                          },
                          '& .MuiPickersArrowSwitcher-button': {
                            color: '#E91E63',
                          },
                        },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#E91E63',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FFC0CB',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#E91E63',
                      },
                      '& .MuiIconButton-root': {
                        color: '#E91E63',
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#E91E63',
                      },
                    }}
                  />
                </LocalizationProvider>
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
              selectedInvoices={selectedInvoiceIds}
              onSelectAllClick={handleSelectAllClick}
              onSelectOneClick={handleSelectOneClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Chat Drawer */}
      <ChatDrawer
        open={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onHighlightInvoice={handleHighlightInvoice}
        initialQuery={aiSearchQuery}
        onQuerySent={() => setAiSearchQuery('')}
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isConfirmBulkDeleteDialogOpen}
        onClose={() => setIsConfirmBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title="Confirm Bulk Deletion"
        message={`Are you sure you want to delete ${selectedInvoiceIds.length} selected invoice(s)? This action cannot be undone.`}
        confirmText={deleteMultipleInvoicesMutation.isPending ? 'Deleting...' : 'Delete'}
        confirmButtonProps={{
          variant: 'contained',
          disabled: deleteMultipleInvoicesMutation.isPending,
          sx: {
            backgroundColor: '#E91E63',
            '&:hover': { backgroundColor: '#C2185B' },
          },
        }}
      />
    </Box>
  );
};

export default InvoiceManagementPage;
