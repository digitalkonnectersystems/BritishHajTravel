/** UK-site contact input: '+' + '44' + exactly ten digits. */
export const UK_PHONE_PREFIX = '+44';
export const UK_PHONE_PATTERN = /^\+44\d{10}$/;
export const UK_PHONE_MAX_LENGTH = 13;
export const UK_CONTACT_PRIMARY = '+44 795 7197 390';
export const UK_CONTACT_SECONDARY = '+44 177 2252 996';

export function normalizeUkPhoneInput(value: string): string {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('44')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return '+44' + digits.slice(0, 10);
}
export function isValidUkPhone(value: string): boolean {
  return UK_PHONE_PATTERN.test(value);
}
