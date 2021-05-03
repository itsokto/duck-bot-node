import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1619992607336 implements MigrationInterface {
  name = 'init1619992607336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("key" character varying(50) NOT NULL, "query" character varying(50), "vqd" character varying(50), "next" character varying(50), "strict" integer NOT NULL DEFAULT '-1', CONSTRAINT "key" UNIQUE ("key"), CONSTRAINT "PK_89dfa37848e4d268927ac5e875e" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_89dfa37848e4d268927ac5e875" ON "sessions" ("key") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_89dfa37848e4d268927ac5e875"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
