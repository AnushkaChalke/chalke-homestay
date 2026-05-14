"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Booking Inquiry Sent",
        description: "Our team will contact you shortly to confirm availability.",
      });
    }, 1500);
  };

  return (
    <section className="py-24 bg-white" id="contact">
      <div className="container px-6 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Contact Info & Map */}
            <div className="flex-1">
              <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block">Get In Touch</span>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-8">Ready to Book Your <br />Experience?</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-1">Our Location</h5>
                    <p className="text-muted-foreground text-sm">Chalke Homestay, Near Vashishti River, Konkan, Maharashtra</p>
                    <a href="https://share.google/WpEDOabdhEYYDZWTh" target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold uppercase tracking-widest mt-2 block hover:underline">Open in Google Maps</a>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-1">Call Us Directly</h5>
                    <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h5 className="font-bold text-primary mb-1">WhatsApp Booking</h5>
                    <p className="text-muted-foreground text-sm">Instant support via WhatsApp</p>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold uppercase tracking-widest mt-2 block hover:underline">Chat Now</a>
                  </div>
                </div>
              </div>

              {/* Map Placeholder/Embed */}
              <div className="rounded-[2.5rem] overflow-hidden shadow-xl h-64 border border-muted bg-secondary/50 flex items-center justify-center relative group">
                <div className="absolute inset-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 bg-[url('https://picsum.photos/seed/map/800/400')] bg-cover bg-center" />
                <div className="relative z-10 p-6 glass rounded-2xl text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-primary font-bold">Vashishti Riverfront</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1">
              <div className="bg-secondary/20 p-10 md:p-12 rounded-[3rem] border border-muted shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-16 h-16 rounded-full border border-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary/20" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-headline font-bold text-primary mb-8">Booking Inquiry</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Full Name</label>
                      <input required type="text" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Phone Number</label>
                      <input required type="tel" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" placeholder="+91 00000 00000" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Check-in</label>
                      <input required type="date" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Check-out</label>
                      <input required type="date" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Guests</label>
                      <select className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm appearance-none">
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5+ Guests</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Room Type</label>
                      <select className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm appearance-none">
                        <option>AC 1BHK</option>
                        <option>Non-AC 1BHK</option>
                        <option>Entire Homestay</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-8 rounded-[2rem] bg-primary text-white text-lg font-bold hover:bg-accent transition-all shadow-lg hover:shadow-2xl mt-4">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Send Inquiry <Send className="w-5 h-5 ml-2" /></>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;