import { Module } from '@nestjs/common';
import { RolesQueries } from './roles.queries';
import { ROLES_QUERIES } from './interfaces/roles-queries.interface';
import { PermissionsQueries } from './permissions.queries';
import { PermissionsCommands } from './permissions.commands';
import { PERMISSIONS_QUERIES } from './interfaces/permissions-queries.interface';
import { PERMISSIONS_COMMANDS } from './interfaces/permissions-commands.interface';

@Module({
    providers: [
        {
            provide: ROLES_QUERIES,
            useClass: RolesQueries,
        },
        {
            provide: PERMISSIONS_QUERIES,
            useClass: PermissionsQueries,
        },
        {
            provide: PERMISSIONS_COMMANDS,
            useClass: PermissionsCommands,
        },
    ],
    exports: [ROLES_QUERIES, PERMISSIONS_QUERIES, PERMISSIONS_COMMANDS],
})
export class RolesModule {}
