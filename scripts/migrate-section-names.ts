import { db } from '../src/db';
import { sitePages } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function migrate() {
  console.log('Starting migration of section types...');
  const pages = await db.select().from(sitePages);

  const replacements = [
    { old: 'Who We Are (Intro & Stats)', new: 'Who We Are' },
    { old: 'Exclusive Upcoming Umrah Packages', new: 'Upcoming Umrah Packages' },
    { old: 'Select Preferred Travel Service', new: 'Travel Services' },
    { old: 'What We Provide (Numbered Features)', new: 'What We Provide' },
    { old: 'Hajj Packages Grid', new: 'Hajj Packages' },
    { old: 'Visa Solutions Grid', new: 'Visa Solutions' },
    { old: 'Google Reviews / Testimonials', new: 'Testimonials' },
    { old: 'Airlines Marquee', new: 'Airlines' },
    { old: 'Contact Form', new: 'Contact' }
  ];

  for (const page of pages) {
    if (page.sections) {
      let updatedSections = page.sections;
      let changed = false;

      for (const { old, new: newName } of replacements) {
        if (updatedSections.includes(`"type":"${old}"`)) {
          updatedSections = updatedSections.replace(new RegExp(`"type":"${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), `"type":"${newName}"`);
          changed = true;
        }
      }

      if (changed) {
        console.log(`Updating page: ${page.title} (${page.slug})`);
        await db.update(sitePages).set({ sections: updatedSections }).where(eq(sitePages.id, page.id));
      }
    }
  }

  console.log('Migration complete.');
}

migrate().catch(console.error).finally(() => process.exit(0));
