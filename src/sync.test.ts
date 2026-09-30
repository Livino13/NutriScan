import { describe, it, expect } from 'vitest'
import {
  buildCloudDoc,
  isValidCloudDoc,
  mergeEntries,
  mergeSnapshots,
  serializeSnapshot,
  type CloudDoc,
  type LocalSnapshot,
} from './sync'
import type { FoodEntry, NutritionGoals, UserProfile } from './types'

const profile: UserProfile = {
  name: 'Test', age: 30, gender: 'female', heightCm: 165, weightKg: 62,
  activityLevel: 'moderate', goal: 'maintain', units: 'metric',
}
const goals: NutritionGoals = { calories: 1950, protein: 120, carbs: 240, fat: 65, fiber: 25, water: 2.5 }

function entry(id: string, name: string, timestamp = '2026-09-27T12:00:00.000Z'): FoodEntry {
  return {
    id, name, meal: 'lunch', calories: 500, protein: 20, carbs: 50,
    fat: 15, fiber: 5, servingSize: 300, servingUnit: 'g', timestamp,
  }
}

function snapshot(overrides: Partial<LocalSnapshot> = {}): LocalSnapshot {
  return { profile, goals, entries: [], water: 1, waterDate: 'Sat Sep 27 2026', weightLogs: [], ...overrides }
}

describe('isValidCloudDoc', () => {
  it('accepts a well-formed doc', () => {
    expect(isValidCloudDoc(buildCloudDoc(snapshot()))).toBe(true)
  })
  it('rejects null, arrays, and missing fields', () => {
    expect(isValidCloudDoc(null)).toBe(false)
    expect(isValidCloudDoc([])).toBe(false)
    expect(isValidCloudDoc({})).toBe(false)
    expect(isValidCloudDoc({ ...buildCloudDoc(snapshot()), updatedAt: 'not-a-date' })).toBe(false)
    expect(isValidCloudDoc({ ...buildCloudDoc(snapshot()), entries: [{ nope: true }] })).toBe(false)
  })
})

describe('mergeEntries', () => {
  it('unions entries from both devices', () => {
    const merged = mergeEntries([entry('a', 'Local')], [entry('b', 'Remote')], false)
    expect(merged.map(e => e.id).sort()).toEqual(['a', 'b'])
  })
  it('dedupes identical ids, remote wins only when preferred', () => {
    const local = entry('a', 'Local', '2026-09-27T12:00:00.000Z')
    const remote = entry('a', 'Remote', '2026-09-27T13:00:00.000Z')
    expect(mergeEntries([local], [remote], false)[0].name).toBe('Local')
    expect(mergeEntries([local], [remote], true)[0].name).toBe('Remote')
  })
  it('drops malformed entries and sorts by timestamp', () => {
    const merged = mergeEntries(
      [entry('b', 'B', '2026-09-27T13:00:00.000Z')],
      [{ id: '', timestamp: 'x' }, entry('a', 'A', '2026-09-27T12:00:00.000Z')] as unknown as FoodEntry[],
      true,
    )
    expect(merged.map(e => e.id)).toEqual(['a', 'b'])
  })
})

describe('mergeSnapshots', () => {
  it('keeps local scalars on first sync but unions entries', () => {
    const local = snapshot({ entries: [entry('a', 'Local')] })
    const remote = buildCloudDoc(snapshot({
      profile: { ...profile, name: 'Remote' },
      entries: [entry('b', 'Remote')],
    }))
    const merged = mergeSnapshots(local, remote, false)
    expect(merged.profile.name).toBe('Test')
    expect(merged.entries.map(e => e.id).sort()).toEqual(['a', 'b'])
    expect(merged.changed).toBe(true)
  })
  it('takes remote scalars when the cloud doc is newer', () => {
    const local = snapshot()
    const remote = buildCloudDoc(snapshot({ profile: { ...profile, name: 'Remote' }, water: 2 }))
    const merged = mergeSnapshots(local, remote, true)
    expect(merged.profile.name).toBe('Remote')
    expect(merged.water).toBe(2)
    expect(merged.changed).toBe(true)
  })
  it('reports unchanged when snapshots already match', () => {
    const local = snapshot({ entries: [entry('a', 'Same')] })
    const remote = buildCloudDoc(local)
    expect(mergeSnapshots(local, remote, true).changed).toBe(false)
  })
})

describe('serializeSnapshot', () => {
  it('is order-insensitive for entries', () => {
    const a = snapshot({ entries: [entry('a', 'A'), entry('b', 'B')] })
    const b = snapshot({ entries: [entry('b', 'B'), entry('a', 'A')] })
    expect(serializeSnapshot(a)).toBe(serializeSnapshot(b))
  })
})

describe('weight log sync', () => {
  const wlog = (id: string, weightKg: number) => ({ id, weightKg, timestamp: '2026-09-29T10:00:00.000Z' })
  it('accepts cloud docs written before weight tracking', () => {
    const { weightLogs, ...legacy } = buildCloudDoc(snapshot())
    expect(isValidCloudDoc(legacy)).toBe(true)
    const merged = mergeSnapshots(snapshot(), { ...legacy, weightLogs: undefined } as unknown as CloudDoc, true)
    expect(merged.weightLogs).toEqual([])
  })
  it('unions weight logs across devices', () => {
    const local = snapshot({ weightLogs: [wlog('a', 70)] })
    const remote = buildCloudDoc(snapshot({ weightLogs: [wlog('b', 69.5)] }))
    const merged = mergeSnapshots(local, remote, true)
    expect(merged.weightLogs.map(w => w.id).sort()).toEqual(['a', 'b'])
    expect(merged.changed).toBe(true)
  })
})
