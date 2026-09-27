import { describe, it, expect, beforeEach, vi } from 'vitest'

class MemoryStorage {
  private store = new Map<string, string>()
  get length() { return this.store.size }
  clear() { this.store.clear() }
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null }
  setItem(k: string, v: string) { this.store.set(k, String(v)) }
  removeItem(k: string) { this.store.delete(k) }
  key(i: number) { return [...this.store.keys()][i] ?? null }
}

vi.stubGlobal('localStorage', new MemoryStorage())
import {
  load,
  save,
  todayKey,
  keepRecentDays,
  isValidBackup,
  storageKeys,
} from './storage'
import type { FoodEntry } from './types'

function entry(id: string, daysAgo: number): FoodEntry {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id,
    name: 'Test',
    meal: 'lunch',
    calories: 500,
    protein: 20,
    carbs: 50,
    fat: 15,
    fiber: 5,
    servingSize: 300,
    servingUnit: 'g',
    timestamp: d.toISOString(),
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('load / save', () => {
  it('returns fallback when key missing or corrupt', () => {
    expect(load('missing', 42)).toBe(42)
    localStorage.setItem('bad', '{not json')
    expect(load('bad', 'fb')).toBe('fb')
  })

  it('round-trips values', () => {
    expect(save(storageKeys.goals, { calories: 2000 })).toBe(true)
    expect(load(storageKeys.goals, null)).toEqual({ calories: 2000 })
  })
})

describe('todayKey', () => {
  it('matches current date string', () => {
    expect(todayKey()).toBe(new Date().toDateString())
  })
})

describe('keepRecentDays', () => {
  it('drops entries older than window', () => {
    const entries = [entry('new', 1), entry('old', 60)]
    expect(keepRecentDays(entries, 30).map(e => e.id)).toEqual(['new'])
  })

  it('drops invalid timestamps', () => {
    const bad = { ...entry('bad', 0), timestamp: 'nope' }
    expect(keepRecentDays([bad], 30)).toEqual([])
  })
})

describe('isValidBackup', () => {
  it('accepts well-formed backups', () => {
    expect(isValidBackup({
      version: 1,
      profile: {},
      goals: {},
      entries: [],
      water: 1,
    })).toBe(true)
  })

  it('rejects malformed payloads', () => {
    expect(isValidBackup(null)).toBe(false)
    expect(isValidBackup({ entries: [] })).toBe(false)
    expect(isValidBackup({ profile: {}, goals: {}, entries: [], water: 'x' })).toBe(false)
  })
})
