import type { WeightEntry } from './types'

export interface WeightStats {
  count: number
  current: number | null
  start: number | null
  change: number
  weeks: number
  perWeek: number
}

export function isValidWeightEntry(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false
  const r = e as Record<string, unknown>
  return (
    typeof r.id === 'string' && r.id.length > 0 &&
    typeof r.weightKg === 'number' && Number.isFinite(r.weightKg) && r.weightKg > 0 && r.weightKg < 1000 &&
    typeof r.timestamp === 'string' && Number.isFinite(Date.parse(r.timestamp))
  )
}

function byTime(a: WeightEntry, b: WeightEntry): number {
  return Date.parse(a.timestamp) - Date.parse(b.timestamp)
}

/** Latest log by timestamp (null when empty). Ignores malformed entries. */
export function latestWeight(logs: WeightEntry[]): WeightEntry | null {
  const valid = logs.filter(isValidWeightEntry)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => (byTime(a, b) >= 0 ? a : b))
}

/** Union of two devices' logs by id; newer doc wins ties. */
export function mergeWeightLogs(local: WeightEntry[], remote: unknown, preferRemote: boolean): WeightEntry[] {
  const merged = new Map<string, WeightEntry>()
  for (const e of local) {
    if (isValidWeightEntry(e)) merged.set(e.id, e)
  }
  if (Array.isArray(remote)) {
    for (const e of remote) {
      if (!isValidWeightEntry(e)) continue
      if (!merged.has(e.id) || preferRemote) merged.set(e.id, e)
    }
  }
  return [...merged.values()].sort(byTime)
}

/** Start vs current trend across the log span. */
export function weightStats(logs: WeightEntry[]): WeightStats {
  const valid = logs.filter(isValidWeightEntry).sort(byTime)
  if (valid.length === 0) {
    return { count: 0, current: null, start: null, change: 0, weeks: 0, perWeek: 0 }
  }
  const start = valid[0].weightKg
  const current = valid[valid.length - 1].weightKg
  const days = Math.max(0, (Date.parse(valid[valid.length - 1].timestamp) - Date.parse(valid[0].timestamp)) / 86_400_000)
  const weeks = days / 7
  const change = Math.round((current - start) * 10) / 10
  const perWeek = weeks >= 1 ? Math.round((change / weeks) * 10) / 10 : 0
  return { count: valid.length, current, start, change, weeks: Math.round(weeks * 10) / 10, perWeek }
}
