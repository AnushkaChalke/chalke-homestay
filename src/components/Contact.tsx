
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: String(formData.get('guestName') ?? ''),
          phone: String(formData.get('phone') ?? ''),
          checkIn: String(formData.get('checkIn') ?? ''),
          checkOut: String(formData.get('checkOut') ?? ''),
          guests: String(formData.get('guests') ?? ''),
          roomType: String(formData.get('roomType') ?? ''),
          source: 'contact-form',
        }),
      });

      if (!response.ok) {
        throw new Error('Booking inquiry failed');
      }

      setLoading(false);
      toast({
        title: "Booking Inquiry Sent",
        description: "Our team will contact you shortly to confirm availability.",
      });
      e.currentTarget.reset();
    } catch {
      setLoading(false);
      toast({
        title: "Booking Inquiry Failed",
        description: "Please try again or reach us directly by phone or WhatsApp.",
      });
    }
  };

  return (
    <section className="py-24 bg-white" id="contact">
      <div className="container px-6 mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Contact Info & Map */}
            <div className="flex-1">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-accent font-semibold tracking-widest uppercase text-sm mb-4 block"
              >
                Get In Touch
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-headline font-bold text-primary mb-8"
              >
                Ready to Book Your <br />Experience?
              </motion.h2>
              
              <div className="space-y-8 mb-12">
                {[
                  { icon: MapPin, title: "Our Location", text: "Chalke Homestays Anari Fata, Adarsh Nagar, Sati, Chinchghari, Chiplun, Maharashtra 415604", linkText: "Open in Google Maps", link: "https://www.google.com/maps/search/?api=1&query=chalke+homestays+anari+fata+adarsh+nagar+sati+chinchghari+chiplun+maharashtra+415604" },
                  { icon: Phone, title: "Call Us Directly", text: "+91 95038 64263 or +91 98500 04263" },
                  { icon: MessageCircle, title: "WhatsApp Booking", text: "Instant support via WhatsApp", links: [
                    { href: "https://wa.me/919503864263", label: "+91 95038 64263" },
                    { href: "https://wa.me/919850004263", label: "+91 98500 04263" },
                  ] }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-6"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h5 className="font-bold text-primary mb-1">{item.title}</h5>
                      <p className="text-muted-foreground text-sm">{item.text}</p>
                      {item.links ? (
                        <div className="flex flex-wrap items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mt-2">
                          {item.links.map((link, idx) => (
                            <React.Fragment key={link.href}>
                              <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link.label}
                              </a>
                              {idx < item.links.length - 1 && <span className="text-muted-foreground">or</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : item.linkText ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold uppercase tracking-widest mt-2 block hover:underline">
                          {item.linkText}
                        </a>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map Placeholder */}
              <motion.a 
                href="https://www.google.com/maps/search/?api=1&query=chalke+homestays+anari+fata+adarsh+nagar+sati+chinchghari+chiplun+maharashtra+415604"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-[2.5rem] overflow-hidden shadow-xl h-64 border border-muted relative block"
              >
                <div className="absolute inset-0 bg-[url('/Locations/map.png')] bg-cover bg-center" />
              </motion.a>
            </div>

            {/* Form */}
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-secondary/20 p-10 md:p-12 rounded-[3rem] border border-muted shadow-2xl relative"
              >
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
                      <input name="guestName" required type="text" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Phone Number</label>
                      <input name="phone" required type="tel" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" placeholder="+91 00000 00000" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Check-in</label>
                      <input name="checkIn" required type="date" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Check-out</label>
                      <input name="checkOut" required type="date" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Guests</label>
                        <select name="guests" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm appearance-none">
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5+ Guests</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Room Type</label>
                        <select name="roomType" className="w-full bg-white border border-muted rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm appearance-none">
                        <option>AC 1BHK</option>
                        <option>Non-AC 1BHK</option>
                        <option>Entire Homestay</option>
                      </select>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={loading} className="w-full py-8 rounded-[2rem] bg-primary text-white text-lg font-bold hover:bg-accent transition-all shadow-lg hover:shadow-2xl mt-4">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Send Inquiry <Send className="w-5 h-5 ml-2" /></>}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
