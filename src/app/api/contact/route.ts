import { NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries } from '@/db/schema';
import { randomUUID } from 'node:crypto';
import { writeBackendLog, databaseErrorCode } from '@/lib/backendLogger';
import { recordPublicEnquiry } from '@/lib/publicEnquiryAudit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, packageType, message } = body;

    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 255 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const enquiryNumber = `KT-CT-${randomUUID().replace(/-/g,'').slice(0,20).toUpperCase()}`;

    try {
      await db.insert(enquiries).values({
        enquiryNumber,
        type: 'general_contact',
        fullName,
        email,
        phone: phone || '',
        preferredPackageType: packageType || 'General',
        message: message || '',
        status: 'new',
      });
    } catch (dbErr) {
      console.error('[api/contact] Save failed:', dbErr);
      await writeBackendLog({severity:'error',category:'Form Submissions',source:'api/contact',message:`Database submission failed (${databaseErrorCode(dbErr)})`});
      return NextResponse.json({success:false,error:'Unable to save your enquiry. Please try again.'},{status:503});
    }

    await recordPublicEnquiry('API Contact Form',enquiryNumber);
    return NextResponse.json({
      success: true,
      enquiryNumber,
      message: 'Thank you for contacting British Hajj Travel. We will reach out shortly!',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process message.' },
      { status: 500 }
    );
  }
}
