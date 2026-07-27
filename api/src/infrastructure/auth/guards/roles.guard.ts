import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { ROLES_KEY, PERMISSIONS_KEY, RequiredPermission } from '../decorators/authorize.decorator';
import {
    IPermissionsQueries,
    PERMISSIONS_QUERIES,
} from '../../../application/roles/interfaces/permissions-queries.interface';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

interface RequestWithUserRoles extends Request {
    userRoles?: RoleName[];
}

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(
        private reflector: Reflector,
        @Inject(PERMISSIONS_QUERIES) private readonly permissionsQueries: IPermissionsQueries,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            const request: RequestWithUserRoles = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userRoles = claims.roles as RoleName[] | undefined;

            if (!userRoles) {
                throw new ForbiddenException('User roles not found.');
            }

            request.userRoles = userRoles;

            if (requiredRoles && requiredRoles.length > 0) {
                const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

                if (!hasRequiredRole) {
                    throw new ForbiddenException('Insufficient permissions');
                }
            }

            const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
                PERMISSIONS_KEY,
                [context.getHandler(), context.getClass()],
            );

            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }

            if (userRoles.includes(RoleName.SUPER_ADMIN)) {
                return true;
            }

            for (const permission of requiredPermissions) {
                const allowed = await this.permissionsQueries.isActionAllowed(
                    userRoles,
                    permission.resource,
                    permission.action,
                );

                if (!allowed) {
                    throw new ForbiddenException('Insufficient permissions');
                }
            }
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown authentication error');
            this.logger.error(`Authentication error: ${message}`);

            return false;
        }

        return true;
    }
}
