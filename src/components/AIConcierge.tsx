"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Map, Utensils, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiKonkaniConcierge, type AiKonkaniConciergeOutput } from '@/ai/flows/ai-konkani-concierge';

const AIConcierge = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiKonkaniConciergeOutput | null>(null);
  const [prefs, setPrefs] = useState({
    name: '',
    food: 'spicy seafood',
    activity: 'nature walks and waterfalls',
    days: 3,
  });

  const handleGenerate = async () => {
    if (!prefs.name) return;
    setLoading(true);
    try {
      const data = await aiKonkaniConcierge({
        guestName: prefs.name,
        foodPreferences: prefs.food,
        activityPreferences: prefs.activity,
        durationInDays: prefs.days,
      });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-secondary/20" id="ai-concierge">
      <div className="container px-6 mx-auto">
        <div className="max-w-5xl mx-auto rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-muted">
          <div className="grid lg:grid-cols-5 min-h-[600px]">
            {/* Form Side */}
            <div className="lg:col-span-2 p-10 lg:p-12 bg-primary text-white flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 text-accent text-xs font-semibold tracking-widest uppercase mb-6">
                  <Sparkles className="w-3 h-3" />
                  AI Concierge
                </div>
                <h3 className="text-3xl font-headline font-bold mb-6">Personalize Your Journey</h3>
                <p className="text-white/60 text-sm mb-10 leading-relaxed">
                  Let our AI design your perfect Konkani retreat. Tell us what you love, and we'll handle the rest.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2 block">Guest Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={prefs.name}
                      onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2 block">Food Love</label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian, spicy"
                      value={prefs.food}
                      onChange={(e) => setPrefs({ ...prefs, food: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-white/40 mb-2 block">Interests</label>
                    <input
                      type="text"
                      placeholder="e.g. Temples, treks"
                      value={prefs.activity}
                      onChange={(e) => setPrefs({ ...prefs, activity: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !prefs.name}
                className="w-full bg-accent hover:bg-white hover:text-primary py-6 rounded-xl mt-12 transition-all font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate Itinerary <Send className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>

            {/* Results Side */}
            <div className="lg:col-span-3 p-10 lg:p-12 flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-left overflow-y-auto max-h-[500px] pr-4"
                  >
                    <div className="mb-8 p-6 bg-accent/5 rounded-3xl border border-accent/10">
                      <h4 className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
                        <Utensils className="w-5 h-5 text-accent" />
                        Culinary Picks for {prefs.name}
                      </h4>
                      <div className="grid gap-3">
                        {result.dishRecommendations.map((dish, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-primary">{dish.name}</span>
                              <p className="text-muted-foreground">{dish.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <h4 className="flex items-center gap-2 text-xl font-bold text-primary mb-6">
                        <Map className="w-5 h-5 text-accent" />
                        Your Bespoke Itinerary
                      </h4>
                      <div className="space-y-8">
                        {result.itineraryRecommendations.map((day, i) => (
                          <div key={i} className="relative pl-6 border-l-2 border-primary/10">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                            <h5 className="font-bold text-primary mb-4">Day {day.day}</h5>
                            <div className="space-y-4">
                              {day.activities.map((act, j) => (
                                <div key={j} className="text-sm">
                                  <span className="text-xs font-bold text-accent uppercase tracking-tighter block mb-1">{act.time} — {act.location}</span>
                                  <p className="text-muted-foreground">{act.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
                      <Sparkles className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-primary mb-4">Ready to Explore?</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Fill out your preferences on the left to see our AI recommendations for food and day-trips.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;