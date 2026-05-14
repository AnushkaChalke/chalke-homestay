"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Calendar, Users, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
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
      <div className="container relative z-10 px-6 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{ opacity }}
            className="text-center lg:text-left max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-widest uppercase mb-6"
            >
              The Heart of Konkan
            </motion.span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-white mb-6 leading-tight">
              Chalke <br /> <span className="text-accent">Homestay</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 font-light max-w-lg leading-relaxed">
              Authentic Konkani village stay surrounded by rivers, mountains, and eternal peace.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 px-8 text-base">
                Explore Rooms
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-primary px-8 text-base">
                Our Story
              </Button>
            </div>
          </motion.div>

          {/* Quick Booking Glass Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:block w-full max-w-sm"
          >
            <div className="glass-dark p-8 rounded-3xl shadow-2xl">
              <h3 className="text-white text-2xl font-headline mb-6">Plan Your Stay</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Check-in Date"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent">
                    <option className="text-black">2 Guests</option>
                    <option className="text-black">3 Guests</option>
                    <option className="text-black">4+ Guests</option>
                  </select>
                </div>
                <div className="relative">
                  <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent">
                    <option className="text-black">AC 1BHK</option>
                    <option className="text-black">Non-AC 1BHK</option>
                  </select>
                </div>
                <Button className="w-full bg-white text-primary font-bold py-6 rounded-xl hover:bg-accent hover:text-white transition-all">
                  Check Availability
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center gap-2 cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest font-medium opacity-60">Scroll to explore</span>
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
};

export default Hero;