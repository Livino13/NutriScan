export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'maintain' | 'lose' | 'gain' | 'balance';
  units: 'metric' | 'imperial';
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  servingUnit: string;
  timestamp: string;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  timestamp: string;
}

export interface ScannedFood {
  food_name: string;
  serving_size_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  confidence: number;
}

export interface FoodScanResponse {
  foods: ScannedFood[];
}

export interface WeeklyData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type ActivePage = 'home' | 'scan' | 'diary' | 'insights' | 'profile';
