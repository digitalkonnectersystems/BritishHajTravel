import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE site_pages ADD COLUMN seo_settings json;`);
    console.log('Added seo_settings to site_pages');
  } catch (e: any) {
    console.error(e.message);
  }
  
  try {
    await db.execute(sql`ALTER TABLE packages ADD COLUMN seo_settings json;`);
    console.log('Added seo_settings to packages');
  } catch (e: any) {
    console.error(e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE visa_services ADD COLUMN seo_settings json;`);
    console.log('Added seo_settings to visa_services');
  } catch (e: any) {
    console.error(e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE blog_posts ADD COLUMN seo_settings json;`);
    console.log('Added seo_settings to blog_posts');
  } catch (e: any) {
    console.error(e.message);
  }

  console.log('Migration complete');
  process.exit(0);
}

main();
