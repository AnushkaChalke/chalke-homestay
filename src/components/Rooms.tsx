"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Thermometer, User, Maximize, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const rooms = [
  {
    title: 'AC 1BHK Premium',
    id: 'room-ac',
    description: 'Luxury AC rooms with modern amenities and a king size bed.',
    features: ['King Size Bed', 'Free WiFi', 'Geyser', 'Mountain View', '4 Guest Capacity'],
    image: PlaceHolderImages.find(img => img.id === 'room-ac'),
  },
  {
    title: 'Non-AC 1BHK Authentic',
    id: 'room-non-ac',
    description: 'Experience village life with natural breeze and scenic river views.',
    features: ['King Size Bed', 'Free WiFi', 'Geyser', 'River Atmosphere', '4 Guest Capacity'],
    image: PlaceHolderImages.find(img => img.id === 'room-non-ac'),
  },
];

const Rooms = () => {
  return (
    <section className="py-24 bg-secondary/30" id="rooms">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block"
          >
            Luxury Stays
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Choose Your Sanctuary</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each room is thoughtfully designed to blend rustic village charm with modern comfort.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={room.image?.imageUrl}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={room.image?.imageHint}
                    />
                    <div className="absolute top-6 left-6 py-2 px-4 rounded-full glass-dark text-white text-xs font-semibold tracking-wider">
                      3 Rooms Available
                    </div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-3xl font-headline font-bold text-primary mb-4">{room.title}</h3>
                    <p className="text-muted-foreground mb-8 line-clamp-2">{room.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {room.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-primary/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-8">
                      <div>
                        <span className="block text-2xl font-bold text-primary">₹3,500</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Per Night</span>
                      </div>
                      <Button className="rounded-full bg-primary hover:bg-accent px-8 group">
                        Book Stay
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mt-12 text-sm text-muted-foreground italic"
        >
          * Extra mattress available with additional charges. 4 guests capacity per room.
        </motion.p>
      </div>
    </section>
  );
};

export default Rooms;