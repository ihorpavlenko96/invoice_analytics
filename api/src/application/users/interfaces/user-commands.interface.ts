import { CreateUserDto, CreateUserBySuperAdminDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';

export interface IUserCommands {
    createUser(dto: CreateUserDto, tenantId: string): Promise<UserDto>;
    createUserBySuperAdmin(dto: CreateUserBySuperAdminDto): Promise<UserDto>;
    updateUser(
        id: string,
        dto: UpdateUserDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<UserDto>;
    deleteUser(id: string, requestingUserTenantId?: string, isSuperAdmin?: boolean): Promise<void>;
    activateUser(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    deactivateUser(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    uploadAvatar(
        userId: string,
        file: Buffer,
        originalFilename: string,
        contentType: string,
        requestingUserId: string,
    ): Promise<UserDto>;
}

export const USER_COMMANDS = 'IUserCommands';
