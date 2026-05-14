"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, Mountain, UtensilsCrossed } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const stats = [
  { icon: Users, label: '6 Rooms', value: 'Boutique' },
  { icon: Wifi, label: 'Free WiFi', value: 'Seamless' },
  { icon: Mountain, label: 'Views', value: 'Scenic' },
  { icon: UtensilsCrossed, label: 'Dining', value: 'Terrace' },
];

const About = () => {
  const villageImage = PlaceHolderImages.find(img => img.id === 'about-village');

  return (
    <section className="py-24 overflow-hidden" id="about">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={villageImage?.imageUrl}
                alt="Village Scenery"
                className="w-full h-auto object-cover"
                data-ai-hint={villageImage?.imageHint}
              />
            </div>
            {/* Layered decorative cards */}
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-48 h-48 bg-accent/10 backdrop-blur-xl border border-accent/20 rounded-3xl -z-10"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 backdrop-blur-xl border border-primary/10 rounded-3xl -z-10"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Our Heritage</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-8 leading-tight">
              Escape to the Peace <br />of Chalke Homestay
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Established in 2026, we bring you the ultimate Konkani village experience. Nestled away from city noise, our homestay offers a unique river-facing environment with majestic mountain views.
            </p>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              We pride ourselves on authentic Konkani hospitality, serving fresh local meals from our live kitchen and providing a serene atmosphere that recharges your soul.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="p-4 rounded-2xl bg-secondary/50 border border-secondary flex flex-col items-center text-center"
                >
                  <stat.icon className="w-6 h-6 text-accent mb-2" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;