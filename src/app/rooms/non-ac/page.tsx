"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, Bed, CalendarDays, Car, CheckCircle2, Clock3, Droplet, Loader2, Thermometer, Wifi, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Calendar from '@/components/ui/calendar';
import type { BookingRecord } from '@/lib/bookings';
import { formatDateInputValue, parseFlexibleDate, toIsoDateString, DATE_INPUT_FORMAT } from '@/lib/date-input';
import { getAvailableRoomCountOnDate, getAvailabilityCountsForMonth } from '@/lib/booking-calendar';
import { useSearchParams } from 'next/navigation';
import { addDays, differenceInCalendarDays, format, isBefore, isEqual, startOfDay, startOfMonth } from 'date-fns';

const BASE_NIGHTLY_RATE = 1200;
const EXTRA_BED_RATE = 500;
const MAX_EXTRA_BEDS = 2;

export default function NonACPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const images = [
    'BED.jpeg',
    'BED_1.jpeg',
    'HALL.jpeg',
    'HALL_1.jpeg',
    'BATH.jpeg',
  ];

  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [extraBeds, setExtraBeds] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable' | 'error'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('Select dates to check availability.');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    const initialCheckIn = searchParams.get('checkIn');
    const initialCheckOut = searchParams.get('checkOut');
    const initialGuests = searchParams.get('guests');
    const initialExtraBeds = searchParams.get('extraBeds');
    if (initialCheckIn) setCheckin(formatDateInputValue(initialCheckIn));
    if (initialCheckOut) setCheckout(formatDateInputValue(initialCheckOut));
    if (initialGuests) setGuests(initialGuests);
    if (initialExtraBeds) setExtraBeds(initialExtraBeds);
  }, [searchParams]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!checkin || !checkout) {
      setAvailabilityStatus('idle');
      setAvailabilityMessage('Select dates to check availability.');
      return;
    }

    const checkInIso = toIsoDateString(checkin);
    const checkOutIso = toIsoDateString(checkout);

    if (!checkInIso || !checkOutIso) {
      setAvailabilityStatus('error');
      setAvailabilityMessage(`Use the ${DATE_INPUT_FORMAT.toUpperCase()} format for dates.`);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingAvailability(true);

      try {
        const params = new URLSearchParams({
          roomType: 'Non-AC 1BHK Authentic',
          checkIn: checkInIso,
          checkOut: checkOutIso,
        });
        const response = await fetch(`/api/availability?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Availability check failed');
        }

        const data = await response.json();
        if (data.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage(`Hurry! Only ${data.availableRooms} room${data.availableRooms === 1 ? '' : 's'} left 🔥`);
        } else {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage(`Not available for the selected dates. ${data.availableRooms ?? 0} room${(data.availableRooms ?? 0) === 1 ? '' : 's'} available.`);
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
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams({ roomType: 'Non-AC 1BHK Authentic' });
        const res = await fetch(`/api/availability?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setBookings((data.upcomingBookings ?? []) as BookingRecord[]);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const availabilityCounts = useMemo(
    () => getAvailabilityCountsForMonth(bookings, calendarMonth, 3, 'Non-AC 1BHK Authentic'),
    [bookings, calendarMonth],
  );

  const selectedRangeDates = useMemo(() => {
    if (!checkin) return [] as Date[];

    const startDate = parseFlexibleDate(checkin);
    const endDate = checkout ? parseFlexibleDate(checkout) : null;
    if (!startDate) return [] as Date[];

    const start = startOfDay(startDate);
    if (!endDate) return [start];

    const end = startOfDay(endDate);
    if (isBefore(end, start)) return [start];

    const dates: Date[] = [];
    for (let current = start; isBefore(current, end) || isEqual(current, end); current = addDays(current, 1)) {
      dates.push(current);
    }

    return dates;
  }, [checkin, checkout]);

  const stayNights = useMemo(() => {
    if (!checkin || !checkout) return 0;

    const checkInDate = parseFlexibleDate(checkin);
    const checkOutDate = parseFlexibleDate(checkout);
    if (!checkInDate || !checkOutDate) return 0;

    const nights = differenceInCalendarDays(checkOutDate, checkInDate);
    return nights > 0 ? nights : 0;
  }, [checkin, checkout]);

  const extraBedCount = Number(extraBeds);
  const extraBedTotal = extraBedCount * EXTRA_BED_RATE;
  const nightlyTotal = BASE_NIGHTLY_RATE + extraBedTotal;
  const estimatedStayTotal = stayNights > 0 ? stayNights * nightlyTotal : 0;

  const handleCalendarDateSelect = (d: Date) => {
    const availableRooms = getAvailableRoomCountOnDate(bookings, d, 'Non-AC 1BHK Authentic');
    const clicked = format(d, DATE_INPUT_FORMAT);
    const clickedDate = parseFlexibleDate(clicked);
    const currentCheckInDate = parseFlexibleDate(checkin);

    if (!checkin) {
      if (availableRooms <= 0) {
        setAvailabilityStatus('unavailable');
        setAvailabilityMessage('Selected date is fully booked.');
        return;
      }

      setCheckin(clicked);
      setAvailabilityMessage(`Hurry! Only ${availableRooms} room${availableRooms === 1 ? '' : 's'} left 🔥`);
      return;
    }

    if (checkin && !checkout) {
      if (!clickedDate) return;

      if (isEqual(clickedDate, currentCheckInDate ?? clickedDate)) {
        setAvailabilityStatus('unavailable');
        setAvailabilityMessage('Check-out must be after check-in.');
        return;
      }

      if (currentCheckInDate && isBefore(clickedDate, currentCheckInDate)) {
        if (availableRooms <= 0) {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage('Selected date is fully booked.');
          return;
        }

        setCheckin(clicked);
        setAvailabilityMessage(`Hurry! Only ${availableRooms} room${availableRooms === 1 ? '' : 's'} left 🔥`);
        return;
      }

      setCheckout(clicked);
      return;
    }

    setCheckin(clicked);
    setCheckout('');
    setAvailabilityMessage(`Hurry! Only ${availableRooms} room${availableRooms === 1 ? '' : 's'} left 🔥`);
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
          roomType: 'Non-AC 1BHK Authentic',
          source: 'non-ac-room-page',
          extraBeds: extraBedCount,
          extraBedRate: EXTRA_BED_RATE,
          extraBedTotal,
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
      setExtraBeds('0');
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
              <img src={`/room/NON_AC/${encodeURIComponent(images[index])}`} alt={`Non-AC Room ${index + 1}`} className="w-full h-[520px] object-cover" />
              <div className="absolute left-6 bottom-6 bg-gradient-to-r from-black/60 to-black/20 text-white rounded-full py-2 px-4 text-sm font-semibold">Non-AC 1BHK Authentic</div>
              <div className="absolute right-6 top-6 bg-white/90 rounded-lg p-3 shadow-md">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-2xl font-bold">₹1,200 <span className="text-xs font-medium text-muted-foreground">/ night</span></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button key={img} onClick={() => setIndex(i)} className={`col-span-1 overflow-hidden rounded-lg border ${i === index ? 'ring-2 ring-accent' : ''}`}>
                  <img src={`/room/NON_AC/${encodeURIComponent(img)}`} alt={img} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-8 prose max-w-none">
              <h2 className="font-headline text-3xl">A peaceful village stay with natural comfort</h2>
              <p className="text-muted-foreground">Enjoy an authentic Konkan getaway in a spacious 1BHK with natural breeze, simple comforts, and a relaxed atmosphere. Ideal for guests who prefer a calm and homely stay.</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3 list-none">
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Spacious king-size bed</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Private bathroom with hot water</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Free WiFi and parking</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="text-accent mt-1" /> Calm atmosphere with village charm</li>
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-20">
              <div className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 border border-secondary/30 shadow-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Starting from</div>
                    <div className="text-3xl font-bold">₹{nightlyTotal.toLocaleString('en-IN')} <span className="text-sm text-muted-foreground">/ night</span></div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">Instant request</div>
                    <div className="text-xs text-muted-foreground">No payment required now</div>
                  </div>
                </div>

                <div className="mt-4">
                  {(checkin || checkout) && (
                    <div className={`mb-3 rounded-2xl border px-4 py-3 text-xl leading-tight font-bold font-headline md:text-2xl ${availabilityStatus === 'unavailable' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {availabilityMessage}
                    </div>
                  )}
                  <Calendar
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    modifiers={{
                      occupied: Object.entries(availabilityCounts).map(([key]) => parseFlexibleDate(key)).filter((date): date is Date => Boolean(date) && availabilityCounts[format(date as Date, 'yyyy-MM-dd')] <= 0),
                      selectedDay: selectedRangeDates,
                    }}
                    modifiersClassNames={{
                      selectedDay: 'bg-black/55 text-white rounded-md',
                    }}
                    onDateSelect={handleCalendarDateSelect}
                    showSelectedDateInfo={true}
                    colorByAvailability={true}
                    startCollapsed={true}
                    className="w-full"
                    maxWidth=""
                    disablePastDates={true}
                    disableBookedDates={false}
                    dayAvailabilityCounts={availabilityCounts}
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

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-primary/70">Extra beds</label>
                    <select value={extraBeds} onChange={(e) => setExtraBeds(e.target.value)} className="w-full mt-1 rounded-xl border p-3 text-sm">
                      {Array.from({ length: MAX_EXTRA_BEDS + 1 }, (_, index) => (
                        <option key={index} value={String(index)}>{index} extra bed{index === 1 ? '' : 's'}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-muted-foreground">₹{EXTRA_BED_RATE.toLocaleString('en-IN')} per bed per night</div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-in</label>
                    <input value={checkin} onChange={(e) => setCheckin(e.target.value)} type="text" inputMode="numeric" placeholder="DD-MM-YYYY" required className="w-full mt-1 p-3 rounded-xl border" />
                    <div className="text-xs text-muted-foreground mt-1">Check-in from 12:00 PM</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-out</label>
                    <input value={checkout} onChange={(e) => setCheckout(e.target.value)} type="text" inputMode="numeric" placeholder="DD-MM-YYYY" required className="w-full mt-1 p-3 rounded-xl border" />
                    <div className="text-xs text-muted-foreground mt-1">Check-out by 11:00 AM</div>
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

                <div className="mt-4 rounded-2xl border border-secondary/30 bg-white/70 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Base room rate</span>
                    <span className="font-semibold text-primary">₹{BASE_NIGHTLY_RATE.toLocaleString('en-IN')} / night</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span>Extra bed charge</span>
                    <span className="font-semibold text-primary">₹{extraBedTotal.toLocaleString('en-IN')} / night</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2 text-base font-bold text-primary">
                    <span>Estimated total</span>
                    <span>₹{estimatedStayTotal.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  {stayNights > 0 ? <div className="mt-1 text-xs">{stayNights} night{stayNights === 1 ? '' : 's'} × ₹{nightlyTotal.toLocaleString('en-IN')} / night</div> : null}
                </div>

                <div className="mt-5">
                  <Button type="submit" onClick={(e: any) => submit(e)} className="w-full py-4 bg-gradient-to-r from-accent to-primary text-white rounded-xl shadow-lg" disabled={submitting}>
                    {submitting ? 'Sending...' : availabilityStatus === 'unavailable' ? 'Choose different dates' : 'Request Booking'}
                  </Button>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {checkingAvailability ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking availability...</span> : <span className={availabilityMessage.startsWith('Hurry!') ? 'font-headline text-xl font-bold text-amber-800 md:text-2xl' : ''}>{availabilityMessage}</span>}
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