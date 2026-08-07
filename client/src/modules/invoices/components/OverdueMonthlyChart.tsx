import React, { useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useOverdueMonthlyStatistics } from '../../../hooks/analyticsQueries';
import dayjs from 'dayjs';

const OverdueMonthlyChart: React.FC = () => {
  const { data, isLoading, error } = useOverdueMonthlyStatistics();

  // Process data to fill in missing months and format labels
  const chartData = useMemo(() => {
    if (!data?.statistics) return { labels: [], counts: [] };

    // Get the last 12 months
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      last12Months.push({
        year: date.year(),
        month: date.month() + 1, // dayjs months are 0-indexed
        label: date.format('MMM YYYY'),
      });
    }

    // Create a map of existing data
    const dataMap = new Map(
      data.statistics.map(item => [`${item.year}-${item.month}`, item.count])
    );

    // Fill in counts, using 0 for missing months
    const counts = last12Months.map(({ year, month }) => {
      const key = `${year}-${month}`;
      return dataMap.get(key) || 0;
    });

    const labels = last12Months.map(({ label }) => label);

    return { labels, counts };
  }, [data]);

  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'white',
          mb: 3,
        }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading overdue statistics...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, backgroundColor: 'white', mb: 3 }}>
        <Alert severity="error">
          Failed to load overdue statistics. Please try again later.
        </Alert>
      </Paper>
    );
  }

  if (chartData.counts.every(count => count === 0)) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: 'white',
          mb: 3,
        }}>
        <Typography variant="h6" color="text.secondary">
          No overdue invoices in the last 12 months
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: 'white',
        mb: 3,
      }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Monthly Overdue Invoices - Last 12 Months
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: chartData.labels,
              label: 'Month',
            },
          ]}
          yAxis={[
            {
              label: 'Number of Overdue Invoices',
            },
          ]}
          series={[
            {
              data: chartData.counts,
              label: 'Overdue Count',
              color: '#D32F2F', // Red color for overdue
            },
          ]}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
          margin={{ top: 20, right: 20, bottom: 80, left: 80 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This chart shows the number of invoices that became overdue in each month based on their due date.
      </Typography>
    </Paper>
  );
};

export default OverdueMonthlyChart;
