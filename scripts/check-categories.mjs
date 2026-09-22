/**
 * Diagnostic: check package_categories rows and packages.category_id assignments.
 * Usage: node scripts/check-categories.mjs
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

async function main() {
  const conn = await mysql.createConnection({ host, port, user, password, database });
  console.log('Connected to MySQL ' + host + ':' + port + '/' + database);

  const [cats] = await conn.query('SELECT id, type, name, slug, is_published FROM package_categories ORDER BY type, display_order, name');
  console.log('\n=== package_categories ===');
  for (const c of cats) {
    console.log(`id=${c.id} type=${c.type} name="${c.name}" slug=${c.slug} published=${c.is_published}`);
  }

  const [pkgs] = await conn.query('SELECT id, type, title, category_id FROM packages ORDER BY id');
  console.log('\n=== packages (id, type, title, category_id) ===');
  for (const p of pkgs) {
    console.log(`id=${p.id} type=${p.type} category_id=${p.category_id} title="${p.title}"`);
  }

  const [counts] = await conn.query(
    'SELECT pc.id, pc.name, COUNT(p.id) AS cnt FROM package_categories pc LEFT JOIN packages p ON p.category_id = pc.id GROUP BY pc.id, pc.name ORDER BY pc.id'
  );
  console.log('\n=== counts per category ===');
  for (const c of counts) {
    console.log(`id=${c.id} name="${c.name}" packages=${c.cnt}`);
  }

  await conn.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});