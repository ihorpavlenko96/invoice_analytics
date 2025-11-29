import axios from 'axios';
import { Invoice } from '../types/invoice';

export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const invoiceService = {
  /**
   * Get all invoices with pagination
   * @param page - Page number (starts at 1)
   * @param limit - Number of items per page
   * @param status - Optional status filter (PAID, UNPAID, OVERDUE)
   * @returns Promise<PaginatedResponseDto<Invoice>>
   */
  getInvoices: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<PaginatedResponseDto<Invoice>> => {
    try {
      const response = await axios.get<PaginatedResponseDto<Invoice>>('/invoices', {
        params: {
          page,
          limit,
          ...(status && { status }),
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
      }
      throw new Error('An unexpected error occurred while fetching invoices');
    }
  },

  /**
   * Get a specific invoice by ID
   * @param id - Invoice ID
   * @returns Promise<Invoice>
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await axios.get<Invoice>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Invoice not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
      }
      throw new Error('An unexpected error occurred while fetching invoice');
    }
  },

  /**
   * Delete an invoice by ID
   * @param id - Invoice ID
   * @returns Promise<void>
   */
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/invoices/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Invoice not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete invoice');
      }
      throw new Error('An unexpected error occurred while deleting invoice');
    }
  },

  /**
   * Delete multiple invoices by their IDs
   * @param ids - Array of invoice IDs
   * @returns Promise<void>
   */
  deleteMultipleInvoices: async (ids: string[]): Promise<void> => {
    try {
      await axios.delete('/invoices/bulk', { data: { ids } });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete invoices');
      }
      throw new Error('An unexpected error occurred while deleting invoices');
    }
  },

  /**
   * Import an invoice from a file
   * @param file - Invoice file (XLSX)
   * @returns Promise<void>
   */
  importInvoice: async (file: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('/invoices/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to import invoice');
      }
      throw new Error('An unexpected error occurred while importing invoice');
    }
  },

  /**
   * Export all invoices to Excel file (ignores pagination)
   * @param status - Optional status filter (PAID, UNPAID, OVERDUE)
   * @returns Promise<Blob>
   */
  exportInvoices: async (status?: string): Promise<Blob> => {
    try {
      const response = await axios.get('/invoices/export/excel', {
        params: {
          ...(status && { status }),
        },
        responseType: 'blob',
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('No invoices found to export');
        }
        if (error.response?.data instanceof Blob) {
          // Try to parse error message from blob
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || 'Failed to export invoices');
          } catch {
            throw new Error('Failed to export invoices');
          }
        }
        throw new Error(error.response?.data?.message || 'Failed to export invoices');
      }
      throw new Error('An unexpected error occurred while exporting invoices');
    }
  },
};
