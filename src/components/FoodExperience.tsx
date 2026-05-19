"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Flame } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const dishes = [
  { name: 'Kombdi Vade', img: PlaceHolderImages.find(i => i.id === 'food-chicken-wade'), desc: 'Spicy farm-fresh chicken curry served with fluffy, deep-fried multi-grain vade.' },
  { name: 'Authentic Ghavne', img: PlaceHolderImages.find(i => i.id === 'food-ghavne'), desc: 'Lacy, soft rice crepes served with fresh coconut chutney.' },
  { name: 'Konkani Fish Fry', img: PlaceHolderImages.find(i => i.id === 'food-fish-fry'), desc: 'Crispy rava-fried catch of the day with authentic local spices.' },
  { name: 'Dry Chicken Sukka', img: PlaceHolderImages.find(i => i.id === 'food-dry-chicken'), desc: 'Smoky, charred chicken pieces tossed in traditional Maharashtrian masalas.' },
  { name: 'Rice Bhakri', img: PlaceHolderImages.find(i => i.id === 'food-bhakri'), desc: 'Traditional handmade rice bread, perfect with spicy curries.' },
];

const FoodExperience = () => {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden" id="food">
      <div className="container px-6 mx-auto mb-16">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-accent text-xs font-semibold tracking-widest uppercase mb-6"
            >
              <Flame className="w-3 h-3" />
              Live Terrace Kitchen
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-8 leading-tight">
              Savor the Authentic <br />Flavor of Konkan
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Experience freshly prepared Konkani meals served straight from our live terrace kitchen. We use locally sourced ingredients and traditional slow-cooking methods.
            </p>
          </div>
          <div className="hidden lg:block">
            <UtensilsCrossed className="w-32 h-32 text-white/5 opacity-50" />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto gap-8 px-6 pb-12 hide-scrollbar snap-x">
          {dishes.map((dish, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="flex-shrink-0 w-80 snap-start"
            >
              <div className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] shadow-2xl">
                <img
                  src={dish.img?.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={dish.img?.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <h4 className="text-2xl font-headline font-bold text-white mb-2">{dish.name}</h4>
                  <p className="text-sm text-white/60 leading-relaxed translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {dish.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
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

export default FoodExperience;