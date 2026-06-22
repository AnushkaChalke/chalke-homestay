
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';
import { getDisplayedRoomPrice, isOfferActive, usePricingSettings } from '@/lib/pricing-settings-client';

const rooms = [
  {
    title: 'AC 1BHK Premium',
    id: 'room-ac',
    description: 'Luxury AC rooms with modern amenities and a king size bed.',
    originalPrice: '₹1,800',
    offerPrice: '₹1,500',
    features: ['King Size Bed', 'Free WiFi', 'Geyser', 'Mountain View', '4 Guest Capacity'],
    image: PlaceHolderImages.find(img => img.id === 'room-ac'),
  },
  {
    title: 'Non-AC 1BHK Authentic',
    id: 'room-non-ac',
    description: 'Experience village life with natural breeze and scenic river views.',
    originalPrice: '₹1,500',
    offerPrice: '₹1,200',
    features: ['King Size Bed', 'Free WiFi', 'Geyser', 'River Atmosphere', '4 Guest Capacity'],
    image: PlaceHolderImages.find(img => img.id === 'room-non-ac'),
  },
];

const Rooms = () => {
  const router = useRouter();
  const pricingSettings = usePricingSettings();
  return (
    <section className="py-16 md:py-24 bg-secondary/30" id="rooms">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block"
          >
            Luxury Stays
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-primary mb-4"
          >
            Choose Your Sanctuary
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Each room is thoughtfully designed to blend rustic village charm with modern comfort.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-3xl transition-all duration-500 bg-white">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                      src={room.image?.imageUrl}
                      alt={room.title}
                      className="w-full h-full object-cover"
                      data-ai-hint={room.image?.imageHint}
                    />
                    <div className="absolute top-6 left-6 py-2 px-4 rounded-full glass-dark text-white text-xs font-semibold tracking-wider">
                      3 Rooms Available
                    </div>
                  </div>
                  <div className="p-5 sm:p-8 lg:p-10">
                    <h3 className="text-2xl sm:text-3xl font-headline font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 line-clamp-2">{room.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      {room.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-primary/70">
                          <motion.div 
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="w-1.5 h-1.5 rounded-full bg-accent" 
                          />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t pt-6 sm:pt-8">
                      <div>
                        {(() => {
                          const roomPricing = room.id === 'room-ac' ? pricingSettings.ac : pricingSettings.nonAc;
                          const offerActive = isOfferActive(roomPricing);
                          const displayPrice = getDisplayedRoomPrice(roomPricing);

                          return offerActive ? (
                            <>
                              <div className="flex items-end gap-3">
                                <span className="block text-2xl font-bold text-emerald-600">₹{displayPrice.toLocaleString('en-IN')}</span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                  Limited Offer
                                </span>
                              </div>
                              <span className="block text-sm text-red-600 line-through decoration-red-600">
                                ₹{roomPricing.originalPrice.toLocaleString('en-IN')}
                              </span>
                            </>
                          ) : (
                            <span className="block text-2xl font-bold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
                          );
                        })()}
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Per Night</span>
                      </div>
                      <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                        {room.id === 'room-ac' ? (
                          <Button onClick={() => router.push('/rooms/ac')} className="w-full sm:w-auto rounded-full bg-primary hover:bg-accent px-8 group shadow-lg">
                            Book Stay
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        ) : (
                        <Button onClick={() => router.push('/rooms/non-ac')} className="w-full sm:w-auto rounded-full bg-primary hover:bg-accent px-8 group shadow-lg">
                          Book Stay
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        )}
                      </motion.div>
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
          className="text-center mt-10 sm:mt-12 text-xs sm:text-sm text-muted-foreground italic px-4"
        >
          * Extra mattress available with additional charges.
        </motion.p>
      </div>
    </section>
  );
};

export default Rooms;
