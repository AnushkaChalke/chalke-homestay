import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'chalke-admin-session';

export function getAdminPassword() {
  return process.env.ADMIN_BOOKINGS_PASSWORD ?? null;
}

export function getAdminSessionToken() {
  const password = getAdminPassword();

  if (!password) {
    return null;
  }

  return crypto.createHash('sha256').update(password).digest('hex');
}

export function isAdminSessionToken(value: string | undefined | null) {
  const sessionToken = getAdminSessionToken();

  if (!sessionToken || !value) {
    return false;
  }

  return value === sessionToken;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  };
}