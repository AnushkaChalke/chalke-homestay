"use client";

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, LogOut, RefreshCcw, ShieldCheck, DatabaseZap, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { BookingRecord } from '@/lib/bookings';
import { TOTAL_ROOM_CAPACITY, bookingOccupiesDate, bookingOverlapsRange, expandBookingDates, getAvailabilityCountsForMonth } from '@/lib/booking-calendar';
import PricingOfferManager from '@/components/admin/PricingOfferManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusStyles: Record<BookingRecord['status'], string> = {
  requested: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  reserved: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  cancelled: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

const ROOM_GROUPS = [
  {
    label: 'AC Rooms',
    roomType: 'AC 1BHK Premium',
    rooms: ['101', '102', '201'],
  },
  {
    label: 'Non-AC Rooms',
    roomType: 'Non-AC 1BHK Authentic',
    rooms: ['202', '301', '302'],
  },
] as const;

const displayDate = (value: string) => format(parseISO(value), 'dd-MM-yyyy');
const displayDateTime = (value: string) => {
  try {
    return format(parseISO(value), 'dd-MM-yyyy');
  } catch {
    return value;
  }
};

function findAvailableRoom(booking: BookingRecord, allBookings: BookingRecord[]) {
  const pool = ROOM_GROUPS.find((group) => group.roomType === booking.roomType)?.rooms ?? [];
  const selectedStart = parseISO(booking.checkIn);
  const selectedEnd = parseISO(booking.checkOut);

  const occupiedRooms = new Set(
    allBookings
      .filter(
        (existing) =>
          existing.id !== booking.id &&
          existing.status === 'reserved' &&
          existing.roomType === booking.roomType &&
          existing.reservedRoom &&
          bookingOverlapsRange(existing, selectedStart, selectedEnd),
      )
      .map((existing) => existing.reservedRoom),
  );

  return pool.find((room) => !occupiedRooms.has(room)) ?? null;
}

function getRoomPool(roomType: string) {
  return ROOM_GROUPS.find((group) => group.roomType === roomType)?.rooms ?? [];
}

function getAvailableRoomsForBooking(booking: BookingRecord, allBookings: BookingRecord[]) {
  const pool = getRoomPool(booking.roomType);
  const selectedStart = parseISO(booking.checkIn);
  const selectedEnd = parseISO(booking.checkOut);

  return pool.filter((room) => {
    const conflictingBooking = allBookings.find(
      (existing) =>
        existing.id !== booking.id &&
        existing.status === 'reserved' &&
        existing.roomType === booking.roomType &&
        existing.reservedRoom === room &&
        bookingOverlapsRange(existing, selectedStart, selectedEnd),
    );

    return !conflictingBooking;
  });
}

export default function BookingAdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionMessage, setConnectionMessage] = useState('Connecting to Firestore...');
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isPending, startTransition] = useTransition();

  const visibleMonthBookings = useMemo(
    () => bookings.filter((booking) => expandBookingDates(booking).some((date) => isSameMonth(date, calendarMonth))),
    [bookings, calendarMonth],
  );

  const roomDiagram = useMemo(
    () =>
      ROOM_GROUPS.map((group) => ({
        ...group,
        rooms: group.rooms.map((roomNumber) => {
          const reservedBooking = bookings.find(
            (booking) =>
              booking.status === 'reserved' &&
              booking.roomType === group.roomType &&
              booking.reservedRoom === roomNumber &&
              bookingOccupiesDate(booking, selectedDate),
          );

          const requestedCount = bookings.filter(
            (booking) => booking.status === 'requested' && booking.roomType === group.roomType && bookingOccupiesDate(booking, selectedDate),
          ).length;

          const status = reservedBooking ? 'reserved' : requestedCount > 0 ? 'requested' : 'available';

          return {
            roomNumber,
            status,
            reservedBooking,
            requestedCount,
          };
        }),
      })),
    [bookings, selectedDate],
  );

  const calendarAvailabilityCounts = useMemo(
    () => getAvailabilityCountsForMonth(bookings, calendarMonth, TOTAL_ROOM_CAPACITY),
    [bookings, calendarMonth],
  );

  const calendarDays = useMemo(
    () => {
      const monthStart = startOfMonth(calendarMonth);
      const monthEnd = endOfMonth(calendarMonth);
      const days: Date[] = [];

      for (let date = startOfWeek(monthStart); date <= endOfWeek(monthEnd); date = addDays(date, 1)) {
        days.push(date);
      }

      return days;
    },
    [calendarMonth],
  );

  const occupiedDates = useMemo(
    () => calendarDays.filter((date) => bookings.some((booking) => booking.status !== 'cancelled' && bookingOccupiesDate(booking, date))),
    [bookings, calendarDays],
  );

  const reservedDates = useMemo(
    () => calendarDays.filter((date) => bookings.some((booking) => booking.status === 'reserved' && bookingOccupiesDate(booking, date))),
    [bookings, calendarDays],
  );

  const requestedDates = useMemo(
    () => calendarDays.filter((date) => bookings.some((booking) => booking.status === 'requested' && bookingOccupiesDate(booking, date))),
    [bookings, calendarDays],
  );

  const selectedDayBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled' && bookingOccupiesDate(booking, selectedDate)),
    [bookings, selectedDate],
  );

  const loadBookings = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    setConnectionMessage('Connecting to Firestore...');
    try {
      const response = await fetch('/api/bookings', { cache: 'no-store' });

      if (response.status === 401) {
        toast({ title: 'Session expired', description: 'Please sign in again.' });
        router.refresh();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error ?? 'Check the bookings API or Firebase credentials.';
        setConnectionStatus('error');
        setConnectionMessage(message);
        toast({ title: 'Unable to load bookings', description: message });
        return;
      }

      const data = await response.json();
      setBookings(data.bookings ?? []);
      setConnectionStatus('connected');
      setConnectionMessage('Connected to Firestore');
    } catch {
      setConnectionStatus('error');
      setConnectionMessage('Unable to reach the bookings API');
      toast({ title: 'Unable to load bookings', description: 'Check the bookings API or Firebase credentials.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const updateStatus = (booking: BookingRecord, status: BookingRecord['status'], reservedRoom: string | null = booking.reservedRoom ?? null) => {
    startTransition(async () => {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reservedRoom: status === 'reserved' ? reservedRoom : null,
        }),
      });

      if (response.status === 401) {
        toast({ title: 'Session expired', description: 'Please sign in again.' });
        router.refresh();
        return;
      }

      if (!response.ok) {
        toast({ title: 'Update failed', description: 'The booking status could not be updated.' });
        return;
      }

      const data = await response.json();
      setBookings((current) => current.map((currentBooking) => (currentBooking.id === booking.id ? data.booking : currentBooking)));
      toast({ title: 'Booking updated', description: `Marked as ${status}.` });
    });
  };

  const updateReservedRoom = (booking: BookingRecord, reservedRoom: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: booking.status,
          reservedRoom,
        }),
      });

      if (response.status === 401) {
        toast({ title: 'Session expired', description: 'Please sign in again.' });
        router.refresh();
        return;
      }

      if (!response.ok) {
        toast({ title: 'Room update failed', description: 'The reserved room could not be updated.' });
        return;
      }

      const data = await response.json();
      setBookings((current) => current.map((currentBooking) => (currentBooking.id === booking.id ? data.booking : currentBooking)));
      toast({ title: 'Room updated', description: `Assigned room ${reservedRoom}.` });
    });
  };

  const deleteBooking = (bookingId: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        toast({ title: 'Session expired', description: 'Please sign in again.' });
        router.refresh();
        return;
      }

      if (!response.ok) {
        toast({ title: 'Delete failed', description: 'The booking could not be deleted.' });
        return;
      }

      setBookings((current) => current.filter((booking) => booking.id !== bookingId));
      toast({ title: 'Booking deleted', description: 'The booking was removed permanently.' });
    });
  };

  const renderRoomSelector = (booking: BookingRecord) => {
    const options = getRoomPool(booking.roomType);
    const availableRooms = getAvailableRoomsForBooking(booking, bookings);

    return (
      <select
        value={booking.reservedRoom ?? ''}
        onChange={(event) => updateReservedRoom(booking, event.target.value)}
        disabled={isPending}
        className="w-full rounded-full border border-muted bg-white px-3 py-2 text-sm text-primary shadow-sm outline-none transition focus:border-accent"
      >
        <option value="">Choose room</option>
        {options.map((roomNumber) => {
          const isAvailable = availableRooms.includes(roomNumber) || booking.reservedRoom === roomNumber;
          return (
            <option key={roomNumber} value={roomNumber} disabled={!isAvailable}>
              Room {roomNumber}{isAvailable ? '' : ' (occupied)'}
            </option>
          );
        })}
      </select>
    );
  };

  const bookingActionControls = (booking: BookingRecord) => (
    <div className="flex flex-wrap justify-end gap-2">
      {booking.status === 'requested' ? (
        <Button size="sm" className="rounded-full bg-primary" onClick={() => {
          const assignedRoom = booking.reservedRoom ?? findAvailableRoom(booking, bookings);
          if (!assignedRoom) {
            toast({ title: 'No rooms available', description: 'All rooms of this type are already reserved for the selected dates.' });
            return;
          }

          updateStatus(booking, 'reserved', assignedRoom);
        }} disabled={isPending}>
          Accept
        </Button>
      ) : null}
      {booking.status === 'requested' || booking.status === 'reserved' ? (
        <Button size="sm" variant="destructive" className="rounded-full" onClick={() => updateStatus(booking, 'cancelled', null)} disabled={isPending}>
          Cancel
        </Button>
      ) : booking.status === 'cancelled' ? (
        <Button size="sm" className="rounded-full bg-primary" onClick={() => updateStatus(booking, 'requested', null)} disabled={isPending}>
          Revive
        </Button>
      ) : null}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" disabled={isPending}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the booking for {booking.guestName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBooking(booking.id)} className="bg-rose-600 text-white hover:bg-rose-700">
              Delete booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const logout = () => {
    startTransition(async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col gap-4 rounded-[1.25rem] border bg-white/90 p-3 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary sm:px-4 sm:text-xs sm:tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4" /> Admin booking console
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary sm:text-4xl">Reservation requests</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:leading-normal">
              View booking requests, reserve rooms once confirmed, and keep a live record of guest interest.
            </p>
            <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] sm:px-4 sm:text-xs sm:tracking-[0.25em]">
              {connectionStatus === 'connected' ? (
                <>
                  <DatabaseZap className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Connected to Firestore</span>
                </>
              ) : connectionStatus === 'error' ? (
                <>
                  <TriangleAlert className="h-4 w-4 text-rose-600" />
                  <span className="text-rose-700">{connectionMessage}</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">{connectionMessage}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
            <Button onClick={() => void loadBookings()} variant="outline" className="w-full rounded-full py-2 sm:w-auto" disabled={loading || isPending}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button onClick={logout} variant="secondary" className="w-full rounded-full py-2 sm:w-auto" disabled={isPending}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <PricingOfferManager />

        <div className="rounded-[1.25rem] border border-primary/10 bg-gradient-to-br from-white to-secondary/20 p-3 shadow-sm sm:rounded-[2rem] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary/50 sm:text-xs sm:tracking-[0.3em]">Rooms</div>
              <h2 className="mt-1 text-lg font-headline font-bold text-primary sm:text-2xl">Room availability diagram</h2>
              <p className="mt-1 text-sm text-muted-foreground">3 AC rooms (101, 102, 201) and 3 non-AC rooms (202, 301, 302) for the selected day.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Reserved</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Requested</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Available</span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {roomDiagram.map((group) => (
              <div key={group.roomType} className="rounded-[1.25rem] border bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary/50 sm:text-xs sm:tracking-[0.3em]">{group.label}</div>
                    <h3 className="mt-1 text-base font-bold text-primary sm:text-xl">Rooms {group.rooms.map((room) => room.roomNumber).join(', ')}</h3>
                  </div>
                  <div className="rounded-full border bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {group.rooms.length} rooms
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {group.rooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className={`rounded-2xl border p-3 shadow-sm ${room.status === 'reserved' ? 'border-rose-200 bg-rose-50' : room.status === 'requested' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-primary">Room {room.roomNumber}</div>
                        <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] ${room.status === 'reserved' ? 'bg-rose-500/10 text-rose-700' : room.status === 'requested' ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}>
                          {room.status}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        {room.status === 'reserved' ? (
                          <>
                            <div className="font-medium text-primary">{room.reservedBooking?.guestName}</div>
                            <div className="mt-1">{displayDate(room.reservedBooking?.checkIn ?? '')} → {displayDate(room.reservedBooking?.checkOut ?? '')}</div>
                          </>
                        ) : room.status === 'requested' ? (
                          <>
                            <div className="font-medium text-primary">Request waiting</div>
                            <div className="mt-1">{room.requestedCount} request{room.requestedCount === 1 ? '' : 's'} for this room type today</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-primary">Open for booking</div>
                            <div className="mt-1">No reserved booking on the selected day</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-primary/10 bg-gradient-to-br from-white to-secondary/20 p-3 shadow-sm sm:rounded-[2rem] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary/50 sm:text-xs sm:tracking-[0.3em]">Availability calendar</div>
              <h2 className="mt-1 text-lg font-headline font-bold text-primary sm:text-2xl">Who booked when</h2>
              <p className="mt-1 text-sm text-muted-foreground">Blocked dates are marked by booking status so you can see the month at a glance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Reserved</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Requested</span>
            </div>
          </div>

            <div className="grid gap-3 lg:grid-cols-[1.35fr_0.9fr] lg:gap-6">
              <div className="order-2 rounded-[1.25rem] border bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-5 lg:order-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary/50 sm:text-xs sm:tracking-[0.3em]">Selected day</div>
                    <h3 className="mt-1 text-base font-bold text-primary sm:text-xl">{format(selectedDate, 'dd-MM-yyyy')}</h3>
                  </div>
                  <div className="text-right text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs sm:tracking-[0.2em]">
                    <div>{format(calendarMonth, 'MMMM yyyy')}</div>
                    <div>{visibleMonthBookings.length} visible bookings</div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary/20 p-3">
                    <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.25em]">Total</div>
                    <div className="mt-1 text-xl font-bold text-primary sm:text-2xl">{selectedDayBookings.length}</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 p-3">
                    <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.25em]">Reserved</div>
                    <div className="mt-1 text-xl font-bold text-emerald-700 sm:text-2xl">{selectedDayBookings.filter((booking) => booking.status === 'reserved').length}</div>
                  </div>
                  <div className="rounded-2xl bg-amber-500/10 p-3">
                    <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.25em]">Requested</div>
                    <div className="mt-1 text-xl font-bold text-amber-700 sm:text-2xl">{selectedDayBookings.filter((booking) => booking.status === 'requested').length}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedDayBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">No active booking overlaps this day.</div>
                  ) : (
                    selectedDayBookings.map((booking) => (
                      <div key={booking.id} className="rounded-2xl border bg-secondary/10 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-primary">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.roomType}</div>
                          </div>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[booking.status]}`}>{booking.status}</span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div>Stay: {displayDate(booking.checkIn)} → {displayDate(booking.checkOut)}</div>
                          <div>Phone / WhatsApp: {booking.phone}</div>
                          <div>Email: {booking.email || 'Not provided'}</div>
                          <div>Guests: {booking.guests}</div>
                          <div>Extra beds: {booking.extraBeds} ({booking.extraBedTotal} / night)</div>
                          <div>Source: {booking.source}</div>
                        </div>
                        {booking.adminNote ? <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-primary">{booking.adminNote}</div> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="order-1 flex items-center justify-center rounded-[1.25rem] border bg-white p-3 shadow-sm sm:rounded-[1.75rem] sm:p-6 lg:order-2">
                <div className="w-full max-w-lg">
                  <Calendar
                    mode="single"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={selectedDate}
                    onDayClick={setSelectedDate}
                    collapsible={false}
                    disableBookedDates={false}
                    dayAvailabilityCounts={calendarAvailabilityCounts}
                    showDayAvailabilityCounts={true}
                    modifiers={{
                      occupied: occupiedDates,
                      reserved: reservedDates,
                      requested: requestedDates,
                      selectedDay: [selectedDate],
                    }}
                    modifiersClassNames={{
                      occupied: 'bg-rose-100 text-rose-900 rounded-full',
                      reserved: 'bg-rose-100 text-rose-900 rounded-full',
                      requested: 'bg-amber-100 text-amber-900 rounded-full',
                      selectedDay: 'ring-2 ring-primary ring-offset-2 ring-offset-white rounded-full',
                    }}
                    className="w-full max-w-full"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.25rem] border bg-white shadow-xl sm:rounded-[2rem]">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-4 text-muted-foreground sm:min-h-[320px] sm:p-6">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground sm:min-h-[320px] sm:p-10">
            <AlertCircle className="h-10 w-10 text-accent" />
            <p className="font-medium text-primary">No booking requests yet</p>
            <p className="max-w-md text-sm">New booking submissions from the website will appear here once the form starts posting to the database.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:p-6 md:hidden">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-muted bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-primary">{booking.guestName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Phone / WhatsApp: {booking.phone}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Email: {booking.email || 'Not provided'}</div>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${statusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <div className="rounded-xl bg-secondary/20 px-3 py-2 text-primary">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Stay</div>
                      <div className="mt-1 font-medium">{booking.roomType}</div>
                      <div className="text-sm text-muted-foreground">{displayDate(booking.checkIn)} → {displayDate(booking.checkOut)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-muted/40 px-3 py-2">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Guests</div>
                        <div className="mt-1 font-medium text-primary">{booking.guests}</div>
                      </div>
                      <div className="rounded-xl bg-muted/40 px-3 py-2">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Source</div>
                        <div className="mt-1 truncate font-medium text-primary">{booking.source}</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 px-3 py-2">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Extra beds</div>
                      <div className="mt-1 font-medium text-primary">{booking.extraBeds} × ₹{booking.extraBedRate} = ₹{booking.extraBedTotal}</div>
                    </div>
                      <div className="rounded-xl bg-muted/30 px-3 py-2">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Room</div>
                        <div className="mt-2">{renderRoomSelector(booking)}</div>
                      </div>
                    <div className="rounded-xl bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <div>Created: {displayDateTime(booking.createdAt)}</div>
                      <div className="mt-1">Updated: {displayDateTime(booking.updatedAt)}</div>
                    </div>
                    {booking.reservedRoom ? <div className="rounded-xl bg-secondary/30 px-3 py-2 text-sm text-primary">Room: {booking.reservedRoom}</div> : null}
                    {booking.adminNote ? <div className="rounded-xl bg-secondary/20 px-3 py-2 text-sm text-primary">{booking.adminNote}</div> : null}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="col-span-3">{bookingActionControls(booking)}</div>
                  </div>
                </div>
              ))}
            </div>

              <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-muted">
              <thead className="bg-secondary/20 text-left text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Stay</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="align-top hover:bg-secondary/10">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-primary">{booking.guestName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Phone / WhatsApp: {booking.phone}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Email: {booking.email || 'Not provided'}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">Source: {booking.source}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-primary">
                      <div className="font-medium">{booking.roomType}</div>
                      <div className="mt-2 text-muted-foreground">{displayDate(booking.checkIn)} → {displayDate(booking.checkOut)}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      <div>Guests: {booking.guests}</div>
                      <div className="mt-2">Extra beds: {booking.extraBeds} (₹{booking.extraBedTotal})</div>
                      <div className="mt-2">Created: {displayDateTime(booking.createdAt)}</div>
                      <div className="mt-2">Updated: {displayDateTime(booking.updatedAt)}</div>
                      {booking.reservedRoom ? <div className="mt-2 text-primary">Room: {booking.reservedRoom}</div> : null}
                      {booking.adminNote ? <div className="mt-2 rounded-2xl bg-secondary/30 p-3 text-primary">{booking.adminNote}</div> : null}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {renderRoomSelector(booking)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {bookingActionControls(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}