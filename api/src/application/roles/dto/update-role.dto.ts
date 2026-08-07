import { IsString, IsNotEmpty, MaxLength, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
    @ApiProperty({ required: false, maxLength: 100 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    permissionIds?: string[];
}
