const { db } = require('./src/db/index.js');
const { sql } = require('drizzle-orm');

async function run() {
  try {
    await db.execute(sql`ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMP`);
    console.log('Added published_at to blog_posts');
  } catch(e) {
    console.error('Error adding published_at:', e.message);
  }
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sitemap_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_type VARCHAR(50) NOT NULL,
        include_in_sitemap BOOLEAN NOT NULL DEFAULT TRUE,
        change_frequency VARCHAR(20) DEFAULT 'weekly',
        priority VARCHAR(10) DEFAULT '0.8',
        include_images BOOLEAN NOT NULL DEFAULT TRUE,
        include_last_modified BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created sitemap_configs table');
  } catch(e) {
    console.error('Error creating sitemap_configs:', e.message);
  }
  process.exit(0);
}

run();
