"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'Home', href: '#' },
  { name: 'Rooms', href: '#rooms' },
  { name: 'Food', href: '#food' },
  { name: 'Attractions', href: '#attractions' },
  { name: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3 bg-white/80 backdrop-blur-lg shadow-sm border-b'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className={`text-2xl font-headline font-bold transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white'}`}>
            Chalke Homestay
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 hover:text-accent ${
                isScrolled ? 'text-foreground' : 'text-white/90'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Button
            asChild
            variant="default"
            className={`${
              isScrolled ? 'bg-primary' : 'bg-white text-primary hover:bg-white/90'
            } transition-all duration-300 rounded-full px-6 shadow-lg`}
          >
            <Link href="#contact">Book Now</Link>
          </Button>
        </div>

        {/* Mobile Trigger */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className={isScrolled ? 'text-foreground' : 'text-white'} />
          ) : (
            <Menu className={isScrolled ? 'text-foreground' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b shadow-2xl p-6 md:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-foreground py-2 border-b border-muted last:border-0"
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="mt-4 rounded-full w-full">
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                Book Now
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;