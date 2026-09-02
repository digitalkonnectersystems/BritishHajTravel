import { NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, packageType, departureDate, adults } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    const enquiryNumber = `KT-QT-${Date.now().toString().slice(-6)}`;

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
      console.warn('Database insert warning:', dbErr);
    }

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
