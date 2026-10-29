import { NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries } from '@/db/schema';
import { randomUUID } from 'node:crypto';
import { writeBackendLog, databaseErrorCode } from '@/lib/backendLogger';
import { recordPublicEnquiry } from '@/lib/publicEnquiryAudit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, packageType, departureDate, adults } = body;

    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 255 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof phone !== 'string' || phone.length > 50 || !phone.trim() || (adults !== undefined && (!Number.isInteger(Number(adults)) || Number(adults) < 1 || Number(adults) > 99))) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    const enquiryNumber = `KT-QT-${randomUUID().replace(/-/g,'').slice(0,20).toUpperCase()}`;

    try {
      await db.insert(enquiries).values({
        enquiryNumber,
        type: 'quote_request',
        fullName,
        email,
        phone,
        preferredPackageType: packageType || 'Not specified',
        departureMonth: departureDate || 'Not specified',
        adults: adults ? parseInt(adults, 10) : 1,
        status: 'new',
      });
    } catch (dbErr) {
      console.error('Quote request database insert failed:', dbErr);
      await writeBackendLog({severity:'error',category:'Form Submissions',source:'api/quote',message:`Database submission failed (${databaseErrorCode(dbErr)})`});
      return NextResponse.json({ success: false, error: 'Unable to save your request. Please try again.' }, { status: 503 });
    }

    await recordPublicEnquiry('API Quote Request',enquiryNumber);
    return NextResponse.json({
      success: true,
      enquiryNumber,
      message: 'Quote request submitted successfully!',
    });
  } catch (error) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process quote request.' },
      { status: 500 }
    );
  }
}
