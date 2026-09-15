/* Genera el esquema inicial reproducible para producción.
   - Escribe src/database/migrations/initial-schema.sql (DDL plano, sin escapes)
   - Escribe src/database/migrations/<timestamp>-InitialSchema.ts que lo aplica
   Se usa UNA VEZ para convertir el esquema local (creado con synchronize)
   en una migración reproducible. No borra nada: solo lee. */
require('dotenv').config();
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);

const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\..+/, '')
  .replace(/[T]/g, '')
  .slice(0, 14);

const migrationsDir = path.join(
  __dirname,
  '..',
  'src',
  'database',
  'migrations',
);
const sqlFile = path.join(migrationsDir, 'initial-schema.sql');
const tsFile = path.join(migrationsDir, `${stamp}-InitialSchema.ts`);

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const port = String(process.env.DB_PORT || 3306);
  const user = process.env.DB_USERNAME;
  const pass = process.env.DB_PASSWORD;
  const db = process.env.DB_NAME;

  const args = [
    `--host=${host}`, `--port=${port}`, `--user=${user}`, `--password=${pass}`,
    `--no-data`, `--skip-comments`, `--routines`, `--no-tablespaces`, `--compact`,
    `--single-transaction`, db,
  ];

  const { stdout } = await execFileAsync('mysqldump', args, {
    timeout: 120000,
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });

  let cleaned = stdout
    .replace(/\/\*![0-9]{5}[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[^\n]*?\*\//g, '')
    .replace(/^\s*;\s*$/gm, '')
    .split('\n')
    .filter((l) => !/^\s*USE\s+/i.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const sql = `-- Migración inicial generada automáticamente desde el esquema local.\n-- Reproduce el DDL de las entidades de Elyron. No modificar a mano salvo revisión.\n\nSET FOREIGN_KEY_CHECKS = 0;\n${cleaned}\nSET FOREIGN_KEY_CHECKS = 1;\n`;

  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.writeFileSync(sqlFile, sql, 'utf8');

  const migration = `import { MigrationInterface, QueryRunner } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

export class InitialSchema${stamp} implements MigrationInterface {
  name = 'InitialSchema${stamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = readFileSync(join(__dirname, 'initial-schema.sql'), 'utf8');
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables: string[] = [];
    const rows: Array<Record<string, unknown>> = await queryRunner.query(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
    );
    for (const r of rows) {
      if (typeof r.name === 'string') tables.push(r.name);
    }
    for (const t of tables) {
      await queryRunner.query(\`DROP TABLE IF EXISTS \\\`\${t}\\\`\`).catch(() => undefined);
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}
`;

  fs.writeFileSync(tsFile, migration, 'utf8');
  console.log('SQL generado:', path.relative(process.cwd(), sqlFile), '(' + sql.length + ' bytes)');
  console.log('Migración generada:', path.relative(process.cwd(), tsFile));
}

main().catch((e) => {
  console.error('Error generando migración:', e.message);
  process.exit(1);
});