import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFirstNameRequired1760015843972 implements MigrationInterface {
    name = 'MakeFirstNameRequired1760015843972';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Set a default value for existing NULL firstName entries before making it non-nullable
        await queryRunner.query(`UPDATE "users" SET "firstName" = '' WHERE "firstName" IS NULL`);

        // Make the firstName column non-nullable
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Make the firstName column nullable again
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL`);
    }
}
