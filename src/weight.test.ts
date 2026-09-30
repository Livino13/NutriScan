import { describe, it, expect } from 'vitest'
import { isValidWeightEntry, latestWeight, mergeWeightLogs, weightStats } from './weight'
import type { WeightEntry } from './types'

function log(id: string, weightKg: number, timestamp: string): WeightEntry {
  return { id, weightKg, timestamp }
}

describe('isValidWeightEntry', () => {
  it('accepts well-formed logs and rejects junk', () => {
    expect(isValidWeightEntry(log('a', 70, '2026-09-29T10:00:00.000Z'))).toBe(true)
    expect(isValidWeightEntry(null)).toBe(false)
    expect(isValidWeightEntry({ id: 'a', weightKg: -5, timestamp: '2026-09-29T10:00:00.000Z' })).toBe(false)
    expect(isValidWeightEntry({ id: '', weightKg: 70, timestamp: '2026-09-29T10:00:00.000Z' })).toBe(false)
    expect(isValidWeightEntry({ id: 'a', weightKg: 70, timestamp: 'not-a-date' })).toBe(false)
  })
})

describe('latestWeight', () => {
  it('returns the newest log and null when empty', () => {
    const logs = [
      log('a', 71, '2026-09-27T10:00:00.000Z'),
      log('b', 70.2, '2026-09-29T10:00:00.000Z'),
    ]
    expect(latestWeight(logs)?.id).toBe('b')
    expect(latestWeight([])).toBeNull()
  })
})

describe('mergeWeightLogs', () => {
  it('unions both sides and resolves ties by preference', () => {
    const local = [log('a', 70, '2026-09-29T10:00:00.000Z')]
    const remote = [log('a', 71, '2026-09-29T10:00:00.000Z'), log('b', 69, '2026-09-29T10:00:00.000Z')]
    expect(mergeWeightLogs(local, remote, false).find(e => e.id === 'a')?.weightKg).toBe(70)
    expect(mergeWeightLogs(local, remote, true).find(e => e.id === 'a')?.weightKg).toBe(71)
    expect(mergeWeightLogs(local, remote, false)).toHaveLength(2)
  })
})

describe('weightStats', () => {
  it('computes change and per-week rate', () => {
    const stats = weightStats([
      log('a', 72, '2026-09-15T10:00:00.000Z'),
      log('b', 70, '2026-09-29T10:00:00.000Z'),
    ])
    expect(stats).toMatchObject({ count: 2, current: 70, start: 72, change: -2, perWeek: -1 })
  })
  it('handles empty and single-log histories', () => {
    expect(weightStats([]).current).toBeNull()
    const single = weightStats([log('a', 70, '2026-09-29T10:00:00.000Z')])
    expect(single).toMatchObject({ count: 1, change: 0, perWeek: 0 })
  })
})
