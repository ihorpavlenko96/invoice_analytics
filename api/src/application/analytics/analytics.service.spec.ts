import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { InvoiceRepository } from '../repositories/invoice.repository';

describe('AnalyticsService', () => {
    let service: AnalyticsService;
    let mockInvoiceRepository: jest.Mocked<InvoiceRepository>;

    beforeEach(async () => {
        const mockRepository = {
            getSummaryAnalytics: jest.fn(),
            getStatusDistribution: jest.fn(),
            getMonthlyTrends: jest.fn(),
            getTopVendors: jest.fn(),
            getTopCustomers: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                {
                    provide: InvoiceRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<AnalyticsService>(AnalyticsService);
        mockInvoiceRepository = module.get(InvoiceRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSummaryAnalytics', () => {
        it('should return summary analytics with parsed numbers', async () => {
            const mockData = {
                totalInvoices: '10',
                totalInvoicedAmount: '5000.50',
                totalPaidAmount: '3000.25',
                totalOverdueAmount: '1500.75',
                paidCount: '8',
                overdueCount: '2',
            };

            mockInvoiceRepository.getSummaryAnalytics.mockResolvedValue(mockData);

            const result = await service.getSummaryAnalytics('tenant-1');

            expect(result).toEqual({
                totalInvoices: 10,
                totalInvoicedAmount: 5000.5,
                totalPaidAmount: 3000.25,
                totalOverdueAmount: 1500.75,
                paidCount: 8,
                overdueCount: 2,
            });
            expect(mockInvoiceRepository.getSummaryAnalytics).toHaveBeenCalledWith(
                'tenant-1',
                undefined,
            );
        });

        it('should handle null values gracefully', async () => {
            const mockData = {
                totalInvoices: null,
                totalInvoicedAmount: null,
                totalPaidAmount: null,
                totalOverdueAmount: null,
                paidCount: null,
                overdueCount: null,
            };

            mockInvoiceRepository.getSummaryAnalytics.mockResolvedValue(mockData);

            const result = await service.getSummaryAnalytics('tenant-1');

            expect(result).toEqual({
                totalInvoices: 0,
                totalInvoicedAmount: 0,
                totalPaidAmount: 0,
                totalOverdueAmount: 0,
                paidCount: 0,
                overdueCount: 0,
            });
        });
    });

    describe('getStatusDistribution', () => {
        it('should return status distribution with parsed numbers', async () => {
            const mockData = [
                { status: 'PAID', count: '5', totalAmount: '3000.50' },
                { status: 'UNPAID', count: '3', totalAmount: '1500.25' },
                { status: 'OVERDUE', count: '2', totalAmount: '500.75' },
            ];

            mockInvoiceRepository.getStatusDistribution.mockResolvedValue(mockData);

            const result = await service.getStatusDistribution('tenant-1');

            expect(result).toEqual({
                distribution: [
                    { status: 'PAID', count: 5, totalAmount: 3000.5 },
                    { status: 'UNPAID', count: 3, totalAmount: 1500.25 },
                    { status: 'OVERDUE', count: 2, totalAmount: 500.75 },
                ],
            });
        });
    });

    describe('getMonthlyTrends', () => {
        it('should return monthly trends with parsed numbers', async () => {
            const mockData = [
                { year: '2023', month: '12', totalAmount: '5000.50', invoiceCount: '10' },
                { year: '2023', month: '11', totalAmount: '3000.25', invoiceCount: '8' },
            ];

            mockInvoiceRepository.getMonthlyTrends.mockResolvedValue(mockData);

            const result = await service.getMonthlyTrends('tenant-1');

            expect(result).toEqual({
                trends: [
                    { year: 2023, month: 12, totalAmount: 5000.5, invoiceCount: 10 },
                    { year: 2023, month: 11, totalAmount: 3000.25, invoiceCount: 8 },
                ],
            });
        });
    });

    describe('getTopVendors', () => {
        it('should return top vendors with parsed numbers', async () => {
            const mockData = [
                { name: 'Vendor A', totalAmount: '5000.50', invoiceCount: '5' },
                { name: 'Vendor B', totalAmount: '3000.25', invoiceCount: '3' },
            ];

            mockInvoiceRepository.getTopVendors.mockResolvedValue(mockData);

            const result = await service.getTopVendors('tenant-1');

            expect(result).toEqual({
                topVendors: [
                    { name: 'Vendor A', totalAmount: 5000.5, invoiceCount: 5 },
                    { name: 'Vendor B', totalAmount: 3000.25, invoiceCount: 3 },
                ],
            });
        });
    });

    describe('getTopCustomers', () => {
        it('should return top customers with parsed numbers', async () => {
            const mockData = [
                { name: 'Customer A', totalAmount: '4000.75', invoiceCount: '4' },
                { name: 'Customer B', totalAmount: '2500.50', invoiceCount: '2' },
            ];

            mockInvoiceRepository.getTopCustomers.mockResolvedValue(mockData);

            const result = await service.getTopCustomers('tenant-1');

            expect(result).toEqual({
                topCustomers: [
                    { name: 'Customer A', totalAmount: 4000.75, invoiceCount: 4 },
                    { name: 'Customer B', totalAmount: 2500.5, invoiceCount: 2 },
                ],
            });
        });
    });

    describe('with filters', () => {
        it('should pass filters to repository methods', async () => {
            const filters = { from: '2023-01-01', to: '2023-12-31' };

            mockInvoiceRepository.getSummaryAnalytics.mockResolvedValue({
                totalInvoices: '5',
                totalInvoicedAmount: '2500.00',
                totalPaidAmount: '1500.00',
                totalOverdueAmount: '1000.00',
                paidCount: '3',
                overdueCount: '2',
            });

            await service.getSummaryAnalytics('tenant-1', filters);

            expect(mockInvoiceRepository.getSummaryAnalytics).toHaveBeenCalledWith(
                'tenant-1',
                filters,
            );
        });
    });
});
