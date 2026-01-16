import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TablePagination,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Chip,
  TableSortLabel,
  Skeleton,
  keyframes,
  Checkbox,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Notifications as BellIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Invoice } from '../types/invoice';
import { useDeleteInvoice } from '../invoiceMutations';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { PaginatedResponseDto } from '../services/invoiceService';

// Define the pulse animation
const pulseAnimation = keyframes`
  0% {
    background-color: rgba(17, 24, 39, 0);
  }
  50% {
    background-color: rgba(17, 24, 39, 0.1);
  }
  100% {
    background-color: rgba(17, 24, 39, 0);
  }
`;

interface InvoiceTableProps {
  paginatedData: PaginatedResponseDto<Invoice>;
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  highlightedInvoiceId: string | null;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  selectedInvoices: string[];
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOneClick: (id: string) => void;
}

/**
 * Invoice table component with pagination, search, and row actions
 */
const InvoiceTable: React.FC<InvoiceTableProps> = ({
  paginatedData,
  isLoading,
  onViewInvoice,
  highlightedInvoiceId,
  onPageChange,
  onRowsPerPageChange,
  selectedInvoices,
  onSelectAllClick,
  onSelectOneClick,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const deleteInvoiceMutation = useDeleteInvoice();

  const invoices = paginatedData?.items || [];
  const totalCount = paginatedData?.total || 0;
  const page = paginatedData?.page ? paginatedData.page - 1 : 0; // Convert to 0-based for MUI
  const rowsPerPage = paginatedData?.limit || 10;

  type SortableColumn =
    | 'invoiceNumber'
    | 'vendorName'
    | 'customerName'
    | 'issueDate'
    | 'dueDate'
    | 'totalAmount'
    | 'currency'
    | 'daysOverdue'
    | 'status';

  const [sortBy, setSortBy] = useState<SortableColumn | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortLabelSx = {
    '& .MuiTableSortLabel-icon': {
      color: `${theme.palette.primary.light} !important`,
    },
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Convert back to 1-based for API
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onRowsPerPageChange(newRowsPerPage);
    onPageChange(1); // Reset to first page
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!invoiceToDelete) return;

    deleteInvoiceMutation.mutate(invoiceToDelete, {
      onSuccess: () => {
        enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
        setDeleteDialogOpen(false);
        setInvoiceToDelete(null);
      },
      onError: (error) => {
        console.error('Error deleting invoice:', error);
        enqueueSnackbar('Failed to delete invoice', { variant: 'error' });
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleSort = (column: SortableColumn) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedInvoices = useMemo(() => {
    if (!sortBy) return invoices;

    const compareStrings = (aVal: string | null | undefined, bVal: string | null | undefined) => {
      const a = (aVal ?? '').toString();
      const b = (bVal ?? '').toString();
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    };

    const compareNumbers = (aVal: number | null | undefined, bVal: number | null | undefined) => {
      const a = Number.isFinite(aVal as number) ? (aVal as number) : 0;
      const b = Number.isFinite(bVal as number) ? (bVal as number) : 0;
      return a - b;
    };

    const compareDates = (aVal: string | null | undefined, bVal: string | null | undefined) => {
      const a = aVal ? new Date(aVal).getTime() : 0;
      const b = bVal ? new Date(bVal).getTime() : 0;
      return a - b;
    };

    const sorted = [...invoices].sort((a, b) => {
      let result = 0;

      switch (sortBy) {
        case 'issueDate':
        case 'dueDate':
          result = compareDates(a[sortBy], b[sortBy]);
          break;
        case 'totalAmount':
        case 'daysOverdue':
          result = compareNumbers(
            Number(a[sortBy] as number | string),
            Number(b[sortBy] as number | string),
          );
          break;
        case 'invoiceNumber':
        case 'vendorName':
        case 'customerName':
        case 'currency':
        case 'status':
        default:
          result = compareStrings(a[sortBy] as string, b[sortBy] as string);
          break;
      }

      return sortOrder === 'asc' ? result : -result;
    });

    return sorted;
  }, [invoices, sortBy, sortOrder]);

  // Format currency with NaN protection
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(safeAmount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Format days overdue with visual alert for invoices overdue by more than 85 days
  const formatDaysOverdue = (daysOverdue: number) => {
    if (daysOverdue === 0) {
      return (
        <Typography color="text.secondary">
          –
        </Typography>
      );
    }

    // Display bell icon for invoices overdue by more than 85 days
    if (daysOverdue > 85) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <BellIcon
            sx={theme => ({
              fontSize: 18,
              color: theme.palette.invoiceStatus.overdue,
            })}
          />
          <Typography
            fontWeight="medium"
            sx={theme => ({
              color: theme.palette.invoiceStatus.overdue,
              backgroundColor: `${theme.palette.invoiceStatus.overdue}20`,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block',
            })}
          >
            {daysOverdue} days
          </Typography>
        </Box>
      );
    }

    return (
      <Typography
        fontWeight="medium"
        sx={theme => ({
          color: theme.palette.invoiceStatus.overdue,
          backgroundColor: `${theme.palette.invoiceStatus.overdue}20`,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          display: 'inline-block',
        })}
      >
        {daysOverdue} days
      </Typography>
    );
  };

  // Calculate and display the status of an invoice
  const getInvoiceStatus = (invoice: Invoice) => {
    const statusMap = {
      PAID: { label: 'Paid', key: 'paid' as const },
      UNPAID: { label: 'Unpaid', key: 'unpaid' as const },
      OVERDUE: { label: 'Overdue', key: 'overdue' as const },
    };

    const status = statusMap[invoice.status] || { label: 'Unknown', key: null };

    return (
      <Chip
        label={status.label}
        size="small"
        sx={{
          fontWeight: 'medium',
          backgroundColor: status.key ? theme.palette.invoiceStatus[status.key] : '#9E9E9E',
          color: theme.palette.primary.contrastText,
        }}
      />
    );
  };

  // Calculate total amount for current page using backend-calculated values
  const calculatePageTotal = (): number => {
    return invoices.reduce((sum, invoice) => {
      // Use the totalAmount calculated by the backend, ensuring it's a valid number
      const total = Number(invoice.totalAmount);
      return sum + (isNaN(total) ? 0 : total);
    }, 0);
  };

  return (
    <>
      <TableContainer>
        <Table stickyHeader aria-label="invoice table">
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  backgroundColor: theme => theme.palette.action.hover,
                  color: theme => theme.palette.text.secondary,
                  fontWeight: 'bold',
                  borderBottom: theme => `1px solid ${theme.palette.divider}`,
                },
              }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedInvoices.length > 0 && selectedInvoices.length < invoices.length
                  }
                  checked={invoices.length > 0 && selectedInvoices.length === invoices.length}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': 'select all invoices on this page',
                  }}
                />
              </TableCell>
              <TableCell sortDirection={sortBy === 'invoiceNumber' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'invoiceNumber'}
                  direction={sortBy === 'invoiceNumber' ? sortOrder : 'asc'}
                  onClick={() => handleSort('invoiceNumber')}
                  sx={sortLabelSx}
                >
                  Invoice #
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'vendorName' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'vendorName'}
                  direction={sortBy === 'vendorName' ? sortOrder : 'asc'}
                  onClick={() => handleSort('vendorName')}
                  sx={sortLabelSx}
                >
                  Vendor
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'customerName' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'customerName'}
                  direction={sortBy === 'customerName' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customerName')}
                  sx={sortLabelSx}
                >
                  Customer
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'issueDate' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'issueDate'}
                  direction={sortBy === 'issueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('issueDate')}
                  sx={sortLabelSx}
                >
                  Issue Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'dueDate' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'dueDate'}
                  direction={sortBy === 'dueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('dueDate')}
                  sx={sortLabelSx}
                >
                  Due Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'totalAmount' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'totalAmount'}
                  direction={sortBy === 'totalAmount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('totalAmount')}
                  sx={sortLabelSx}
                >
                  Total Amount
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'currency' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'currency'}
                  direction={sortBy === 'currency' ? sortOrder : 'asc'}
                  onClick={() => handleSort('currency')}
                  sx={sortLabelSx}
                >
                  Currency
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'daysOverdue' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'daysOverdue'}
                  direction={sortBy === 'daysOverdue' ? sortOrder : 'asc'}
                  onClick={() => handleSort('daysOverdue')}
                  sx={sortLabelSx}
                >
                  Days Overdue
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortBy === 'status' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                  sx={sortLabelSx}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr': {
                '&:hover': {},
              },
              '& td, & th': {
                color: theme => theme.palette.text.primary,
                borderBottom: theme => `1px solid ${theme.palette.divider}`,
                py: 1,
              },
              '& tr:last-child td, & tr:last-child th': {
                borderBottom: 0,
              },
            }}>
            {isLoading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell padding="checkbox">
                    <Skeleton animation="wave" variant="rectangular" width={18} height={18} />
                  </TableCell>
                  {Array.from(new Array(10)).map((_, cellIndex) => (
                    <TableCell key={`cell-${index}-${cellIndex}`}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length > 0 ? (
              sortedInvoices.map((invoice) => {
                const isItemSelected = selectedInvoices.indexOf(invoice.id) !== -1;
                return (
                  <TableRow
                    hover
                    onClick={() => onSelectOneClick(invoice.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={invoice.id}
                    selected={isItemSelected}
                    sx={{
                      cursor: 'pointer',
                      ...(highlightedInvoiceId === invoice.id && {
                        animation: `${pulseAnimation} 2s ease-in-out`,
                      }),
                      ...(invoice.isArchived && {
                        opacity: 0.6,
                        backgroundColor: theme => `${theme.palette.action.disabled}20`,
                      }),
                    }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': `invoice-table-checkbox-${invoice.id}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="medium">{invoice.invoiceNumber}</Typography>
                        {invoice.isArchived && (
                          <Chip
                            icon={<ArchiveIcon />}
                            label="Archived"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: theme => theme.palette.grey[500],
                              color: 'white',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                  <TableCell>{invoice.currency}</TableCell>
                  <TableCell>{formatDaysOverdue(invoice.daysOverdue)}</TableCell>
                  <TableCell>{getInvoiceStatus(invoice)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewInvoice(invoice.id);
                          }}
                          size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Invoice">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(invoice.id);
                          }}
                          size="small"
                          sx={{ color: theme.palette.error.main, '&:hover': { color: theme.palette.error.dark } }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
            {/* Total row - only show if there are invoices */}
            {!isLoading && invoices.length > 0 && (
              <TableRow
                sx={{
                  backgroundColor: theme => theme.palette.action.hover,
                  '& td': {
                    fontWeight: 'bold',
                    borderTop: theme => `2px solid ${theme.palette.divider}`,
                  },
                }}>
                <TableCell colSpan={6}>
                  <Typography variant="body1" fontWeight="bold">
                    Page Total ({invoices.length} invoices)
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(calculatePageTotal())}
                  </Typography>
                </TableCell>
                <TableCell colSpan={4}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteInvoiceMutation.isPending}
            sx={{
              backgroundColor: theme.palette.error.main,
              color: theme.palette.primary.contrastText,
              '&:hover': { backgroundColor: theme.palette.error.dark },
            }}>
            {deleteInvoiceMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceTable;
