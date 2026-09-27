import { useState, useEffect, Suspense, lazy } from 'react'
import BottomNav from './BottomNav'
import type { UserProfile, NutritionGoals, FoodEntry, ActivePage } from './types'
import { load, save, loadWater, todayKey, trimEntries, buildBackup, isValidBackup, storageKeys } from './storage'

const Onboarding = lazy(() => import('./Onboarding'))
const Dashboard = lazy(() => import('./Dashboard'))
const Scanner = lazy(() => import('./Scanner'))
const Diary = lazy(() => import('./Diary'))
const Insights = lazy(() => import('./Insights'))
const Profile = lazy(() => import('./Profile'))

const DEMO_PROFILE: UserProfile = {
  name: 'Alex',
  age: 28,
  gender: 'female',
  heightCm: 165,
  weightKg: 62,
  activityLevel: 'moderate',
  goal: 'maintain',
  units: 'metric',
}

const DEMO_GOALS: NutritionGoals = {
  calories: 1950,
  protein: 120,
  carbs: 240,
  fat: 65,
  fiber: 25,
  water: 2.5,
}

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#AACB73', animation: 'spin-slow 1s linear infinite' }} />
    </div>
  )
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try {
      return localStorage.getItem(storageKeys.done) === 'true'
    } catch {
      return false
    }
  })
  const [profile, setProfile] = useState<UserProfile>(() => load(storageKeys.profile, DEMO_PROFILE))
  const [goals, setGoals] = useState<NutritionGoals>(() => ({ ...DEMO_GOALS, ...load(storageKeys.goals, DEMO_GOALS) }))
  const [entries, setEntries] = useState<FoodEntry[]>(() => load(storageKeys.entries, []))
  const [water, setWater] = useState(() => loadWater(0))
  const [activePage, setActivePage] = useState<ActivePage>('home')

  useEffect(() => { trimEntries(90) }, [])
  useEffect(() => { save(storageKeys.profile, profile) }, [profile])
  useEffect(() => { save(storageKeys.goals, goals) }, [goals])
  useEffect(() => { save(storageKeys.entries, entries) }, [entries])
  useEffect(() => {
    save(storageKeys.water, water)
    try {
      localStorage.setItem(storageKeys.waterDate, todayKey())
    } catch {
      // storage unavailable — app still works in memory
    }
  }, [water])

  function completeOnboarding(p: UserProfile, g: NutritionGoals) {
    setProfile(p)
    setGoals(g)
    setOnboardingDone(true)
    try {
      localStorage.setItem(storageKeys.done, 'true')
    } catch {
      // ignore
    }
  }

  function addEntry(entry: FoodEntry) {
    setEntries(prev => [...prev, entry])
  }

  function deleteEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function addWater(amount: number) {
    setWater(prev => Math.min(+(prev + amount).toFixed(2), goals.water + 1))
  }

  function importBackup(data: unknown): boolean {
    if (!isValidBackup(data)) return false
    setProfile(data.profile)
    setGoals(data.goals)
    setEntries(Array.isArray(data.entries) ? data.entries : [])
    setWater(typeof data.water === 'number' ? data.water : 0)
    return true
  }

  if (!onboardingDone) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Onboarding onComplete={completeOnboarding} />
      </Suspense>
    )
  }

  return (
    <div style={{ background: '#F0FDF8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', position: 'relative', background: '#F0FDF8' }}>
        <div style={{ paddingBottom: 80 }}>
          <Suspense fallback={<PageFallback />}>
            {activePage === 'home' && (
              <Dashboard
                profile={profile}
                goals={goals}
                entries={entries}
                water={water}
                onAddWater={addWater}
                onNavigate={setActivePage}
              />
            )}
            {activePage === 'scan' && (
              <Scanner onAddEntry={addEntry} onBack={() => setActivePage('home')} onViewDiary={() => setActivePage('diary')} />
            )}
            {activePage === 'diary' && (
              <Diary
                entries={entries}
                onDeleteEntry={deleteEntry}
                onAddEntry={addEntry}
                onNavigateScan={() => setActivePage('scan')}
              />
            )}
            {activePage === 'insights' && (
              <Insights entries={entries} goals={goals} />
            )}
            {activePage === 'profile' && (
              <Profile
                profile={profile}
                goals={goals}
                entries={entries}
                water={water}
                onUpdateProfile={setProfile}
                onUpdateGoals={setGoals}
                onImportData={importBackup}
                onExportData={() => buildBackup({ profile, goals, entries, water })}
                onResetOnboarding={() => {
                  try {
                    localStorage.removeItem(storageKeys.done)
                  } catch {
                    // ignore
                  }
                  setOnboardingDone(false)
                }}
              />
            )}
          </Suspense>
        </div>
        <BottomNav activePage={activePage} onNavigate={setActivePage} />
      </div>
    </div>
  )
}
