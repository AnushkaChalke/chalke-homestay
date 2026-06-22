import { useEffect, useState } from 'react';

export type RoomPricingSettings = {
  originalPrice: number;
  offerPrice: number;
  offerEnabled: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;
};

export type PricingSettings = {
  ac: RoomPricingSettings;
  nonAc: RoomPricingSettings;
};

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  ac: {
    originalPrice: 1800,
    offerPrice: 1500,
    offerEnabled: false,
    offerStartDate: null,
    offerEndDate: null,
  },
  nonAc: {
    originalPrice: 1500,
    offerPrice: 1200,
    offerEnabled: false,
    offerStartDate: null,
    offerEndDate: null,
  },
};

function normalizeRoomPricing(room: Partial<RoomPricingSettings> | undefined, defaults: RoomPricingSettings): RoomPricingSettings {
  return {
    originalPrice: room?.originalPrice ?? defaults.originalPrice,
    offerPrice: room?.offerPrice ?? defaults.offerPrice,
    offerEnabled: room?.offerEnabled ?? defaults.offerEnabled,
    offerStartDate: room?.offerStartDate ?? defaults.offerStartDate,
    offerEndDate: room?.offerEndDate ?? defaults.offerEndDate,
  };
}

export function normalizePricingSettings(value?: Partial<PricingSettings> | null): PricingSettings {
  return {
    ac: normalizeRoomPricing(value?.ac, DEFAULT_PRICING_SETTINGS.ac),
    nonAc: normalizeRoomPricing(value?.nonAc, DEFAULT_PRICING_SETTINGS.nonAc),
  };
}

export function isOfferActive(room: RoomPricingSettings, referenceDate = new Date()) {
  if (!room.offerEnabled) {
    return false;
  }

  const today = referenceDate.toISOString().slice(0, 10);

  if (room.offerStartDate && today < room.offerStartDate) {
    return false;
  }

  if (room.offerEndDate && today > room.offerEndDate) {
    return false;
  }

  return true;
}

export function getDisplayedRoomPrice(room: RoomPricingSettings, referenceDate = new Date()) {
  return isOfferActive(room, referenceDate) ? room.offerPrice : room.originalPrice;
}

const PRICING_SETTINGS_EVENT = 'pricing-settings-updated';
const PRICING_SETTINGS_STORAGE_KEY = 'pricing-settings-updated-at';

async function fetchPricingSettings() {
  const response = await fetch('/api/pricing-settings', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Unable to load pricing settings');
  }

  const data = await response.json();
  return normalizePricingSettings(data.settings);
}

export function notifyPricingSettingsUpdated() {
  const stamp = String(Date.now());

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PRICING_SETTINGS_STORAGE_KEY, stamp);
    window.dispatchEvent(new Event(PRICING_SETTINGS_EVENT));

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('pricing-settings');
      channel.postMessage(stamp);
      channel.close();
    }
  }
}

export function usePricingSettings() {
  const [settings, setSettings] = useState(DEFAULT_PRICING_SETTINGS);

  useEffect(() => {
    let mounted = true;
    let channel: BroadcastChannel | null = null;

    const load = async () => {
      try {
        const nextSettings = await fetchPricingSettings();
        if (mounted) {
          setSettings(nextSettings);
        }
      } catch {
        if (mounted) {
          setSettings(DEFAULT_PRICING_SETTINGS);
        }
      }
    };

    const handleUpdate = () => {
      void load();
    };

    void load();

    window.addEventListener(PRICING_SETTINGS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('pricing-settings');
      channel.onmessage = handleUpdate;
    }

    return () => {
      mounted = false;
      window.removeEventListener(PRICING_SETTINGS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      channel?.close();
    };
  }, []);

  return settings;
}
