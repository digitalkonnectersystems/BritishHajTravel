/** Single-source policy for the restricted Enquiry Manager admin account. */
export const ENQUIRY_MANAGER_ROLE = 'enquiry_manager';
export const ENQUIRY_MANAGER_HOME = '/admin/enquiries';

export function adminHomeForRole(role: string): string {
  return role === ENQUIRY_MANAGER_ROLE ? ENQUIRY_MANAGER_HOME : '/admin/dashboard';
}

/** Direct admin navigation is restricted to the one CRM screen. */
export function isAllowedAdminPathForRole(role: string, pathname: string): boolean {
  if (role !== ENQUIRY_MANAGER_ROLE) return true;
  return (pathname.replace(/\/+$/, '') || '/') === ENQUIRY_MANAGER_HOME;
}

export function canDeleteEnquiries(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}
