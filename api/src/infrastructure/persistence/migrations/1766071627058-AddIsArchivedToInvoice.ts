import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsArchivedToInvoice1766071627058 implements MigrationInterface {
    name = 'AddIsArchivedToInvoice1766071627058';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "invoices" ADD "isArchived" boolean NOT NULL DEFAULT false`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "isArchived"`);
    }
}
