import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from '../../api/controllers/analytics.controller';
import { ANALYTICS_SERVICE } from './interfaces/analytics.service.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice])],
    controllers: [AnalyticsController],
    providers: [
        InvoiceRepository,
        {
            provide: ANALYTICS_SERVICE,
            useClass: AnalyticsService,
        },
    ],
    exports: [ANALYTICS_SERVICE],
})
export class AnalyticsModule {}
