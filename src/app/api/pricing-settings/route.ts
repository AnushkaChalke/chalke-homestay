import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isAdminSessionToken } from '@/lib/admin-auth';
import { getPricingSettings, pricingSettingsSchema, savePricingSettings } from '@/lib/pricing-settings';

export async function GET() {
  try {
    const settings = await getPricingSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load pricing settings';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = pricingSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid pricing settings', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const settings = await savePricingSettings(parsed.data);
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save pricing settings';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
