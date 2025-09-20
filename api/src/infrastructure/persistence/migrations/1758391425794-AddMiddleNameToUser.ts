import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMiddleNameToUser1758391425794 implements MigrationInterface {
    name = 'AddMiddleNameToUser1758391425794';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "middleName" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "middleName"`);
    }
}
