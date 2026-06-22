import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getFirestoreClient, isFirebaseAdminConfigured } from '@/lib/firebase-admin';

export const pricingSettingsSchema = z.object({
  ac: z.object({
    originalPrice: z.number().int().min(0),
    offerPrice: z.number().int().min(0),
    offerEnabled: z.boolean(),
    offerStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    offerEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  }),
  nonAc: z.object({
    originalPrice: z.number().int().min(0),
    offerPrice: z.number().int().min(0),
    offerEnabled: z.boolean(),
    offerStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    offerEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  }),
});

export type RoomPricingSettings = z.infer<typeof pricingSettingsSchema>['ac'];
export type PricingSettings = z.infer<typeof pricingSettingsSchema>;

const pricingSettingsDocumentSchema = pricingSettingsSchema.extend({
  updatedAt: z.any().optional(),
});

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

const pricingDocRef = () => getFirestoreClient().collection('siteSettings').doc('pricing');

function assertFirestoreConfigured() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      'Firestore admin credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.',
    );
  }
}

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

export async function getPricingSettings() {
  assertFirestoreConfigured();
  const snapshot = await pricingDocRef().get();

  if (!snapshot.exists) {
    return normalizePricingSettings(DEFAULT_PRICING_SETTINGS);
  }

  const parsed = pricingSettingsDocumentSchema.safeParse(snapshot.data());

  if (!parsed.success) {
    return normalizePricingSettings(DEFAULT_PRICING_SETTINGS);
  }

  return normalizePricingSettings(parsed.data);
}

export async function savePricingSettings(input: PricingSettings) {
  assertFirestoreConfigured();
  const now = Timestamp.now();
  const payload = {
    ...normalizePricingSettings(input),
    updatedAt: now,
  };

  await pricingDocRef().set(payload, { merge: true });

  return normalizePricingSettings(payload);
}
