import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyToInvoices1758616876009 implements MigrationInterface {
    name = 'AddCurrencyToInvoices1758616876009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "invoices" ADD "currency" character varying(3) NOT NULL DEFAULT 'USD'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "currency"`);
    }
}