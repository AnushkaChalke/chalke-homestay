"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, ArrowRight, Bed, CalendarDays, Car, CheckCircle2, Clock3, Droplet, Loader2, Thermometer, Wifi, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <main className="py-24 container px-6 mx-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6">
            <div className="relative">
              <img src={`/room/AC/${encodeURIComponent(images[index])}`} alt={`AC Room ${index+1}`} className="w-full h-96 object-cover rounded-lg" />
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow"> <ArrowLeft className="w-4 h-4" /> </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow"> <ArrowRight className="w-4 h-4" /> </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button key={img} onClick={() => setIndex(i)} className={`rounded overflow-hidden border ${i === index ? 'ring-2 ring-accent' : ''}`}>
                  <img src={`/room/AC/${encodeURIComponent(img)}`} alt={img} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-headline font-bold mb-2">AC 1BHK Premium</h1>
            <p className="text-muted-foreground mb-4">Luxury AC room with sofa cum bed, private bathroom, and scenic views.</p>
            <div className="mb-6">
              <span className="text-2xl font-bold">₹1,500</span>
              <span className="ml-3 text-xs text-muted-foreground uppercase font-semibold">Per Night</span>
            </div>

            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-accent font-semibold">
              <span className="h-1 w-10 bg-accent rounded-full" />
              Key Features
            </div>

            <div className="grid gap-3 mb-8 text-sm text-primary/80 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Bed className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">1BHK</div>
                  <div className="text-xs text-muted-foreground">Sofa cum bed included</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Droplet className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">2 bathrooms</div>
                  <div className="text-xs text-muted-foreground">Modern fittings</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Thermometer className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">AC room</div>
                  <div className="text-xs text-muted-foreground">Comfort all year</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Wifi className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">Free WiFi</div>
                  <div className="text-xs text-muted-foreground">High-speed internet</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Car className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">Free parking</div>
                  <div className="text-xs text-muted-foreground">Secure space</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-secondary/50 bg-secondary/10 p-3">
                <Zap className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-semibold">Geyser included</div>
                  <div className="text-xs text-muted-foreground">Hot water ready</div>
                </div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">
                Extra charge per additional bed: ₹300
              </div>
            </div>

            <div className="mb-8">
              <label className="text-xs font-bold text-primary/70 block mb-2">Guests</label>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full rounded-2xl border p-3 text-sm">
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>

            <div className="mb-8 rounded-3xl border bg-secondary/10 p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-primary/60">
                <CalendarDays className="h-4 w-4" /> Live availability
              </div>
              <div className="mt-3 flex items-start gap-3">
                {checkingAvailability ? <Loader2 className="mt-1 h-5 w-5 animate-spin text-accent" /> : availabilityStatus === 'available' ? <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" /> : availabilityStatus === 'unavailable' ? <AlertCircle className="mt-1 h-5 w-5 text-rose-600" /> : <Clock3 className="mt-1 h-5 w-5 text-muted-foreground" />}
                <div>
                  <div className="font-semibold text-primary">
                    {checkingAvailability ? 'Checking dates...' : availabilityStatus === 'available' ? 'Available' : availabilityStatus === 'unavailable' ? 'Unavailable' : 'Waiting for dates'}
                  </div>
                  <div className="text-sm text-muted-foreground">{availabilityMessage}</div>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-primary/70">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-3 rounded-2xl border" />
              </div>
              <div>
                <label className="text-xs font-bold text-primary/70">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full mt-1 p-3 rounded-2xl border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primary/70">Check-in</label>
                  <input value={checkin} onChange={(e) => setCheckin(e.target.value)} type="date" required className="w-full mt-1 p-3 rounded-2xl border" />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/70">Check-out</label>
                  <input value={checkout} onChange={(e) => setCheckout(e.target.value)} type="date" required className="w-full mt-1 p-3 rounded-2xl border" />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full py-4 bg-accent text-white" disabled={submitting}>
                  {submitting ? 'Sending...' : availabilityStatus === 'unavailable' ? 'Choose different dates' : 'Request Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
