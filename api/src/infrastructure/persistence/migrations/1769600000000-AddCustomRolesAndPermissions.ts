import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomRolesAndPermissions1769600000000 implements MigrationInterface {
    name = 'AddCustomRolesAndPermissions1769600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "roles" ALTER COLUMN "name" TYPE character varying(100) USING "name"::text`,
        );
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);

        await queryRunner.query(
            `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" character varying(100) NOT NULL, "action" character varying(100) NOT NULL, CONSTRAINT "UQ_permissions_resource_action" UNIQUE ("resource", "action"), CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "role_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_role_permissions_role" ON "role_permissions" ("role_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_role_permissions_permission" ON "role_permissions" ("permission_id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );

        await queryRunner.query(
            `INSERT INTO "permissions" ("resource", "action")
SELECT r, a
FROM unnest(ARRAY['users','invoices','secrets','tenants','roles']) AS r
CROSS JOIN unnest(ARRAY['create','read','update','delete']) AS a
ON CONFLICT ("resource", "action") DO NOTHING`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`,
        );
        await queryRunner.query(
            `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`,
        );
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(
            `CREATE TYPE "public"."roles_name_enum" AS ENUM('Super Admin', 'Admin', 'User')`,
        );
        await queryRunner.query(
            `ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum" USING "name"::"public"."roles_name_enum"`,
        );
    }
}
