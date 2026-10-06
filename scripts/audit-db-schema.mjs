import mysql from 'mysql2/promise';

const required = {
  activity_logs: ['id', 'name', 'status', 'user_id', 'ip_address', 'previous_entry', 'new_entry', 'created_at', 'updated_at', 'deleted_at'],
  sitemap_configs: ['id', 'content_type', 'include_in_sitemap', 'change_frequency', 'priority', 'include_images', 'include_last_modified', 'updated_at'],
  sitemap_logs: ['id', 'action', 'status', 'details', 'triggered_by', 'created_at'],
  visa_services: ['id', 'seo_settings'],
  destinations: ['id', 'packages_data', 'package_data', 'seo_settings'],
  enquiries: ['id', 'type', 'source_form', 'email_to', 'email_cc', 'email_bcc', 'email_subject', 'email_html', 'email_delivery_status'],
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required. This audit never uses hard-coded database credentials.');
  process.exit(2);
}

const db = await mysql.createConnection(connectionString);
try {
  const [schemaRows] = await db.query('SELECT DATABASE() AS db');
  const database = schemaRows?.[0]?.db;
  if (!database) throw new Error('No database selected by DATABASE_URL.');

  const problems = [];
  for (const [table, columns] of Object.entries(required)) {
    const [rows] = await db.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [database, table],
    );
    const columnMap = new Map(rows.map((row) => [row.COLUMN_NAME, row.COLUMN_TYPE]));
    if (columnMap.size === 0) {
      problems.push(`Missing table: ${table}`);
      continue;
    }
    for (const column of columns) {
      if (!columnMap.has(column)) problems.push(`Missing column: ${table}.${column}`);
    }
    if (table === 'enquiries') {
      const type = String(columnMap.get('type') || '');
      if (!type.includes("'flight_enquiry'")) problems.push('enquiries.type enum is missing flight_enquiry');
      const emailHtmlType = String(columnMap.get('email_html') || '').toLowerCase();
      if (emailHtmlType && !emailHtmlType.startsWith('longtext')) {
        problems.push(`enquiries.email_html should be LONGTEXT, found ${emailHtmlType}`);
      }
    }

    if (table === 'activity_logs') {
      for (const column of ['previous_entry', 'new_entry']) {
        const auditType = String(columnMap.get(column) || '').toLowerCase();
        if (auditType && !auditType.startsWith('longtext')) {
          problems.push(`activity_logs.${column} should be LONGTEXT, found ${auditType}`);
        }
      }
    }
  }

  if (problems.length) {
    console.error('Database schema audit failed:');
    for (const problem of problems) console.error(`- ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('Database schema audit passed.');
  }
} finally {
  await db.end();
}
