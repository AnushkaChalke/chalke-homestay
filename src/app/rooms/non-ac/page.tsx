"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, Bed, CalendarDays, Car, CheckCircle2, Clock3, Droplet, Loader2, MapPin, ShieldCheck, Star, Thermometer, Wifi, Zap } from 'lucide-react';
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
  const images = ['BED.jpeg', 'BED_1.jpeg', 'HALL.jpeg', 'HALL_1.jpeg', 'BATH.jpeg'];

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

  const roomHighlights = [
    'King-size bedroom',
    'Private bathroom',
    'Quiet village atmosphere',
    'Free WiFi and parking',
    'Natural breeze stay',
    'Extra bed available',
  ];

  const trustChips = ['Direct homestay booking', 'Instant request flow', 'Value stay for families'];

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
        const params = new URLSearchParams({ roomType: 'Non-AC 1BHK Authentic', checkIn: checkInIso, checkOut: checkOutIso });
        const response = await fetch(`/api/availability?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Availability check failed');
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
        if (!controller.signal.aborted) setCheckingAvailability(false);
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
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const availabilityCounts = useMemo(() => getAvailabilityCountsForMonth(bookings, calendarMonth, 3, 'Non-AC 1BHK Authentic'), [bookings, calendarMonth]);

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

      if (!response.ok) throw new Error('Booking submission failed');

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
    <main className="bg-gradient-to-b from-slate-50 via-white to-amber-50/30 py-10 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[2rem] border bg-white/90 p-5 shadow-xl backdrop-blur sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber-700">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2">Homestay</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">8.5 Very good</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">Direct booking</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Chalke Homestay</p>
                  <h1 className="mt-2 text-3xl font-headline font-bold text-primary sm:text-5xl">Non-AC 1BHK Authentic</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Chiplun, Konkan, Maharashtra</span>
                    <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Calm village atmosphere</span>
                    <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Family-friendly and quiet</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trustChips.map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-w-[240px] gap-3 rounded-[1.5rem] border bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-lg sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-white/60">Starting from</div>
                    <div className="mt-1 text-3xl font-bold">₹{nightlyTotal.toLocaleString('en-IN')}</div>
                    <div className="text-sm text-white/75">per night</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-xs uppercase tracking-[0.2em] text-white/75">
                    <div className="font-semibold text-white">Pay later</div>
                    <div>Inquiry first</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-white/10 p-3"><div className="text-lg font-bold">3</div><div className="text-white/70">Rooms</div></div>
                  <div className="rounded-2xl bg-white/10 p-3"><div className="text-lg font-bold">Quiet</div><div className="text-white/70">Atmosphere</div></div>
                  <div className="rounded-2xl bg-white/10 p-3"><div className="text-lg font-bold">₹500</div><div className="text-white/70">Extra bed</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border bg-white shadow-2xl">
                <div className="relative">
                  <img src={`/room/NON_AC/${encodeURIComponent(images[index])}`} alt={`Non-AC Room ${index + 1}`} className="h-[420px] w-full object-cover sm:h-[520px]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 text-white sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-white/60">Room gallery</div>
                        <div className="mt-1 text-2xl font-bold sm:text-3xl">Peaceful village stay with natural comfort</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                        <div className="text-xs uppercase tracking-[0.25em] text-white/60">Guest rating</div>
                        <div className="mt-1 flex items-center gap-2 text-lg font-bold">
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                          8.5 / 10
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 border-t bg-slate-50 p-3 sm:gap-3 sm:p-4">
                  {images.map((img, i) => (
                    <button key={img} onClick={() => setIndex(i)} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${i === index ? 'ring-2 ring-amber-400' : 'hover:-translate-y-0.5 hover:shadow-md'}`}>
                      <img src={`/room/NON_AC/${encodeURIComponent(img)}`} alt={img} className="h-24 w-full object-cover sm:h-28" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Room highlights</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {roomHighlights.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">What you get</div>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3"><Bed className="h-4 w-4 text-accent" /> Spacious king-size bed</div>
                    <div className="flex items-center gap-3"><Droplet className="h-4 w-4 text-accent" /> Private bathroom with hot water</div>
                    <div className="flex items-center gap-3"><Wifi className="h-4 w-4 text-accent" /> Free WiFi and parking</div>
                    <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-accent" /> Check-in from 12:00 PM</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Why guests like it</div>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Quiet and homely stay</div>
                    <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Direct booking request</div>
                    <div className="flex items-center gap-3"><Star className="h-4 w-4 text-amber-500" /> Great for families</div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> Close to Chiplun attractions</div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border bg-white p-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Popular facilities</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Non-AC room', 'Private bath', 'WiFi', 'Parking', 'Village charm', 'Extra bed'].map((item) => (
                      <span key={item} className="rounded-full border bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="lg:sticky lg:top-20">
              <div className="rounded-[2rem] border bg-white p-4 shadow-2xl sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Reserve now</div>
                    <h3 className="mt-1 text-xl font-bold text-primary">Check dates & send request</h3>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right text-xs font-semibold text-amber-800">
                    <div>Per night</div>
                    <div className="text-lg text-amber-900">₹{nightlyTotal.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                

                <div className="mt-4">
                  <Calendar
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    modifiers={{
                      occupied: Object.entries(availabilityCounts).map(([key]) => parseFlexibleDate(key)).filter((date): date is Date => Boolean(date) && availabilityCounts[format(date as Date, 'yyyy-MM-dd')] <= 0),
                      selectedDay: selectedRangeDates,
                    }}
                    modifiersClassNames={{ selectedDay: 'bg-black/55 text-white rounded-md' }}
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
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="mt-1 w-full rounded-xl border p-3 text-sm">
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-primary/70">Extra beds</label>
                    <select value={extraBeds} onChange={(e) => setExtraBeds(e.target.value)} className="mt-1 w-full rounded-xl border p-3 text-sm">
                      {Array.from({ length: MAX_EXTRA_BEDS + 1 }, (_, index) => (
                        <option key={index} value={String(index)}>{index} extra bed{index === 1 ? '' : 's'}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-muted-foreground">₹{EXTRA_BED_RATE.toLocaleString('en-IN')} per bed per night</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-in</label>
                    <input value={checkin} onChange={(e) => setCheckin(e.target.value)} type="text" inputMode="numeric" placeholder="DD-MM-YYYY" required className="mt-1 w-full rounded-xl border p-3" />
                    <div className="mt-1 text-xs text-muted-foreground">Check-in from 12:00 PM</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/70">Check-out</label>
                    <input value={checkout} onChange={(e) => setCheckout(e.target.value)} type="text" inputMode="numeric" placeholder="DD-MM-YYYY" required className="mt-1 w-full rounded-xl border p-3" />
                    <div className="mt-1 text-xs text-muted-foreground">Check-out by 11:00 AM</div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-primary/70">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-xl border p-3" />
                </div>
                <div className="mt-4">
                  <label className="text-xs font-bold text-primary/70">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full rounded-xl border p-3" />
                </div>

                <div className="mt-4 rounded-2xl border border-secondary/30 bg-slate-50 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3"><span>Base room rate</span><span className="font-semibold text-primary">₹{BASE_NIGHTLY_RATE.toLocaleString('en-IN')} / night</span></div>
                  <div className="mt-2 flex items-center justify-between gap-3"><span>Extra bed charge</span><span className="font-semibold text-primary">₹{extraBedTotal.toLocaleString('en-IN')} / night</span></div>
                  <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2 text-base font-bold text-primary"><span>Estimated total</span><span>₹{estimatedStayTotal.toLocaleString('en-IN') || '0'}</span></div>
                  {stayNights > 0 ? <div className="mt-1 text-xs">{stayNights} night{stayNights === 1 ? '' : 's'} × ₹{nightlyTotal.toLocaleString('en-IN')} / night</div> : null}
                </div>

                <div className="mt-4">
                  <Button type="submit" onClick={(e: any) => submit(e)} className="w-full rounded-xl bg-gradient-to-r from-accent to-primary py-4 text-white shadow-lg" disabled={submitting}>
                    {submitting ? 'Sending...' : availabilityStatus === 'unavailable' ? 'Choose different dates' : 'Request Booking'}
                  </Button>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  {checkingAvailability ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking availability...</span> : <span className={availabilityMessage.startsWith('Hurry!') ? 'font-headline text-lg font-bold text-amber-800' : ''}>{availabilityMessage}</span>}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-2 text-lg font-semibold">House Rules</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>No smoking indoors</li>
                  <li>Check-in from 12:00 PM, Check-out by 11:00 AM</li>
                  <li>Quiet hours after 10:00 PM</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
