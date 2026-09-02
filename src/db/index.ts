import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'kingtravel_db';
const useSsl = process.env.DB_SSL?.toLowerCase() === 'true';

const globalForDb = globalThis as unknown as {
  poolConnection?: mysql.Pool;
};

// Reuse connection pool across Next.js Hot Module Reloads to prevent ER_CON_COUNT_ERROR
const poolConnection =
  globalForDb.poolConnection ||
  mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.poolConnection = poolConnection;
}

export const db = drizzle(poolConnection, { schema, mode: 'default' });
