import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolePermissions1770000000000 implements MigrationInterface {
    name = 'AddRolePermissions1770000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."role_permissions_resource_enum" AS ENUM('users','invoices','tenants','secrets')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."role_permissions_action_enum" AS ENUM('create','read','update','delete')`,
        );
        await queryRunner.query(
            `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "resource" "public"."role_permissions_resource_enum" NOT NULL, "action" "public"."role_permissions_action_enum" NOT NULL, CONSTRAINT "UQ_role_permission" UNIQUE ("role_id","resource","action"), CONSTRAINT "PK_role_permissions" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id","resource","action")
            SELECT r.id, res.resource, act.action FROM "roles" r
            CROSS JOIN (VALUES ('users'),('invoices'),('tenants'),('secrets')) AS res(resource)
            CROSS JOIN (VALUES ('create'),('read'),('update'),('delete')) AS act(action)
            WHERE r.name = 'Super Admin' ON CONFLICT DO NOTHING`);
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id","resource","action")
            SELECT r.id, res.resource, act.action FROM "roles" r
            CROSS JOIN (VALUES ('users'),('secrets'),('invoices')) AS res(resource)
            CROSS JOIN (VALUES ('create'),('read'),('update'),('delete')) AS act(action)
            WHERE r.name = 'Admin' ON CONFLICT DO NOTHING`);
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id","resource","action")
            SELECT r.id, 'invoices', act.action FROM "roles" r
            CROSS JOIN (VALUES ('read'),('create')) AS act(action)
            WHERE r.name = 'User' ON CONFLICT DO NOTHING`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`,
        );
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_resource_enum"`);
    }
}
