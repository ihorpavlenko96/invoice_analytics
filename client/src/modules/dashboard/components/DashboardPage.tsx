import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useInvoices } from '../../invoices/invoiceQueries';
import VendorChart from './VendorChart';
import VendorDetailsDialog from './VendorDetailsDialog';
import {
  filterInvoicesByDays,
  aggregateByVendor,
  getVendorMonthlyBreakdown,
} from '../utils/aggregations';
import { VendorDetails } from '../types/dashboard';

const DashboardPage: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);

  // Fetch all invoices with a high limit to get all data for aggregation
  const { data: invoicesData, isLoading, error } = useInvoices('', '', '', 1, 1000);

  const vendorData = useMemo(() => {
    if (!invoicesData?.items) return [];
    const filteredInvoices = filterInvoicesByDays(invoicesData.items, 30);
    return aggregateByVendor(filteredInvoices);
  }, [invoicesData]);

  const handleVendorClick = (vendorName: string) => {
    if (!invoicesData?.items) return;

    const filteredInvoices = filterInvoicesByDays(invoicesData.items, 30);
    const details = getVendorMonthlyBreakdown(filteredInvoices, vendorName);

    setVendorDetails(details);
    setSelectedVendor(vendorName);
  };

  const handleCloseDialog = () => {
    setSelectedVendor(null);
    setVendorDetails(null);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#E0F7F7',
        minHeight: 'calc(100vh - 200px)',
        py: 4,
        px: 2,
      }}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
          Dashboard
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading invoice data. Please try again later.
          </Alert>
        )}

        {!isLoading && !error && (
          <>
            <VendorChart data={vendorData} onVendorClick={handleVendorClick} />

            <VendorDetailsDialog
              open={!!selectedVendor}
              onClose={handleCloseDialog}
              vendorDetails={vendorDetails}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
