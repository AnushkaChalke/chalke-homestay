import { NextResponse } from 'next/server';
import { listBookings } from '@/lib/bookings';
import { isDateRangeAvailable } from '@/lib/booking-calendar';

const ROOM_CAPACITY_BY_TYPE: Record<string, number> = {
  'AC 1BHK Premium': 3,
  'Non-AC 1BHK Authentic': 3,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomType = url.searchParams.get('roomType');
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  if (!roomType) {
    return NextResponse.json({ error: 'roomType is required' }, { status: 400 });
  }

  const bookings = await listBookings();

  if (!checkIn || !checkOut) {
    const upcomingBookings = bookings
      .filter((booking) => booking.roomType === roomType && booking.status !== 'cancelled')
      .slice(0, 10);

    return NextResponse.json({
      roomType,
      available: null,
      upcomingBookings,
    });
  }

  const totalRooms = ROOM_CAPACITY_BY_TYPE[roomType] ?? 1;
  const { available, availableRooms, availabilityByDate, conflicts } = isDateRangeAvailable(bookings, roomType, checkIn, checkOut, totalRooms);

  return NextResponse.json({
    roomType,
    checkIn,
    checkOut,
    available,
    availableRooms,
    availabilityByDate,
    conflicts,
  });
}
