const mysql = require('mysql2/promise');

async function alterColumns() {
  console.log('--------------------------------------------------');
  console.log('🔄 UPGRADING DB COLUMNS TO LONGTEXT (Local & Hostinger)...');
  console.log('--------------------------------------------------');

  // 1. Upgrade Local DB
  try {
    const localConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bht_travel_db'
    });
    await localConn.query('ALTER TABLE site_settings MODIFY `value` LONGTEXT NOT NULL');
    await localConn.query('ALTER TABLE site_pages MODIFY `sections` LONGTEXT');
    await localConn.query('ALTER TABLE site_pages MODIFY `rich_text` LONGTEXT');
    console.log('✅ Local MySQL (bht_travel_db) site_settings.value ALTERED TO LONGTEXT!');
    await localConn.end();
  } catch (err) {
    console.error('Local alter warning:', err.message);
  }

  // 2. Upgrade Remote Hostinger DB
  try {
    const remoteConn = await mysql.createConnection({
      host: '145.79.20.149',
      user: 'u328269640_DKSDEV',
      password: 'KingTravel@78600',
      database: 'u328269640_kingtravelNXT'
    });
    await remoteConn.query('ALTER TABLE site_settings MODIFY `value` LONGTEXT NOT NULL');
    await remoteConn.query('ALTER TABLE site_pages MODIFY `sections` LONGTEXT');
    await remoteConn.query('ALTER TABLE site_pages MODIFY `rich_text` LONGTEXT');
    console.log('✅ Remote Hostinger MySQL (u328269640_kingtravelNXT) site_settings.value ALTERED TO LONGTEXT!');
    await remoteConn.end();
  } catch (err) {
    console.error('Remote alter warning:', err.message);
  }
}

alterColumns();
