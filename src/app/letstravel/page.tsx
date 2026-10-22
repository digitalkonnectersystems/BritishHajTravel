import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getLoginAuthSettings, getSiteIdentity } from '@/actions/pageActions';
import LetsTravelPageClient from './LetsTravelPageClient';

export default async function LetsTravelPage() {
  // Verify an existing session only when visiting the login page, not in Proxy.
  const session = await getCurrentSession();
  if (session) redirect('/admin/dashboard');

  const [identity, loginAuth] = await Promise.all([
    getSiteIdentity(),
    getLoginAuthSettings(),
  ]);
  return <LetsTravelPageClient initialIdentity={identity} initialLoginAuth={loginAuth} />;
}
