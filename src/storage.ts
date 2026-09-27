import type { FoodEntry, NutritionGoals, UserProfile } from './types'

export const STORAGE_VERSION = 1
const PREFIX = 'ns'

function key(name: string): string {
  return `${PREFIX}_${name}`
}

export const storageKeys = {
  done: key('done'),
  profile: key('profile'),
  goals: key('goals'),
  entries: key('entries'),
  water: key('water'),
  waterDate: key('water_date'),
} as const

export function load<T>(storageKey: string, fallback: T): T {
  try {
    const s = localStorage.getItem(storageKey)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

/** Quota-safe write. On QuotaExceededError, trims old food entries and retries once. */
export function save(storageKey: string, value: unknown): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch (err) {
    if (isQuotaError(err) && storageKey !== storageKeys.entries) {
      try {
        trimEntries(30)
        localStorage.setItem(storageKey, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    }
    if (isQuotaError(err) && storageKey === storageKeys.entries && Array.isArray(value)) {
      try {
        const trimmed = keepRecentDays(value as FoodEntry[], 30)
        localStorage.setItem(storageKey, JSON.stringify(trimmed))
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

function isQuotaError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)
}

export function todayKey(date = new Date()): string {
  return date.toDateString()
}

export function loadWater(fallback = 0): number {
  try {
    if (localStorage.getItem(storageKeys.waterDate) !== todayKey()) return fallback
    return load<number>(storageKeys.water, fallback)
  } catch {
    return fallback
  }
}

export function keepRecentDays(entries: FoodEntry[], days: number): FoodEntry[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return entries.filter(e => {
    const t = new Date(e.timestamp).getTime()
    return Number.isFinite(t) && t >= cutoff
  })
}

/** Drop entries older than `days` (default 90) to bound localStorage growth. */
export function trimEntries(days = 90): void {
  try {
    const entries = load<FoodEntry[]>(storageKeys.entries, [])
    const kept = keepRecentDays(entries, days)
    if (kept.length !== entries.length) {
      localStorage.setItem(storageKeys.entries, JSON.stringify(kept))
    }
  } catch {
    // best effort
  }
}

export interface BackupData {
  version: number
  exportedAt: string
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
  waterDate: string | null
}

export function buildBackup(args: {
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
}): BackupData {
  let waterDate: string | null = null
  try {
    waterDate = localStorage.getItem(storageKeys.waterDate)
  } catch {
    waterDate = null
  }
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    profile: args.profile,
    goals: args.goals,
    entries: args.entries,
    water: args.water,
    waterDate,
  }
}

export function isValidBackup(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    Array.isArray(d.entries) &&
    typeof d.profile === 'object' && d.profile !== null &&
    typeof d.goals === 'object' && d.goals !== null &&
    typeof d.water === 'number'
  )
}
