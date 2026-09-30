import type { FoodEntry, NutritionGoals } from './types'

export interface DaySummary {
  key: string
  label: string
  short: string
  calories: number
  protein: number
  carbs: number
  fat: number
  logged: boolean
}

export interface WeekSummary {
  rangeLabel: string
  days: DaySummary[]
  daysLogged: number
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
}

export interface WeeklyReport {
  thisWeek: WeekSummary
  prevWeek: WeekSummary
  daysOverGoal: string[]
  lowProteinDays: string[]
  bestDay: string | null
  highlights: string[]
}

const DAY_MS = 86_400_000

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function summarizeWeek(entries: FoodEntry[], weekStart: Date): WeekSummary {
  const days: DaySummary[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getTime() + i * DAY_MS)
    const dayEntries = entries.filter(e => {
      const t = new Date(e.timestamp)
      return Number.isFinite(t.getTime()) && startOfDay(t).getTime() === date.getTime()
    })
    return {
      key: date.toDateString(),
      label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      short: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayEntries.reduce((s, e) => s + e.calories, 0),
      protein: dayEntries.reduce((s, e) => s + e.protein, 0),
      carbs: dayEntries.reduce((s, e) => s + e.carbs, 0),
      fat: dayEntries.reduce((s, e) => s + e.fat, 0),
      logged: dayEntries.length > 0,
    }
  })
  const logged = days.filter(d => d.logged)
  const div = logged.length > 0 ? logged.length : 1
  const sum = (f: (d: DaySummary) => number) => logged.reduce((s, d) => s + f(d), 0)
  const rangeLabel = `${days[0].label} – ${days[6].label}`
  return {
    rangeLabel,
    days,
    daysLogged: logged.length,
    avgCalories: Math.round(sum(d => d.calories) / div),
    avgProtein: Math.round(sum(d => d.protein) / div),
    avgCarbs: Math.round(sum(d => d.carbs) / div),
    avgFat: Math.round(sum(d => d.fat) / div),
  }
}

/**
 * Builds the weekly report: this (partial) week vs the previous full week,
 * over-goal and low-protein day flags, best day, and shareable highlights.
 */
export function buildWeeklyReport(entries: FoodEntry[], goals: NutritionGoals, now = new Date()): WeeklyReport {
  const today = startOfDay(now)
  const thisStart = new Date(today.getTime() - ((today.getDay() + 6) % 7) * DAY_MS)
  const prevStart = new Date(thisStart.getTime() - 7 * DAY_MS)

  const thisWeek = summarizeWeek(entries, thisStart)
  const prevWeek = summarizeWeek(entries, prevStart)

  const loggedDays = thisWeek.days.filter(d => d.logged)
  const daysOverGoal = loggedDays.filter(d => goals.calories > 0 && d.calories > goals.calories).map(d => d.short)
  const lowProteinDays = goals.protein > 0
    ? loggedDays.filter(d => d.protein < goals.protein * 0.8).map(d => d.short)
    : []
  const best = loggedDays.length > 0 && goals.calories > 0
    ? loggedDays.reduce((a, b) => (Math.abs(a.calories - goals.calories) <= Math.abs(b.calories - goals.calories) ? a : b))
    : null

  const highlights: string[] = []
  if (thisWeek.daysLogged === 0) {
    highlights.push('No meals logged this week yet — log your first meal to start the report.')
  } else {
    if (thisWeek.daysLogged < 7) {
      highlights.push(`Logged meals on ${thisWeek.daysLogged} of 7 days — log daily for a fuller picture.`)
    }
    if (best) {
      highlights.push(`Best day: ${best.label} — ${best.calories.toLocaleString()} kcal, closest to your ${goals.calories.toLocaleString()} kcal target.`)
    }
    if (daysOverGoal.length > 0) {
      highlights.push(`Over your calorie goal on ${daysOverGoal.length} day${daysOverGoal.length > 1 ? 's' : ''}: ${daysOverGoal.join(', ')}.`)
    }
    if (lowProteinDays.length > 0 && goals.protein > 0) {
      highlights.push(`Low protein on ${lowProteinDays.join(', ')} — aim for ${goals.protein}g per day.`)
    }
    if (prevWeek.daysLogged > 0 && prevWeek.avgCalories > 0) {
      const delta = Math.round(((thisWeek.avgCalories - prevWeek.avgCalories) / prevWeek.avgCalories) * 100)
      if (delta !== 0) {
        highlights.push(`Average calories ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)}% vs last week.`)
      } else {
        highlights.push('Average calories holding steady vs last week.')
      }
    }
    if (daysOverGoal.length === 0 && lowProteinDays.length === 0 && thisWeek.daysLogged >= 5) {
      highlights.push('Clean week — every logged day hit both calorie and protein targets.')
    }
  }

  return { thisWeek, prevWeek, daysOverGoal, lowProteinDays, bestDay: best?.label ?? null, highlights }
}

/** Plain-text rendering for the copy/share button. */
export function formatReportText(report: WeeklyReport, goals: NutritionGoals): string {
  const w = report.thisWeek
  const lines = [
    `NutriScan weekly report (${w.rangeLabel})`,
    `Logged ${w.daysLogged}/7 days · avg ${w.avgCalories.toLocaleString()} kcal (goal ${goals.calories.toLocaleString()}) · ${w.avgProtein}g protein (goal ${goals.protein}g)`,
    ...report.highlights.map(h => `- ${h}`),
  ]
  return lines.join('\n')
}
