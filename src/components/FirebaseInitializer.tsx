"use client"

import React from "react"
import { firebaseApp } from "@/lib/firebase-client"

export default function FirebaseInitializer() {
  React.useEffect(() => {
    // Touch the firebaseApp to ensure initialization runs in the browser.
    if (firebaseApp) {
      // no-op; firebase initialized
      // console.log('Firebase initialized', firebaseApp.name)
    }
  }, [])

  return null
}
