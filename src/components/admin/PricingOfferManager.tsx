"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { AlertCircle, CalendarDays, Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  DEFAULT_PRICING_SETTINGS,
  type PricingSettings,
  getDisplayedRoomPrice,
  isOfferActive,
  normalizePricingSettings,
  notifyPricingSettingsUpdated,
} from '@/lib/pricing-settings-client';

const roomMeta = [
  {
    key: 'ac' as const,
    title: 'AC 1BHK Premium',
    description: 'Set a limited-time offer for the AC room pricing.',
  },
  {
    key: 'nonAc' as const,
    title: 'Non-AC 1BHK Authentic',
    description: 'Set a limited-time offer for the non-AC room pricing.',
  },
];

function prettyDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  try {
    return format(parseISO(value), 'dd-MM-yyyy');
  } catch {
    return value;
  }
}

export default function PricingOfferManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PricingSettings>(DEFAULT_PRICING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch('/api/pricing-settings', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load pricing settings');
        }

        const data = await response.json();
        if (mounted) {
          setSettings(normalizePricingSettings(data.settings));
          setLoadError('');
        }
      } catch (error) {
        if (mounted) {
          setSettings(DEFAULT_PRICING_SETTINGS);
          setLoadError(error instanceof Error ? error.message : 'Unable to load pricing settings');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateRoom = (roomKey: keyof PricingSettings, updater: (current: PricingSettings[keyof PricingSettings]) => PricingSettings[keyof PricingSettings]) => {
    setSettings((current) => ({
      ...current,
      [roomKey]: updater(current[roomKey]),
    }));
  };

  const save = () => {
    startTransition(async () => {
      setSaving(true);

      try {
        const response = await fetch('/api/pricing-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });

        if (response.status === 401) {
          toast({ title: 'Session expired', description: 'Please sign in again.' });
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error ?? 'Unable to save pricing settings');
        }

        const data = await response.json();
        setSettings(normalizePricingSettings(data.settings));
        notifyPricingSettingsUpdated();
        toast({ title: 'Pricing updated', description: 'Offer pricing settings were saved.' });
      } catch (error) {
        toast({
          title: 'Save failed',
          description: error instanceof Error ? error.message : 'Unable to save pricing settings',
        });
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <section className="rounded-[1.25rem] border bg-white/90 p-4 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-emerald-700 sm:px-4 sm:text-xs sm:tracking-[0.3em]">
            <Sparkles className="h-4 w-4" /> Pricing offers
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary sm:text-3xl">Manage normal and offer pricing</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:leading-normal">
            Turn an offer on or off, choose when it starts and ends, and keep the normal price as the fallback.
          </p>
        </div>
        <Button onClick={save} className="w-full rounded-full bg-primary py-2 sm:w-auto" disabled={loading || saving || isPending}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save pricing
        </Button>
      </div>

      {loadError ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{loadError}</div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {roomMeta.map((room) => {
          const current = settings[room.key];
          const active = isOfferActive(current);
          const currentRate = getDisplayedRoomPrice(current);

          return (
            <Card key={room.key} className="border-primary/10 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-primary">{room.title}</CardTitle>
                    <CardDescription className="mt-1">{room.description}</CardDescription>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {active ? 'Offer live' : 'Normal pricing'}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Normal price</span>
                    <input
                      type="number"
                      min="0"
                      value={current.originalPrice}
                      readOnly
                      className="mt-1 w-full rounded-xl border border-muted bg-muted/30 p-3 text-sm text-primary outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Offer price</span>
                    <input
                      type="number"
                      min="0"
                      value={current.offerPrice}
                      onChange={(event) =>
                        updateRoom(room.key, (roomSettings) => ({
                          ...roomSettings,
                          offerPrice: Number(event.target.value || 0),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border p-3 text-sm text-primary outline-none focus:border-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border bg-secondary/20 px-4 py-3 sm:col-span-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">Use offer pricing</div>
                      <div className="text-xs text-muted-foreground">When off, the homepage and room pages show the normal price only.</div>
                    </div>
                    <Switch
                      checked={current.offerEnabled}
                      onCheckedChange={(checked) =>
                        updateRoom(room.key, (roomSettings) => ({
                          ...roomSettings,
                          offerEnabled: checked,
                        }))
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Offer starts</span>
                    <input
                      type="date"
                      value={current.offerStartDate ?? ''}
                      onChange={(event) =>
                        updateRoom(room.key, (roomSettings) => ({
                          ...roomSettings,
                          offerStartDate: event.target.value || null,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border p-3 text-sm text-primary outline-none focus:border-accent"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Offer ends</span>
                    <input
                      type="date"
                      value={current.offerEndDate ?? ''}
                      onChange={(event) =>
                        updateRoom(room.key, (roomSettings) => ({
                          ...roomSettings,
                          offerEndDate: event.target.value || null,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border p-3 text-sm text-primary outline-none focus:border-accent"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-dashed border-primary/15 bg-slate-50 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-primary">Preview</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {prettyDate(current.offerStartDate)} → {prettyDate(current.offerEndDate)}
                    </span>
                  </div>
                  <div className="mt-2 text-base font-semibold text-primary">
                    {active ? (
                      <>
                        Offer active now at ₹{currentRate.toLocaleString('en-IN')} / night
                      </>
                    ) : (
                      <>
                        Normal pricing active at ₹{currentRate.toLocaleString('en-IN')} / night
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
