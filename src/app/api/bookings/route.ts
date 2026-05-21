import { NextResponse } from 'next/server';
import { bookingInputSchema, createBooking, listBookings } from '@/lib/bookings';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isAdminSessionToken } from '@/lib/admin-auth';

export async function GET() {
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await listBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load bookings';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking request', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const booking = await createBooking(parsed.data);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create booking';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}