import { describe, it, expect } from 'vitest'
import { buildWeeklyReport, formatReportText } from './report'
import type { FoodEntry, NutritionGoals } from './types'

const goals: NutritionGoals = { calories: 2000, protein: 120, carbs: 250, fat: 65, fiber: 25, water: 2.5 }
// Monday 2026-09-28 (week starts Monday)
const NOW = new Date('2026-09-30T12:00:00')

function entry(day: string, calories: number, protein: number, id = `${day}-${calories}`): FoodEntry {
  return {
    id, name: 'Test', meal: 'lunch', calories, protein, carbs: 50, fat: 15, fiber: 5,
    servingSize: 300, servingUnit: 'g', timestamp: new Date(`${day}T12:00:00`).toISOString(),
  }
}

describe('buildWeeklyReport', () => {
  it('flags over-goal and low-protein days and picks the best day', () => {
    const entries = [
      entry('2026-09-28', 1950, 130), // Mon: near goal, protein ok
      entry('2026-09-29', 2600, 60), // Tue: over goal, low protein
      entry('2026-09-30', 2000, 120), // Wed: on goal
    ]
    const report = buildWeeklyReport(entries, goals, NOW)
    expect(report.thisWeek.daysLogged).toBe(3)
    expect(report.daysOverGoal).toEqual(['Tue'])
    expect(report.lowProteinDays).toEqual(['Tue'])
    expect(report.bestDay).toContain('Wednesday')
    expect(report.highlights.some(h => h.includes('Low protein'))).toBe(true)
  })

  it('compares against the previous week', () => {
    const entries = [
      entry('2026-09-21', 2500, 100), // prev Mon
      entry('2026-09-22', 2500, 100), // prev Tue
      entry('2026-09-28', 2000, 120), // this Mon
    ]
    const report = buildWeeklyReport(entries, goals, NOW)
    expect(report.prevWeek.daysLogged).toBe(2)
    expect(report.highlights.some(h => h.includes('down 20%'))).toBe(true)
  })

  it('handles an empty week gracefully', () => {
    const report = buildWeeklyReport([], goals, NOW)
    expect(report.thisWeek.daysLogged).toBe(0)
    expect(report.bestDay).toBeNull()
    expect(report.highlights).toHaveLength(1)
  })

  it('praises a clean week', () => {
    const sunday = new Date('2026-10-04T12:00:00')
    const entries = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'].map((d, i) =>
      entry(d, 1950 + i * 10, 130, `clean-${i}`),
    )
    const report = buildWeeklyReport(entries, goals, sunday)
    expect(report.thisWeek.daysLogged).toBe(5)
    expect(report.daysOverGoal).toEqual([])
    expect(report.lowProteinDays).toEqual([])
    expect(report.highlights.some(h => h.includes('Clean week'))).toBe(true)
  })
})

describe('formatReportText', () => {
  it('renders a shareable summary', () => {
    const report = buildWeeklyReport([entry('2026-09-28', 1950, 130)], goals, NOW)
    const text = formatReportText(report, goals)
    expect(text).toContain('NutriScan weekly report')
    expect(text).toContain('Logged 1/7 days')
  })
})
