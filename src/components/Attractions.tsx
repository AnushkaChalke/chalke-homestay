"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const attractions = [
  { name: 'Sawatsada Waterfall', dist: '3.5 KM', img: PlaceHolderImages.find(i => i.id === 'attraction-waterfall'), tags: ['Nature', 'Relaxation'] },
  { name: 'Parshuram Temple', dist: '4 KM', img: PlaceHolderImages.find(i => i.id === 'attraction-temple'), tags: ['Heritage', 'Spiritual'] },
  { name: 'Vashishti River', dist: '5 KM', img: PlaceHolderImages.find(i => i.id === 'attraction-river'), tags: ['Water', 'Scenic'] },
  { name: 'Gowalkot Fort', dist: '8 KM', img: PlaceHolderImages.find(i => i.id === 'attraction-fort'), tags: ['History', 'Hiking'] },
];

const Attractions = () => {
  return (
    <section className="py-24" id="attractions">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Adventure Awaits</span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Discover the Local Wonders</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chalke Homestay is centrally located near some of Konkan's most beautiful landmarks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {attractions.map((place, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={place.img?.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={place.img?.imageHint}
                    />
                    <div className="absolute top-4 right-4 py-1.5 px-3 rounded-full glass text-white text-[10px] font-bold tracking-widest uppercase">
                      {place.dist} away
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex gap-2 mb-3">
                        {place.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] font-bold uppercase tracking-tighter text-white/60 border border-white/20 py-0.5 px-2 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-xl font-headline font-bold text-white group-hover:text-accent transition-colors flex items-center justify-between">
                        {place.name}
                        <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 py-4 px-8 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all cursor-pointer group">
            <MapPin className="w-5 h-5 group-hover:animate-bounce" />
            View Full Tourist Guide
          </div>
        </div>
      </div>
    </section>
  );
};

export default Attractions;