import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT || '3306');
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;

if (
  !databaseUrl &&
  (!host || !user || !password || !database)
) {
  throw new Error(
    'Missing database environment variables. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD and DB_NAME.'
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: databaseUrl
    ? { url: databaseUrl }
    : {
        host: host!,
        port,
        user: user!,
        password: password!,
        database: database!,
      },
});