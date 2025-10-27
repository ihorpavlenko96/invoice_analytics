import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    invoiceStatus: {
      paid: string;
      unpaid: string;
      overdue: string;
    };
  }
  interface PaletteOptions {
    invoiceStatus?: {
      paid?: string;
      unpaid?: string;
      overdue?: string;
    };
  }
}
