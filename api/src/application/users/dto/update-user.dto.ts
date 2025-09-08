import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    IsArray,
    ArrayMinSize,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsHoneycombEmail } from '../../common/validators/is-honeycomb-email.decorator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'Email address of the user (must be from @honeycombsoft.com domain)',
        example: 'updated@honeycombsoft.com',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsEmail()
    @IsHoneycombEmail()
    @MaxLength(255)
    email?: string;

    @ApiProperty({
        description: 'External identity provider subject ID',
        example: 'auth0|123456789',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    subId?: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({
        description: 'List of role IDs to assign to the user',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        required: false,
        minItems: 1,
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    roleIds?: string[];
}
