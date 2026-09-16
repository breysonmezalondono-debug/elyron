import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { mysqlSslOptions } from './src/database/ssl-options';

dotenv.config();

// DataSource para el CLI de TypeORM (generar/ejecutar migraciones).
// Se conecta con las mismas variables que la app. NO usa synchronize.
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'elyron',
  password: process.env.DB_PASSWORD || 'elyron123',
  database: process.env.DB_NAME || 'elyron_db',
  charset: 'utf8mb4',
  timezone: 'Z',
  synchronize: false,
  ssl: mysqlSslOptions(),
  migrations: [
    join(process.cwd(), 'src', 'database', 'migrations', '*.{ts,js}'),
  ],
});
