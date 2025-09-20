import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMiddleNameRequired1758391425795 implements MigrationInterface {
    name = 'MakeMiddleNameRequired1758391425795';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Set a default value for existing NULL middleName entries before making it non-nullable
        await queryRunner.query(`UPDATE "users" SET "middleName" = '' WHERE "middleName" IS NULL`);

        // Make the middleName column non-nullable
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "middleName" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Make the middleName column nullable again
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "middleName" DROP NOT NULL`);
    }
}
