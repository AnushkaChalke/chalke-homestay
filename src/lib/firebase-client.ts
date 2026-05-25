"use client"

import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let firebaseApp: FirebaseApp | null = null

if (typeof window !== "undefined") {
  if (!getApps().length) {
    firebaseApp = initializeApp(clientCredentials)
    try {
      // Analytics can throw in some environments (disabled, blocked, etc.)
      getAnalytics(firebaseApp)
    } catch (err) {
      // ignore analytics errors
      // console.warn('Firebase analytics not initialized', err)
    }
  } else {
    firebaseApp = getApps()[0]
  }
}

export { firebaseApp }
