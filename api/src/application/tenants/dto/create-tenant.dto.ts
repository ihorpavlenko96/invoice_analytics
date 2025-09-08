import {
    IsNotEmpty,
    IsString,
    MaxLength,
    Matches,
    IsLowercase,
    IsOptional,
    IsEmail,
} from 'class-validator';
import { ALIAS_PATTERN } from '../../../domain/constants/validation-patterns.const';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Acme Corporation',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description:
            'Unique alias used for tenant identification, must be lowercase alphanumeric with hyphens',
        example: 'acme-corp',
        maxLength: 50,
        pattern: ALIAS_PATTERN.toString(),
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @IsLowercase()
    @Matches(ALIAS_PATTERN, {
        message: 'Alias must be lowercase alphanumeric with hyphens and no leading/trailing hyphen',
    })
    alias: string;

    @ApiProperty({
        description: 'Billing contact email address',
        example: 'billing@acme-corp.com',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    billingContact?: string;
}
