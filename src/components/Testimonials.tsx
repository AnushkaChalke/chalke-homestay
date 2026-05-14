"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
  { name: 'Sameer K.', role: 'Weekend Traveler', content: 'Perfect peaceful getaway. The river view from the terrace is something I will never forget. Truly authentic experience.', rating: 5 },
  { name: 'Priya M.', role: 'Food Enthusiast', content: 'Amazing Konkani food! The Chicken Wade and Ghavne were delicious. The hosts treated us like family.', rating: 5 },
  { name: 'David W.', role: 'Nature Lover', content: 'Beautiful riverside stay. Away from all the noise. Highly recommend for anyone looking to disconnect and recharge.', rating: 5 },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden" id="testimonials">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-20">
          <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Guest Stories</span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Warm Words from Our Visitors</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-10 rounded-[2.5rem] bg-secondary/30 border border-muted relative group"
            >
              <Quote className="absolute top-8 right-10 w-12 h-12 text-primary/5 group-hover:text-accent/10 transition-colors" />
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-lg text-primary/80 mb-8 italic font-light leading-relaxed">
                "{review.content}"
              </p>
              <div className="flex items-center gap-4 border-t pt-6">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-primary">{review.name}</h5>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;