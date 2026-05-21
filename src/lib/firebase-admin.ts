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

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const app = getApps().length
    ? getApps()[0]
    : projectId && clientEmail && privateKey
      ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
      : initializeApp({
          credential: applicationDefault(),
        });

  globalThis.firebaseAdminApp = app;
  return app;
}

export const firestore = getFirestore(getFirebaseAdminApp());