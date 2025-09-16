import { IsOptional, IsString, MaxLength } from 'class-validator';
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
        description: 'Alias of the tenant',
        example: 'updated-corp',
        required: false,
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    alias?: string;
}
