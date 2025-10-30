import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Tabs, Tab, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useInvoices } from '../../invoices/invoiceQueries';
import VendorChart from './VendorChart';
import CustomerChart from './CustomerChart';
import VendorDetailsDialog from './VendorDetailsDialog';
import CustomerDetailsDialog from './CustomerDetailsDialog';
import {
  filterInvoicesByDays,
  aggregateByVendor,
  aggregateByCustomer,
  getVendorMonthlyBreakdown,
  getCustomerMonthlyBreakdown,
} from '../utils/aggregations';
import { VendorDetails, CustomerDetails } from '../types/dashboard';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'customer'>('vendor');
  const [timePeriod, setTimePeriod] = useState<number>(365);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);

  // Fetch all invoices with a high limit to get all data for aggregation
  const { data: invoicesData, isLoading, error } = useInvoices('', 1, 1000);

  // Get time period label for display
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 30:
        return 'Last 30 Days';
      case 90:
        return 'Last 90 Days';
      case 180:
        return 'Last 180 Days';
      case 365:
        return 'Last 365 Days';
      default:
        return `Last ${timePeriod} Days`;
    }
  };

  const vendorData = useMemo(() => {
    if (!invoicesData?.items) return [];
    const filteredInvoices = filterInvoicesByDays(invoicesData.items, timePeriod);
    return aggregateByVendor(filteredInvoices);
  }, [invoicesData, timePeriod]);

  const customerData = useMemo(() => {
    if (!invoicesData?.items) return [];
    const filteredInvoices = filterInvoicesByDays(invoicesData.items, timePeriod);
    return aggregateByCustomer(filteredInvoices);
  }, [invoicesData, timePeriod]);

  const handleVendorClick = (vendorName: string) => {
    if (!invoicesData?.items) return;

    const filteredInvoices = filterInvoicesByDays(invoicesData.items, timePeriod);
    const details = getVendorMonthlyBreakdown(filteredInvoices, vendorName);

    setVendorDetails(details);
    setSelectedVendor(vendorName);
  };

  const handleCustomerClick = (customerName: string) => {
    if (!invoicesData?.items) return;

    const filteredInvoices = filterInvoicesByDays(invoicesData.items, timePeriod);
    const details = getCustomerMonthlyBreakdown(filteredInvoices, customerName);

    setCustomerDetails(details);
    setSelectedCustomer(customerName);
  };

  const handleCloseVendorDialog = () => {
    setSelectedVendor(null);
    setVendorDetails(null);
  };

  const handleCloseCustomerDialog = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'vendor' | 'customer') => {
    setActiveTab(newValue);
  };

  const handleTimePeriodChange = (event: any) => {
    setTimePeriod(event.target.value as number);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Dashboard
          </Typography>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period-select"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
              sx={{ backgroundColor: 'white' }}>
              <MenuItem value={30}>Last 30 Days</MenuItem>
              <MenuItem value={90}>Last 90 Days</MenuItem>
              <MenuItem value={180}>Last 180 Days</MenuItem>
              <MenuItem value={365}>Last 365 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
                <Tab label="Vendors" value="vendor" />
                <Tab label="Customers" value="customer" />
              </Tabs>
            </Box>

            {activeTab === 'vendor' && (
              <VendorChart
                data={vendorData}
                onVendorClick={handleVendorClick}
                timePeriodLabel={getTimePeriodLabel()}
              />
            )}

            {activeTab === 'customer' && (
              <CustomerChart
                data={customerData}
                onCustomerClick={handleCustomerClick}
                timePeriodLabel={getTimePeriodLabel()}
              />
            )}

            <VendorDetailsDialog
              open={!!selectedVendor}
              onClose={handleCloseVendorDialog}
              vendorDetails={vendorDetails}
            />

            <CustomerDetailsDialog
              open={!!selectedCustomer}
              onClose={handleCloseCustomerDialog}
              customerDetails={customerDetails}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;
