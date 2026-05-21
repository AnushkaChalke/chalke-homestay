"use client";

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Loader2, LogOut, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { BookingRecord } from '@/lib/bookings';

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
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(
    () => ({
      total: bookings.length,
      requested: bookings.filter((booking) => booking.status === 'requested').length,
      reserved: bookings.filter((booking) => booking.status === 'reserved').length,
    }),
    [bookings],
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', { cache: 'no-store' });

      if (response.status === 401) {
        toast({ title: 'Session expired', description: 'Please sign in again.' });
        router.refresh();
        return;
      }

      const data = await response.json();
      setBookings(data.bookings ?? []);
    } catch {
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