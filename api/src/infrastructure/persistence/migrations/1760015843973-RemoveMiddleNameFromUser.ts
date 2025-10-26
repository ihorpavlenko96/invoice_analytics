import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMiddleNameFromUser1760015843973 implements MigrationInterface {
    name = 'RemoveMiddleNameFromUser1760015843973';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "middleName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "middleName" character varying(50)`);
    }
}
