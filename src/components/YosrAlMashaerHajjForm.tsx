'use client';

import HajjRegistrationForm from '@/components/HajjRegistrationForm';

/** Branded YOSR version, with independent form settings and email templates. */
export default function YosrAlMashaerHajjForm({
  sourcePage,
  heading = 'Register for Hajj 2027',
}: { sourcePage: string; heading?: string }) {
  return <HajjRegistrationForm sourcePage={sourcePage} heading={heading} branded variant="yosr" />;
}
