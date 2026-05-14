"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Sunset, Wind } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const TerraceDining = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const terraceImg = PlaceHolderImages.find(i => i.id === 'terrace-dining');

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${terraceImg?.imageUrl})` }}
          data-ai-hint={terraceImg?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-background" />
      </motion.div>

      <div className="container relative z-10 px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center gap-6 mb-8">
            <Sunset className="w-8 h-8 text-accent animate-pulse" />
            <Star className="w-8 h-8 text-accent animate-pulse" />
            <Wind className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold text-white mb-8 leading-tight">
            Dining Above <br /><span className="text-accent italic">The Clouds</span>
          </h2>
          <p className="text-xl text-white/80 font-light leading-relaxed mb-12">
            As the sun dips below the Sahyadri mountains, our open terrace transforms into a magical dining arena. Surrounded by hanging lanterns and the sound of the nearby river, it's an experience you'll cherish forever.
          </p>
          <div className="inline-block py-3 px-8 rounded-full border border-white/20 glass text-white font-medium">
            Evening Sunset Sessions: 7:00 PM onwards
          </div>
        </motion.div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '10%',
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default TerraceDining;