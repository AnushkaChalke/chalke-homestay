
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Calendar, Users, Home as HomeIcon, ChevronUp, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { parseFlexibleDate, toIsoDateString, DATE_INPUT_FORMAT } from '@/lib/date-input';

const Hero = () => {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const [checkerOpen, setCheckerOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('AC 1BHK Premium');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable' | 'error'>('idle');
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const checkInDate = parseFlexibleDate(checkIn);
  const checkOutDate = parseFlexibleDate(checkOut);

  const availabilityLabel =
    availabilityStatus === 'available'
      ? 'Available'
      : availabilityStatus === 'unavailable'
        ? 'Not available'
        : availabilityStatus === 'error'
          ? 'Could not check'
          : 'Tap to check availability';

  const availabilityStyles =
    availabilityStatus === 'available'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : availabilityStatus === 'unavailable'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : availabilityStatus === 'error'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-white/10 bg-white/10 text-white';

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckAvailability = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const checkInIso = toIsoDateString(checkIn);
    const checkOutIso = toIsoDateString(checkOut);

    if (!checkInIso || !checkOutIso) {
      setAvailabilityStatus('error');
      return;
    }

    if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
      setAvailabilityStatus('error');
      return;
    }

    setCheckingAvailability(true);

    try {
      const params = new URLSearchParams({
        roomType,
        checkIn: checkInIso,
        checkOut: checkOutIso,
        guests,
      });

      const response = await fetch(`/api/availability?${params.toString()}`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Availability check failed');
      }

      const data = await response.json();
      setAvailableRooms(typeof data.availableRooms === 'number' ? data.availableRooms : null);
      setAvailabilityStatus(data.available ? 'available' : 'unavailable');
    } catch {
      setAvailableRooms(null);
      setAvailabilityStatus('error');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookNow = () => {
    if (availabilityStatus !== 'available' || !toIsoDateString(checkIn) || !toIsoDateString(checkOut)) return;

    const basePath = roomType === 'AC 1BHK Premium' ? '/rooms/ac' : '/rooms/non-ac';
    const params = new URLSearchParams({
      checkIn: toIsoDateString(checkIn),
      checkOut: toIsoDateString(checkOut),
      guests,
      roomType,
    });

    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden lg:h-screen">
      {/* Background with parallax scale */}
      <motion.div
        style={{ scale }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage?.imageUrl})` }}
          data-ai-hint={heroImage?.imageHint}
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 px-4 sm:px-6 pt-24 sm:pt-20 pb-16 sm:pb-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ opacity }}
            className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-[0.65rem] sm:text-xs font-semibold tracking-widest uppercase mb-4 sm:mb-6"
            >
              The Heart of Konkan
            </motion.span>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-white mb-4 sm:mb-6 leading-[0.95] sm:leading-tight"
            >
              Chalke <br /> <span className="text-amber-300">Homestay</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-sm sm:text-base md:text-xl text-white/80 mb-8 sm:mb-10 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Authentic Konkani village stay surrounded by rivers, mountains, and eternal peace.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => scrollToSection('rooms')}
                  className="w-full sm:w-auto rounded-full bg-accent hover:bg-accent/90 px-8 text-base shadow-xl shadow-accent/20"
                >
                  Explore Rooms
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('about')}
                  className="w-full sm:w-auto rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl shadow-white/10 hover:bg-white/20 hover:text-primary px-8 text-base glass"
                >
                  Our Story
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Booking Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full max-w-sm lg:block mt-2 lg:mt-0"
          >
            <div className="glass-dark p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-headline text-center lg:text-left">Plan Your Stay</h3>
                  <p className="mt-1 text-xs sm:text-sm text-white/60">Add your stay details to check availability.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckerOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20"
                >
                  {checkerOpen ? 'Hide' : 'Check'}
                  {checkerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${availabilityStyles}`}>
                <div className="flex items-center gap-2">
                  {availabilityStatus === 'available' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : availabilityStatus === 'unavailable' ? (
                    <XCircle className="h-4 w-4" />
                  ) : availabilityStatus === 'error' ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  <span>{availabilityLabel}</span>
                  {checkingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                </div>
                {availabilityStatus === 'available' && typeof availableRooms === 'number' ? (
                  <div className="mt-1 text-xs font-medium opacity-80">{availableRooms} room{availableRooms === 1 ? '' : 's'} available</div>
                ) : null}
              </div>

              {checkerOpen ? (
                <form className="space-y-3 sm:space-y-4" onSubmit={handleCheckAvailability}>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative block">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={DATE_INPUT_FORMAT.toUpperCase()}
                        value={checkIn}
                        onChange={(event) => setCheckIn(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label="Check-in date"
                      />
                    </label>
                    <label className="relative block">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={DATE_INPUT_FORMAT.toUpperCase()}
                        value={checkOut}
                        onChange={(event) => setCheckOut(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label="Check-out date"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative block">
                      <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <select
                        value={guests}
                        onChange={(event) => setGuests(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label="Guests"
                      >
                        <option className="text-black" value="1">1 Guest</option>
                        <option className="text-black" value="2">2 Guests</option>
                        <option className="text-black" value="3">3 Guests</option>
                        <option className="text-black" value="4">4 Guests</option>
                        <option className="text-black" value="5+">5+ Guests</option>
                      </select>
                    </label>

                    <label className="relative block">
                      <HomeIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <select
                        value={roomType}
                        onChange={(event) => setRoomType(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label="Room type"
                      >
                        <option className="text-black" value="AC 1BHK Premium">AC Room</option>
                        <option className="text-black" value="Non-AC 1BHK Authentic">Non-AC Room</option>
                      </select>
                    </label>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={checkingAvailability}
                      className="w-full rounded-xl bg-white py-5 font-bold text-primary shadow-lg transition-all hover:bg-accent hover:text-white"
                    >
                      {checkingAvailability ? 'Checking...' : 'Check Availability'}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      onClick={handleBookNow}
                      disabled={availabilityStatus !== 'available'}
                      className="w-full rounded-xl border border-white/20 bg-emerald-500 py-5 font-bold text-white shadow-lg transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/50"
                    >
                      Book Now
                    </Button>
                  </motion.div>
                </form>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[0.65rem] sm:text-xs uppercase tracking-widest font-medium opacity-60">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.div>
    </section>
  );
};

export default Hero;
