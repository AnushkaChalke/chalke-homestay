
"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Calendar, Users, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const Hero = () => {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ opacity }}
            className="text-center lg:text-left max-w-2xl"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-widest uppercase mb-6"
            >
              The Heart of Konkan
            </motion.span>
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-white mb-6 leading-tight"
            >
              Chalke <br /> <span className="text-accent">Homestay</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-white/80 mb-10 font-light max-w-lg leading-relaxed"
            >
              Authentic Konkani village stay surrounded by rivers, mountains, and eternal peace.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 px-8 text-base shadow-xl shadow-accent/20">
                  Explore Rooms
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-primary px-8 text-base backdrop-blur-sm">
                  Our Story
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Booking Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="hidden lg:block w-full max-w-sm"
          >
            <div className="glass-dark p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
              <h3 className="text-white text-2xl font-headline mb-6">Plan Your Stay</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Check-in Date"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer">
                    <option className="text-black">2 Guests</option>
                    <option className="text-black">3 Guests</option>
                    <option className="text-black">4+ Guests</option>
                  </select>
                </div>
                <div className="relative">
                  <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer">
                    <option className="text-black">AC 1BHK</option>
                    <option className="text-black">Non-AC 1BHK</option>
                  </select>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-white text-primary font-bold py-6 rounded-xl hover:bg-accent hover:text-white transition-all shadow-lg">
                    Check Availability
                  </Button>
                </motion.div>
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
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-xs uppercase tracking-widest font-medium opacity-60">Scroll to explore</span>
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
};

export default Hero;
