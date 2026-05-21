import { addDays, format, isBefore, parseISO, startOfDay } from 'date-fns';
import type { BookingRecord } from '@/lib/bookings';

export function parseBookingDate(value: string) {
  return startOfDay(parseISO(value));
}

export function getDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function bookingOccupiesDate(booking: BookingRecord, date: Date) {
  const day = startOfDay(date);
  const checkIn = parseBookingDate(booking.checkIn);
  const checkOut = parseBookingDate(booking.checkOut);

  return !isBefore(day, checkIn) && isBefore(day, checkOut);
}

export function bookingOverlapsRange(booking: BookingRecord, start: Date, end: Date) {
  const bookingStart = parseBookingDate(booking.checkIn);
  const bookingEnd = parseBookingDate(booking.checkOut);

  return isBefore(start, bookingEnd) && isBefore(bookingStart, end);
}

export function expandBookingDates(booking: BookingRecord) {
  const dates: Date[] = [];
  const checkIn = parseBookingDate(booking.checkIn);
  const checkOut = parseBookingDate(booking.checkOut);

  for (let current = checkIn; isBefore(current, checkOut); current = addDays(current, 1)) {
    dates.push(current);
  }

  return dates;
}

export function isDateRangeAvailable(bookings: BookingRecord[], roomType: string, start: string, end: string) {
  const selectedStart = parseBookingDate(start);
  const selectedEnd = parseBookingDate(end);

  const conflicts = bookings.filter((booking) => {
    if (booking.roomType !== roomType) {
      return false;
    }

    if (booking.status === 'cancelled') {
      return false;
    }

    return bookingOverlapsRange(booking, selectedStart, selectedEnd);
  });

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}
