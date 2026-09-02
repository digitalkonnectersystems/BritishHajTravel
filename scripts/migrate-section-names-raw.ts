import mysql from 'mysql2/promise';

async function migrate() {
  console.log('Starting migration of section types...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bht_travel_db',
    port: Number(process.env.DB_PORT) || 3306,
  });

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

  for (const { old, new: newName } of replacements) {
    const oldStr = `"type":"${old}"`;
    const newStr = `"type":"${newName}"`;
    await connection.execute(`UPDATE site_pages SET sections = REPLACE(sections, ?, ?)`, [oldStr, newStr]);
    console.log(`Replaced ${oldStr} with ${newStr}`);
  }

  console.log('Migration complete.');
  await connection.end();
}

migrate().catch(console.error).finally(() => process.exit(0));
