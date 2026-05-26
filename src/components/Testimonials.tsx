"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';

const googleReviewsUrl =
  'https://www.google.com/maps/place/Chalke+Homestays/@17.5089307,73.5637848,17z/data=!4m8!3m7!1s0x3bc20544ea8b2df9:0x882c9ab486d7aaff!8m2!3d17.5089307!4d73.5637848!9m1!1b1!16s%2Fg%2F11n42vsqmx?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D';

const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden" id="testimonials">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-20">
          <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Guest Stories</span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Warm Words from Our Visitors</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto p-8 sm:p-10 rounded-[2.5rem] bg-secondary/30 border border-muted text-center"
        >
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-accent text-accent" />
            ))}
          </div>
          <p className="text-base sm:text-lg text-primary/80 mb-8 leading-relaxed">
            Read authentic guest reviews directly on Google.
          </p>
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            View Google Reviews
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;