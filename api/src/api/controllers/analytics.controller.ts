import {
    Controller,
    Get,
    Query,
    Req,
    Inject,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ANALYTICS_SERVICE,
    IAnalyticsService,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsFiltersDto } from '../../application/analytics/dto/analytics-filters.dto';
import { SummaryAnalyticsDto } from '../../application/analytics/dto/summary-analytics.dto';
import { StatusDistributionDto } from '../../application/analytics/dto/status-distribution.dto';
import { MonthlyTrendsDto } from '../../application/analytics/dto/monthly-trends.dto';
import { TopVendorsDto, TopCustomersDto } from '../../application/analytics/dto/top-entities.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(@Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService) {}

    @Get('summary')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get summary analytics',
        description: 'Returns totals (number of invoices, total invoiced amount, total overdue, total paid)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Summary analytics retrieved successfully',
        type: SummaryAnalyticsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getSummaryAnalytics(
        @Req() request: RequestWithTenant,
        @Query() filters: AnalyticsFiltersDto,
    ): Promise<SummaryAnalyticsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getSummaryAnalytics(tenantId, filters);
    }

    @Get('status-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get status distribution analytics',
        description: 'Returns count of invoices by status (Active, Overdue, Paid)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Status distribution analytics retrieved successfully',
        type: StatusDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getStatusDistribution(
        @Req() request: RequestWithTenant,
        @Query() filters: AnalyticsFiltersDto,
    ): Promise<StatusDistributionDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getStatusDistribution(tenantId, filters);
    }

    @Get('monthly-trends')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get monthly trends analytics',
        description: 'Returns sum of invoice amounts grouped by issue date (month/year)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Monthly trends analytics retrieved successfully',
        type: MonthlyTrendsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getMonthlyTrends(
        @Req() request: RequestWithTenant,
        @Query() filters: AnalyticsFiltersDto,
    ): Promise<MonthlyTrendsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getMonthlyTrends(tenantId, filters);
    }

    @Get('top-vendors')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top vendors analytics',
        description: 'Returns top 5 vendors by invoice amount',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top vendors analytics retrieved successfully',
        type: TopVendorsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTopVendors(
        @Req() request: RequestWithTenant,
        @Query() filters: AnalyticsFiltersDto,
    ): Promise<TopVendorsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getTopVendors(tenantId, filters);
    }

    @Get('top-customers')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top customers analytics',
        description: 'Returns top 5 customers by invoice amount',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top customers analytics retrieved successfully',
        type: TopCustomersDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTopCustomers(
        @Req() request: RequestWithTenant,
        @Query() filters: AnalyticsFiltersDto,
    ): Promise<TopCustomersDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getTopCustomers(tenantId, filters);
    }
}