import { MigrationInterface, QueryRunner } from 'typeorm';

export class limitChanges1620000581993 implements MigrationInterface {
  name = 'limitChanges1620000581993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "UQ_89dfa37848e4d268927ac5e875e" UNIQUE ("key")`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "vqd"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "vqd" character varying(150)`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "next"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "next" character varying(100)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "next"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "next" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "vqd"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "vqd" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "UQ_89dfa37848e4d268927ac5e875e"`);
  }
}
