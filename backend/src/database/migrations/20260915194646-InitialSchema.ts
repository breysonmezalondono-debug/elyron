import { MigrationInterface, QueryRunner } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

export class InitialSchema20260915194646 implements MigrationInterface {
  name = 'InitialSchema20260915194646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = readFileSync(join(__dirname, 'initial-schema.sql'), 'utf8');
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables: string[] = [];
    const rows: Array<Record<string, unknown>> = await queryRunner.query(
      'SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()',
    );
    for (const r of rows) {
      if (typeof r.name === 'string') tables.push(r.name);
    }
    for (const t of tables) {
      await queryRunner
        .query(`DROP TABLE IF EXISTS \`${t}\``)
        .catch(() => undefined);
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}
