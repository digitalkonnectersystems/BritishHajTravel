const { db } = require('./src/db/index.ts');
const { sitePages } = require('./src/db/schema.ts');
const { eq } = require('drizzle-orm');

async function run() {
  const page = await db.select().from(sitePages).where(eq(sitePages.slug, '/')).limit(1);
  if (page[0]) console.log(page[0].sections);
  process.exit(0);
}

run();
