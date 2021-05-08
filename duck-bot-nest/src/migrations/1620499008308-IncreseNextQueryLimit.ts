import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreseNextQueryLimit1620499008308 implements MigrationInterface {
  name = 'IncreseNextQueryLimit1620499008308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "UQ_89dfa37848e4d268927ac5e875e"`);
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "query" TYPE varchar(100)`);
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "next" TYPE varchar(300)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" ALTER COLUMN "next" TYPE varchar(200) USING substr("next", 1, 200)`,
    );
    await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "query" TYPE varchar(50) USING substr("next", 1, 50)`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "UQ_89dfa37848e4d268927ac5e875e" UNIQUE ("key")`);
  }
}
