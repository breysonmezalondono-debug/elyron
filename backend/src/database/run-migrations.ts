import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

/**
 * Ejecuta las migraciones pendientes de TypeORM de forma programática.
 * Alternativa robusta al CLI (que falla en Windows con ts-node).
 * Uso: npm run db:migrate   (aplica pendientes)
 *      DB_ACTION=revert npm run db:migrate  (revierte la última)
 */
dotenv.config();

async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || 'elyron',
    password: process.env.DB_PASSWORD || 'elyron123',
    database: process.env.DB_NAME || 'elyron_db',
    charset: 'utf8mb4',
    timezone: 'Z',
    synchronize: false,
    extra: { multipleStatements: true },
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  });
  await dataSource.initialize();

  const action = process.env.DB_ACTION || 'migrate';
  if (action === 'revert') {
    await dataSource.undoLastMigration();
    console.log('Última migración revertida');
  } else {
    const pending = await dataSource.runMigrations({ transaction: 'all' });
    console.log(`Migraciones ejecutadas: ${pending.length}`);
    pending.forEach((m) => console.log(`  - ${m.name}`));
  }
  await dataSource.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en migración:', err?.message ?? err);
    process.exit(1);
  });
