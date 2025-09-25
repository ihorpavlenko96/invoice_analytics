import { UserDto } from '../dto/user.dto';
import { FilterUserDto } from '../dto/filter-user.dto';

export interface IUserQueries {
    findAllUsersByTenant(tenantId: string, filters?: FilterUserDto): Promise<UserDto[]>;
    findAllUsers(filters?: FilterUserDto): Promise<UserDto[]>;
    findUserById(id: string, requestingUserTenantId?: string): Promise<UserDto>;
    findUserByEmail(email: string): Promise<UserDto | null>;
    findUserBySubId(subId: string): Promise<UserDto | null>;
}

export const USER_QUERIES = 'IUserQueries';
