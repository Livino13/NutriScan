import { describe, it, expect } from 'vitest'
import {
  calculateBMI,
  getBMICategory,
  calculateTDEE,
  calculateGoals,
  clamp,
  pct,
  generateId,
} from './utils'

describe('calculateBMI', () => {
  it('computes BMI for typical values', () => {
    expect(calculateBMI(62, 165)).toBeCloseTo(22.77, 1)
  })

  it('returns 0 for missing input', () => {
    expect(calculateBMI(0, 165)).toBe(0)
    expect(calculateBMI(62, 0)).toBe(0)
  })
})

describe('getBMICategory', () => {
  it('classifies boundaries', () => {
    expect(getBMICategory(17).label).toBe('Underweight')
    expect(getBMICategory(22).label).toBe('Normal weight')
    expect(getBMICategory(27).label).toBe('Overweight')
    expect(getBMICategory(32).label).toBe('Obesity')
  })
})

describe('calculateTDEE', () => {
  it('returns a sane daily expenditure', () => {
    const tdee = calculateTDEE({ age: 28, gender: 'female', heightCm: 165, weightKg: 62, activityLevel: 'moderate' })
    expect(tdee).toBeGreaterThan(1500)
    expect(tdee).toBeLessThan(3000)
  })

  it('male TDEE exceeds female TDEE for same stats', () => {
    const base = { age: 30, heightCm: 175, weightKg: 70, activityLevel: 'moderate' as const }
    expect(calculateTDEE({ ...base, gender: 'male' as const })).toBeGreaterThan(
      calculateTDEE({ ...base, gender: 'female' as const }),
    )
  })
})

describe('calculateGoals', () => {
  it('applies deficit for weight loss with floor', () => {
    const goals = calculateGoals({
      name: 'T', age: 30, gender: 'female', heightCm: 165, weightKg: 62,
      activityLevel: 'moderate', goal: 'lose', units: 'metric',
    })
    expect(goals.calories).toBeGreaterThanOrEqual(1200)
    expect(goals.protein).toBeGreaterThan(0)
    expect(goals.carbs).toBeGreaterThanOrEqual(50)
    expect(goals.fat).toBeGreaterThan(0)
  })

  it('adds surplus for weight gain', () => {
    const base = {
      name: 'T', age: 30, gender: 'male' as const, heightCm: 180, weightKg: 75,
      activityLevel: 'active' as const, units: 'metric' as const,
    }
    const maintain = calculateGoals({ ...base, goal: 'maintain' })
    const gain = calculateGoals({ ...base, goal: 'gain' })
    expect(gain.calories).toBe(maintain.calories + 300)
  })
})

describe('clamp / pct', () => {
  it('clamps pct to 0..100', () => {
    expect(pct(50, 200)).toBe(25)
    expect(pct(500, 200)).toBe(100)
    expect(pct(0, 200)).toBe(0)
  })

  it('clamps values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(99, 0, 10)).toBe(10)
  })
})

describe('generateId', () => {
  it('produces unique non-empty ids', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId))
    expect(ids.size).toBe(100)
  })
})
