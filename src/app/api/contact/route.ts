import { NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries } from '@/db/schema';
import { randomUUID } from 'node:crypto';
import { writeBackendLog, databaseErrorCode } from '@/lib/backendLogger';
import { recordPublicEnquiry } from '@/lib/publicEnquiryAudit';
import { dispatchFormEmails } from '@/lib/emailService';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, packageType, message, subject } = body;

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
    // Legacy API callers must receive the same admin/customer mail handling as CMS forms.
    const delivery = await dispatchFormEmails('Contact Form', {
      enquiryNumber, ticketNumber: enquiryNumber, fullName, email, phone: phone || '',
      packageType: packageType || '', message, subject: typeof subject === 'string' ? subject.slice(0, 240) : '',
    }, email, async audit => {
      await db.update(enquiries).set({
        sourceForm: audit.formName, emailTo: audit.to.join(', '), emailCc: audit.cc.join(', '),
        emailBcc: audit.bcc.join(', '), emailSubject: audit.subject,
        emailHtml: audit.html, emailDeliveryStatus: audit.status, updatedAt: new Date(),
      }).where(eq(enquiries.enquiryNumber, enquiryNumber));
    });
    return NextResponse.json({
      success: true,
      enquiryNumber,
      emailWarning: delivery.error,
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
