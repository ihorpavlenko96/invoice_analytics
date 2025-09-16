import { TenantDto } from '../dto/tenant.dto';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BulkDeleteTenantsDto } from '../dto/bulk-delete-tenants.dto';

export interface ITenantCommands {
    createTenant(input: CreateTenantDto): Promise<TenantDto>;
    updateTenant(id: string, input: UpdateTenantDto): Promise<TenantDto>;
    deleteTenant(id: string): Promise<void>;
    bulkDeleteTenants(input: BulkDeleteTenantsDto): Promise<void>;
}

export const TENANT_COMMANDS = 'ITenantCommands';
