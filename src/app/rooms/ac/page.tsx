"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, Bed, CalendarDays, Car, CheckCircle2, Clock3, Droplet, Loader2, Thermometer, Wifi, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Calendar from '@/components/ui/calendar';
import { expandBookingDates } from '@/lib/booking-calendar';
import { format, isBefore, parseISO } from 'date-fns';

export default function ACPage() {
  const { toast } = useToast();
  const images = [
    'bedroom.jpeg',
    'bedroom 2.jpeg',
    'bedroom 3.jpeg',
    'hall.jpeg',
    'hall 2.jpeg',
    'kitchen.jpeg',
    'kitchen 2.jpeg',
    'bathroom.jpeg',
    'toilet.jpeg',
  ];

  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable' | 'error'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('Select dates to check availability.');
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!checkin || !checkout) {
      setAvailabilityStatus('idle');
      setAvailabilityMessage('Select dates to check availability.');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingAvailability(true);

      try {
        const params = new URLSearchParams({
          roomType: 'AC 1BHK Premium',
          checkIn: checkin,
          checkOut: checkout,
        });
        const response = await fetch(`/api/availability?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Availability check failed');
        }

        const data = await response.json();
        if (data.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('Available for the selected dates.');
        } else {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage(`Not available for the selected dates. ${data.conflicts?.length ? `${data.conflicts.length} booking${data.conflicts.length === 1 ? '' : 's'} overlap.` : ''}`);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailabilityStatus('error');
          setAvailabilityMessage(error instanceof Error ? error.message : 'Could not check availability.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingAvailability(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [checkin, checkout]);

  useEffect(() => {
    // load upcoming bookings to mark occupied dates on the calendar
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams({ roomType: 'AC 1BHK Premium' });
        const res = await fetch(`/api/availability?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const bookings = data.upcomingBookings ?? [];

        const allDates: string[] = [];
        bookings.forEach((b: any) => {
          try {
            const dates = expandBookingDates(b);
            dates.forEach((d) => allDates.push(format(d, 'yyyy-MM-dd')));
          } catch (e) {
            // ignore
          }
        });

        // dedupe and set Date objects
        const unique = Array.from(new Set(allDates)).map((s) => parseISO(s));
        if (mounted) setOccupiedDates(unique);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function isDateOccupied(d: Date) {
    return occupiedDates.some((od) => format(od, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));
  }

  const handleCalendarDateSelect = (d: Date) => {
    if (isDateOccupied(d)) {
      setAvailabilityStatus('unavailable');
      setAvailabilityMessage('Selected date is already booked.');
      return;
    }

    const clicked = format(d, 'yyyy-MM-dd');
    if (!checkin) {
      setCheckin(clicked);
      setAvailabilityMessage('Select check-out date.');
      return;
    }

    if (checkin && !checkout) {
      // if clicked is before checkin, treat as new checkin
      if (isBefore(parseISO(clicked), parseISO(checkin))) {
        setCheckin(clicked);
        setAvailabilityMessage('Select check-out date.');
        return;
      }

      setCheckout(clicked);
      return;
    }

    // both set -> start new range
    setCheckin(clicked);
    setCheckout('');
    setAvailabilityMessage('Select check-out date.');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name,
          phone,
          checkIn: checkin,
          checkOut: checkout,
          guests,
          roomType: 'AC 1BHK Premium',
          source: 'ac-room-page',
        }),
      });

      if (!response.ok) {
        throw new Error('Booking submission failed');
      }

      toast({ title: 'Booking request sent', description: `Request for ${guests} guest${guests === '1' ? '' : 's'} received. We will contact you shortly.` });
      setName('');
      setPhone('');
      setCheckin('');
      setCheckout('');
    } catch {
      toast({ title: 'Booking could not be sent', description: 'Please try again or contact us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="py-16 lg:py-24">
      <div className="container px-6 mx-auto">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img src={`/room/AC/${encodeURIComponent(images[index])}`} alt={`AC Room ${index+1}`} className="w-full h-[520px] object-cover" />
              <div className="absolute left-6 bottom-6 bg-gradient-to-r from-black/60 to-black/20 text-white rounded-full py-2 px-4 text-sm font-semibold">AC 1BHK Premium</div>
              <div className="absolute right-6 top-6 bg-white/90 rounded-lg p-3 shadow-md">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-2xl font-bold">₹1,500 <span className="text-xs font-medium text-muted-foreground">/ night</span></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button key={img} onClick={() => setIndex(i)} className={`col-span-1 overflow-hidden rounded-lg border ${i === index ? 'ring-2 ring-accent' : ''}`}>
                  <img src={`/room/AC/${encodeURIComponent(img)}`} alt={img} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-8 prose max-w-none">
              <h2 className="font-headline text-3xl">A premium stay blending comfort & authenticity</h2>
              <p className="text-muted-foreground">Relax in a thoughtfully designed 1BHK with modern amenities, private bathroom, and sweeping views of the konkan landscape. Perfect for couples or small families looking for a peaceful getaway.</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3 list-none">
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> King-size bed with fresh linen</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Private bathroom with hot water</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Fast WiFi and workspace</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Complimentary tea & coffee</li>
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 border border-secondary/30 shadow-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Starting from</div>
                    <div className="text-3xl font-bold">₹1,500 <span className="text-sm text-muted-foreground">/ night</span></div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">Instant request</div>
                    <div className="text-xs text-muted-foreground">No payment required now</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Calendar
                    modifiers={{ occupied: occupiedDates }}
                    onDateSelect={handleCalendarDateSelect}
                    showSelectedDateInfo={true}
                    startCollapsed={true}
                    className="w-full"
                    maxWidth=""
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-primary/70">Guests</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full mt-1 rounded-xl border p-3 text-sm">
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-in</label>
                    <input value={checkin} onChange={(e) => setCheckin(e.target.value)} type="date" required className="w-full mt-1 p-3 rounded-xl border" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-out</label>
                    <input value={checkout} onChange={(e) => setCheckout(e.target.value)} type="date" required className="w-full mt-1 p-3 rounded-xl border" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-primary/70">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-3 rounded-xl border" />
                </div>
                <div className="mt-4">
                  <label className="text-xs font-bold text-primary/70">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full mt-1 p-3 rounded-xl border" />
                </div>

                <div className="mt-5">
                  <Button type="submit" onClick={(e: any) => submit(e)} className="w-full py-4 bg-gradient-to-r from-accent to-primary text-white rounded-xl shadow-lg" disabled={submitting}>
                    {submitting ? 'Sending...' : availabilityStatus === 'unavailable' ? 'Choose different dates' : 'Request Booking'}
                  </Button>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  {checkingAvailability ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking availability...</span> : <span>{availabilityMessage}</span>}
                </div>
              </div>

              <div className="mt-4 rounded-2xl p-4 bg-white/70 border border-secondary/20 shadow">
                <div className="text-sm font-semibold mb-2">House Rules</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>No smoking indoors</li>
                  <li>Check-in after 2:00 PM, Check-out by 11:00 AM</li>
                  <li>Quiet hours after 10:00 PM</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
