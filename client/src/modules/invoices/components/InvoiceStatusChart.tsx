import React from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useStatusDistribution } from '../invoiceQueries';

/**
 * Invoice Status Distribution Chart
 * Displays a bar chart showing the count of invoices by status (Paid, Unpaid, Overdue)
 * Shows analytics for ALL invoices regardless of table filters
 */
const InvoiceStatusChart: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, isError, error } = useStatusDistribution();

  // Handle loading state
  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 350,
        }}>
        <CircularProgress />
      </Paper>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
        }}>
        <Alert severity="error">
          Failed to load invoice status distribution: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Paper>
    );
  }

  // Handle empty data
  if (!data || data.distribution.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
        }}>
        <Typography variant="h6" color="text.secondary">
          No invoice data available
        </Typography>
      </Paper>
    );
  }

  // Prepare data for chart
  const statusLabels = data.distribution.map((item) => {
    // Capitalize first letter and lowercase rest
    return item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
  });
  const statusCounts = data.distribution.map((item) => item.count);

  // Map status to theme colors
  const getColorForStatus = (status: string): string => {
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === 'PAID') {
      return theme.palette.invoiceStatus.paid;
    } else if (normalizedStatus === 'UNPAID') {
      return theme.palette.invoiceStatus.unpaid;
    } else if (normalizedStatus === 'OVERDUE') {
      return theme.palette.invoiceStatus.overdue;
    }
    return theme.palette.primary.main;
  };

  const barColors = data.distribution.map((item) => getColorForStatus(item.status));

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: theme.palette.background.paper,
      }}>
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, mb: 2 }}>
        Invoice Status Distribution
      </Typography>
      <Box sx={{ width: '100%', height: 350 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: statusLabels,
              label: 'Status',
            },
          ]}
          yAxis={[
            {
              label: 'Count',
            },
          ]}
          series={[
            {
              data: statusCounts,
              label: 'Invoice Count',
              color: barColors[0],
            },
          ]}
          colors={barColors}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
          margin={{ top: 20, right: 20, bottom: 80, left: 80 }}
        />
      </Box>
    </Paper>
  );
};

export default InvoiceStatusChart;
