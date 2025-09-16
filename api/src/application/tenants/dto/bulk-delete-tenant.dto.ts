import { IsArray, IsUUID } from 'class-validator';

export class BulkDeleteTenantDto {
    @IsArray()
    @IsUUID('4', { each: true })
    ids: string[];
}
