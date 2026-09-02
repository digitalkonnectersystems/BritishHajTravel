const mysql = require('mysql2/promise');

async function createTables() {
  const conn = await mysql.createConnection({
    host: '145.79.20.149',
    user: 'u328269640_DKSDEV',
    password: 'KingTravel@78600',
    database: 'u328269640_kingtravelNXT'
  });

  console.log('Creating missing enquiry sub-tables on Hostinger DB...');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS quote_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enquiry_number VARCHAR(128) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      package_type VARCHAR(100) DEFAULT 'Umrah Package',
      departure_date VARCHAR(100),
      adults INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS package_booking_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_number VARCHAR(128) NOT NULL UNIQUE,
      package_id INT,
      package_name VARCHAR(255),
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      adults INT DEFAULT 1,
      children INT DEFAULT 0,
      infants INT DEFAULT 0,
      start_date VARCHAR(100),
      total_price VARCHAR(50),
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS contact_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_number VARCHAR(128) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      website VARCHAR(255),
      package_type VARCHAR(100),
      message TEXT,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS visa_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enquiry_number VARCHAR(128) NOT NULL UNIQUE,
      visa_service_id INT,
      visa_title VARCHAR(255),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      travelers_count INT DEFAULT 1,
      nationality VARCHAR(100) DEFAULT 'Canadian',
      message TEXT,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS flight_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enquiry_number VARCHAR(128) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      origin_city VARCHAR(100) DEFAULT 'Toronto (YYZ)',
      destination_city VARCHAR(100) DEFAULT 'Jeddah (JED)',
      departure_date VARCHAR(100),
      return_date VARCHAR(100),
      passengers INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ ALL 5 MISSING ENQUIRY SUB-TABLES CREATED SUCCESSFULLY IN HOSTINGER DB!');
  await conn.end();
}

createTables().catch(err => {
  console.error('Error creating tables:', err);
});
