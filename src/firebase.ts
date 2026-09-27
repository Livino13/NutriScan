import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

function readConfig() {
  const env = import.meta.env
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = env.VITE_FIREBASE_APP_ID as string | undefined
  if (!apiKey || !authDomain || !projectId || !appId) return null
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
  }
}

/** False when Firebase keys are missing — the app then works fully offline. */
export function isFirebaseConfigured(): boolean {
  return readConfig() !== null
}

let cached: FirebaseServices | null | undefined

/**
 * Lazily initializes Firebase on first use. Firebase SDK modules are
 * dynamically imported so they never land in the bundle when cloud sync
 * is unconfigured or unused.
 */
export async function getFirebase(): Promise<FirebaseServices | null> {
  if (cached !== undefined) return cached
  const config = readConfig()
  if (!config) {
    cached = null
    return null
  }
  const { initializeApp, getApps, getApp } = await import('firebase/app')
  const { getAuth } = await import('firebase/auth')
  const { getFirestore } = await import('firebase/firestore')
  const app = getApps().length > 0 ? getApp() : initializeApp(config)
  cached = { app, auth: getAuth(app), db: getFirestore(app) }
  return cached
}
