import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import { getFirebase, isFirebaseConfigured } from './firebase'
import {
  buildCloudDoc,
  isValidCloudDoc,
  mergeSnapshots,
  serializeSnapshot,
  type LocalSnapshot,
} from './sync'
import { storageKeys } from './storage'
import type { FoodEntry, NutritionGoals, UserProfile } from './types'

export interface AccountUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type SyncStatus = 'disabled' | 'signed-out' | 'syncing' | 'synced' | 'error'

export interface CloudSync {
  configured: boolean
  user: AccountUser | null
  status: SyncStatus
  error: string | null
  signIn: () => void
  signOut: () => void
  syncNow: () => void
}

const SYNCED_AT_KEY = 'ns_cloud_synced_at'
const PUSH_DEBOUNCE_MS = 2500

function toAccountUser(u: User): AccountUser {
  return { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL }
}

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable — sync still works in memory
  }
}

function signInErrorMessage(code: string): string {
  switch (code) {
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Allow popups and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add it in Firebase console → Authentication → Settings → Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase console → Authentication → Sign-in method.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/cancelled-popup-request':
    case 'auth/popup-closed-by-user':
      return ''
    default:
      return 'Sign-in failed. Please try again.'
  }
}

interface SyncArgs {
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
  setProfile: (p: UserProfile) => void
  setGoals: (g: NutritionGoals) => void
  setEntries: (e: FoodEntry[]) => void
  setWater: (w: number) => void
}

/**
 * Google sign-in + Firestore sync with localStorage as the offline layer.
 * When Firebase keys are missing everything degrades to local-only mode
 * and the app behaves exactly as before.
 */
export function useCloudSync(args: SyncArgs): CloudSync {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState<AccountUser | null>(null)
  const [status, setStatus] = useState<SyncStatus>(configured ? 'signed-out' : 'disabled')
  const [error, setError] = useState<string | null>(null)

  const latest = useRef(args)
  latest.current = args
  const userRef = useRef<AccountUser | null>(null)
  const lastPushedSnapshot = useRef<string | null>(null)
  const lastPushedAt = useRef<string | null>(readStored(SYNCED_AT_KEY))
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function snapshot(): LocalSnapshot {
    const a = latest.current
    return {
      profile: a.profile,
      goals: a.goals,
      entries: a.entries,
      water: a.water,
      waterDate: readStored(storageKeys.waterDate),
    }
  }

  /** Applies a merged snapshot locally and marks it as synced (no echo push). */
  function applyMerged(merged: LocalSnapshot, remoteUpdatedAt: string): void {
    const a = latest.current
    a.setProfile(merged.profile)
    a.setGoals(merged.goals)
    a.setEntries(merged.entries)
    a.setWater(merged.water)
    if (merged.waterDate) writeStored(storageKeys.waterDate, merged.waterDate)
    lastPushedSnapshot.current = serializeSnapshot(merged)
    lastPushedAt.current = remoteUpdatedAt
    writeStored(SYNCED_AT_KEY, remoteUpdatedAt)
  }

  const push = useCallback(async (uid: string, force = false): Promise<boolean> => {
    const fb = await getFirebase()
    if (!fb) return false
    const snap = snapshot()
    const serialized = serializeSnapshot(snap)
    if (!force && serialized === lastPushedSnapshot.current) return true
    const { doc, setDoc } = await import('firebase/firestore')
    const updatedAt = new Date().toISOString()
    try {
      await setDoc(doc(fb.db, 'users', uid), buildCloudDoc(snap, updatedAt))
      lastPushedSnapshot.current = serialized
      lastPushedAt.current = updatedAt
      writeStored(SYNCED_AT_KEY, updatedAt)
      return true
    } catch {
      return false
    }
  }, [])

  /** Pulls the cloud doc, merges, and pushes back anything new from this device. */
  const pullAndMerge = useCallback(async (uid: string, firstSync: boolean): Promise<void> => {
    const fb = await getFirebase()
    if (!fb) return
    const { doc, getDoc } = await import('firebase/firestore')
    const remote = await getDoc(doc(fb.db, 'users', uid))
    if (!remote.exists()) {
      await push(uid, true)
      return
    }
    const data = remote.data()
    if (!isValidCloudDoc(data)) return
    if (lastPushedAt.current && data.updatedAt <= lastPushedAt.current) return
    const preferRemote = !firstSync && !!lastPushedAt.current && data.updatedAt > lastPushedAt.current
    const merged = mergeSnapshots(snapshot(), data, firstSync ? false : preferRemote)
    if (merged.changed) applyMerged(merged, data.updatedAt)
    else {
      lastPushedAt.current = data.updatedAt
      writeStored(SYNCED_AT_KEY, data.updatedAt)
    }
    // Propagate local-only entries upward so all devices converge.
    await push(uid)
  }, [push])

  // Auth subscription + live remote updates.
  useEffect(() => {
    if (!configured) return
    let cancelled = false
    let unsubAuth: (() => void) | null = null
    let unsubDoc: (() => void) | null = null

    void (async () => {
      const fb = await getFirebase()
      if (!fb || cancelled) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubAuth = onAuthStateChanged(fb.auth, u => {
        if (cancelled) return
        const account = u ? toAccountUser(u) : null
        userRef.current = account
        setUser(account)
        setError(null)
        if (!account) {
          if (pushTimer.current) clearTimeout(pushTimer.current)
          unsubDoc?.()
          unsubDoc = null
          setStatus('signed-out')
          return
        }
        setStatus('syncing')
        void pullAndMerge(account.uid, !lastPushedAt.current)
          .then(() => { if (!cancelled) setStatus('synced') })
          .catch(() => { if (!cancelled) { setStatus('error'); setError('Could not reach cloud sync. Your data is safe on this device.') } })

        // Live updates from other devices.
        void import('firebase/firestore').then(({ doc, onSnapshot }) => {
          if (cancelled || userRef.current?.uid !== account.uid) return
          unsubDoc?.()
          unsubDoc = onSnapshot(
            doc(fb.db, 'users', account.uid),
            s => {
              if (cancelled || userRef.current?.uid !== account.uid) return
              const data = s.data()
              if (!isValidCloudDoc(data)) return
              if (lastPushedAt.current && data.updatedAt <= lastPushedAt.current) return
              const merged = mergeSnapshots(snapshot(), data, true)
              if (merged.changed) {
                applyMerged(merged, data.updatedAt)
                setStatus('synced')
              }
            },
            () => { if (!cancelled) setStatus('error') },
          )
        })
      })
    })()

    return () => {
      cancelled = true
      unsubAuth?.()
      unsubDoc?.()
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
  }, [configured, pullAndMerge])

  // Debounced auto-push on local changes while signed in.
  useEffect(() => {
    if (!configured || !user) return
    if (serializeSnapshot(snapshot()) === lastPushedSnapshot.current) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    setStatus(s => (s === 'synced' || s === 'signed-out' ? 'syncing' : s))
    pushTimer.current = setTimeout(() => {
      const uid = userRef.current?.uid
      if (!uid) return
      void push(uid)
        .then(ok => {
          setStatus(ok ? 'synced' : 'error')
          if (!ok) setError('Could not reach cloud sync. Your data is safe on this device.')
        })
    }, PUSH_DEBOUNCE_MS)
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current)
    }
    // Re-run when the diary snapshot changes; user/config gate the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user, args.profile, args.goals, args.entries, args.water, push])

  const signIn = useCallback(() => {
    if (!configured) return
    setError(null)
    setStatus('syncing')
    void (async () => {
      const fb = await getFirebase()
      if (!fb) {
        setStatus('signed-out')
        return
      }
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
        await signInWithPopup(fb.auth, new GoogleAuthProvider())
        // onAuthStateChanged takes over from here.
      } catch (err) {
        const code = (err as { code?: string }).code ?? ''
        const message = signInErrorMessage(code)
        if (message) setError(message)
        setStatus(userRef.current ? 'synced' : 'signed-out')
      }
    })()
  }, [configured])

  const signOut = useCallback(() => {
    if (!configured) return
    void (async () => {
      const fb = await getFirebase()
      if (!fb) return
      try {
        const { signOut: fbSignOut } = await import('firebase/auth')
        await fbSignOut(fb.auth)
      } catch {
        setError('Sign-out failed. Please try again.')
      }
    })()
  }, [configured])

  const syncNow = useCallback(() => {
    const uid = userRef.current?.uid
    if (!uid) return
    setError(null)
    setStatus('syncing')
    void pullAndMerge(uid, false)
      .then(() => setStatus('synced'))
      .catch(() => {
        setStatus('error')
        setError('Could not reach cloud sync. Your data is safe on this device.')
      })
  }, [pullAndMerge])

  return { configured, user, status, error, signIn, signOut, syncNow }
}
