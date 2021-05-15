import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseSessionNextLength1620017979281 implements MigrationInterface {
  name = 'IncreaseSessionNextLength1620017979281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "next"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "next" character varying(200)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "next"`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD "next" character varying(100)`);
  }
}
