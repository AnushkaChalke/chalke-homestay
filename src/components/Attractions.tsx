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
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/20 overflow-hidden" id="attractions">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-10 md:mb-16">
          <div className="max-w-2xl">
            <span className="text-accent font-semibold tracking-widest uppercase text-xs sm:text-sm mb-4 block">Adventure Awaits</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Discover the Local Wonders</h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Chalke Homestay is centrally located near some of Konkan's most beautiful landmarks.
            </p>
          </div>
          <div className="hidden lg:block">
            <Navigation className="w-28 h-28 text-primary/10" />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 sm:gap-8 px-1 pb-6 hide-scrollbar snap-x snap-mandatory">
          {attractions.map((place, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="flex-shrink-0 w-[18rem] sm:w-80 snap-start"
            >
              <Card className="group relative overflow-hidden rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={place.img?.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={place.img?.imageHint}
                    />
                    <div className="absolute top-4 right-4 py-1.5 px-3 rounded-full glass text-white text-[10px] font-bold tracking-widest uppercase">
                      {place.dist} away
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {place.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] font-bold uppercase tracking-tighter text-white/60 border border-white/20 py-0.5 px-2 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-xl sm:text-2xl font-headline font-bold text-white group-hover:text-accent transition-colors flex items-center justify-between gap-3">
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

        <div className="mt-12 md:mt-16 text-center px-4">
          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className="inline-flex items-center gap-2 py-4 px-6 sm:px-8 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all cursor-pointer group text-sm sm:text-base"
          >
            <MapPin className="w-5 h-5 group-hover:animate-bounce" />
            View Full Tourist Guide
          </button>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Attractions;