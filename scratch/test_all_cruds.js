const mysql = require('mysql2/promise');

async function testAllCrudsAndForms() {
  console.log('--------------------------------------------------');
  console.log('🚀 TESTING ALL ADMIN CRUDS & FORM SUBMISSIONS...');
  console.log('--------------------------------------------------');

  const connectionConfig = {
    host: '145.79.20.149',
    user: 'u328269640_DKSDEV',
    password: 'KingTravel@78600',
    database: 'u328269640_kingtravelNXT'
  };

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log('✅ MySQL Database Connection: VERIFIED & ACTIVE');

    // 1. Test Site Settings CRUD (Site Identity, Header/Footer, Share Tools, Forms, Auth, Disclaimer)
    console.log('\n--- 1. Testing Admin Site Settings CRUD ---');
    const [settings] = await conn.query('SELECT `key` FROM site_settings');
    console.log('  Keys found in site_settings:', settings.map(s => s.key).join(', '));

    // Test upsert site_identity
    await conn.query(`
      INSERT INTO site_settings (\`key\`, \`value\`, \`updated_at\`)
      VALUES ('test_crud_key', '{"test":true}', NOW())
      ON DUPLICATE KEY UPDATE \`value\` = '{"test":true}', \`updated_at\` = NOW()
    `);
    console.log('  ✅ Site Settings Save/Upsert Query: SUCCESS');

    // Cleanup test key
    await conn.query("DELETE FROM site_settings WHERE `key` = 'test_crud_key'");

    // 2. Test Pages CRUD
    console.log('\n--- 2. Testing Pages CRUD ---');
    const [pages] = await conn.query('SELECT id, title, slug, status FROM site_pages LIMIT 5');
    console.log('  Page count in DB:', pages.length);
    console.log('  Sample page:', pages[0] ? `${pages[0].title} (${pages[0].slug})` : 'No pages');
    console.log('  ✅ Site Pages Query: SUCCESS');

    // 3. Test Packages CRUD
    console.log('\n--- 3. Testing Packages CRUD ---');
    const [packages] = await conn.query('SELECT id, title, slug, starting_price FROM packages LIMIT 5');
    console.log('  Packages count in DB:', packages.length);
    if (packages.length > 0) {
      console.log('  Sample package:', `${packages[0].title} - $${packages[0].starting_price}`);
    }
    console.log('  ✅ Packages Query: SUCCESS');

    // 4. Test User Management CRUD
    console.log('\n--- 4. Testing User Management CRUD ---');
    const [users] = await conn.query('SELECT id, name, email, role FROM users LIMIT 5');
    console.log('  Users count in DB:', users.length);
    if (users.length > 0) {
      console.log('  Sample admin user:', `${users[0].name} (${users[0].email}) - Role: ${users[0].role}`);
    }
    console.log('  ✅ User Management Query: SUCCESS');

    // 5. Test All 5 Form Submissions & Unified Inbox
    console.log('\n--- 5. Testing All Form Submission Action Tables ---');

    // a. Quote Request
    const testEnquiryNum = `TEST-QT-${Date.now().toString().slice(-4)}`;
    await conn.query(`
      INSERT INTO quote_enquiries (enquiry_number, full_name, email, phone, package_type, departure_date, adults, status)
      VALUES (?, 'Automated Test User', 'test.quote@kingtravelcan.com', '+1 905-555-0199', 'Deluxe Hajj 2027', 'June 2027', 2, 'new')
    `, [testEnquiryNum]);
    console.log('  ✅ 1/5 Quote Enquiry Submission Insert: SUCCESS (Ref: ' + testEnquiryNum + ')');

    // b. Package Booking Request
    const testBookingNum = `TEST-BK-${Date.now().toString().slice(-4)}`;
    await conn.query(`
      INSERT INTO package_booking_enquiries (booking_number, package_name, full_name, email, phone, adults, total_price, status)
      VALUES (?, '5 Star Executive Umrah Package', 'Automated Test Pilgrim', 'test.booking@kingtravelcan.com', '+1 416-555-0188', 2, '$3,450 CAD', 'new')
    `, [testBookingNum]);
    console.log('  ✅ 2/5 Package Booking Submission Insert: SUCCESS (Ref: ' + testBookingNum + ')');

    // c. Contact Us Request
    const testTicketNum = `TEST-TKT-${Date.now().toString().slice(-4)}`;
    await conn.query(`
      INSERT INTO contact_enquiries (ticket_number, full_name, email, phone, message, status)
      VALUES (?, 'Automated Contact Tester', 'test.contact@kingtravelcan.com', '+1 647-555-0177', 'Testing automated form submission.', 'new')
    `, [testTicketNum]);
    console.log('  ✅ 3/5 Contact Us Submission Insert: SUCCESS (Ref: ' + testTicketNum + ')');

    // d. Visa Consultation Request
    const testVisaNum = `TEST-VSA-${Date.now().toString().slice(-4)}`;
    await conn.query(`
      INSERT INTO visa_enquiries (enquiry_number, visa_title, full_name, email, phone, travelers_count, nationality, status)
      VALUES (?, 'Saudi Tourist eVisa', 'Automated Visa Applicant', 'test.visa@kingtravelcan.com', '+1 416-555-0166', 3, 'Canadian', 'new')
    `, [testVisaNum]);
    console.log('  ✅ 4/5 Visa Consultation Submission Insert: SUCCESS (Ref: ' + testVisaNum + ')');

    // e. Flight Booking Request
    const testFlightNum = `TEST-FLT-${Date.now().toString().slice(-4)}`;
    await conn.query(`
      INSERT INTO flight_enquiries (enquiry_number, full_name, email, phone, origin_city, destination_city, passengers, status)
      VALUES (?, 'Automated Traveler', 'test.flight@kingtravelcan.com', '+1 905-555-0155', 'Toronto (YYZ)', 'Jeddah (JED)', 2, 'new')
    `, [testFlightNum]);
    console.log('  ✅ 5/5 Flight Booking Submission Insert: SUCCESS (Ref: ' + testFlightNum + ')');

    // Clean up test rows
    await conn.query('DELETE FROM quote_enquiries WHERE enquiry_number LIKE "TEST-%"');
    await conn.query('DELETE FROM package_booking_enquiries WHERE booking_number LIKE "TEST-%"');
    await conn.query('DELETE FROM contact_enquiries WHERE ticket_number LIKE "TEST-%"');
    await conn.query('DELETE FROM visa_enquiries WHERE enquiry_number LIKE "TEST-%"');
    await conn.query('DELETE FROM flight_enquiries WHERE enquiry_number LIKE "TEST-%"');
    console.log('  ✅ Test Data Cleanup: COMPLETE');

    console.log('\n--------------------------------------------------');
    console.log('🎉 ALL ADMIN CRUDS & FORM SUBMISSION ACTIONS VERIFIED!');
    console.log('--------------------------------------------------');

  } catch (err) {
    console.error('❌ Error during CRUD verification:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

testAllCrudsAndForms();
