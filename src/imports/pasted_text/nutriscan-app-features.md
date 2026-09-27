Build a modern, aesthetically pleasing AI-powered food nutrition tracking app called NutriScan. The primary purpose of the app is to help users track calories, monitor macronutrients, and maintain a balanced diet by scanning or uploading photos of their food.
1. Onboarding & User Profile
Before the user can access the main app, create a short onboarding process.
Step 1 — Welcome Screen
Display:
App logo: NutriScan
Tagline: "Scan. Track. Balance."
Short description: "Understand your food, track your nutrition, and build healthier eating habits."
Button:
Get Started
Step 2 — User Information
Ask the user for:
Age
Gender
Height
Weight
Activity level
Allow the user to enter height in cm or ft/in and weight in kg or lbs.
Step 3 — BMI Calculation
Calculate the user's BMI automatically using:
BMI = weight (kg) / height² (m²)
Display:
BMI value
BMI category:
Underweight
Normal weight
Overweight
Obesity
Important: Clearly state that BMI is only a general screening metric and is not a medical diagnosis.
Also calculate an estimated daily calorie target based on the user's age, sex, weight, height, and activity level. Clearly label this as an estimate, not medical advice.
Step 4 — Nutrition Goal
Ask the user what their primary goal is:
Maintain weight
Lose weight
Gain weight
Eat a more balanced diet
Use the selected goal when calculating the user's suggested calorie and macro targets.
After onboarding, show a summary:
Your Daily Goals
Calories: XXXX kcal
Protein: XX g
Carbohydrates: XX g
Fat: XX g
Allow the user to edit these goals later from Settings.
2. Main Dashboard
Create a clean dashboard showing the user's nutrition progress for the current day.
At the top display:
Good evening, [User Name] 👋
Then show:
Today's Nutrition
A large circular progress indicator for:
Calories 1,240 / 2,000 kcal
Below it display three macro cards:
Protein 65 / 120 g
Carbs 145 / 250 g
Fat 42 / 65 g
Use progress bars/rings to visually represent how much of each daily target has been consumed.
Also display:
Remaining calories
Remaining protein
Remaining carbohydrates
Remaining fat
3. AI Food Scanner
The main feature should be a prominent button:
📷 Scan Food
When clicked, allow the user to:
Take a photo using their camera
Upload an image from their device
After the image is uploaded, use an AI vision model to identify the food.
The AI should attempt to determine:
Food name
Food category
Estimated serving size
Calories
Protein
Carbohydrates
Fat
Fiber
Sugar
Sodium
If multiple foods are visible, identify each food separately.
Example:
Chicken Rice Bowl
Estimated serving: 350 g
Calories: 620 kcal
Macros:
Protein: 38 g
Carbohydrates: 72 g
Fat: 18 g
Fiber: 6 g
Other nutrients:
Sugar: 5 g
Sodium: 720 mg
4. Confidence & Portion Editing
Because nutrition estimation from an image cannot always be exact, display:
AI Confidence: 82%
Add a disclaimer:
"Nutrition values are estimates and may vary depending on ingredients, preparation method, and portion size."
Allow users to manually edit:
Food name
Portion size
Calories
Protein
Carbohydrates
Fat
For example:
Serving Size [ 350 ] [ g ▼ ]
Changing the serving size should automatically update the estimated nutritional values.
Add buttons:
Add to Today's Log
and
Scan Again
5. Food Diary
Create a Diary page where users can see everything they have eaten during the day.
Organize food by:
Breakfast
Oats with peanut butter — 380 kcal
Banana — 105 kcal
Lunch
Chicken rice — 620 kcal
Snack
Apple — 95 kcal
Dinner
Not logged
Show the total at the bottom:
Total: 1,200 kcal
Macros:
Protein: 72 g
Carbs: 156 g
Fat: 38 g
Allow users to:
Edit food entries
Delete entries
Change serving size
Manually add food
Scan additional food
6. Balanced Diet Indicator
Create a visual feature called:
Balance Score
Calculate a simple nutrition balance score based on the user's logged intake compared with their daily calorie and macro targets.
Example:
Today's Balance 78 / 100
Display categories:
🟢 Calories — On Track 🟢 Protein — Good 🟡 Fiber — Slightly Low 🟢 Carbohydrates — On Track 🔴 Vegetables/Fruits — Low
Provide helpful suggestions such as:
"You are slightly low on protein today. Consider adding eggs, Greek yogurt, chicken, fish, tofu, beans, or another protein-rich food."
Do not present these suggestions as medical advice.
7. Nutrition Insights
Create an Insights page that analyzes the user's food history.
Show:
Weekly Calories
A line/bar chart showing calories consumed each day.
Macronutrients
A chart showing:
Protein
Carbohydrates
Fat
Weekly Average
Average calories
Average protein
Average carbohydrates
Average fat
Eating Patterns
Examples:
"Your protein intake has been consistent this week."
"You tend to consume more calories at dinner."
"Your fiber intake appears low on several days."
"You have been close to your calorie target on 5 of the last 7 days."
Keep insights descriptive and avoid diagnosing health conditions.
8. Food History
Create a searchable history of previously scanned foods.
Each food entry should show:
Food Name
Calories
Protein
Carbs
Fat
Date scanned
Allow users to search foods and quickly add frequently consumed foods to their diary.
Include a Favorites section for frequently eaten foods.
9. Manual Food Entry
Not every meal can be scanned, so provide:
+ Add Food Manually
Fields:
Food name
Serving size
Calories
Protein
Carbohydrates
Fat
Fiber
Allow the user to save custom foods.
10. Water Tracking
Add a simple hydration tracker.
Example:
Water 1.5 L / 2.5 L
Buttons:
+250 ml
+500 ml
Display a visual progress indicator.
11. Navigation
Use a bottom navigation bar on mobile.
Tabs:
Home Scan Diary Insights Profile
The Scan button should be visually emphasized because it is the primary feature.
12. Profile & Settings
Create a profile page containing:
Personal Information
Name
Age
Gender
Height
Weight
Activity level
Nutrition Goals
Daily calorie target
Protein target
Carb target
Fat target
Preferences
Units: Metric / Imperial
Notifications
Dark mode
Language
Allow users to update their information at any time.
If weight changes, provide an option to recalculate calorie and macro targets.
13. UI/UX Design
Make the application feel like a premium modern health-tech app, not a generic dashboard.
Design style:
Clean
Minimal
Modern
Friendly
Mobile-first
Rounded cards
Smooth animations
Clear typography
Plenty of whitespace
Attractive nutrition charts
Soft gradients
High-quality food imagery
Use a consistent visual hierarchy.
The primary action should always be easy to find:
📷 Scan Food
Create polished loading animations while AI analyzes a food image.
For example:
"Analyzing your meal..." "Identifying ingredients..." "Estimating portion size..." "Calculating nutrition..."
14. AI Food Recognition
Integrate a vision-capable AI model for food recognition.
The AI response should return structured JSON similar to:
{ "food_name": "Chicken Rice Bowl", "serving_size": "350 g", "calories": 620, "protein_g": 38, "carbohydrates_g": 72, "fat_g": 18, "fiber_g": 6, "sugar_g": 5, "sodium_mg": 720, "confidence": 0.82 }
If the AI cannot confidently identify the food, do not invent an exact result.
Instead show:
"We couldn't confidently identify this food."
Then allow the user to:
Retake the photo
Enter the food manually
Select from possible matches
15. Nutrition Database
Where possible, combine AI image recognition with a reliable nutrition database/API rather than relying entirely on AI-generated nutritional values.
The workflow should be:
Image → AI identifies food → Nutrition database lookup → Portion adjustment → Nutrition result
This should reduce inaccurate nutrition estimates.
16. Important Safety & Accuracy Features
Do NOT claim that image-based nutrition estimates are 100% accurate.
Always show:
"Nutrition information is an estimate. Actual values can vary based on ingredients, cooking methods, brands, and portion sizes."
Do not diagnose diseases or provide medical treatment.
If the user enters extreme calorie or nutrition goals, display an appropriate warning and encourage them to consult a qualified healthcare professional.
17. Data Storage
Store:
User profile
BMI
Daily calorie target
Macro targets
Food diary
Scanned foods
Manual food entries
Water intake
Daily/weekly nutrition history
Users should be able to edit or delete their data.
18. Technical Requirements
Build the app using a modern responsive architecture.
Preferred stack:
Frontend
React
TypeScript
Vite
Tailwind CSS
Backend
Node.js / appropriate backend service
Database
Supabase or Firebase
AI
Vision-capable LLM API for food recognition
Nutrition Data
Integrate a reliable food/nutrition API where available
The application should be responsive and work well on:
Mobile
Tablet
Desktop
Structure the project cleanly with reusable components.
Use environment variables for API keys. Never expose API keys in frontend code.
19. First-Time User Flow
The complete first-time experience should be:
Welcome ↓ Enter Personal Information ↓ Calculate BMI ↓ Select Activity Level ↓ Select Nutrition Goal ↓ Calculate Estimated Daily Targets ↓ Show Nutrition Goal Summary ↓ Home Dashboard ↓ Scan First Meal ↓ AI Food Recognition ↓ Review Nutrition ↓ Add to Diary ↓ Update Daily Progress
20. Main Objective
The final product should feel like a complete AI nutrition companion rather than simply an image-recognition application.
The core loop is:
SCAN → IDENTIFY → REVIEW → LOG → TRACK → ANALYZE → IMPROVE
The user should be able to understand at a glance:
How many calories they have consumed.
How many calories remain.
How much protein, carbs, and fat they have consumed.
Whether their overall diet is balanced.
What they should consider eating next to better meet their targets.
Build the application with realistic sample data initially so the UI can be fully demonstrated even before the AI and nutrition APIs are connected.