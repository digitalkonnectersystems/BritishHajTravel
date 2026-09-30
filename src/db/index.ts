import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'bht_travel_db';
const useSsl = process.env.DB_SSL?.toLowerCase() === 'true';

const globalForDb = globalThis as unknown as {
  poolConnection?: mysql.Pool;
};

/**
 * IMPORTANT:
 * Vercel/serverless can create multiple application instances.
 * Do not allow every instance to open 10 DB connections.
 */
const connectionLimit = Math.max(
  1,
  Number(process.env.DB_CONNECTION_LIMIT || (process.env.VERCEL ? 2 : 5))
);

const poolConnection =
  globalForDb.poolConnection ||
  mysql.createPool({
    host,
    port,
    user,
    password,
    database,

    ssl: useSsl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,

    waitForConnections: true,

    // Keep serverless connection usage low
    connectionLimit,
    maxIdle: connectionLimit,

    idleTimeout: 30000,

    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    connectTimeout: 10000,
  });

/**
 * Reuse the pool whenever the same server instance stays warm.
 * Do this in production too.
 */
globalForDb.poolConnection = poolConnection;

export const db = drizzle(poolConnection, {
  schema,
  mode: 'default',
});