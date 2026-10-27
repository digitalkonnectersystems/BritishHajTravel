import { permanentRedirect } from 'next/navigation';

/** Fallback for direct /airlines routing if proxy redirects are bypassed. */
export default function AirlinesRouteLayout() {
  permanentRedirect('/flights');
}
