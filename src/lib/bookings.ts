import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getFirestoreClient, isFirebaseAdminConfigured } from '@/lib/firebase-admin';

export const bookingStatusValues = ['requested', 'reserved', 'cancelled'] as const;

export const bookingInputSchema = z.object({
  guestName: z.string().min(2, 'Guest name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.string().min(1, 'Guest count is required'),
  roomType: z.string().min(1, 'Room type is required'),
  extraBeds: z.number().int().min(0).max(2).default(0),
  extraBedRate: z.number().int().positive().default(500),
  extraBedTotal: z.number().int().min(0).default(0),
  source: z.string().optional().default('website'),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(bookingStatusValues),
  reservedRoom: z.string().optional().nullable(),
  adminNote: z.string().optional().nullable(),
});

export type BookingStatus = (typeof bookingStatusValues)[number];

export type BookingRecord = {
  id: string;
  guestName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  roomType: string;
  extraBeds: number;
  extraBedRate: number;
  extraBedTotal: number;
  source: string;
  status: BookingStatus;
  reservedRoom: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

type BookingDocument = {
  guestName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  roomType: string;
  extraBeds: number;
  extraBedRate: number;
  extraBedTotal: number;
  source: string;
  status: BookingStatus;
  reservedRoom: string | null;
  adminNote: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function assertFirestoreConfigured() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      'Firestore admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.',
    );
  }
}

function toBookingRecord(id: string, data: FirebaseFirestore.DocumentData): BookingRecord {
  const typedData = data as BookingDocument;

  return {
    id,
    guestName: typedData.guestName,
    phone: typedData.phone,
    checkIn: typedData.checkIn,
    checkOut: typedData.checkOut,
    guests: typedData.guests,
    roomType: typedData.roomType,
    extraBeds: typedData.extraBeds ?? 0,
    extraBedRate: typedData.extraBedRate ?? 500,
    extraBedTotal: typedData.extraBedTotal ?? 0,
    source: typedData.source,
    status: typedData.status,
    reservedRoom: typedData.reservedRoom ?? null,
    adminNote: typedData.adminNote ?? null,
    createdAt: typedData.createdAt.toDate().toISOString(),
    updatedAt: typedData.updatedAt.toDate().toISOString(),
  };
}

export async function createBooking(input: z.infer<typeof bookingInputSchema>) {
  assertFirestoreConfigured();
  const firestore = getFirestoreClient();
  const now = Timestamp.now();
  const extraBedRate = 500;
  const extraBedTotal = input.extraBeds * extraBedRate;

  // Ensure check-in/check-out include expected times if only a date was provided.
  // Default: check-in 12:00 (noon), check-out 11:00.
  const attachTimes = (value: string, time: string) => {
    // simple heuristic: if value looks like YYYY-MM-DD (no T), append time
    return value.includes('T') ? value : `${value}T${time}`;
  };

  const checkInWithTime = attachTimes(input.checkIn, '12:00:00');
  const checkOutWithTime = attachTimes(input.checkOut, '11:00:00');

  const payload = {
    ...input,
    checkIn: checkInWithTime,
    checkOut: checkOutWithTime,
    extraBedRate,
    extraBedTotal,
    status: 'requested' as const,
    reservedRoom: null,
    adminNote: null,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await firestore.collection('bookings').add(payload);

  const snapshot = await docRef.get();
  return toBookingRecord(snapshot.id, snapshot.data() ?? {});
}

export async function listBookings() {
  assertFirestoreConfigured();
  const firestore = getFirestoreClient();
  const snapshot = await firestore.collection('bookings').orderBy('createdAt', 'desc').get();

  return snapshot.docs.map((doc) => toBookingRecord(doc.id, doc.data()));
}

export async function updateBooking(id: string, update: z.infer<typeof bookingUpdateSchema>) {
  assertFirestoreConfigured();
  const firestore = getFirestoreClient();
  const docRef = firestore.collection('bookings').doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    return null;
  }

  const payload = {
    ...update,
    updatedAt: Timestamp.now(),
  };

  await docRef.update(payload);
  const refreshed = await docRef.get();

  return toBookingRecord(refreshed.id, refreshed.data() ?? {});
}

export async function deleteBooking(id: string) {
  assertFirestoreConfigured();
  const firestore = getFirestoreClient();
  const docRef = firestore.collection('bookings').doc(id);
  const existing = await docRef.get();

  if (!existing.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}
