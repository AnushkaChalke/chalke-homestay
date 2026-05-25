import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

declare global {
  // eslint-disable-next-line no-var
  var firebaseAdminApp: App | undefined;
}

function getFirebaseAdminApp() {
  if (globalThis.firebaseAdminApp) {
    return globalThis.firebaseAdminApp;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const app = getApps().length
    ? getApps()[0]
    : credentialsPath
      ? initializeApp({
          credential: applicationDefault(),
        })
      : projectId && clientEmail && privateKey
        ? initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          })
        : null;

  if (!app) {
    throw new Error(
      'Firestore admin credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.',
    );
  }

  globalThis.firebaseAdminApp = app;
  return app;
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function getFirestoreClient() {
  return getFirestore(getFirebaseAdminApp());
}