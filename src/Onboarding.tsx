import { useState } from 'react'
import type { UserProfile, NutritionGoals } from './types'
import { calculateBMI, getBMICategory, calculateGoals } from './utils'
import leavesBg from './imports/onboarding-bg.webp'
interface Props {
  onComplete: (profile: UserProfile, goals: NutritionGoals) => void
}

const activityOptions = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'light', label: 'Lightly Active', desc: '1–3 days/week' },
  { id: 'moderate', label: 'Moderately Active', desc: '3–5 days/week' },
  { id: 'active', label: 'Very Active', desc: '6–7 days/week' },
  { id: 'very_active', label: 'Extra Active', desc: 'Physical job or 2×/day' },
] as const

const goalOptions = [
  { id: 'maintain', label: 'Maintain Weight', emoji: '⚖️', desc: 'Keep current weight stable' },
  { id: 'lose', label: 'Lose Weight', emoji: '📉', desc: '~500 kcal healthy deficit' },
  { id: 'gain', label: 'Gain Weight', emoji: '💪', desc: 'Lean muscle & weight gain' },
  { id: 'balance', label: 'Eat Healthier', emoji: '🥗', desc: 'Better nutrition balance' },
] as const

function Input({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '13px 16px',
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
          fontSize: 16,
          fontFamily: 'Inter, sans-serif',
          color: '#365314',
          background: '#fff',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#AACB73' }}
        onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
      />
    </div>
  )
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female')
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')
  const [heightCm, setHeightCm] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [weightLbs, setWeightLbs] = useState('')
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate')
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain')

  const getH = () => units === 'metric' ? Number(heightCm) : Math.round(Number(heightFt) * 30.48 + Number(heightIn) * 2.54)
  const getW = () => units === 'metric' ? Number(weightKg) : Math.round(Number(weightLbs) * 453.592) / 1000

  const ageNum = Number(age)
  const hVal = getH()
  const wVal = getW()
  const isAgeValid = Number.isFinite(ageNum) && ageNum >= 13 && ageNum <= 100
  const isHeightValid = Number.isFinite(hVal) && hVal >= 100 && hVal <= 250
  const isWeightValid = Number.isFinite(wVal) && wVal >= 20 && wVal <= 300
  const isStep1Valid = isAgeValid && isHeightValid && isWeightValid

  const bmi = hVal && wVal ? calculateBMI(wVal, hVal) : 0
  const bmiInfo = bmi > 0 ? getBMICategory(bmi) : null

  const profile: UserProfile = {
    name: name.trim() || 'You',
    age: isAgeValid ? Math.round(ageNum) : 25,
    gender,
    heightCm: hVal,
    weightKg: wVal,
    activityLevel,
    goal,
    units,
  }

  const goals = profile.heightCm && profile.weightKg ? calculateGoals(profile) : { calories: 2000, protein: 120, carbs: 240, fat: 65, fiber: 25, water: 2.5 }

  function finish() {
    if (!hVal || !wVal) return
    onComplete(profile, goals)
  }

  const totalSteps = 4

  return (
    <div   style={{     minHeight: '100vh',     backgroundImage: `url(${leavesBg})`,     backgroundSize: 'cover',     backgroundPosition: 'center',     backgroundRepeat: 'no-repeat',     display: 'flex',     flexDirection: 'column',     maxWidth: 430,     margin: '0 auto',   }} >
     {step === 0 ? (
  /* Welcome */
  <div
    style={{
      minHeight: '100vh',
      background: '#F0FDF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}
    className="animate-fade-in"
  >
   {/* OUTER FRAME */}
<div
  style={{
    width: '100%',
    maxWidth: 390,
   height: 'calc(100vh - 10px)',
maxHeight: 820,
minHeight: 710,
    background: '#F0FDF8',
    borderRadius: 38,
    padding: 0,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'visible',
  }}
>
     {/* GREEN INNER PANEL */}
<div
  style={{
    position: 'relative',
    width: '98%',
    margin: '20px auto',
    height: 'calc(100% - 0px)',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '10px 28px 70px',
    boxSizing: 'border-box',
  }}
>
{/* ORGANIC GREEN PANEL SHAPE */}
<svg
  viewBox="0 0 390 760"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible',
    zIndex: 0,
    pointerEvents: 'none',
  }}
>
  <defs>
    <clipPath id="welcomeOrganicShape">
      <path
        d="
          M 34 0
          C 15 0 0 15 0 34
          L 0 580

C 0 598 14 612 32 612
L 72 612

C 94 612 112 624 120 646
C 128 678 145 696 165 704
C 176 709 186 712 195 712
C 204 712 214 709 225 704
C 245 696 262 678 270 646
C 278 624 296 612 318 612
L 358 612

C 376 612 390 598 390 580
          L 390 34

          C 390 15 375 0 356 0

          Z
        "
      />
    </clipPath>
  </defs>

  <image
    href={leavesBg}
    x="0"
    y="0"
    width="390"
    height="760"
    preserveAspectRatio="xMidYMin slice"
    clipPath="url(#welcomeOrganicShape)"
  />
</svg>

        {/* INNER CONTENT */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          {/* LOGO */}
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 28,
              background: 'linear-gradient(135deg, #E0EEA3 0%, #AACB73 60%, #6FAE5C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              marginBottom: 28,
              boxShadow: '0 12px 30px rgba(54, 83, 20, 0.18)',
            }}
          >
            🌿
          </div>

          {/* TITLE */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: '#365314',
              margin: '0 0 10px',
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            NutriScan
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              fontSize: 18,
              color: '#6FAE5C',
              fontWeight: 700,
              margin: '0 0 24px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Scan. Track. Balance.
          </p>

          {/* DESCRIPTION */}
          <p
            style={{
              fontSize: 15,
              color: '#365314',
              lineHeight: 1.65,
              margin: '0 0 34px',
              maxWidth: 290,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Understand your food, track your nutrition, and build healthier
            eating habits — one scan at a time.
          </p>

          {/* GET STARTED */}
          <button
            onClick={() => setStep(1)}
            aria-label="Get started"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: 'none',
              background: '#365314',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(54, 83, 20, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              transform: 'translateY(175px)',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(175px) scale(0.96)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(175px) scale(1)' }}
          >
            →
          </button>

          {/* FOOTER */}
          <p
            style={{
              marginTop: 18,
              fontSize: 12,
              color: '#557044',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Your data stays on your device
          </p>

        </div>
      </div>
    </div>
  </div>
) : (
        <>
          {/* Progress bar */}
          <div style={{ padding: '48px 24px 16px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? '#AACB73' : '#E0EEA3', transition: 'background 0.3s' }} />
              ))}
            </div>
            <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Back
            </button>
          </div>

          <div style={{ flex: 1, padding: '0 24px 40px', overflowY: 'auto' }} className="animate-fade-in">
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#365314', margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.01em' }}>Your Information</h2>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Help us personalize your nutrition goals.</p>
                </div>

                <Input label="First Name" value={name} onChange={setName} placeholder="Alex" />
                <Input label="Age" value={age} onChange={setAge} type="number" placeholder="28" />

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Gender</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['female', 'male', 'other'] as const).map(g => (
                      <button key={g} onClick={() => setGender(g)} aria-pressed={gender === g} style={{ flex: 1, padding: '11px 8px', border: `1.5px solid ${gender === g ? '#AACB73' : '#E2E8F0'}`, borderRadius: 12, background: '#FFFFFF', fontSize: 13, fontWeight: 600, color: gender === g ? '#AACB73' : '#64748B', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Units */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Units</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['metric', 'imperial'] as const).map(u => (
                      <button key={u} onClick={() => setUnits(u)} aria-pressed={units === u} style={{ flex: 1, padding: '11px 8px', border: `1.5px solid ${units === u ? '#AACB73' : '#E2E8F0'}`, borderRadius: 12, background: '#FFFFFF', fontSize: 13, fontWeight: 600, color: units === u ? '#AACB73' : '#64748B', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                        {u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height */}
                {units === 'metric' ? (
                  <Input label="Height (cm)" value={heightCm} onChange={setHeightCm} type="number" placeholder="165" />
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Height</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" style={{ flex: 1, padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 16, fontFamily: 'Inter, sans-serif' }} />
                      <span style={{ alignSelf: 'center', color: '#64748B', fontWeight: 600 }}>ft</span>
                      <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="5" style={{ flex: 1, padding: '13px 16px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 16, fontFamily: 'Inter, sans-serif' }} />
                      <span style={{ alignSelf: 'center', color: '#64748B', fontWeight: 600 }}>in</span>
                    </div>
                  </div>
                )}

                {/* Weight */}
                {units === 'metric' ? (
                  <Input label="Weight (kg)" value={weightKg} onChange={setWeightKg} type="number" placeholder="62" />
                ) : (
                  <Input label="Weight (lbs)" value={weightLbs} onChange={setWeightLbs} type="number" placeholder="137" />
                )}

                {/* Activity */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Activity Level</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activityOptions.map(a => (
                      <button key={a.id} onClick={() => setActivityLevel(a.id)} aria-pressed={activityLevel === a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', border: `1.5px solid ${activityLevel === a.id ? '#AACB73' : '#E2E8F0'}`, borderRadius: 12, background: '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: activityLevel === a.id ? '#AACB73' : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{a.label}</span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {!isStep1Valid && (
                  <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                    Please enter age 13–100{units === 'metric' ? ', height 100–250 cm, weight 20–300 kg' : ', valid height and weight'} to continue.
                  </div>
                )}

                <button
                  onClick={() => isStep1Valid && setStep(2)}
                  disabled={!isStep1Valid}
                  style={{ padding: '16px', background: isStep1Valid ? '#AACB73' : '#E2E8F0', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: isStep1Valid ? 'pointer' : 'not-allowed', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: isStep1Valid ? '0 4px 16px rgba(5,150,105,0.3)' : 'none', marginTop: 8 }}
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#365314', margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.01em' }}>Your BMI</h2>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Based on your height and weight.</p>
                </div>

                {bmi > 0 && bmiInfo ? (
                  <>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                      <div style={{ fontSize: 56, fontWeight: 800, color: bmiInfo.color, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {bmi.toFixed(1)}
                      </div>
                      <div style={{ display: 'inline-block', marginTop: 12, padding: '6px 16px', borderRadius: 99, background: bmiInfo.bgColor, color: bmiInfo.color, fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {bmiInfo.label}
                      </div>
                      <div style={{ marginTop: 20, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
                        {[
                          { label: 'Under', range: '< 18.5', color: '#3B82F6' },
                          { label: 'Normal', range: '18.5–24.9', color: '#AACB73' },
                          { label: 'Over', range: '25–29.9', color: '#F59E0B' },
                          { label: 'Obese', range: '≥ 30', color: '#EF4444' },
                        ].map(c => (
                          <div key={c.label} style={{ flex: 1, borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: 6, background: c.color, opacity: bmiInfo.color === c.color ? 1 : 0.2 }} />
                            <div style={{ fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{c.range}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#F5EBDA', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#854D0E', lineHeight: 1.6 }}>
                      ⚠️ BMI is a general screening metric only. It does not account for muscle mass, bone density, or distribution of fat. It is not a medical diagnosis.
                    </div>

                    <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#365314', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Estimated Daily Calories</h3>
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748B' }}>Calculated using the Mifflin-St Jeor equation.</p>
                      <div style={{ fontSize: 36, fontWeight: 800, color: '#AACB73', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}>
                        {goals.calories.toLocaleString()} <span style={{ fontSize: 18, fontWeight: 500, color: '#94A3B8' }}>kcal/day</span>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                        This is an estimate, not medical advice. Actual needs vary.
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ background: '#F5EBDA', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                   <p style={{ color: '#94A3B8', fontSize: 14 }}>
  ⚠️ Please go back and enter your height and weight.
</p>
                  </div>
                )}

                <button onClick={() => setStep(3)} style={{ padding: '16px', background: '#AACB73', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', marginTop: 4 }}>
                  Continue →
                </button>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#365314', margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.01em' }}>Your Goal</h2>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>What are you working towards?</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {goalOptions.map(g => (
                    <button key={g.id} onClick={() => setGoal(g.id)} aria-pressed={goal === g.id} style={{
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 18px',
  border: `2px solid ${goal === g.id ? '#AACB73' : '#E2E8F0'}`,
  borderRadius: 16,
  background: '#FFFFFF',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s',
}}>
                      <span style={{ fontSize: 28 }}>{g.emoji}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: goal === g.id ? '#AACB73' : '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{g.label}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{g.desc}</div>
                      </div>
                      {goal === g.id && <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#AACB73', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: 11 }}>✓</span></div>}
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(4)} style={{ padding: '16px', background: '#AACB73', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', marginTop: 4 }}>
                  Continue →
                </button>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#365314', margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.01em' }}>Your Daily Goals</h2>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                    {name ? `Great, ${name}!` : 'All set!'} Here's your personalized nutrition plan.
                  </p>
                </div>

                <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                  <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', fontFamily: 'Plus Jakarta Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Calories</div>
                        <div style={{ fontSize: 38, fontWeight: 800, color: '#AACB73', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2 }}>{goals.calories.toLocaleString()}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>kcal / day</div>
                      </div>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #E0EEA3, #A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔥</div>
                    </div>
                  </div>
                  {[
  { label: 'Protein', value: goals.protein, unit: 'g', color: '#F26BB0', icon: '🥩' },
  { label: 'Carbohydrates', value: goals.carbs, unit: 'g', color: '#8EECF4', icon: '🍚' },
  { label: 'Fat', value: goals.fat, unit: 'g', color: '#F1FF84', icon: '🥑' },
  { label: 'Fiber', value: goals.fiber, unit: 'g', color: '#16A34A', icon: '🥦' },
  { label: 'Water', value: goals.water, unit: 'L', color: '#0EA5E9', icon: '💧' },
].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{m.label}</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {m.value} <span style={{ fontSize: 13, fontWeight: 500, color: m.color }}>{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6, fontStyle: 'italic' }}>
                  These targets are estimates based on the Mifflin-St Jeor formula. They are not medical advice. You can update them anytime in Settings.
                </p>

                <button onClick={finish} style={{ padding: '16px', background: '#AACB73', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}>
                  Start Tracking →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
