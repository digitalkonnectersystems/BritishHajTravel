import { NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, packageType, message } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const enquiryNumber = `KT-CT-${Date.now().toString().slice(-6)}`;

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
      console.warn('Database insert warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      enquiryNumber,
      message: 'Thank you for contacting King Travel. We will reach out shortly!',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process message.' },
      { status: 500 }
    );
  }
}
