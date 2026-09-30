import { useState, useEffect, useRef } from 'react'
import type { UserProfile, NutritionGoals, FoodEntry, WeightEntry } from './types'
import { calculateBMI, getBMICategory, calculateGoals } from './utils'
import { latestWeight, weightStats } from './weight'
import type { BackupData } from './storage'
import type { CloudSync } from './useCloudSync'

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462)
}

function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10
}

function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inch = Math.round(totalIn % 12)
  return { ft, inch }
}

export default function Profile({ profile, goals, entries, water, weightLogs, account, onUpdateProfile, onUpdateGoals, onImportData, onExportData, onLogWeight, onDeleteWeightLog, onResetOnboarding }: {
  profile: UserProfile
  goals: NutritionGoals
  entries: FoodEntry[]
  water: number
  weightLogs: WeightEntry[]
  account: CloudSync
  onUpdateProfile: (p: UserProfile) => void
  onUpdateGoals: (g: NutritionGoals) => void
  onImportData: (data: unknown) => boolean
  onExportData: () => BackupData
  onLogWeight: (weightKg: number) => void
  onDeleteWeightLog: (id: string) => void
  onResetOnboarding: () => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState(profile)
  const [goalDraft, setGoalDraft] = useState(goals)
  const [notifications, setNotifications] = useState(true)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [weightInput, setWeightInput] = useState('')
  const [weightMsg, setWeightMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing !== 'info') setDraft(profile)
  }, [profile, editing])
  useEffect(() => {
    if (editing !== 'goals') setGoalDraft(goals)
  }, [goals, editing])

  const bmi = calculateBMI(profile.weightKg, profile.heightCm)
  const bmiInfo = bmi > 0 ? getBMICategory(bmi) : null

  function saveProfile() {
    onUpdateProfile({
      ...draft,
      name: draft.name.trim() || profile.name,
      age: Math.min(100, Math.max(13, Math.round(Number(draft.age) || profile.age))),
      weightKg: Math.max(20, Number(draft.weightKg) || profile.weightKg),
      heightCm: Math.max(100, Number(draft.heightCm) || profile.heightCm),
    })
    setEditing(null)
  }

  function saveGoals() {
    onUpdateGoals({
      calories: Math.max(800, Math.round(Number(goalDraft.calories) || goals.calories)),
      protein: Math.max(0, Math.round(Number(goalDraft.protein) || 0)),
      carbs: Math.max(0, Math.round(Number(goalDraft.carbs) || 0)),
      fat: Math.max(0, Math.round(Number(goalDraft.fat) || 0)),
      fiber: Math.max(0, Math.round(Number(goalDraft.fiber) || 0)),
      water: Math.min(10, Math.max(0.5, Number(goalDraft.water) || goals.water)),
    })
    setEditing(null)
  }

  function recalcGoals() {
    const base = editing === 'info' ? draft : profile
    const newGoals = calculateGoals({ ...base, weightKg: Number(base.weightKg) || 0, heightCm: Number(base.heightCm) || 0 })
    onUpdateGoals(newGoals)
    setGoalDraft(newGoals)
  }

  function exportBackup() {
    try {
      const data = onExportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nutriscan-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setImportMsg('Export failed. Storage may be unavailable.')
    }
  }

  function handleLogWeight() {
    const raw = Number(weightInput)
    if (!Number.isFinite(raw) || raw <= 0) {
      setWeightMsg('Enter a valid weight.')
      return
    }
    const weightKg = profile.units === 'imperial' ? lbsToKg(raw) : raw
    if (weightKg < 20 || weightKg > 400) {
      setWeightMsg(profile.units === 'imperial' ? 'Enter a weight between 44 and 880 lbs.' : 'Enter a weight between 20 and 400 kg.')
      return
    }
    onLogWeight(Math.round(weightKg * 10) / 10)
    setWeightInput('')
    setWeightMsg(null)
  }

  const stats = weightStats(weightLogs)
  const recentLogs = [...weightLogs].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 5)
  const chartLogs = [...weightLogs].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).slice(-20)
  const displayWeight = (kg: number) => profile.units === 'imperial' ? `${kgToLbs(kg)} lbs` : `${kg} kg`

  function weightPoints(): string {
    if (chartLogs.length === 0) return ''
    const W = 300, H = 90, PAD = 12
    const vals = chartLogs.map(l => l.weightKg)
    const min = Math.min(...vals), max = Math.max(...vals)
    const span = max - min || 1
    return chartLogs.map((l, i) => {
      const x = chartLogs.length === 1 ? W / 2 : PAD + (i / (chartLogs.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((l.weightKg - min) / span) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  function handleImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string)
        if (!window.confirm('Replace all current data with this backup? This cannot be undone.')) return
        const ok = onImportData(parsed)
        setImportMsg(ok ? 'Backup restored.' : 'Invalid backup file.')
      } catch {
        setImportMsg('Invalid backup file.')
      }
    }
    reader.onerror = () => setImportMsg('Could not read file.')
    reader.readAsText(file)
  }

  const fieldStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#0F172A', outline: 'none', background: '#F8FAFC' }

  return (
    <div style={{ background: '#F0FDF8', minHeight: '100vh' }} className="animate-fade-in">
     {/* Hero */}
{/* Hero */}
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

  {/* Profile content */}
  <div
    style={{
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    {/* Name + information */}
    <div>
      <h1
        style={{
          margin: '0 0 5px',
          fontSize: 22,
          fontWeight: 800,
          color: '#365314',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {profile.name}
      </h1>

      <div
        style={{
          fontSize: 13,
          color: '#365314',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {profile.age}y ·{' '}
        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} ·{' '}
        {profile.units === 'imperial'
          ? (() => { const { ft, inch } = cmToFtIn(profile.heightCm); return `${ft}ft ${inch}in · ${kgToLbs(profile.weightKg)}lbs` })()
          : `${profile.heightCm}cm · ${profile.weightKg}kg`}
      </div>

      {bmi > 0 && bmiInfo && (
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            padding: '5px 12px',
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            color: '#365314',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          BMI {bmi.toFixed(1)} · {bmiInfo.label}
        </div>
      )}
    </div>

    {/* Profile icon — RIGHT SIDE */}
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
        marginLeft: 16,
      }}
    >
      {profile.name.charAt(0).toUpperCase()}
    </div>
  </div>
</div>
      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Account & Sync */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Account & Sync</div>
          </div>
          {!account.configured ? (
            <div style={{ padding: '14px 18px', fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
              ☁️ Cloud sync is not set up. Add your Firebase keys to <span style={{ fontFamily: 'monospace' }}>.env</span> to enable Google sign-in and sync across devices. Your data stays on this device until then.
            </div>
          ) : !account.user ? (
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                Sign in to back up your diary to the cloud and sync it across devices.
              </div>
              <button onClick={account.signIn} style={{ padding: '12px', background: '#fff', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Sign in with Google
              </button>
              {account.error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, fontSize: 12, color: '#B91C1C', lineHeight: 1.5 }}>
                  {account.error}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {account.user.photoURL ? (
                  <img src={account.user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0F7DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#365314', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {(account.user.displayName || account.user.email || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {account.user.displayName || 'Google Account'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {account.user.email ?? ''}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: account.status === 'error' ? '#B91C1C' : '#059669', fontWeight: 600 }}>
                {account.status === 'syncing' && 'Syncing…'}
                {account.status === 'synced' && '✓ Synced across devices'}
                {account.status === 'signed-out' && 'Signed out'}
                {account.status === 'error' && (account.error || 'Sync error. Your data is safe on this device.')}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={account.syncNow} style={{ flex: 1, padding: '11px', background: '#F0FDF8', color: '#059669', border: '1.5px solid #A7F3D0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Sync Now
                </button>
                <button onClick={account.signOut} style={{ flex: 1, padding: '11px', background: '#fff', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Personal Information</div>
            <button onClick={() => setEditing(editing === 'info' ? null : 'info')} style={{ fontSize: 12, fontWeight: 700, color: '#AACB73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {editing === 'info' ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing === 'info' ? (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Name</div>
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={fieldStyle} onFocus={e => { e.target.style.borderColor = '#AACB73' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Age</div>
                  <input type="number" min={13} max={100} value={draft.age} onChange={e => setDraft({ ...draft, age: Number(e.target.value) })} style={fieldStyle} onFocus={e => { e.target.style.borderColor = '#AACB73' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{draft.units === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)'}</div>
                  <input
                    type="number"
                    min={0}
                    value={draft.units === 'imperial' ? kgToLbs(draft.weightKg) : draft.weightKg}
                    onChange={e => setDraft({ ...draft, weightKg: draft.units === 'imperial' ? lbsToKg(Number(e.target.value)) : Number(e.target.value) })}
                    style={fieldStyle}
                    onFocus={e => { e.target.style.borderColor = '#AACB73' }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
                  />
                </div>
                {draft.units === 'imperial' ? (
                  <>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Height (ft)</div>
                      <input type="number" min={0} value={cmToFtIn(draft.heightCm).ft} onChange={e => {
                        const { inch } = cmToFtIn(draft.heightCm)
                        const ft = Number(e.target.value) || 0
                        setDraft({ ...draft, heightCm: Math.round((ft * 12 + inch) * 2.54) })
                      }} style={fieldStyle} onFocus={e => { e.target.style.borderColor = '#AACB73' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Height (in)</div>
                      <input type="number" min={0} max={11} value={cmToFtIn(draft.heightCm).inch} onChange={e => {
                        const { ft } = cmToFtIn(draft.heightCm)
                        const inch = Number(e.target.value) || 0
                        setDraft({ ...draft, heightCm: Math.round((ft * 12 + inch) * 2.54) })
                      }} style={fieldStyle} onFocus={e => { e.target.style.borderColor = '#AACB73' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Height (cm)</div>
                    <input type="number" min={0} value={draft.heightCm} onChange={e => setDraft({ ...draft, heightCm: Number(e.target.value) })} style={fieldStyle} onFocus={e => { e.target.style.borderColor = '#AACB73' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={recalcGoals} style={{ flex: 1, padding: '11px', background: '#F0FDF8', color: '#059669', border: '1.5px solid #A7F3D0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Recalculate Goals
                </button>
                <button onClick={saveProfile} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #AACB73, #10B981)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const isImperial = profile.units === 'imperial'
              const heightVal = isImperial
                ? (() => { const { ft, inch } = cmToFtIn(profile.heightCm); return `${ft}ft ${inch}in` })()
                : `${profile.heightCm} cm`
              const weightVal = isImperial ? `${kgToLbs(profile.weightKg)} lbs` : `${profile.weightKg} kg`
              return [
                { label: 'Name', value: profile.name },
                { label: 'Age', value: `${profile.age} years` },
                { label: 'Gender', value: profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) },
                { label: 'Height', value: heightVal },
                { label: 'Weight', value: weightVal },
                { label: 'Activity Level', value: profile.activityLevel.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) },
              ].map((row, i) => (
                <div key={row.label} style={{ padding: '13px 18px', borderBottom: i < 5 ? '1px solid #F8FAFC' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{row.value}</span>
                </div>
              ))
            })()
          )}
        </div>

        {/* Nutrition Goals */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Nutrition Goals</div>
            <button onClick={() => setEditing(editing === 'goals' ? null : 'goals')} style={{ fontSize: 12, fontWeight: 700, color: '#AACB73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {editing === 'goals' ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing === 'goals' ? (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(
                [
                  { key: 'calories', label: 'Calories (kcal)', color: '#AACB73' },
                  { key: 'protein', label: 'Protein (g)', color: '#F26BB0 ' },
                  { key: 'carbs', label: 'Carbohydrates (g)', color: '#8EECF4' },
                  { key: 'fat', label: 'Fat (g)', color: '#F1FF84' },
                  { key: 'fiber', label: 'Fiber (g)', color: '#16A34A' },
                  { key: 'water', label: 'Water (L)', color: '#0EA5E9' },
                ] as { key: keyof NutritionGoals; label: string; color: string }[]
              ).map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: f.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.label}</div>
                  <input type="number" min={0} value={goalDraft[f.key]} onChange={e => setGoalDraft({ ...goalDraft, [f.key]: Number(e.target.value) })} style={fieldStyle} onFocus={e => { e.target.style.borderColor = f.color }} onBlur={e => { e.target.style.borderColor = '#E2E8F0' }} />
                </div>
              ))}
              <button onClick={saveGoals} style={{ padding: '13px', background: 'linear-gradient(135deg, #AACB73, #10B981)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Save Goals
              </button>
            </div>
          ) : (
            [
              { label: 'Daily Calories', value: `${goals.calories.toLocaleString()} kcal`, color: '#AACB73' },
              { label: 'Protein', value: `${goals.protein} g`, color: '#F26BB0  ' },
              { label: 'Carbohydrates', value: `${goals.carbs} g`, color: '#8EECF4' },
              { label: 'Fat', value: `${goals.fat} g`, color: '#F1FF84' },
              { label: 'Fiber', value: `${goals.fiber} g`, color: '#16A34A' },
              { label: 'Water', value: `${goals.water} L`, color: '#0EA5E9' },
            ].map((row, i) => (
              <div key={row.label} style={{ padding: '13px 18px', borderBottom: i < 4 ? '1px solid #F8FAFC' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: row.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{row.value}</span>
              </div>
            ))
          )}
        </div>

        {/* Weight Tracking */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Weight Tracking</div>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.current !== null ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {displayWeight(stats.current)}
                  </span>
                  {stats.count > 1 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: stats.change <= 0 ? '#059669' : '#F97316', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {stats.change > 0 ? '+' : ''}{profile.units === 'imperial' ? `${Math.round(stats.change * 2.20462)} lbs` : `${stats.change} kg`} total
                      {stats.weeks >= 1 ? ` · ${stats.perWeek > 0 ? '+' : ''}${profile.units === 'imperial' ? `${Math.round(stats.perWeek * 2.20462)} lbs` : `${stats.perWeek} kg`}/week` : ''}
                    </span>
                  )}
                </div>
                {chartLogs.length > 1 && (
                  <div>
                    <svg viewBox="0 0 300 90" style={{ width: '100%', height: 90, background: '#F8FAFC', borderRadius: 12 }} role="img" aria-label="Weight trend chart">
                      <polyline points={weightPoints()} fill="none" stroke="#AACB73" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                      {chartLogs.map((l, i) => {
                        const pts = weightPoints().split(' ')
                        const [x, y] = (pts[i] ?? '0,0').split(',')
                        return <circle key={l.id} cx={x} cy={y} r={3} fill="#365314" />
                      })}
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                      <span>{new Date(chartLogs[0].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{new Date(chartLogs[chartLogs.length - 1].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                No weigh-ins yet. Log your weight below to start tracking your progress over time.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min={0}
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                placeholder={profile.units === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)'}
                aria-label="Log weight"
                style={fieldStyle}
                onFocus={e => { e.target.style.borderColor = '#AACB73' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
              />
              <button onClick={handleLogWeight} style={{ padding: '11px 20px', background: 'linear-gradient(135deg, #AACB73, #10B981)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0 }}>
                Log
              </button>
            </div>
            {weightMsg && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, fontSize: 12, color: '#B91C1C' }}>
                {weightMsg}
              </div>
            )}
            {recentLogs.length > 0 && (
              <div>
                {recentLogs.map(l => (
                  <div key={l.id} style={{ padding: '9px 0', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                      {new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{displayWeight(l.weightKg)}</span>
                      <button onClick={() => onDeleteWeightLog(l.id)} aria-label={`Delete weigh-in ${displayWeight(l.weightKg)}`} style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: 14, cursor: 'pointer', padding: 4 }}>✕</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
              Logging updates your profile weight, keeping BMI and goals in sync.
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Preferences</div>
          </div>
          {[
            {
              label: 'Notifications', sub: 'Daily reminders to log meals',
              control: <button onClick={() => setNotifications(!notifications)} style={{ width: 44, height: 24, borderRadius: 99, background: notifications ? '#AACB73' : '#E2E8F0', border: 'none', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifications ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              </button>
            },
            {
              label: 'Units', sub: profile.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)',
              control: <button onClick={() => onUpdateProfile({ ...profile, units: profile.units === 'metric' ? 'imperial' : 'metric' })} style={{ padding: '5px 12px', background: '#FFFFFF', color: '#AACB73', border: '1.5px solid #AACB73', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Switch
              </button>
            },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '14px 18px', borderBottom: i === 0 ? '1px solid #F8FAFC' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div>
              </div>
              {item.control}
            </div>
          ))}
        </div>

        {/* Data backup */}
        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your Data</div>
          </div>
          <div style={{ padding: '14px 18px', fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
            {entries.length} meals logged · {water.toFixed(1)}L water today · {weightLogs.length} weigh-in{weightLogs.length === 1 ? '' : 's'}.{' '}
            {account.user
              ? `Synced across your devices as ${account.user.email ?? 'your Google account'}.`
              : 'Data lives only on this device — export a backup to keep it safe.'}
          </div>
          <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8 }}>
            <button onClick={exportBackup} style={{ flex: 1, padding: '11px', background: '#F0FDF8', color: '#059669', border: '1.5px solid #A7F3D0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Export Backup
            </button>
            <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '11px', background: '#fff', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Import Backup
            </button>
            <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = '' }} />
          </div>
          {importMsg && (
            <div style={{ margin: '0 18px 16px', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 12, color: '#475569' }}>
              {importMsg}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => { if (window.confirm('Reset onboarding? Your data will remain.')) onResetOnboarding() }}
          style={{ padding: '14px', background: '#fff', color: '#EF4444', border: '1.5px solid #FEE2E2', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Redo Onboarding
        </button>

        <p style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic' }}>
          NutriScan is not a medical device. Nutrition estimates are for general informational purposes only. Consult a qualified healthcare professional for medical advice.
        </p>
      </div>
    </div>
  )
}
