/**
 * Generic Field Label Formatter
 * Converts raw form field keys into professional, human-readable labels
 */
export function formatFieldLabel(key: string): string {
  const map: Record<string, string> = {
    fullName: 'Full Name',
    name: 'Full Name',
    pilgrimName: 'Pilgrim Name',
    applicantName: 'Applicant Name',
    passengerName: 'Passenger Name',

    email: 'Email Address',
    emailAddress: 'Email Address',

    phone: 'Phone Number',
    phoneNumber: 'Phone Number',
    contactPhone: 'Contact Phone',

    packageType: 'Package Type',
    preferredPackageType: 'Preferred Package',
    packageName: 'Package Name',
    selectedPackage: 'Selected Package',

    departureDate: 'Departure Date',
    departureMonth: 'Departure Month / Date',
    startDate: 'Travel Start Date',
    travelDates: 'Travel Dates',

    adults: 'Number of Adults',
    numberOfPilgrims: 'Number of Pilgrims',
    travelersCount: 'Number of Travelers',
    numberOfPassengers: 'Number of Passengers',
    children: 'Children',
    infants: 'Infants',

    nationality: 'Nationality',
    destination: 'Destination',
    departureCity: 'Departure City',
    destinationCity: 'Destination City',
    originCity: 'Origin City',

    website: 'Website',

    message: 'Message',
    specialNotes: 'Special Notes',
    consultationDetails: 'Consultation Details',

    enquiryNumber: 'Enquiry Reference #',
    bookingNumber: 'Booking Reference #',
    ticketNumber: 'Ticket Reference #',

    totalPrice: 'Estimated Total Price (£)',
    status: 'Submission Status',
  };

  if (map[key]) {
    return map[key];
  }

  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}


/**
 * Escape dynamic values before inserting them into the email HTML.
 */
function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/**
 * Format field values for email display.
 */
function formatFieldValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return escapeHtml(value.join(', '));
  }

  if (typeof value === 'object' && value !== null) {
    return escapeHtml(JSON.stringify(value));
  }

  return escapeHtml(value);
}


/**
 * Universal Master Email Template Generator
 *
 * Uses normal HTML email structure with all CSS inline.
 */
export function getResponsiveEmailTemplateHtml(
  formName: string,
  data: Record<string, any>,
  isForUser: boolean = false
): string {
  const safeFormName = escapeHtml(formName);

  const badgeText = isForUser
    ? 'INQUIRY RECEIVED'
    : 'NEW INQUIRY NOTIFICATION';

  const introTextHtml = isForUser
    ? `Thank you for contacting King Travel UK. We have received your inquiry submitted via <strong>${safeFormName}</strong>. Submission details are listed below:`
    : `A new inquiry has been submitted via <strong>${safeFormName}</strong>. Submission details are listed below:`;

  /**
   * Fields that should not appear inside email.
   */
  const excludedFields = [
    'id',
    '_id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'userId',
    'password',
    'passwordHash',
  ];

  const filteredData = Object.entries(data).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !excludedFields.includes(key)
  );

  /**
   * Generate dynamic form detail rows.
   */
  const tableRowsHtml = filteredData
    .map(([key, value], index) => {
      const label = escapeHtml(formatFieldLabel(key));
      const displayValue = formatFieldValue(value);
      const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const borderBottom = index === filteredData.length - 1 ? 'none' : '1px solid #e2e8f0';

      return `
        <tr style="background-color: ${backgroundColor}; border-bottom: ${borderBottom};">
          <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a; width: 38%; vertical-align: top; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${label}
          </td>
          <td style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: #334155; width: 62%; vertical-align: top; word-break: break-word; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${displayValue}
          </td>
        </tr>
      `;
    })
    .join('\n');

  /**
   * Current submission date.
   */
  const submissionDate = new Intl.DateTimeFormat('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(formName)} - King Travel UK</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; border-radius: 0 !important; }
      .fluid-padding { padding: 20px 16px !important; }
      .header-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #004B39 0%, #003326 100%); padding: 32px 24px; border-bottom: 4px solid #DB9E30;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(219, 158, 48, 0.15); border: 1px solid #DB9E30; color: #DB9E30; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      ${badgeText}
                    </div>
                    <div style="margin: 8px 0 4px 0;">
                      <a href="https://kingtravelcan.com" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img src="https://kingtravelcan.com/images_KTC/logos/2026-08/logo.png" alt="King Travel UK" width="220" style="display: block; width: 220px; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none; margin: 0 auto;" />
                      </a>
                    </div>
                    <p style="color: #a7f3d0; font-size: 12px; margin: 6px 0 0 0; font-weight: 600;">
                      Licensed Hajj &amp; Umrah Travel Operator
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="fluid-padding" style="padding: 32px 28px; background-color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">

                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                      ${introTextHtml}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; font-weight: 600;">
                          Date: <strong style="color: #0f172a;">${escapeHtml(submissionDate)}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 12px;">
                    <h3 style="color: #004B39; font-size: 14px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Submitted Form Details
                    </h3>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0; border: 1px solid #cbd5e1; border-radius: 14px; overflow: hidden;">
                      ${tableRowsHtml}
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #000000; padding: 28px 24px; border-top: 1px solid #1e293b; color: #ffffff; font-size: 12px;">
              <table border="0" cellpadding="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="color:#ffffff; font-weight: 800; font-size: 14px; margin: 0 0 4px 0;">
                      King Travel UK Ltd.
                    </p>
                    <p style="color: #ffffff; font-size: 11px; margin: 0; line-height: 1.5;">
                      1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, UK<br>
                      TICO &amp; IATA Licensed Pilgrimage &amp; Flight Operator
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="https://kingtravelcan.com" target="_blank" style="color: #DB9E30; text-decoration: none; font-weight: 700; font-size: 12px; margin: 0 8px;">
                      Visit Official Website →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #ffffff;">
                    © ${new Date().getFullYear()} King Travel UK Ltd. All Rights Reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export const CANONICAL_FORM_SUBJECTS = [
  'Get a Free Quote Form',
  'Umrah Package Booking Form',
  'Hajj Package Booking Form',
  'Contact Inquiry Form',
  'Flights Booking Inquiry Form',
  'Drop Us A Message Form',
  'Blog Detail Page',
] as const;

export type CanonicalFormSubject = (typeof CANONICAL_FORM_SUBJECTS)[number];

export const FORM_SAMPLE_DATA: Record<CanonicalFormSubject, Record<string, unknown>> = {
  'Get a Free Quote Form': {
    fullName: 'Ahmed Khan',
    email: 'ahmed@example.com',
    phone: '+1 416 555 0123',
    packageType: 'Umrah Package',
    departureMonth: 'December 2026',
    numberOfPilgrims: 2,
  },
  'Umrah Package Booking Form': {
    fullName: 'Fatima Ali',
    email: 'fatima@example.com',
    phone: '+1 647 555 0145',
    packageName: 'Premium Umrah Package',
    departureDate: '2026-12-10',
    adults: 2,
    children: 1,
  },
  'Hajj Package Booking Form': {
    fullName: 'Omar Hassan',
    email: 'omar@example.com',
    phone: '+1 905 555 0167',
    packageName: 'Hajj 2027 Package',
    numberOfPilgrims: 4,
    nationality: 'Canadian',
  },
  'Contact Inquiry Form': {
    name: 'Sarah Ahmed',
    email: 'sarah@example.com',
    phone: '+1 289 555 0189',
    message: 'I would like more information about your pilgrimage packages.',
  },
  'Flights Booking Inquiry Form': {
    passengerName: 'Bilal Mahmood',
    email: 'bilal@example.com',
    phone: '+1 416 555 0190',
    originCity: 'Toronto',
    destinationCity: 'Jeddah',
    travelDates: '2027-05-20 to 2027-06-05',
    numberOfPassengers: 2,
  },
  'Drop Us A Message Form': {
    name: 'Aisha Rahman',
    email: 'aisha@example.com',
    phone: '+1 647 555 0191',
    message: 'Please contact me about arranging a private group trip.',
  },
  'Blog Detail Page': {
    fullName: 'Yusuf Ibrahim',
    email: 'yusuf@example.com',
    phone: '+1 905 555 0192',
    packageType: 'Hajj Package',
    message: 'I am interested in learning more about this package.',
  },
};