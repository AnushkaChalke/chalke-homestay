import { NextResponse } from 'next/server';
import { bookingUpdateSchema, deleteBooking, updateBooking } from '@/lib/bookings';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isAdminSessionToken } from '@/lib/admin-auth';

type RouteContext = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking update', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const booking = await updateBooking(bookingId, parsed.data);

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionToken(sessionCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteBooking(bookingId);

  if (!deleted) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}