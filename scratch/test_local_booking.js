const mysql = require('mysql2/promise');

async function testLocalInsert() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bht_travel_db'
  });

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Local DB Tables:', tables.map(t => Object.values(t)[0]));

  const bkNum = 'TEST-LOCAL-BK-' + Date.now().toString().slice(-4);
  await conn.query(`
    INSERT INTO package_booking_enquiries (booking_number, package_name, full_name, email, phone, adults, children, infants, start_date, total_price, status)
    VALUES (?, 'Deluxe Hajj Package 2', 'Hassan', 'hassandks10@gmail.com', '+1 123456789', 2, 1, 0, '2026-08-14', '17,995', 'new')
  `, [bkNum]);
  console.log('✅ Local package_booking_enquiries insert test: SUCCESSFUL (Ref:', bkNum, ')');

  await conn.query('DELETE FROM package_booking_enquiries WHERE booking_number = ?', [bkNum]);
  console.log('✅ Cleanup complete!');
  await conn.end();
}

testLocalInsert();
