import React, { useState } from 'react';
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
  Skeleton,
  keyframes,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
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
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const deleteInvoiceMutation = useDeleteInvoice();

  const invoices = paginatedData?.items || [];
  const totalCount = paginatedData?.total || 0;
  const page = paginatedData?.page ? paginatedData.page - 1 : 0; // Convert to 0-based for MUI
  const rowsPerPage = paginatedData?.limit || 10;

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

  // Format days overdue
  const formatDaysOverdue = (daysOverdue: number) => {
    if (daysOverdue === 0) {
      return (
        <Typography color="text.secondary">
          –
        </Typography>
      );
    }

    return (
      <Typography
        color="error"
        fontWeight="medium"
        sx={{
          backgroundColor: theme => theme.palette.error.light + '20',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          display: 'inline-block',
        }}
      >
        {daysOverdue} days
      </Typography>
    );
  };

  // Calculate and display the status of an invoice
  const getInvoiceStatus = (invoice: Invoice) => {
    const statusMap = {
      PAID: { label: 'Paid', color: 'success' as const },
      UNPAID: { label: 'Unpaid', color: 'warning' as const },
      OVERDUE: { label: 'Overdue', color: 'error' as const },
    };

    const status = statusMap[invoice.status] || { label: 'Unknown', color: 'default' as const };

    return (
      <Chip
        label={status.label}
        color={status.color}
        size="small"
        sx={{ fontWeight: 'medium' }}
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
              <TableCell>Invoice #</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Days Overdue</TableCell>
              <TableCell>Status</TableCell>
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
                  {Array.from(new Array(10)).map((_, cellIndex) => (
                    <TableCell key={`cell-${index}-${cellIndex}`}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(highlightedInvoiceId === invoice.id && {
                      animation: `${pulseAnimation} 2s ease-in-out`,
                    }),
                  }}
                  onClick={() => onViewInvoice(invoice.id)}>
                  <TableCell>
                    <Typography fontWeight="medium">{invoice.invoiceNumber}</Typography>
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
                          sx={{ color: '#F87171', '&:hover': { color: '#DC2626' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
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
                <TableCell colSpan={5}>
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
          <Button onClick={handleDeleteCancel} color="primary" disabled={deleteInvoiceMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteInvoiceMutation.isPending}
            startIcon={deleteInvoiceMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: '#F87171',
              color: '#000000',
              '&:hover': { backgroundColor: '#DC2626' },
            }}>
            {deleteInvoiceMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceTable;
