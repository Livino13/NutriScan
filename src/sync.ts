import type { FoodEntry, NutritionGoals, UserProfile } from './types'
import { STORAGE_VERSION } from './storage'

/** The local diary snapshot that gets synced. */
export interface LocalSnapshot {
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
  waterDate: string | null
}

/** Cloud document shape stored at `users/{uid}` in Firestore. */
export interface CloudDoc extends LocalSnapshot {
  version: number
  updatedAt: string
}

export function isValidCloudDoc(data: unknown): data is CloudDoc {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d.updatedAt === 'string' &&
    Number.isFinite(Date.parse(d.updatedAt)) &&
    Array.isArray(d.entries) &&
    (d.entries as unknown[]).every(isValidEntry) &&
    typeof d.profile === 'object' && d.profile !== null &&
    typeof d.goals === 'object' && d.goals !== null &&
    typeof d.water === 'number' &&
    (d.waterDate === null || typeof d.waterDate === 'string')
  )
}

function isValidEntry(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false
  const r = e as Record<string, unknown>
  return typeof r.id === 'string' && r.id.length > 0 && typeof r.timestamp === 'string'
}

export function buildCloudDoc(snapshot: LocalSnapshot, updatedAt = new Date().toISOString()): CloudDoc {
  return { ...snapshot, version: STORAGE_VERSION, updatedAt }
}

/** Stable serialization used to detect local changes worth pushing. */
export function serializeSnapshot(s: LocalSnapshot): string {
  const entries = [...s.entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return JSON.stringify({ ...s, entries })
}

/**
 * Union of both devices' entries by id. When both sides edited the same
 * entry, `preferRemote` (i.e. the cloud doc is newer) decides the winner.
 * Malformed entries are dropped.
 */
export function mergeEntries(local: FoodEntry[], remote: unknown, preferRemote: boolean): FoodEntry[] {
  const merged = new Map<string, FoodEntry>()
  for (const e of local) {
    if (isValidEntry(e)) merged.set(e.id, e)
  }
  if (Array.isArray(remote)) {
    for (const e of remote) {
      if (!isValidEntry(e)) continue
      if (!merged.has(e.id) || preferRemote) merged.set(e.id, e)
    }
  }
  return [...merged.values()].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0))
}

export interface MergeResult extends LocalSnapshot {
  /** True when the merged result differs from the local snapshot. */
  changed: boolean
}

/**
 * Merges a cloud doc into the local snapshot. Entries are always unioned;
 * profile/goals/water follow `preferRemote` (true when the cloud doc is
 * newer than our last push). First sign-in passes false so the device the
 * user just set up keeps its values, then pushes them up.
 */
export function mergeSnapshots(local: LocalSnapshot, remote: CloudDoc, preferRemote: boolean): MergeResult {
  const entries = mergeEntries(local.entries, remote.entries, preferRemote)
  const merged: LocalSnapshot = preferRemote
    ? { profile: remote.profile, goals: remote.goals, entries, water: remote.water, waterDate: remote.waterDate }
    : { ...local, entries }
  return { ...merged, changed: serializeSnapshot(merged) !== serializeSnapshot(local) }
}
