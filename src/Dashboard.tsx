import breakfastImage from './imports/breakfast.webp'
import lunchImage from './imports/lunch.webp'
import snackImage from './imports/snack.webp'
import dinnerImage from './imports/dinner.webp'
import type { UserProfile, NutritionGoals, FoodEntry, ActivePage } from './types'
import { getGreeting, pct } from './utils'

const mealConfig: { id: 'breakfast' | 'lunch' | 'snack' | 'dinner'; label: string; emoji: string;image: string; color: string; gradient: string; accent: string }[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    emoji: '🍳',
    image: breakfastImage,
    color: '#FEC194',
    gradient: 'linear-gradient(135deg, #FEC194 0%, #FF0061 100%)',
    accent: 'rgba(255, 0, 97, 0.25)',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    emoji: '🥗',
    image: lunchImage,
    color: '#F02FC2',
    gradient: 'linear-gradient(135deg, #F02FC2 0%, #6094EA 100%)',
    accent: 'rgba(96, 148, 234, 0.25)',
  },
  {
    id: 'snack',
    label: 'Snack',
    emoji: '🍉',
    image: snackImage,
    color: '#F54EA2',
    gradient: 'linear-gradient(135deg, #FFF3B0 0%, #CA26FF 100%)',
    accent: 'rgba(245, 78, 162, 0.25)',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    emoji: '🍗',
    image: dinnerImage,
    color: '#FCCF31',
    gradient: 'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
    accent: 'rgba(245, 85, 85, 0.25)',
  },
]

function MealCard({
  meal, entries, onNavigateScan, onNavigateDiary,
}: {
  meal: typeof mealConfig[0]
  entries: FoodEntry[]
  onNavigateScan: () => void
  onNavigateDiary: () => void
}) {
  const cal = entries.reduce((s, e) => s + e.calories, 0)
  const names = entries.map(e => e.name.split(' ').slice(0, 2).join(' ')).slice(0, 3)

  return (
    <div
      style={{
        flexShrink: 0,
        width: 155,
        height: 250,
        borderRadius:'10px 120px 18px 18px',
        background: meal.gradient,
        padding: '0 0 14px',
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
        boxShadow: `
  0 18px 30px ${meal.accent},
  0 8px 14px rgba(0,0,0,0.16),
  inset 0 1px 1px rgba(255,255,255,0.25)
`,
transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onClick={entries.length > 0 ? onNavigateDiary : onNavigateScan}
      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {/* Watermark icon */}
 {/* FLUID POSTER BACKGROUND */}
<svg
  viewBox="0 0 155 250"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
    borderRadius: '10px 120px 18px 18px',
    overflow: 'hidden',
  }}
>
  <defs>

    {/* Soft light gradient */}
    <linearGradient
      id={`fluidLight-${meal.id}`}
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
    </linearGradient>

    {/* Soft secondary gradient */}
    <linearGradient
      id={`fluidSoft-${meal.id}`}
      x1="1"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
    </linearGradient>

  </defs>


  {/* ───────── LARGE TOP FLUID SHAPE ───────── */}
<path
  d="
    M0 0
    H155
    V90
    C140 78 128 68 113 74
    C96 81 88 101 72 103
    C55 105 48 84 36 70
    C24 56 12 57 0 70
    Z
  "
  fill={`url(#fluidLight-${meal.id})`}
/>

  {/* ───────── LARGE BOTTOM FLUID SHAPE ───────── */}
  <path
    d="
      M0 125
      C18 105 38 108 52 125
      C67 143 61 166 78 181
      C94 196 112 188 125 171
      C137 154 147 150 155 158
      V250
      H0
      Z
    "
    fill={`url(#fluidLight-${meal.id})`}
  />


  {/* ───────── BOTTOM LEFT BLOB ───────── */}
<path
  d="
    M0 170
    C14 157 29 159 39 171
    C49 183 47 194 58 202
    C70 211 88 205 99 196
    C110 187 126 184 155 190
    V250
    H0
    Z
  "
  fill={`url(#fluidLight-${meal.id})`}
/>

  {/* ───────── BOTTOM RIGHT BLOB ───────── */}
 <path
  d="
    M155 155
    C137 142 119 148 108 163
    C97 178 101 196 87 208
    C73 220 55 218 40 230
    C30 238 22 244 10 250
    H155
    Z
  "
  fill={`url(#fluidLight-${meal.id})`}
/>

</svg>
      {/* Floating food image */}
<div style={{
  textAlign: 'center',
  marginTop: -34,
  marginBottom: 10,
  position: 'relative',
  zIndex: 1,
}}>
 <img
  src={meal.image}
  alt={meal.label}
  style={{
    width: 140,
    height: 140,
    objectFit: 'contain',

    /* UP / DOWN */
    marginTop:
      meal.id === 'breakfast' ? -45 :
      meal.id === 'lunch' ? -60 :
      meal.id === 'snack' ? -10 :
      meal.id === 'dinner' ? -10 :
      0,

    /* LEFT / RIGHT */
    transform:
      meal.id === 'breakfast' ? 'translateX(0px)' :
      meal.id === 'lunch' ? 'translateX(-5px)' :
      meal.id === 'snack' ? 'translateX(8px)' :
      meal.id === 'dinner' ? 'translateX(3px)' :
      'translateX(0px)',

    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))',
  }}
/>
</div>
     <div style={{position: 'absolute',left: 14, right: 14, bottom: 18, zIndex:4}}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8, letterSpacing: '-0.01em' }}>
          {meal.label}
        </div>

        {entries.length === 0 ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            Not logged yet
            <div style={{ marginTop: 10, padding: '5px 0', textAlign: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: 99, fontSize: 12, fontWeight: 700, color: '#fff' }}>
              + Add
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {names.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{n}{i < names.length - 1 ? ',' : ''}</div>
              ))}
              {entries.length > 3 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>+{entries.length - 3} more</div>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 10px', display: 'inline-block' }}>
              {cal} kcal
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   CalorieWeekCard — Calorie ring + weekly bar chart
   All values reference CSS design-system tokens defined in index.css
   ───────────────────────────────────────────────────────────────────────── */
function CalorieWeekCard({ entries = [], calorieGoal = 2000 }: { entries?: FoodEntry[]; calorieGoal?: number }) {
  const today = new Date()

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))

    const dayEntries = entries.filter(e => {
      const entryDate = new Date(e.timestamp)
      return entryDate.toDateString() === date.toDateString()
    })

    const calories = dayEntries.reduce((sum, e) => sum + e.calories, 0)

    return {
      date,
      calories,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      number: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    }
  })

  return (
    <div
      style={{
        
        background: '#F5EBDA',
        borderRadius: 20,
        padding: '18px 18px 16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
   
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#0F172A',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Calorie Tracker
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#94A3B8',
              marginTop: 3,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Your last 7 days
          </div>
        </div>

       <div
  style={{
    width: 36,
    height: 36,
    borderRadius: 12,
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
</div>
      </div>

      {/* Calendar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 6,
        }}
      >
        {days.map(day => {
          const percentage = Math.min(
            pct(day.calories, calorieGoal),
            100
          )
        const goalReached = day.isToday && day.calories >= calorieGoal

          return (
            <div
              key={day.date.toISOString()}
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Day */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: 6,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {day.day}
              </div>

              {/* Date circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: goalReached ? '#CDE990' : '#FFFFFF',
                  color: goalReached ? '#0F172A' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  marginBottom: 8,
                }}
              >
                {day.number}
              </div>

              {/* Calorie progress */}
              <div
                style={{
                  width: 7,
                  height: 55,
                  background: '#FFFFFF',
                  borderRadius: 99,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${percentage}%`,
                    background: day.isToday
                      ? '#CDE990'
                      : '#FFFFFF',
                    borderRadius: 99,
                    transition: 'height 0.6s ease',
                  }}
                />
              </div>

              {/* Calories */}
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#64748B',
                  marginTop: 6,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {day.calories}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WaterTracker({
  water,
  goal,
  onAdd,
}: {
  water: number
  goal: number
  onAdd: (v: number) => void
}) {
  const p = Math.min(pct(water, goal), 100)
  // sy: SVG y-coordinate of the water surface (viewBox 0 0 400 300)
  const sy = 300 - p * 3

  return (
    <div style={{
      position: 'relative',
      background: '#FFFAFA',
      borderRadius: 20,
      minHeight: 180,
      overflow: 'hidden',
      boxShadow: '0 1px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
    }}>

      {/* ── Water layer ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20, pointerEvents: 'none' }}>
       <svg
  viewBox="0 0 400 300"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  }}
>
  <defs>
    <linearGradient id="wt-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#BAE6FD" />
      <stop offset="20%" stopColor="#7DD3FC" />
      <stop offset="55%" stopColor="#38BDF8" />
      <stop offset="100%" stopColor="#0284C7" />
    </linearGradient>
  </defs>

  {p > 0 && (
    <path
      d={`
        M-100 ${sy}
        C-50 ${sy - 12}
         20 ${sy - 12}
         80 ${sy}

        C140 ${sy + 12}
         210 ${sy + 12}
         270 ${sy}

        C330 ${sy - 12}
         400 ${sy - 12}
         500 ${sy}

        L500 300
        L-100 300
        Z
      `}
      fill="url(#wt-body)"
    >
      <animate
        attributeName="d"
        values={`
          M-100 ${sy}
          C-50 ${sy - 12} 20 ${sy - 12} 80 ${sy}
          C140 ${sy + 12} 210 ${sy + 12} 270 ${sy}
          C330 ${sy - 12} 400 ${sy - 12} 500 ${sy}
          L500 300 L-100 300 Z;

          M-100 ${sy + 3}
          C-50 ${sy - 9} 20 ${sy - 9} 80 ${sy + 3}
          C140 ${sy + 15} 210 ${sy + 15} 270 ${sy + 3}
          C330 ${sy - 9} 400 ${sy - 9} 500 ${sy + 3}
          L500 300 L-100 300 Z;

          M-100 ${sy}
          C-50 ${sy - 12} 20 ${sy - 12} 80 ${sy}
          C140 ${sy + 12} 210 ${sy + 12} 270 ${sy}
          C330 ${sy - 12} 400 ${sy - 12} 500 ${sy}
          L500 300 L-100 300 Z
        `}
        dur="5s"
        repeatCount="indefinite"
      />
    </path>
  )}
</svg>
      </div>

      {/* ── Content (header + buttons — unchanged) ── */}
      <div style={{ position: 'relative', zIndex: 5, padding: '16px 18px', minHeight: 180, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 10px rgba(14,165,233,0.12)' }}>💧</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--ds-font-heading)' }}>Hydration</div>
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--ds-font-body)' }}>{water.toFixed(1)} of {goal} L</div>
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0284C7', fontFamily: 'var(--ds-font-heading)' }}>{p}%</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {[{ label: '+250 ml', val: 0.25 }, { label: '+500 ml', val: 0.5 }].map(b => (
            <button key={b.label} onClick={() => onAdd(b.val)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(10px)', color: '#0284C7', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.65)', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--ds-font-heading)', boxShadow: '0 4px 10px rgba(14,165,233,0.08)' }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

//macro card */

function MacroCard({
  label,
  value,
  goal,
  icon,
  accent,
}: {
  label: string
  value: number
  goal: number
  icon: string
  accent: string
}) {
  const percentage = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0

  // Card colors
  const cardColor =
    label === 'Protein'
      ? '#E4C1F9'
      : label === 'Carbs'
      ? '#A9DEF9'
      : label === 'Fat'
      ? '#FCF6BD'
      : '#D0F4DE'
  const textColor =
  label === 'Protein'
    ? '#6B21A8'   // Dark purple
    : label === 'Fat'
    ? '#B88600'   // Dark yellow
    : accent

  return (
    <div
      style={{
        position: 'relative',
        height: 150,
        minWidth: 0,
        overflow: 'hidden',

        // Keep the outer container transparent
       background: 'none',
      boxShadow: 'none',
      }}
    >
      {/* SOFT GLOW INSIDE CARD */}
<div
  style={{
    position: 'absolute',
    width: 220,
    height: 220,
    right: -45,
    bottom: -80,
    borderRadius: '50%',
    background: `
      radial-gradient(
        circle,
        rgba(255,255,255,0.55) 0%,
        rgba(255,255,255,0.25) 35%,
        transparent 70%
      )
    `,
    filter: 'blur(18px)',
    pointerEvents: 'none',
    zIndex: 2,
  }}
/>
 
    {/* Organic card shape */}
<svg
  viewBox="0 0 320 150"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'visible',
  }}
>
<path
  d="
    M 24 0
    H 296
    Q 320 0 320 24
    V 52

    C 291 52 270 62 270 75
    C 270 88 291 98 320 98

    V 126
    Q 320 150 296 150
    H 24
    Q 0 150 0 126
    V 24
    Q 0 0 24 0
    Z
  "
  fill={cardColor}
/>
</svg>
      {/* =========================
          CARD CONTENT
          ========================= */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          padding: '18px 18px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >

        {/* TOP ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >

          {/* ICON */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.60)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {icon}
          </div>

          {/* PERCENTAGE */}
          <div
            style={{
              padding: '5px 8px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.60)',
              color: textColor,
              fontSize: 10,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {percentage}%
          </div>
        </div>

        {/* =========================
            BOTTOM INFORMATION
            ========================= */}
        <div>

          {/* VALUE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 25,
                lineHeight: 1,
                fontWeight: 800,
                color: textColor,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {Math.round(value)}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: textColor,
                opacity: 0.75,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              g
            </span>
          </div>

          {/* LABEL */}
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 700,
              color: textColor,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {label}
          </div>

          {/* PROGRESS BAR */}
          <div
            style={{
              marginTop: 10,
              height: 5,
              width: '100%',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.60)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                borderRadius: 99,
                background: textColor,
                transition: 'width 0.5s ease',
              }}
            />
          </div>

          {/* GOAL */}
          <div
            style={{
              marginTop: 4,
              fontSize: 9,
              color: textColor,
              opacity: 0.7,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Goal {goal}g
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ profile, goals, entries, water, onAddWater, onNavigate }: {
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
  onAddWater: (v: number) => void
  onNavigate: (p: ActivePage) => void
}) {
  const today = entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
  const totalCal = today.reduce((s, e) => s + e.calories, 0)
  const totalProt = today.reduce((s, e) => s + e.protein, 0)
  const totalCarbs = today.reduce((s, e) => s + e.carbs, 0)
  const totalFat = today.reduce((s, e) => s + e.fat, 0)
  const totalFiber = today.reduce((s, e) => s + (e.fiber ?? 0), 0)
  const remaining = Math.max(goals.calories - totalCal, 0)

  return (
   <div
  style={{
    backgroundColor: '#F0FDF8',
    minHeight: '100vh',
    width: '100%',
  }}
  className="animate-fade-in"
>
  {/* ───────────────── HERO SECTION ───────────────── */}

<div
  style={{
    backgroundColor: '#F0FDF8',
    minHeight: '100%',
    width: '100%',
    paddingBottom: 1,
  }}
>
 {/* ───────────── GREETING HEADER ───────────── */}
<div
  style={{
    background: '#E0EEA3',
    padding: '48px 20px 52px',
    borderRadius: '0 0 50% 50% / 0 0 14% 14%',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  {/* subtle curved highlight */}
  <div
    style={{
      position: 'absolute',
      width: 260,
      height: 260,
      right: -100,
      top: -140,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
    }}
  />

  <div
    style={{
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: '#365314',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <h1
        style={{
          margin: '5px 0 0',
          fontSize: 22,
          fontWeight: 800,
          color: '#365314',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {getGreeting(profile.name)} 👋
      </h1>
    </div>

    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 800,
        color: '#365314',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        border: '2px solid rgba(54,83,20,0.25)',
        flexShrink: 0,
      }}
    >
      {profile.name.charAt(0).toUpperCase()}
    </div>
  </div>
</div>
 
{/* ───────────── CALORIE CARD ───────────── */}
<div
  style={{
    margin: '-18px 16px 0',
    position: 'relative',
    zIndex: 5,
    backgroundColor: '#FFFAFA',
    borderRadius: 24,
    padding: '20px 18px 18px',
    boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
    border: '1px solid rgba(255,255,255,0.45)',
    boxSizing: 'border-box',
  }}
>
    {/* Card title */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#365314',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        Daily Calories
      </div>

      <div
        style={{
          padding: '5px 9px',
          borderRadius: 99,
          backgroundColor: '#F5EBDA',
          color: '#365314',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {Math.min(pct(totalCal, goals.calories), 100)}%
      </div>
    </div>

    {/* Full calorie ring */}
{/* Duolingo-style calorie progress ring */}
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 0 8px',
  }}
>
  <div
    style={{
      position: 'relative',
      width: 150,
      height: 150,
    }}
  >
<svg
  width="150"
  height="150"
  viewBox="0 0 150 150"
  style={{
    overflow: 'visible',
  }}
>
  {(() => {
    const cx = 75
    const cy = 75
    const r = 57

    // ───────────── RING SETTINGS ─────────────
    const segmentCount = 8
    const strokeWidths = [
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
]
    // Gap between each segment
    const gap = 4

    // Start/end point near the crown
    // 60° = approximately 5 o'clock
    const startAngle = 60

    const progress = Math.min(
      pct(totalCal, goals.calories),
      100
    )

    // ───────────── INCREASING SEGMENT SIZES ─────────────
    // 1, 2, 3, 4, 5, 6, 7, 8
    const weights = [1, 2, 3, 4, 5, 6, 7, 8]

    const totalWeight = weights.reduce(
      (sum, w) => sum + w,
      0
    )

    // Total angle occupied by gaps
    const totalGap = gap * segmentCount

    // Angle available for actual segments
    const availableAngle = 360 - totalGap

    // Angle assigned to one weight unit
    const unitAngle =
      availableAngle / totalWeight

    // ───────────── POLAR COORDINATE ─────────────
    const point = (angle: number) => {
      const rad =
        (angle * Math.PI) / 180

      return {
        x:
          cx +
          r * Math.cos(rad),

        y:
          cy +
          r * Math.sin(rad),
      }
    }

    // ───────────── ARC CREATOR ─────────────
    const createArc = (
      start: number,
      end: number
    ) => {
      const p1 = point(start)
      const p2 = point(end)

      const angle = end - start

      const largeArc =
        angle > 180 ? 1 : 0

      return `
        M ${p1.x} ${p1.y}
        A ${r} ${r} 0 ${largeArc} 1
        ${p2.x} ${p2.y}
      `
    }

    // ───────────── CREATE 8 SEGMENTS ─────────────
    const segments: {
      start: number
      end: number
      size: number
    }[] = []

    let currentAngle = startAngle

    weights.forEach(weight => {
      const segmentSize =
        weight * unitAngle

      const segmentStart =
        currentAngle + gap / 2

      const segmentEnd =
        currentAngle +
        segmentSize -
        gap / 2

      segments.push({
        start: segmentStart,
        end: segmentEnd,
        size: segmentSize,
      })

      currentAngle +=
        segmentSize + gap
    })

    // ───────────── PROGRESS ─────────────
    let remainingProgress =
      (progress / 100) *
      availableAngle

    return (
      <g>

        {/* ───────── GRAY BACKGROUND SEGMENTS ───────── */}
        {segments.map((segment, index) => (
          <path
            key={`gray-${index}`}
            d={createArc(
              segment.start,
              segment.end
            )}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidths[index]}
            strokeLinecap="butt"
          />
        ))}

        {/* ───────── YELLOW PROGRESS SEGMENTS ───────── */}
        {segments.map((segment, index) => {

          if (remainingProgress <= 0) {
            return null
          }

          const usableAngle =
            segment.size - gap

          const filledAngle =
            Math.min(
              remainingProgress,
              usableAngle
            )

          remainingProgress -=
            usableAngle

          if (filledAngle <= 0) {
            return null
          }

          const yellowStart =
            segment.start

          const yellowEnd =
            yellowStart +
            filledAngle

          return (
            <path
              key={`yellow-${index}`}
              d={createArc(
                yellowStart,
                yellowEnd
              )}
              fill="none"
              stroke="#FBBF24"
              strokeWidth={strokeWidths[index]}
              strokeLinecap="butt"
              style={{
                transition:
                  'all 0.8s ease',
              }}
            />
          )
        })}

      </g>
    )
  })()}
</svg>
    {/* Center content */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Flame */}
      <div
        style={{
          fontSize: 18,
          lineHeight: 1,
          marginBottom: 7,
        }}
      >
        🔥
      </div>

      {/* Calories */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#374151',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          lineHeight: 1,
        }}
      >
        {totalCal.toLocaleString()}
      </div>

      {/* kcal */}
      <div
        style={{
          fontSize: 9,
          color: '#9CA3AF',
          marginTop: 4,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        kcal
      </div>
    </div>

    {/* Crown badge */}
    {/* Crown overlapping the ring */}
<div
  style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 36,
    height: 36,
    // Position crown directly on the ring at ~5 o'clock
   transform: 'translate(24px, 18px)',

    borderRadius: 7,

    background:
      totalCal >= goals.calories
        ? '#FBBF24'
        : '#E5E7EB',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    // Makes the crown appear ABOVE the ring
    zIndex: 10,

    boxShadow:
      totalCal >= goals.calories
        ? '0 2px 6px rgba(251,191,36,0.35)'
        : '0 2px 5px rgba(0,0,0,0.10)',

    transition: 'all 0.4s ease',
  }}
>
  <svg
    width="23"
    height="23"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 18L3 8L8 12L12 5L16 12L21 8L20 18H4Z"
      fill={
        totalCal >= goals.calories
          ? '#FFFFFF'
          : '#9CA3AF'
      }
    />

    <path
      d="M4 20H20"
      stroke={
        totalCal >= goals.calories
          ? '#FFFFFF'
          : '#9CA3AF'
      }
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</div>
  </div>
</div>
    {/* Eaten / Goal / Remaining */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginTop: 2,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '8px 4px',
          borderRadius: 12,
          backgroundColor: '#F5EBDA',
        }}
      >
        <div style={{ fontSize: 18 }}>🍎</div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#365314',
            marginTop: 2,
          }}
        >
          {totalCal.toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 10,
            color: '#4D7C0F',
            marginTop: 2,
          }}
        >
          Eaten
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '8px 4px',
          borderRadius: 12,
          backgroundColor: '#F5EBDA',
        }}
      >
        <div style={{ fontSize: 18 }}>🎯</div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#365314',
            marginTop: 2,
          }}
        >
          {goals.calories.toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 10,
            color: '#4D7C0F',
            marginTop: 2,
          }}
        >
          Goal
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '8px 4px',
          borderRadius: 12,
          backgroundColor: '#F5EBDA',
        }}
      >
        <div style={{ fontSize: 18 }}>🔥</div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#365314',
            marginTop: 2,
          }}
        >
          {remaining.toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 10,
            color: '#4D7C0F',
            marginTop: 2,
          }}
        >
          Remaining
        </div>
      </div>
    </div>
  </div>
      
 {/* ───────────── 4 MACRO CARDS ───────────── */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    margin: '12px 16px 0',
    background: '#F0FDF8',
  }}
>
    <MacroCard
      label="Protein"
      value={totalProt}
      goal={goals.protein}
      icon="🥩"
      accent="#65A30D"
    />

    <MacroCard
      label="Carbs"
      value={totalCarbs}
      goal={goals.carbs}
      icon="🌾"
      accent="#3B82F6"
    />

    <MacroCard
      label="Fat"
      value={totalFat}
      goal={goals.fat}
      icon="🥑"
      accent="#D97706"
    />

    <MacroCard
      label="Fiber"
      value={totalFiber}
      goal={goals.fiber}
      icon="🥦"
      accent="#16A34A"
    />
  </div>
</div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Scan CTA */}
        <button
          onClick={() => onNavigate('scan')}
          style={{
  width: '100%',
  padding: '16px 24px',
  background: '#FFFAFA',
  color: '#365314',
  fontSize: 16,
  fontWeight: 700,
  border: '1.5px solid #E0EEA3',
  borderRadius: 18,
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  boxShadow: '0 6px 20px rgba(5,150,105,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10
}}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)' }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          <span style={{ fontSize: 20 }}>📷</span>
          Scan Food
        </button>

        {/* Calorie + Weekly card */}
        <CalorieWeekCard entries={entries} calorieGoal={goals.calories} />

        {/* Meal cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 2px' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Today's Meals</h2>
            <button onClick={() => onNavigate('diary')} style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>View all →</button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, paddingTop: 28 }}>
            {mealConfig.map(mc => (
              <MealCard
                key={mc.id}
                meal={mc}
                entries={today.filter(e => e.meal === mc.id)}
                onNavigateScan={() => onNavigate('scan')}
                onNavigateDiary={() => onNavigate('diary')}
              />
            ))}
          </div>
        </div>

        {/* Water */}
        <WaterTracker water={water} goal={goals.water} onAdd={onAddWater} />
      </div>
    </div>
  )
}
