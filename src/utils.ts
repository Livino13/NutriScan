import type { UserProfile, NutritionGoals } from './types';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function getBMICategory(bmi: number): { label: string; color: string; bgColor: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6', bgColor: '#EFF6FF' };
  if (bmi < 25) return { label: 'Normal weight', color: '#059669', bgColor: '#D1FAE5' };
  if (bmi < 30) return { label: 'Overweight', color: '#F59E0B', bgColor: '#FEF3C7' };
  return { label: 'Obesity', color: '#EF4444', bgColor: '#FEE2E2' };
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(profile: Partial<UserProfile>): number {
  const { age = 25, gender = 'female', heightCm = 165, weightKg = 65, activityLevel = 'moderate' } = profile;
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function calculateGoals(profile: UserProfile): NutritionGoals {
  const tdee = calculateTDEE(profile);
  let calories = tdee;
  if (profile.goal === 'lose') calories = Math.max(tdee - 500, 1200);
  else if (profile.goal === 'gain') calories = tdee + 300;

  const protein = Math.round(profile.weightKg * 1.8);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs: Math.max(carbs, 50), fat, fiber: 25, water: 2.5 };
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export function pct(value: number, goal: number) {
  return clamp(Math.round((value / goal) * 100), 0, 100);
}

export function getHour(): number {
  return new Date().getHours();
}

export function getGreeting(name: string): string {
  const h = getHour();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
