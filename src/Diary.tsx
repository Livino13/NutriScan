import { useState, useEffect } from 'react'
import type { FoodEntry } from './types'
import { generateId } from './utils'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const mealConfig: {
  id: MealType
  label: string
  icon: string
  gradient: string
  accent: string
  color: string
}[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    icon: '🌅',
    gradient: 'linear-gradient(135deg, #FEC194 0%, #FF0061 100%)',
    accent: 'rgba(255, 0, 97, 0.25)',
    color: '#E11D48',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    icon: '☀️',
    gradient: 'linear-gradient(135deg, #F02FC2 0%, #6094EA 100%)',
    accent: 'rgba(202, 38, 255, 0.25)',
    color: '#7C3AED',
  },
  {
    id: 'snack',
    label: 'Snack',
    icon: '🍎',
    gradient: 'linear-gradient(135deg, #FFF3B0 0%, #CA26FF 100%)',
    accent: 'rgba(96, 148, 234, 0.25)',
    color: '#9333EA',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    icon: '🌙',
    gradient: 'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
    accent: 'rgba(245, 85, 85, 0.25)',
    color: '#EA580C',
  },
]
function ManualAddModal({ meal, onAdd, onClose }: { meal: MealType; onAdd: (e: FoodEntry) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [serving, setServing] = useState('100')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cal = Math.max(0, Math.round(Number(calories) || 0))
    if (!name.trim() || !cal) return
    onAdd({
      id: generateId(),
      name: name.trim(),
      meal,
      calories: cal,
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      fiber: 0,
      servingSize: Math.max(1, Number(serving) || 100),
      servingUnit: 'g',
      timestamp: new Date().toISOString(),
    })
    onClose()
  }

  const iStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#0F172A', outline: 'none', transition: 'border-color 0.15s' }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }} className="animate-slide-up">
        <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 99, margin: '0 auto 20px' }} />
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Add Food Manually</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Food name" required style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Calories*</div>
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0 kcal" required style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Serving (g)</div>
              <input type="number" value={serving} onChange={e => setServing(e.target.value)} style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Protein (g)</div>
              <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Carbs (g)</div>
              <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Fat (g)</div>
              <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="0" style={iStyle} onFocus={e => { e.target.style.borderColor = '#059669' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 8, padding: '14px', background: 'linear-gradient(135deg, #059669, #10B981)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}>
            Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Diary({ entries, onDeleteEntry, onAddEntry, onNavigateScan }: {
  entries: FoodEntry[]
  onDeleteEntry: (id: string) => void
  onAddEntry: (e: FoodEntry) => void
  onNavigateScan: () => void
}) {
  const [addingMeal, setAddingMeal] = useState<MealType | null>(null)

  const today = entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
  const byMeal = (meal: MealType) => today.filter(e => e.meal === meal)
  const totalCal = today.reduce((sum, e) => sum + e.calories, 0)
  let insightTitle = ''
let insightText = ''

if (today.length === 0) {
  insightTitle = 'Ready when you are 🌱'
  insightText = 'Start logging your meals to get personalized insights about your day.'
} else if (totalCal === 0) {
  insightTitle = 'Keep going 💪'
  insightText = 'Add the calories for your meals to see how your day is progressing.'
} else if (totalCal < 1200) {
  insightTitle = 'You’re doing great! 🌟'
  insightText = 'You’ve made a good start today. Keep logging your meals to stay on track.'
} else if (totalCal < 1800) {
  insightTitle = 'Nice work! 💚'
  insightText = 'You’re making steady progress today. Keep building balanced meals.'
} else {
  insightTitle = 'Great job staying consistent! 🎯'
  insightText = 'You’ve logged a good amount of food today. Keep listening to your body and making balanced choices.'
}

  return (
    <div style={{ background: '#F0FDF8', minHeight: '100vh' }} className="animate-fade-in">
      {addingMeal && <ManualAddModal meal={addingMeal} onAdd={onAddEntry} onClose={() => setAddingMeal(null)} />}

      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF8 100%)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Food Diary</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
   {/* ==================== MEAL SECTIONS ==================== */}

{mealConfig.map(mc => {
  const mealEntries = byMeal(mc.id)
  const mealCal = mealEntries.reduce((s, e) => s + e.calories, 0)

  return (
    <div
      key={mc.id}
      style={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* MEAL CARD */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: mc.gradient,
          borderRadius: '22px 90px 22px 22px',
          padding: '16px',
          boxSizing: 'border-box',
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* SUBTLE FLUID WATERMARK */}
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
    borderRadius: 22,
    overflow: 'hidden',
    opacity: 0.85,
  }}
>
  <defs>
    <linearGradient
      id={`fluidLight-${mc.id}`}
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
<stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
    </linearGradient>

    <linearGradient
      id={`fluidSoft-${mc.id}`}
      x1="1"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
<stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
    </linearGradient>
  </defs>

  {/* Small top fluid */}
<path
  d="
    M0 0
    H155
    V62
    C137 48 124 44 110 51
    C94 59 88 77 73 79
    C56 81 49 63 37 52
    C25 41 12 42 0 55
    Z
  "
  fill={`url(#fluidLight-${mc.id})`}
/>
  {/* Small bottom fluid */}
<path
  d="
    M0 184
    C16 170 31 173 43 185
    C54 197 54 213 69 221
    C84 230 101 220 113 207
    C125 194 141 190 155 201
    V250
    H0
    Z
  "
  fill={`url(#fluidSoft-${mc.id})`}
/>
  {/* Small bottom-left blob */}
  <path
    d="
      M0 220
      C12 212 25 214 34 222
      C43 231 47 241 58 245
      C69 250 81 246 91 239
      C102 232 119 231 155 240
      V250
      H0
      Z
    "
    fill={`url(#fluidLight-${mc.id})`}
  />

  {/* Small right blob */}
 {/* LARGER BOTTOM RIGHT WATERMARK */}
<path
  d="
    M155 150
    C136 137 116 143 103 159
    C90 175 94 195 80 209
    C66 223 47 222 32 235
    C20 245 12 249 0 250
    H155
    Z
  "
  fill={`url(#fluidSoft-${mc.id})`}
/>
</svg>

        {/* HEADER */}
        <div
          style={{
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 14,
}}
        >

          {/* LEFT SIDE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {mc.icon}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {mc.label}
              </div>

              <div
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: '#64748B',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {mealEntries.length}{' '}
                {mealEntries.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {/* CALORIES */}
        <div
  style={{
    fontSize: 15,
    fontWeight: 800,
    color: '#FFFFFF',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    whiteSpace: 'nowrap',
    transform: 'translateX(-35px)',
  }}
>
  {mealCal} kcal
</div>
        </div>

        {/* FOOD LIST */}
       <div
  style={{
    position: 'relative',
    zIndex: 1,
    background: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  }}
>

          {mealEntries.length === 0 ? (
            <div
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                color: '#A8B3C2',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              No food logged yet
            </div>
          ) : (
            mealEntries.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  padding: '13px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  borderBottom:
                    index < mealEntries.length - 1
                      ? '1px solid rgba(148,163,184,0.15)'
                      : 'none',
                  boxSizing: 'border-box',
                }}
              >

                {/* FOOD DETAILS */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#0F172A',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.name}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      color: '#94A3B8',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {entry.servingSize}
                    {entry.servingUnit}
                    {' · '}
                    P:{entry.protein}g
                    {' · '}
                    C:{entry.carbs}g
                    {' · '}
                    F:{entry.fat}g
                  </div>
                </div>

                {/* CALORIES + DELETE */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: mc.color,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      whiteSpace: 'nowrap',
                      
                    }}
                  >
                    {entry.calories} kcal
                  </div>

                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    style={{
                      width: 27,
                      height: 27,
                      borderRadius: '50%',
                      background: '#FEE2E2',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#EF4444',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>

              </div>
            ))
          )}

        </div>

        {/* ACTION BUTTONS */}
       <div
  style={{
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 7,
    marginTop: 11,
  }}
>
                   <button
                    onClick={onNavigateScan}
                    style={{
                      height: 30,
                      padding: '0 12px',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      border: 'none',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
                    }}
                  >
                    📷 Scan
          </button>

          <button
    onClick={() => setAddingMeal(mc.id)}
    style={{
      height: 30,
      padding: '0 12px',
      background: '#FFFFFF',
      color: '#0F172A',
      border: 'none',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
    }}
          >
            + Add
          </button>
        </div>

      </div>
    </div>
  )
})}
        {/* DAILY INSIGHT */}
<div
  style={{
    marginTop: 4,
    padding: '16px 18px',
    background: '#F5EBDA',
    borderRadius: 18,
    border: '1px solid rgba(5,150,105,0.12)',
    boxShadow: '0 4px 14px rgba(15,23,42,0.05)',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        background: '#ECFDF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 19,
        flexShrink: 0,
      }}
    >
      💡
    </div>

    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: '#0F172A',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          marginBottom: 4,
        }}
      >
        {insightTitle}
      </div>

      <div
        style={{
          fontSize: 12,
          lineHeight: 1.5,
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {insightText}
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  )
}
