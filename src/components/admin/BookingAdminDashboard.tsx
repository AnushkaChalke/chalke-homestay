"use client";

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2, LogOut, RefreshCcw, ShieldCheck, DatabaseZap, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import type { BookingRecord } from '@/lib/bookings';
import { bookingOccupiesDate, expandBookingDates, getDateKey } from '@/lib/booking-calendar';

const statusStyles: Record<BookingRecord['status'], string> = {
  requested: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  reserved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
};

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

  const stats = useMemo(
    () => ({
      total: bookings.length,
      requested: bookings.filter((booking) => booking.status === 'requested').length,
      reserved: bookings.filter((booking) => booking.status === 'reserved').length,
    }),
    [bookings],
  );

  const visibleMonthBookings = useMemo(
    () => bookings.filter((booking) => expandBookingDates(booking).some((date) => isSameMonth(date, calendarMonth))),
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

  const updateStatus = (bookingId: string, status: BookingRecord['status']) => {
    startTransition(async () => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
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
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? data.booking : booking)));
      toast({ title: 'Booking updated', description: `Marked as ${status}.` });
    });
  };

  const logout = () => {
    startTransition(async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 rounded-[2rem] border bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              <ShieldCheck className="h-4 w-4" /> Admin booking console
            </div>
            <h1 className="text-4xl font-headline font-bold text-primary">Reservation requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              View booking requests, reserve rooms once confirmed, and keep a live record of guest interest.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]">
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
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void loadBookings()} variant="outline" className="rounded-full" disabled={loading || isPending}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button onClick={logout} variant="secondary" className="rounded-full" disabled={isPending}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total requests', value: stats.total, icon: CalendarDays },
            { label: 'Waiting review', value: stats.requested, icon: Clock3 },
            { label: 'Reserved', value: stats.reserved, icon: CheckCircle2 },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-muted bg-secondary/20 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white to-secondary/20 p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary/50">Availability calendar</div>
              <h2 className="mt-1 text-2xl font-headline font-bold text-primary">Who booked when</h2>
              <p className="mt-1 text-sm text-muted-foreground">Blocked dates are marked by booking status so you can see the month at a glance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Reserved</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Requested</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Unavailable</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
              <div className="rounded-[1.75rem] border bg-white p-5 shadow-sm order-2 lg:order-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary/50">Selected day</div>
                    <h3 className="mt-1 text-xl font-bold text-primary">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
                  </div>
                  <div className="text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <div>{format(calendarMonth, 'MMMM yyyy')}</div>
                    <div>{visibleMonthBookings.length} visible bookings</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary/20 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</div>
                    <div className="mt-1 text-2xl font-bold text-primary">{selectedDayBookings.length}</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Reserved</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-700">{selectedDayBookings.filter((booking) => booking.status === 'reserved').length}</div>
                  </div>
                  <div className="rounded-2xl bg-amber-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Requested</div>
                    <div className="mt-1 text-2xl font-bold text-amber-700">{selectedDayBookings.filter((booking) => booking.status === 'requested').length}</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedDayBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">No active booking overlaps this day.</div>
                  ) : (
                    selectedDayBookings.map((booking) => (
                      <div key={booking.id} className="rounded-2xl border bg-secondary/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-primary">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.roomType}</div>
                          </div>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[booking.status]}`}>{booking.status}</span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div>Stay: {booking.checkIn} → {booking.checkOut}</div>
                          <div>Phone: {booking.phone}</div>
                          <div>Guests: {booking.guests}</div>
                          <div>Source: {booking.source}</div>
                        </div>
                        {booking.adminNote ? <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-primary">{booking.adminNote}</div> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border bg-white p-6 shadow-sm order-1 lg:order-2 flex items-center justify-center">
                <div className="w-full max-w-lg">
                  <Calendar
                    mode="single"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={selectedDate}
                    onDayClick={setSelectedDate}
                    modifiers={{
                      occupied: occupiedDates,
                      reserved: reservedDates,
                      requested: requestedDates,
                      selectedDay: [selectedDate],
                    }}
                    modifiersClassNames={{
                      occupied: 'bg-rose-100 text-rose-900 rounded-full',
                      reserved: 'bg-emerald-100 text-emerald-900 rounded-full',
                      requested: 'bg-amber-100 text-amber-900 rounded-full',
                      selectedDay: 'ring-2 ring-primary ring-offset-2 ring-offset-white rounded-full',
                    }}
                    className="w-full"
                  />
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border bg-white shadow-xl">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-accent" />
            <p className="font-medium text-primary">No booking requests yet</p>
            <p className="max-w-md text-sm">New booking submissions from the website will appear here once the form starts posting to the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-muted">
              <thead className="bg-secondary/20 text-left text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Stay</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="align-top hover:bg-secondary/10">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-primary">{booking.guestName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{booking.phone}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">Source: {booking.source}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-primary">
                      <div className="font-medium">{booking.roomType}</div>
                      <div className="mt-2 text-muted-foreground">{booking.checkIn} → {booking.checkOut}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      <div>Guests: {booking.guests}</div>
                      <div className="mt-2">Created: {new Date(booking.createdAt).toLocaleString()}</div>
                      <div className="mt-2">Updated: {new Date(booking.updatedAt).toLocaleString()}</div>
                      {booking.reservedRoom ? <div className="mt-2 text-primary">Room: {booking.reservedRoom}</div> : null}
                      {booking.adminNote ? <div className="mt-2 rounded-2xl bg-secondary/30 p-3 text-primary">{booking.adminNote}</div> : null}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(booking.id, 'requested')} disabled={isPending}>
                          Request
                        </Button>
                        <Button size="sm" className="rounded-full bg-primary" onClick={() => updateStatus(booking.id, 'reserved')} disabled={isPending}>
                          Reserve
                        </Button>
                        <Button size="sm" variant="destructive" className="rounded-full" onClick={() => updateStatus(booking.id, 'cancelled')} disabled={isPending}>
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}