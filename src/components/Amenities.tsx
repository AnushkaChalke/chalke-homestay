"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, ShieldCheck, Car, Bed, Waves, Utensils, Mountain, Users, Zap, Coffee } from 'lucide-react';

const amenities = [
  { icon: Wifi, title: 'Free WiFi', desc: 'High-speed connectivity' },
  { icon: ShieldCheck, title: 'CCTV Security', desc: '24/7 safe surveillance' },
  { icon: Car, title: 'Free Parking', desc: 'Secure space for guests' },
  { icon: Bed, title: 'King Size Beds', desc: 'Ultimate sleeping comfort' },
  { icon: Zap, title: 'Hot Water', desc: 'Instant geyser facility' },
  { icon: Utensils, title: 'Terrace Dining', desc: 'Eat under the stars' },
  { icon: Coffee, title: 'Live Kitchen', desc: 'Fresh home-made meals' },
  { icon: Mountain, title: 'Mountain Views', desc: 'Breathtaking scenery' },
  { icon: Waves, title: 'River Atmosphere', desc: 'Peaceful waterfront' },
  { icon: Users, title: 'Family Friendly', desc: 'Space for everyone' },
];

const Amenities = () => {
  return (
    <section className="py-24 bg-white" id="amenities">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Our Facilities</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Everything for Your Comfort</h2>
          </div>
          <p className="text-muted-foreground max-w-sm mb-2">
            We've carefully curated our amenities to ensure your village stay is as comfortable as it is authentic.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {amenities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, backgroundColor: 'rgba(var(--accent), 0.05)' }}
              className="p-8 rounded-3xl border border-muted bg-secondary/20 flex flex-col items-center text-center group transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7 text-accent" />
              </div>
              <h4 className="text-lg font-bold text-primary mb-2">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities;