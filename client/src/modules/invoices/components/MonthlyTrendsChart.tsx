import React from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { MonthlyTrendItem } from '../types/analytics';

interface MonthlyTrendsChartProps {
  data: MonthlyTrendItem[];
  isLoading: boolean;
}

const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ data, isLoading }) => {
  // Month names for formatting
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Transform data for chart display
  const formatMonthLabel = (item: MonthlyTrendItem): string => {
    const monthName = monthNames[item.month - 1] || 'Unknown';
    return `${monthName} ${item.year}`;
  };

  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: 'white',
          mb: 3,
        }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
          Monthly Invoice Trends
        </Typography>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'white',
          mb: 3,
        }}>
        <Typography variant="h6" color="text.secondary">
          No monthly trends data available
        </Typography>
      </Paper>
    );
  }

  const monthLabels = data.map(formatMonthLabel);
  const amounts = data.map((item) => item.totalAmount);
  const counts = data.map((item) => item.invoiceCount);

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: 'white',
        mb: 3,
      }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Monthly Invoice Trends
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: monthLabels,
              label: 'Month',
            },
          ]}
          yAxis={[
            {
              label: 'Total Amount ($)',
            },
          ]}
          series={[
            {
              data: amounts,
              label: 'Total Amount',
              color: '#0ABAB5',
            },
          ]}
          slotProps={{
            legend: {
              hidden: false,
              position: { vertical: 'top', horizontal: 'right' },
            },
          }}
          margin={{ top: 20, right: 20, bottom: 80, left: 80 }}
        />
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Total Invoices: {counts.reduce((sum, count) => sum + count, 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Amount: ${amounts.reduce((sum, amount) => sum + amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>
    </Paper>
  );
};

export default MonthlyTrendsChart;
