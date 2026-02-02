import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { USER_COMMANDS } from './interfaces/user-commands.interface';
import { USER_QUERIES } from './interfaces/user-queries.interface';
import { S3StorageService } from '../../infrastructure/storage/s3-storage.service';

@Module({
    providers: [
        {
            provide: USER_COMMANDS,
            useClass: UserCommands,
        },
        {
            provide: USER_QUERIES,
            useClass: UserQueries,
        },
        S3StorageService,
    ],
    exports: [USER_COMMANDS, USER_QUERIES],
})
export class UserModule {}
