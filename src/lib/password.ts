import { randomBytes, scryptSync, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

/** New hashes are scrypt; legacy PBKDF2 hashes are verified for migration only. */
export function hashPassword(password: string): string {
  if (!password) throw new Error('A password is required.');
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, Buffer.from(salt, 'hex'), 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt}:${key.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || typeof storedHash !== 'string') return false;
  try {
    const parts = storedHash.split(':');
    if (parts[0] === 'scrypt' && parts.length === 6) {
      const [, n, r, p, salt, hex] = parts;
      if (n !== '16384' || r !== '8' || p !== '1' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hex)) return false;
      const derived = scryptSync(password, Buffer.from(salt, 'hex'), 64, { N: 16384, r: 8, p: 1 });
      return timingSafeEqual(derived, Buffer.from(hex, 'hex'));
    }
    if (parts[0] === 'pbkdf2' && parts.length === 3) {
      const [, salt, hex] = parts;
      if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hex)) return false;
      const derived = pbkdf2Sync(password, salt, 10000, 64, 'sha512');
      return timingSafeEqual(derived, Buffer.from(hex, 'hex'));
    }
    // Plaintext DB passwords are intentionally no longer accepted.
    return false;
  } catch { return false; }
}

export function needsPasswordRehash(storedHash: string): boolean {
  return storedHash.startsWith('pbkdf2:');
}
