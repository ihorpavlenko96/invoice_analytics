import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingContactToTenant1757341000000 implements MigrationInterface {
    name = 'AddBillingContactToTenant1757341000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tenants" ADD "billingContact" character varying(255)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "billingContact"`);
    }
}
