import { defineConfig } from 'drizzle-kit';

const host = process.env.DB_HOST || '156.67.75.79';
const port = process.env.DB_PORT || '3306';
const user = process.env.DB_USER || 'u346222341_dksdev';
const password = process.env.DB_PASSWORD || 'Dks@78600';
const database = process.env.DB_NAME || 'u346222341_BHTNEXT';

const connectionUrl = process.env.DATABASE_URL || `mysql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: connectionUrl,
  },
});
