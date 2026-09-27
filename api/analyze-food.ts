import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_IMAGE_CHARS = 6_000_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const fallbackHits = new Map<string, number[]>();

function hasUpstash(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!hasUpstash()) return null;
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, "60 s"),
      analytics: false,
      prefix: "nutriscan",
    });
  }
  return limiter;
}

/**
 * Global (Upstash) rate limit when UPSTASH_REDIS_REST_URL/_TOKEN are set,
 * otherwise per-instance in-memory fallback.
 */
async function isRateLimited(ip: string): Promise<boolean> {
  const rl = getLimiter();
  if (rl) {
    try {
      const { success } = await rl.limit(ip);
      return !success;
    } catch (err) {
      console.error("Upstash rate limit failed, using in-memory fallback:", err);
    }
  }
  const now = Date.now();
  const hits = (fallbackHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  fallbackHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function getIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

const SYSTEM_PROMPT = `You are a nutrition analysis AI. Analyze the food in this image and return a JSON object with a single key "foods": an array of 1 to 4 items (one per distinct dish or food item visible; use exactly 1 item for a single dish). Each item has these exact fields:
- food_name: string (name of the food)
- serving_size_g: number (estimated serving size in grams)
- calories: number (estimated calories)
- protein_g: number (protein in grams)
- carbs_g: number (carbohydrates in grams)
- fat_g: number (fat in grams)
- fiber_g: number (fiber in grams)
- sugar_g: number (sugar in grams)
- sodium_mg: number (sodium in milligrams)
- confidence: number (0-1, how confident you are in the identification)

Be realistic with estimates. Return ONLY the JSON object, no markdown, no explanation.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (await isRateLimited(getIp(req))) {
    return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const { image } = req.body ?? {};
  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "Missing image field (base64 string)" });
  }

  if (image.length > MAX_IMAGE_CHARS) {
    return res.status(413).json({ error: "Image too large. Please use a smaller photo." });
  }

  // Strip data URL prefix if present, detect mime
  const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch?.[1] ?? "image/jpeg";
  if (!mimeType.startsWith("image/")) {
    return res.status(400).json({ error: "Invalid image format" });
  }
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", response.status);
      void err;
      return res.status(502).json({ error: "Vision API request failed" });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: "No response from vision API" });
    }

    // Parse JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "Invalid response format from vision API" });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Accept the documented { foods: [...] } shape, or a bare single item.
    const rawFoods: unknown[] = Array.isArray((parsed as { foods?: unknown }).foods)
      ? (parsed as { foods: unknown[] }).foods
      : [parsed];

    if (rawFoods.length === 0) {
      return res.status(502).json({ error: "No food detected in image" });
    }
    if (rawFoods.length > 6) {
      return res.status(502).json({ error: "Too many items detected" });
    }

    // Validate shape + numeric sanity per item
    const numericFields = [
      "serving_size_g",
      "calories",
      "protein_g",
      "carbs_g",
      "fat_g",
      "fiber_g",
      "sugar_g",
      "sodium_mg",
      "confidence",
    ];
    const foods = [];
    for (const raw of rawFoods) {
      if (typeof raw !== "object" || raw === null) {
        return res.status(502).json({ error: "Invalid item in vision API response" });
      }
      const nutrition = { ...(raw as Record<string, unknown>) };
      if (typeof nutrition.food_name !== "string" || !nutrition.food_name.trim()) {
        return res.status(502).json({ error: "Missing field: food_name" });
      }
      for (const field of numericFields) {
        const v = Number(nutrition[field]);
        if (!Number.isFinite(v) || v < 0) {
          return res.status(502).json({ error: `Invalid field: ${field}` });
        }
        nutrition[field] = v;
      }
      nutrition.confidence = Math.min(1, Math.max(0, nutrition.confidence as number));
      foods.push(nutrition);
    }

    return res.status(200).json({ foods });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return res.status(504).json({ error: "Vision API timed out. Please try again." });
    }
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Failed to analyze image" });
  } finally {
    clearTimeout(timeout);
  }
}
