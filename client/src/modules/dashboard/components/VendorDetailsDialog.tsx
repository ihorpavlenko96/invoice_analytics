import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { VendorDetails } from '../types/dashboard';

interface VendorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  vendorDetails: VendorDetails | null;
}

const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({
  open,
  onClose,
  vendorDetails,
}) => {
  if (!vendorDetails) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{vendorDetails.vendorName}</Typography>
        <Typography variant="body2" color="text.secondary">
          Monthly Breakdown
        </Typography>
      </DialogTitle>
      <DialogContent>
        {vendorDetails.monthlyBreakdown.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Invoice Dates</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorDetails.monthlyBreakdown.map((monthData, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {monthData.month}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(monthData.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {monthData.invoiceDates.map((date, dateIndex) => (
                          <Chip
                            key={dateIndex}
                            label={formatDate(date)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorDetailsDialog;
