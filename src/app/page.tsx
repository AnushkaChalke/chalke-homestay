import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Rooms from '@/components/Rooms';
import Amenities from '@/components/Amenities';
import FoodExperience from '@/components/FoodExperience';
import TerraceDining from '@/components/TerraceDining';
import Attractions from '@/components/Attractions';
import AIConcierge from '@/components/AIConcierge';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <div className="relative z-10 bg-background">
        <About />
        <Rooms />
        <Amenities />
        <FoodExperience />
        <TerraceDining />
        <Attractions />
        <AIConcierge />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
