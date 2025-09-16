import { TenantDto } from '../dto/tenant.dto';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BulkUpdateTenantDto } from '../dto/bulk-update-tenant.dto';
import { BulkUpdateResultDto } from '../dto/bulk-update-result.dto';

export interface ITenantCommands {
    createTenant(input: CreateTenantDto): Promise<TenantDto>;
    updateTenant(id: string, input: UpdateTenantDto): Promise<TenantDto>;
    deleteTenant(id: string): Promise<void>;
    bulkUpdateTenants(input: BulkUpdateTenantDto): Promise<BulkUpdateResultDto>;
}

export const TENANT_COMMANDS = 'ITenantCommands';
