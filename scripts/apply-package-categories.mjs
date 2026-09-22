/**
 * Non-interactive schema application for the Package Categories feature.
 * Creates `package_categories` and adds `packages.category_id` (FK, ON DELETE SET NULL).
 * Idempotent — safe to re-run. Usage: node scripts/apply-package-categories.mjs
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL('../env.local', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let value = t.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* env.local optional */ }
}
loadEnvLocal();

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'bht_travel_db';

const CREATE_TABLE_SQL = [
  'CREATE TABLE IF NOT EXISTS `package_categories` (',
  '  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,',
  "  `type` enum('umrah','hajj') NOT NULL DEFAULT 'umrah',",
  '  `name` varchar(120) NOT NULL,',
  '  `slug` varchar(120) NOT NULL,',
  '  `description` varchar(255),',
  '  `display_order` int NOT NULL DEFAULT 0,',
  '  `is_published` boolean NOT NULL DEFAULT true,',
  '  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,',
  '  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,',
  '  UNIQUE KEY `package_categories_slug_unique` (`slug`)',
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;',
].join('\n');

const ADD_COLUMN_SQL = [
  'ALTER TABLE `packages`',
  '  ADD COLUMN `category_id` int NULL,',
  '  ADD CONSTRAINT `packages_category_id_package_categories_id_fk`',
  '    FOREIGN KEY (`category_id`) REFERENCES `package_categories`(`id`) ON DELETE SET NULL;',
].join('\n');

async function main() {
  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  console.log('Connected to MySQL ' + host + ':' + port + '/' + database);

  await conn.query(CREATE_TABLE_SQL);
  console.log('OK: table `package_categories` is present');

  const [cols] = await conn.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'packages' AND COLUMN_NAME = 'category_id'",
    [database]
  );
  if (cols.length === 0) {
    await conn.query(ADD_COLUMN_SQL);
    console.log('OK: column `packages.category_id` added with FK (ON DELETE SET NULL)');
  } else {
    console.log('SKIP: column `packages.category_id` already exists');
  }

  const [verifyCol] = await conn.query("SHOW COLUMNS FROM `packages` LIKE 'category_id'");
  const [verifyTbl] = await conn.query("SHOW TABLES LIKE 'package_categories'");
  console.log('Verify: table=' + (verifyTbl.length === 1 ? 'OK' : 'MISSING') + ', column=' + (verifyCol.length === 1 ? 'OK' : 'MISSING'));

  await conn.end();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to apply package categories schema:', err.message);
  process.exit(1);
});