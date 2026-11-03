/** Stable public API: avoids Server Action build-ID conflicts across rolling deployments. */
import { NextRequest, NextResponse } from 'next/server';
import { writeBackendLog } from '@/lib/backendLogger';
import { submitUmrahRegistrationEnquiryAction, submitHajjRegistrationEnquiryAction, submitYosrHajjRegistrationEnquiryAction, submitPlanYourOwnPackageSectionAction, submitFlightEnquirySectionAction, submitQuoteEnquiryAction, submitPackageBookingEnquiryAction, submitContactEnquiryAction, submitVisaEnquiryAction, submitFlightInquiry } from '@/actions/enquiryActions';
import { submitCustomizedPackageAction } from '@/actions/customizedPackageActions';
import { submitBaanInterest } from '@/actions/baanActions';
import { submitPageBuilderFormAction } from '@/actions/pageBuilderFormActions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_BODY_BYTES = 96 * 1024;
const publicActions = {
  umrahRegistration: submitUmrahRegistrationEnquiryAction,
  hajjRegistration: submitHajjRegistrationEnquiryAction,
  yosrHajjRegistration: submitYosrHajjRegistrationEnquiryAction,
  planYourOwnPackage: submitPlanYourOwnPackageSectionAction,
  flightSection: submitFlightEnquirySectionAction,
  quote: submitQuoteEnquiryAction,
  packageBooking: submitPackageBookingEnquiryAction,
  contact: submitContactEnquiryAction,
  visa: submitVisaEnquiryAction,
  flight: submitFlightInquiry,
  customized: submitCustomizedPackageAction,
  baanInterest: submitBaanInterest,
  pageBuilder: submitPageBuilderFormAction,
} as const;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  // Block cross-origin browser submissions. Do not trust proxy-provided origin aliases.
  const origin = request.headers.get('origin');
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host.toLowerCase(); } catch { return errorResponse('Invalid request origin.', 403); }
    const requestHost = request.nextUrl.host.toLowerCase();
    const forwardedHost = request.headers.get('host')?.toLowerCase();
    if (originHost !== requestHost && originHost !== forwardedHost) return errorResponse('Cross-origin submissions are not allowed.', 403);
  }
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return errorResponse('Send JSON form data.', 415);
  }
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return errorResponse('Form submission exceeds the allowed size.', 413);

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return errorResponse('Form submission exceeds the allowed size.', 413);
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { return errorResponse('Invalid form data.', 400); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return errorResponse('Invalid form data.', 400);
    const payload = parsed as { kind?: unknown; data?: unknown };
    if (typeof payload.kind !== 'string' || !Object.prototype.hasOwnProperty.call(publicActions, payload.kind)) {
      return errorResponse('Unknown enquiry form.', 400);
    }
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) return errorResponse('Invalid form data.', 400);
    // Each destination still runs its existing DB, page-visibility and field validation.
    const handler = publicActions[payload.kind as keyof typeof publicActions] as (data: any) => Promise<any>;
    const result = await handler(payload.data);
    return NextResponse.json(result, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Public Enquiries] Form submission failed:', error);
    try { await writeBackendLog({ severity: 'error', category: 'Form Submissions', source: 'public-enquiries', message: 'Unexpected public enquiry route failure.' }); }
    catch { /* Logging must not mask the original failure. */ }
    return errorResponse('The enquiry could not be processed. Please try again.', 500);
  }
}
