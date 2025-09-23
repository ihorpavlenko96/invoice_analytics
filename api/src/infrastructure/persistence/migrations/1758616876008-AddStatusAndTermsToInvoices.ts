import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusAndTermsToInvoices1758616876008 implements MigrationInterface {
    name = 'AddStatusAndTermsToInvoices1758616876008';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "invoices" ADD "status" character varying(50) NOT NULL DEFAULT 'UNPAID'`,
        );
        await queryRunner.query(`ALTER TABLE "invoices" ADD "terms" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "terms"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "status"`);
    }
}
