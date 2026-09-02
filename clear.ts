import { db } from './src/db';
import { contactEnquiries, quoteEnquiries, packageBookingEnquiries, visaEnquiries, flightEnquiries } from './src/db/schema';

async function main() {
  await db.delete(contactEnquiries);
  await db.delete(quoteEnquiries);
  await db.delete(packageBookingEnquiries);
  await db.delete(visaEnquiries);
  await db.delete(flightEnquiries);
  console.log('Cleared all enquiry tables');
  process.exit(0);
}
main();
