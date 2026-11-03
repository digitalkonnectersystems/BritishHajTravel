/** Browser submissions use a version-independent route instead of deployment-specific Server Action IDs. */
async function postPublicEnquiry<T>(kind: string, data: unknown): Promise<T> {
  const response = await fetch('/api/public-enquiries', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, data }),
  });
  let result: any;
  try { result = await response.json(); }
  catch { throw new Error(response.status === 409 ? 'The page version changed. Refresh and try again.' : 'The server returned an unexpected response. Please try again.'); }
  if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'The enquiry could not be submitted.');
  return result as T;
}

function endpoint<Action extends (data: any) => any>(kind: string) {
  return (data: Parameters<Action>[0]): Promise<Awaited<ReturnType<Action>>> =>
    postPublicEnquiry<Awaited<ReturnType<Action>>>(kind, data);
}

export const submitUmrahRegistrationEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitUmrahRegistrationEnquiryAction>('umrahRegistration');
export const submitHajjRegistrationEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitHajjRegistrationEnquiryAction>('hajjRegistration');
export const submitYosrHajjRegistrationEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitYosrHajjRegistrationEnquiryAction>('yosrHajjRegistration');
export const submitPlanYourOwnPackageSectionAction = endpoint<typeof import('@/actions/enquiryActions').submitPlanYourOwnPackageSectionAction>('planYourOwnPackage');
export const submitFlightEnquirySectionAction = endpoint<typeof import('@/actions/enquiryActions').submitFlightEnquirySectionAction>('flightSection');
export const submitQuoteEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitQuoteEnquiryAction>('quote');
export const submitPackageBookingEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitPackageBookingEnquiryAction>('packageBooking');
export const submitContactEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitContactEnquiryAction>('contact');
export const submitVisaEnquiryAction = endpoint<typeof import('@/actions/enquiryActions').submitVisaEnquiryAction>('visa');
export const submitFlightInquiry = endpoint<typeof import('@/actions/enquiryActions').submitFlightInquiry>('flight');
export const submitCustomizedPackageAction = endpoint<typeof import('@/actions/customizedPackageActions').submitCustomizedPackageAction>('customized');
export const submitBaanInterest = endpoint<typeof import('@/actions/baanActions').submitBaanInterest>('baanInterest');
export const submitPageBuilderFormAction = endpoint<typeof import('@/actions/pageBuilderFormActions').submitPageBuilderFormAction>('pageBuilder');
