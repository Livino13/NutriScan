import { test, expect } from '@playwright/test';

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const MOCK_SCAN = {
  foods: [
    {
      food_name: 'Test Chicken Bowl',
      serving_size_g: 350,
      calories: 620,
      protein_g: 38,
      carbs_g: 72,
      fat_g: 18,
      fiber_g: 6,
      sugar_g: 5,
      sodium_mg: 720,
      confidence: 0.9,
    },
    {
      food_name: 'Test Side Salad',
      serving_size_g: 150,
      calories: 120,
      protein_g: 4,
      carbs_g: 10,
      fat_g: 8,
      fiber_g: 3,
      sugar_g: 4,
      sodium_mg: 200,
      confidence: 0.85,
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ns_done', 'true');
    localStorage.setItem(
      'ns_profile',
      JSON.stringify({
        name: 'E2E', age: 30, gender: 'female', heightCm: 165, weightKg: 62,
        activityLevel: 'moderate', goal: 'maintain', units: 'metric',
      }),
    );
    localStorage.setItem(
      'ns_goals',
      JSON.stringify({ calories: 1950, protein: 120, carbs: 240, fat: 65, fiber: 25, water: 2.5 }),
    );
    localStorage.setItem('ns_entries', '[]');
  });
});

test('home renders daily overview', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Daily Calories')).toBeVisible();
  await expect(page.getByRole('button', { name: /scan food/i })).toBeVisible();
});

test('manual diary add appears in diary', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Diary' }).click();
  await expect(page.getByText('Food Diary')).toBeVisible();
  // First "+ Add" button opens the manual entry sheet
  await page.getByRole('button', { name: '+ Add' }).first().click();
  await page.getByPlaceholder('Food name').fill('E2E Oats');
  await page.getByPlaceholder('0 kcal').fill('300');
  await page.getByRole('button', { name: /add to/i }).click();
  await expect(page.getByText('E2E Oats')).toBeVisible();
  await expect(page.getByText('300 kcal').first()).toBeVisible();
});

test('mocked scan logs multiple items to diary', async ({ page }) => {
  await page.route('**/api/analyze-food', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SCAN) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan', exact: true }).click();
  // Headless has no camera: upload fallback is shown
  await expect(page.getByText('Upload Image')).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'meal.png',
    mimeType: 'image/png',
    buffer: PIXEL,
  });
  await expect(page.getByRole('textbox', { name: 'Food 1 name' })).toHaveValue('Test Chicken Bowl');
  await expect(page.getByRole('textbox', { name: 'Food 2 name' })).toHaveValue('Test Side Salad');
  await page.getByRole('button', { name: '+ Add to Lunch' }).first().click();
  await expect(page.getByText('Added 1 item to your lunch diary!')).toBeVisible();
  await page.getByRole('button', { name: /view diary/i }).click();
  await expect(page.getByText('Test Chicken Bowl')).toBeVisible();
});

test('insights and profile render', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Insights' }).click();
  await expect(page.getByRole('heading', { name: 'Nutrition Insights' })).toBeVisible();
  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByText('Nutrition Goals')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export Backup' })).toBeVisible();
});
