import 'server-only';
import { getCurrentSession, type UserSession } from '@/lib/auth';

/** Authorization must happen inside every privileged Server Action, not just on admin pages. */
export async function requireAdmin(roles?: UserSession['role'][]): Promise<UserSession> {
  const session = await getCurrentSession();
  if (!session || (roles && session.role !== 'super_admin' && !roles.includes(session.role))) {
    throw new Error('Unauthorized: administrator permission required.');
  }
  return session;
}
