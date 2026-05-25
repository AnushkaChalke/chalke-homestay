import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminCookieOptions, getAdminPassword, getAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return NextResponse.json({ error: 'Admin password is not configured' }, { status: 500 });
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success || parsed.data.password !== configuredPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ error: 'Admin session could not be created' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminCookieOptions());
  return response;
}