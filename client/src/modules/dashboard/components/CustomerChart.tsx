import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { CustomerData } from '../types/dashboard';

interface CustomerChartProps {
  data: CustomerData[];
  onCustomerClick: (customerName: string) => void;
  timePeriodLabel: string;
}

const CustomerChart: React.FC<CustomerChartProps> = ({ data, onCustomerClick, timePeriodLabel }) => {
  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'white',
        }}>
        <Typography variant="h6" color="text.secondary">
          No invoice data available for the selected time period
        </Typography>
      </Paper>
    );
  }

  const customerNames = data.map((item) => item.customerName);
  const amounts = data.map((item) => item.totalAmount);

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: 'white',
      }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Customer Totals - {timePeriodLabel}
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: customerNames,
              label: 'Customers',
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
              color: '#9C27B0',
            },
          ]}
          onAxisClick={(event, axisData) => {
            if (axisData && axisData.axisValue !== undefined) {
              const clickedCustomer = customerNames[axisData.dataIndex || 0];
              if (clickedCustomer) {
                onCustomerClick(clickedCustomer);
              }
            }
          }}
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

export default CustomerChart;
