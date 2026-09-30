import { useState } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import type { FoodEntry, NutritionGoals } from './types'
import { buildWeeklyReport, formatReportText } from './report'

function StatCard({
  label,
  value,
  unit,
  icon,
  color,
  bg,
}: {
  label: string
  value: number | string
  unit: string
  icon: string
  color: string
  bg: string
}) {
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        height: 125,
        borderRadius: 20,
        padding: '16px 16px',
        overflow: 'hidden',
        background: bg,
        boxShadow: '0 5px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* Large soft circle */}
      <div
        style={{
          position: 'absolute',
         width: 125,
         height: 125,
          borderRadius: '50%',
          right: -28,
          bottom: -30,
          background: 'rgba(255,255,255,0.28)',
        }}
      />

      {/* Smaller inner circle */}
      <div
        style={{
          position: 'absolute',
          width: 85,
          height: 85,
          borderRadius: '50%',
          right: -10,
          bottom: -12,
          background: 'rgba(255,255,255,0.18)',
        }}
      />

      {/* Text */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            marginBottom: 6,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: 10,
            color,
opacity: 0.75,
            marginTop: 5,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {unit}
        </div>
      </div>

      {/* Icon */}
      <div
        style={{
          position: 'absolute',
          zIndex: 3,
          right: 14,
          bottom: 12,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
      >
        {icon}
      </div>
    </div>
  )
}
interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.name === 'Calories' ? ' kcal' : 'g'}</div>
        ))}
      </div>
    )
  }
  return null
}

export default function Insights({ entries, goals }: { entries: FoodEntry[]; goals: NutritionGoals }) {
  const today = new Date()
  const [copied, setCopied] = useState(false)
  const report = buildWeeklyReport(entries, goals, today)

  function copyReport() {
    const text = formatReportText(report, goals)
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    try {
      const nav = navigator as Navigator & { clipboard?: { writeText: (t: string) => Promise<void> } }
      if (nav.clipboard) {
        void nav.clipboard.writeText(text).then(done).catch(() => setCopied(false))
        return
      }
    } catch {
      // fall through to legacy copy
    }
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      done()
    } catch {
      setCopied(false)
    }
  }

const weeklyData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(today)
  date.setDate(today.getDate() - (6 - i))

  const dayEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp)
    return entryDate.toDateString() === date.toDateString()
  })

  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date,
    calories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
    protein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
    carbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
    fat: dayEntries.reduce((sum, e) => sum + e.fat, 0),
    fiber: dayEntries.reduce((sum, e) => sum + e.fiber, 0),
  }
})

const daysWithFood = weeklyData.filter(d => d.calories > 0).length
const avgDivisor = daysWithFood > 0 ? daysWithFood : 1

const avgCal = daysWithFood === 0 ? 0 : Math.round(
  weeklyData.reduce((s, d) => s + d.calories, 0) / avgDivisor
)

const avgProt = daysWithFood === 0 ? 0 : Math.round(
  weeklyData.reduce((s, d) => s + d.protein, 0) / avgDivisor
)

const avgCarbs = daysWithFood === 0 ? 0 : Math.round(
  weeklyData.reduce((s, d) => s + d.carbs, 0) / avgDivisor
)

const avgFat = daysWithFood === 0 ? 0 : Math.round(
  weeklyData.reduce((s, d) => s + d.fat, 0) / avgDivisor
)

const avgFiber = daysWithFood === 0 ? 0 : Math.round(
  weeklyData.reduce((s, d) => s + d.fiber, 0) / avgDivisor
)


  const rawCalPct = goals.calories > 0 ? Math.round((avgCal / goals.calories) * 100) : 0
  const calGoalPct = Math.min(rawCalPct, 100)
  const isOverGoal = rawCalPct > 100

const daysNearGoal = weeklyData.filter(d =>
  d.calories > 0 &&
  Math.abs(d.calories - goals.calories) <= goals.calories * 0.1
).length

const proteinGoal = goals.protein || 0

const proteinGoalDays =
  proteinGoal > 0
    ? weeklyData.filter(d => d.protein >= proteinGoal).length
    : 0

const highestCalorieDay = weeklyData.reduce(
  (highest, day) =>
    day.calories > highest.calories ? day : highest,
  weeklyData[0]
)

const lowestCalorieDay = weeklyData
  .filter(d => d.calories > 0)
  .reduce(
    (lowest, day) =>
      day.calories < lowest.calories ? day : lowest,
    weeklyData.find(d => d.calories > 0) || weeklyData[0]
  )
const patterns = []

if (daysWithFood === 0) {
  patterns.push({
    icon: '🍽️',
    text: 'Start logging your meals to unlock personalized nutrition insights.',
    bg: '#F8F4EA',
  })
} else {
  if (daysNearGoal >= 4) {
    patterns.push({
      icon: '🎯',
      text: `Great consistency! You were close to your calorie target on ${daysNearGoal} of the last 7 days.`,
      bg: '#F1F8D8',
    })
  } else if (daysNearGoal >= 2) {
    patterns.push({
      icon: '🌱',
      text: `You're building consistency. You were close to your calorie target on ${daysNearGoal} days this week.`,
      bg: '#F8F4EA',
    })
  }

  if (proteinGoal > 0 && proteinGoalDays >= 5) {
    patterns.push({
      icon: '💪',
      text: `Strong protein consistency — you reached your protein goal on ${proteinGoalDays} of the last 7 days.`,
      bg: '#F1F8D8',
    })
  } else if (avgProt > 0) {
    patterns.push({
      icon: '💪',
      text: `Your average protein intake was ${avgProt}g per day this week.`,
      bg: '#F8F4EA',
    })
  }

  if (highestCalorieDay && highestCalorieDay.calories > 0) {
    patterns.push({
      icon: '📊',
      text: `${highestCalorieDay.day} was your highest-calorie day at ${highestCalorieDay.calories} kcal.`,
      bg: '#F8F4EA',
    })
  }

  if (avgFiber > 0) {
    patterns.push({
      icon: '🥬',
      text: `You're averaging ${avgFiber}g of fiber per day.`,
      bg: '#F1F8D8',
    })
  }
}
  return (
    <div style={{ background: '#F0FDF8', minHeight: '100vh' }} className="animate-fade-in">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF8 100%)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Nutrition Insights</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Last 7 days overview</p>
      </div>

      <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Weekly averages */}
       {/* Weekly averages */}
<div style={{ display: 'flex', gap: 10 }}>
  <StatCard
    label="Avg Calories"
    value={avgCal}
    unit="kcal/day"
    icon="🔥"
    color="#FFFFFF"
    bg="#FFB2F7"
  />

  <StatCard
    label="Avg Protein"
    value={avgProt}
    unit="g/day"
    icon="🥩"
    color="#FFFFFF"
    bg="#61CEF2"
  />
</div>

<div style={{ display: 'flex', gap: 10 }}>
  <StatCard
    label="Avg Carbs"
    value={avgCarbs}
    unit="g/day"
    icon="🍚"
    color="#FFFFFF"
    bg="#FFD862"
  />

  <StatCard
    label="Avg Fat"
    value={avgFat}
    unit="g/day"
    icon="🥑"
    color="#FFFFFF"
    bg="#AB9DFF"
  />
</div>

        {/* Goal adherence */}
       <div
  style={{
    background: '#FFFFFF',
    borderRadius: 20,
    padding: '16px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }}
>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12 }}>Calorie Target Adherence</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: isOverGoal ? '#F97316' : '#AACB73', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}>{rawCalPct}%</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${calGoalPct}%`, background: isOverGoal ? '#F97316' : '#AACB73', borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Avg {avgCal} kcal vs {goals.calories} kcal target{daysWithFood > 0 && daysWithFood < 7 ? ` · ${daysWithFood}/7 days logged` : ''}{isOverGoal ? ' · over target' : ''}</div>
            </div>
          </div>
        </div>

        {/* Weekly report */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Weekly Report</div>
            <button onClick={copyReport} style={{ fontSize: 12, fontWeight: 700, color: '#AACB73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {copied ? '✓ Copied' : 'Copy Report'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 12 }}>{report.thisWeek.rangeLabel} · logged {report.thisWeek.daysLogged}/7 days</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Avg kcal', display: report.thisWeek.avgCalories.toLocaleString(), current: report.thisWeek.avgCalories, prev: report.prevWeek.daysLogged > 0 ? report.prevWeek.avgCalories : null },
              { label: 'Avg protein', display: `${report.thisWeek.avgProtein}g`, current: report.thisWeek.avgProtein, prev: report.prevWeek.daysLogged > 0 ? report.prevWeek.avgProtein : null },
            ].map(s => {
              const delta = s.prev !== null && s.prev > 0 ? Math.round(((s.current - s.prev) / s.prev) * 100) : null
              return (
                <div key={s.label} style={{ flex: 1, background: '#F8FAFC', borderRadius: 14, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.display}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: delta === null ? '#CBD5E1' : delta > 0 ? '#F97316' : delta < 0 ? '#059669' : '#94A3B8' }}>
                    {delta === null ? 'no prior week' : delta === 0 ? 'same as last week' : `${delta > 0 ? '+' : ''}${delta}% vs last week`}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#334155', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#AACB73', fontWeight: 800 }}>•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie chart */}
       {/* Calorie chart */}
<div style={{ background: 'linear-gradient(135deg, #DDF2D1 2%, #BEE3BA 100%)', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>Weekly Calories</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Daily calorie consumption</div>

<div
  style={{
    background: '#FFFFFF',
    borderRadius: 14,
    padding: '10px 8px 4px',
  }}
>
  <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', radius: 8 }} />
              <Bar dataKey="calories" name="Calories" radius={[8, 8, 0, 0]}>
  {weeklyData.map((_, index) => {
    const colors = ['#FBE6AD', '#F49DB5', '#9EF0DE', '#9884E8']
    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
  })}
</Bar>
                     </BarChart>
        </ResponsiveContainer>
      </div>

        {/* Goal line indicator */}
          {/* Goal line indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ width: 16, height: 2, background: '#AACB73', borderRadius: 99 }} />
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Goal: {goals.calories} kcal</div>
          </div>
        </div>

        {/* Macros line chart */}
       {/* Macros line chart */}
<div style={{ background: 'linear-gradient(135deg, #FCE6F4 2%, #FCC7D9 100%)', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>Macronutrient Trends</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>
  Protein, carbs & fat over the week
</div>

<div
  style={{
    background: '#FFFFFF',
    borderRadius: 14,
    padding: '10px 8px 4px',
  }}
>
  <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
             <Line
  type="monotone"
  dataKey="protein"
  name="Protein"
  stroke="#EC4899"
  strokeWidth={2.5}
  dot={{ r: 3, fill: '#EC4899' }}
/>
              <Line
  type="monotone"
  dataKey="carbs"
  name="Carbs"
  stroke="#0EA5E9"
  strokeWidth={2.5}
  dot={{ r: 3, fill: '#0EA5E9' }}
/>
              <Line
  type="monotone"
  dataKey="fat"
  name="Fat"
  stroke="#F97316"
  strokeWidth={2.5}
  dot={{ r: 3, fill: '#F97316' }}
/>
                      </LineChart>
        </ResponsiveContainer>
      </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {[{ label: 'Protein', color: '#EC4899' }, { label: 'Carbs', color: '#0EA5E9' }, { label: 'Fat', color: '#F97316' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 3, background: l.color, borderRadius: 99 }} />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eating patterns */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 14 }}>Eating Patterns</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patterns.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: p.bg, borderRadius: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{p.text}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>
            These observations are descriptive only and do not constitute medical advice or diagnosis.
          </p>
        </div>
      </div>
    </div>
  )
}
