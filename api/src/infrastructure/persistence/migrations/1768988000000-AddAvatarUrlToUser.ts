import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToUser1768988000000 implements MigrationInterface {
    name = 'AddAvatarUrlToUser1768988000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    }
}
