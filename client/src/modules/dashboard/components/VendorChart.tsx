import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { VendorData } from '../types/dashboard';

interface VendorChartProps {
  data: VendorData[];
  onVendorClick: (vendorName: string) => void;
}

const VendorChart: React.FC<VendorChartProps> = ({ data, onVendorClick }) => {
  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'white',
        }}>
        <Typography variant="h6" color="text.secondary">
          No invoice data available for the past 30 days
        </Typography>
      </Paper>
    );
  }

  const vendorNames = data.map((item) => item.vendorName);
  const amounts = data.map((item) => item.totalAmount);

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: 'white',
      }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
        Vendor Totals - Last 30 Days
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: vendorNames,
              label: 'Vendors',
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
          onAxisClick={(event, axisData) => {
            if (axisData && axisData.axisValue !== undefined) {
              const clickedVendor = vendorNames[axisData.dataIndex || 0];
              if (clickedVendor) {
                onVendorClick(clickedVendor);
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

export default VendorChart;
