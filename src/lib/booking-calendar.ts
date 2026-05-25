import { addDays, endOfMonth, endOfWeek, format, isBefore, parseISO, startOfMonth, startOfWeek, startOfDay } from 'date-fns';
import type { BookingRecord } from '@/lib/bookings';

export const ROOM_CAPACITY_BY_TYPE = {
  'AC 1BHK Premium': 3,
  'Non-AC 1BHK Authentic': 3,
} as const;

export const TOTAL_ROOM_CAPACITY = Object.values(ROOM_CAPACITY_BY_TYPE).reduce((total, value) => total + value, 0);

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

export function getRoomCapacity(roomType?: string) {
  if (!roomType) return TOTAL_ROOM_CAPACITY;
  return ROOM_CAPACITY_BY_TYPE[roomType as keyof typeof ROOM_CAPACITY_BY_TYPE] ?? 0;
}

export function getCalendarGridDates(month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const dates: Date[] = [];

  for (let current = startOfWeek(monthStart); current <= endOfWeek(monthEnd); current = addDays(current, 1)) {
    dates.push(current);
  }

  return dates;
}

export function countActiveRoomsOnDate(bookings: BookingRecord[], date: Date, roomType?: string) {
  const activeRooms = new Set<string>();

  bookings.forEach((booking) => {
    if (booking.status === 'cancelled') return;
    if (roomType && booking.roomType !== roomType) return;
    if (!bookingOccupiesDate(booking, date)) return;

    activeRooms.add(`${booking.roomType}:${booking.reservedRoom ?? booking.id}`);
  });

  return activeRooms.size;
}

export function getAvailableRoomCountOnDate(bookings: BookingRecord[], date: Date, roomType?: string) {
  return Math.max(getRoomCapacity(roomType) - countActiveRoomsOnDate(bookings, date, roomType), 0);
}

export function isFullyBookedOnDate(bookings: BookingRecord[], date: Date, roomType?: string) {
  return getAvailableRoomCountOnDate(bookings, date, roomType) === 0;
}

export function getDateAvailabilityLabel(bookings: BookingRecord[], date: Date, roomType?: string) {
  const availableRooms = getAvailableRoomCountOnDate(bookings, date, roomType);

  if (availableRooms <= 0) {
    return 'Full';
  }

  return `${availableRooms} left`;
}

export function getRangeAvailabilitySummary(bookings: BookingRecord[], roomType: string, start: string, end: string) {
  const selectedStart = parseBookingDate(start);
  const selectedEnd = parseBookingDate(end);

  const byDate: Array<{ date: string; availableRooms: number }> = [];
  let minimumAvailableRooms = getRoomCapacity(roomType);

  for (let current = selectedStart; isBefore(current, selectedEnd); current = addDays(current, 1)) {
    const availableRooms = getAvailableRoomCountOnDate(bookings, current, roomType);
    byDate.push({
      date: getDateKey(current),
      availableRooms,
    });
    minimumAvailableRooms = Math.min(minimumAvailableRooms, availableRooms);
  }

  return {
    available: minimumAvailableRooms > 0,
    availableRooms: minimumAvailableRooms,
    availabilityByDate: byDate,
    conflicts: byDate.filter((item) => item.availableRooms === 0).map((item) => item.date),
  };
}

export function getAvailabilityCountsForMonth(bookings: BookingRecord[], month: Date, totalRooms: number, roomType?: string) {
  const counts: Record<string, number> = {};

  for (const date of getCalendarGridDates(month)) {
    counts[getDateKey(date)] = Math.max(totalRooms - countActiveRoomsOnDate(bookings, date, roomType), 0);
  }

  return counts;
}

export function isDateRangeAvailable(bookings: BookingRecord[], roomType: string, start: string, end: string, totalRooms = 1) {
  const summary = getRangeAvailabilitySummary(bookings, roomType, start, end);

  const selectedStart = parseBookingDate(start);
  const selectedEnd = parseBookingDate(end);
  let available = true;

  for (let current = selectedStart; isBefore(current, selectedEnd); current = addDays(current, 1)) {
    if (countActiveRoomsOnDate(bookings, current, roomType) >= totalRooms) {
      available = false;
      break;
    }
  }

  return {
    available,
    availableRooms: summary.availableRooms,
    availabilityByDate: summary.availabilityByDate,
    conflicts: summary.conflicts,
  };
}
