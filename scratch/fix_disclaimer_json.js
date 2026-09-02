const mysql = require('mysql2/promise');

async function fixDisclaimerJson() {
  console.log('--------------------------------------------------');
  console.log('🛠️ CHECKING AND REPAIRING DISCLAIMER SETTINGS JSON...');
  console.log('--------------------------------------------------');

  const configs = [
    { name: 'Local MySQL', host: 'localhost', user: 'root', password: '', database: 'bht_travel_db' },
    { name: 'Hostinger MySQL', host: '145.79.20.149', user: 'u328269640_DKSDEV', password: 'KingTravel@78600', database: 'u328269640_kingtravelNXT' }
  ];

  for (const cfg of configs) {
    try {
      const conn = await mysql.createConnection(cfg);
      const [rows] = await conn.query('SELECT `value` FROM site_settings WHERE `key` = "disclaimer_settings"');
      if (rows && rows.length > 0) {
        try {
          JSON.parse(rows[0].value);
          console.log(`  ✅ ${cfg.name}: disclaimer_settings JSON is valid!`);
        } catch (e) {
          console.warn(`  ⚠️ ${cfg.name}: disclaimer_settings JSON was corrupted/truncated (${e.message}). Repairing default JSON...`);
          const defaultJson = JSON.stringify({ enabled: false, image: '', altText: 'Disclaimer Popup Image' });
          await conn.query('UPDATE site_settings SET `value` = ? WHERE `key` = "disclaimer_settings"', [defaultJson]);
          console.log(`  ✅ ${cfg.name}: disclaimer_settings REPAIRED!`);
        }
      } else {
        console.log(`  ℹ️ ${cfg.name}: disclaimer_settings not set yet.`);
      }
      await conn.end();
    } catch (err) {
      console.error(`  ❌ ${cfg.name} Error:`, err.message);
    }
  }
}

fixDisclaimerJson();
