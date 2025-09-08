import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantDto {
    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Updated Corporation Name',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'Billing contact email address',
        example: 'billing@updated-corp.com',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    billingContact?: string;
}
