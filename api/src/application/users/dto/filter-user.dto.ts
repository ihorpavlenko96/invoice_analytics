import { IsOptional, IsDateString, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUserDto {
    @ApiProperty({
        description: 'Filter by email address',
        required: false,
        example: 'john@example.com'
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'Filter by first or last name (partial match)',
        required: false,
        example: 'John'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Filter by role name',
        required: false,
        example: 'Admin'
    })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({
        description: 'Filter by user status (active/inactive)',
        required: false,
        example: 'active'
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({
        description: 'Filter by created date from (ISO date string)',
        required: false,
        example: '2023-01-01T00:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    createdFrom?: string;

    @ApiProperty({
        description: 'Filter by created date to (ISO date string)',
        required: false,
        example: '2023-12-31T23:59:59.999Z'
    })
    @IsOptional()
    @IsDateString()
    createdTo?: string;
}