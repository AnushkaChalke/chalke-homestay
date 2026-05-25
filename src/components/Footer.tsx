"use client";

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-white pt-24 pb-12 overflow-hidden relative">
      {/* Animated background accent */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container px-6 mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-headline font-bold mb-6">Chalke Homestay</h2>
            <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
              Authentic Konkani village stay surrounded by rivers, mountains, and eternal peace. Experience true hospitality in the heart of nature.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors border border-white/10">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors border border-white/10">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors border border-white/10">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-accent mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="#about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="#rooms" className="hover:text-white transition-colors">Rooms & Stays</Link></li>
              <li><Link href="#food" className="hover:text-white transition-colors">Konkani Food</Link></li>
              <li><Link href="#attractions" className="hover:text-white transition-colors">Local Guide</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-accent mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/admin/bookings" className="hover:text-white transition-colors">Admin Bookings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/40 tracking-wider">
            © 2026 Chalke Homestay. All Rights Reserved. Crafted for the love of Konkan.
          </p>
          <button
            onClick={scrollToTop}
            className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;