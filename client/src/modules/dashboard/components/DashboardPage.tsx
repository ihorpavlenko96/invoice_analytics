import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useInvoices } from '../../invoices/invoiceQueries';
import { useCustomerAnalytics } from '../dashboardQueries';
import { DashboardFilters } from '../services/dashboardService';
import VendorChart from './VendorChart';
import CustomerChart from './CustomerChart';
import CustomerFilters from './CustomerFilters';
import VendorDetailsDialog from './VendorDetailsDialog';
import CustomerDetailsDialog from './CustomerDetailsDialog';
import {
  filterInvoicesByDays,
  aggregateByVendor,
  getVendorMonthlyBreakdown,
  getCustomerMonthlyBreakdown,
} from '../utils/aggregations';
import { VendorDetails, CustomerDetails } from '../types/dashboard';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendor' | 'customer'>('customer');
  const [timePeriod, setTimePeriod] = useState<number>(365);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);

  // Customer filters state
  const [customerFilters, setCustomerFilters] = useState<DashboardFilters>({
    days: 365,
    customerNames: [],
    statuses: [],
  });

  // Fetch all invoices for vendor tab (existing functionality)
  const { data: invoicesData, isLoading: vendorLoading, error: vendorError } = useInvoices('', 1, 1000);

  // Fetch customer analytics data with filters (new backend API)
  const {
    data: customerAnalytics,
    isLoading: customerLoading,
    error: customerError
  } = useCustomerAnalytics(customerFilters);

  // Get time period label for display
  const getTimePeriodLabel = () => {
    const days = activeTab === 'vendor' ? timePeriod : (customerFilters.days || 365);
    switch (days) {
      case 30:
        return 'Last 30 Days';
      case 90:
        return 'Last 90 Days';
      case 180:
        return 'Last 180 Days';
      case 365:
        return 'Last 365 Days';
      default:
        return `Last ${days} Days`;
    }
  };

  const vendorData = useMemo(() => {
    if (!invoicesData?.items) return [];
    const filteredInvoices = filterInvoicesByDays(invoicesData.items, timePeriod);
    return aggregateByVendor(filteredInvoices);
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

    const filteredInvoices = filterInvoicesByDays(invoicesData.items, customerFilters.days || 365);
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

  const handleTimePeriodChange = (event: SelectChangeEvent<number>) => {
    setTimePeriod(event.target.value as number);
  };

  const handleCustomerFiltersChange = (filters: DashboardFilters) => {
    setCustomerFilters(filters);
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
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Vendors" value="vendor" />
            <Tab label="Customers" value="customer" />
          </Tabs>
        </Box>

        {/* Vendor Tab Content */}
        {activeTab === 'vendor' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="vendor-time-period-label">Time Period</InputLabel>
                <Select
                  labelId="vendor-time-period-label"
                  id="vendor-time-period-select"
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

            {vendorLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}

            {vendorError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading invoice data. Please try again later.
              </Alert>
            )}

            {!vendorLoading && !vendorError && (
              <VendorChart
                data={vendorData}
                onVendorClick={handleVendorClick}
                timePeriodLabel={getTimePeriodLabel()}
              />
            )}
          </Box>
        )}

        {/* Customer Tab Content with Filters */}
        {activeTab === 'customer' && (
          <Box>
            <CustomerFilters
              filters={customerFilters}
              onFiltersChange={handleCustomerFiltersChange}
            />

            {customerLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}

            {customerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading customer data. Please try again later.
              </Alert>
            )}

            {!customerLoading && !customerError && customerAnalytics && (
              <CustomerChart
                data={customerAnalytics.customerData}
                summary={customerAnalytics.summary}
                onCustomerClick={handleCustomerClick}
                timePeriodLabel={getTimePeriodLabel()}
              />
            )}
          </Box>
        )}

        {/* Dialogs */}
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
      </Container>
    </Box>
  );
};

export default DashboardPage;