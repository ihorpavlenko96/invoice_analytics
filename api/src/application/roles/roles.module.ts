import { Module } from '@nestjs/common';
import { RolesQueries } from './roles.queries';
import { RolesCommands } from './roles.commands';
import { ROLES_QUERIES } from './interfaces/roles-queries.interface';
import { ROLES_COMMANDS } from './interfaces/roles-commands.interface';

@Module({
    providers: [
        { provide: ROLES_QUERIES, useClass: RolesQueries },
        { provide: ROLES_COMMANDS, useClass: RolesCommands },
    ],
    exports: [ROLES_QUERIES, ROLES_COMMANDS],
})
export class RolesModule {}
