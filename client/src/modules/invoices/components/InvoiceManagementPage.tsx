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
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  SmartToy as AIIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import { useInvoices } from '../invoiceQueries';
import UnifiedSearchBar from './UnifiedSearchBar';
import InvoiceTable from './InvoiceTable';
import InvoiceDetails from './InvoiceDetails';
import ChatDrawer from './ChatDrawer';
import ThemeToggle from './ThemeToggle';
import { useInvoice } from '../invoiceQueries';
import { useUser } from '@clerk/clerk-react';
import { PaginatedResponseDto, invoiceService } from '../services/invoiceService';
import { Invoice } from '../types/invoice';
import { useDeleteMultipleInvoices, useArchiveInvoices, useUnarchiveInvoices } from '../invoiceMutations';
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
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isConfirmBulkDeleteDialogOpen, setIsConfirmBulkDeleteDialogOpen] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const deleteMultipleInvoicesMutation = useDeleteMultipleInvoices();
  const archiveInvoicesMutation = useArchiveInvoices();
  const unarchiveInvoicesMutation = useUnarchiveInvoices();

  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('Super Admin');

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
  } = useInvoices(searchQuery, page, limit, statusFilter || undefined, includeArchived);

  // Fetch selected invoice details
  const { data: selectedInvoice, isLoading: isInvoiceLoading } = useInvoice(
    selectedInvoiceId || '',
  );

  // Apply client-side date filtering
  const filteredInvoices = useMemo(() => {
    let filtered = paginatedInvoices.items;

    // Filter by date with ±7 days range if date is set
    if (dateFilter) {
      filtered = filtered.filter((invoice) => {
        const issueDate = dayjs(invoice.issueDate);
        const dueDate = dayjs(invoice.dueDate);

        // Create a ±7 days range from the selected date
        const rangeStart = dateFilter.subtract(7, 'day');
        const rangeEnd = dateFilter.add(7, 'day');

        // Check if either issueDate or dueDate falls within the ±7 days range
        const isIssueDateInRange =
          issueDate.isAfter(rangeStart.subtract(1, 'day')) &&
          issueDate.isBefore(rangeEnd.add(1, 'day'));

        const isDueDateInRange =
          dueDate.isAfter(rangeStart.subtract(1, 'day')) &&
          dueDate.isBefore(rangeEnd.add(1, 'day'));

        return isIssueDateInRange || isDueDateInRange;
      });
    }

    return {
      ...paginatedInvoices,
      items: filtered,
      total: filtered.length,
    };
  }, [paginatedInvoices, dateFilter]);

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

  // Handle bulk archive
  const handleBulkArchive = () => {
    archiveInvoicesMutation.mutate(selectedInvoiceIds, {
      onSuccess: () => {
        enqueueSnackbar(`${selectedInvoiceIds.length} invoices archived successfully.`, {
          variant: 'success',
        });
        setSelectedInvoiceIds([]);
      },
      onError: (error) => {
        console.error('Error archiving invoices:', error);
        enqueueSnackbar('Failed to archive invoices.', { variant: 'error' });
      },
    });
  };

  // Handle bulk unarchive
  const handleBulkUnarchive = () => {
    unarchiveInvoicesMutation.mutate(selectedInvoiceIds, {
      onSuccess: () => {
        enqueueSnackbar(`${selectedInvoiceIds.length} invoices unarchived successfully.`, {
          variant: 'success',
        });
        setSelectedInvoiceIds([]);
      },
      onError: (error) => {
        console.error('Error unarchiving invoices:', error);
        enqueueSnackbar('Failed to unarchive invoices.', { variant: 'error' });
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
      // Export ALL invoices matching current filters (no pagination)
      const blob = await invoiceService.exportInvoices(statusFilter || undefined, includeArchived);

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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ maxWidth: 400 }}>
                  <UnifiedSearchBar onSearch={handleSearch} onAiSearch={handleAiSearch} />
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date Filter (±7 days)"
                    value={dateFilter}
                    onChange={(newValue) => setDateFilter(newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        placeholder: 'Select date for ±7 days range...',
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: `${theme.palette.primary.main} !important`,
                            '&:hover': {
                              backgroundColor: `${theme.palette.primary.dark} !important`,
                            },
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light,
                          },
                        },
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-switchViewButton': {
                            color: theme.palette.primary.main,
                          },
                          '& .MuiPickersArrowSwitcher-button': {
                            color: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiIconButton-root': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                </LocalizationProvider>
                {dateFilter && (
                  <IconButton
                    aria-label="Clear date filter"
                    onClick={() => setDateFilter(null)}
                    size="small"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel
                    id="status-filter-label"
                    sx={{
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Status
                  </InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                  </Select>
                </FormControl>
                {statusFilter && (
                  <IconButton
                    aria-label="Clear status filter"
                    onClick={() => setStatusFilter('')}
                    size="small"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeArchived}
                      onChange={(e) => setIncludeArchived(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label="Show Archived"
                  sx={{ ml: 1 }}
                />
              </Box>
            ) : (
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                {`${selectedInvoiceIds.length} selected`}
              </Typography>
            )
          }
          action={
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              {selectedInvoiceIds.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    startIcon={includeArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                    onClick={includeArchived ? handleBulkUnarchive : handleBulkArchive}
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      '&:hover': { backgroundColor: theme.palette.secondary.dark },
                    }}>
                    {includeArchived ? 'Unarchive' : 'Archive'} ({selectedInvoiceIds.length})
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    onClick={() => setIsConfirmBulkDeleteDialogOpen(true)}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}>
                    Delete ({selectedInvoiceIds.length})
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={handleToggleChatDrawer}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                AI Assistant
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportToExcel}
                disabled={isExporting}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}>
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </Button>
              <ThemeToggle />
            </Box>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isInvoicesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!isInvoicesLoading && (
            <InvoiceTable
              paginatedData={filteredInvoices}
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
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          },
        }}
      />
    </Box>
  );
};

export default InvoiceManagementPage;
