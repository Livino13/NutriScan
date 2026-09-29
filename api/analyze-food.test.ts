import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './analyze-food'

let ipCounter = 0
function uniqueIp(): string {
  ipCounter += 1
  return `10.255.${Math.floor(ipCounter / 256)}.${ipCounter % 256}`
}

function makeReq(opts: { method?: string; ip?: string; body?: unknown }): VercelRequest {
  return {
    method: opts.method ?? 'POST',
    headers: { 'x-forwarded-for': opts.ip ?? uniqueIp() },
    body: opts.body,
  } as unknown as VercelRequest
}

function makeRes() {
  const state: { code: number; body: unknown } = { code: 200, body: null }
  const res = {
    status: (code: number) => ({
      json: (obj: unknown) => {
        state.code = code
        state.body = obj
        return res
      },
    }),
  } as unknown as VercelResponse
  return { res, state }
}

const ITEM = {
  food_name: 'Test Bowl',
  serving_size_g: 350,
  calories: 620,
  protein_g: 38,
  carbs_g: 72,
  fat_g: 18,
  fiber_g: 6,
  sugar_g: 5,
  sodium_mg: 720,
  confidence: 0.9,
}

function geminiOk(item: unknown = ITEM) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ foods: [item] }) }] } }],
    }),
  } as unknown as Response
}

const SAVED_ENV = { ...process.env }

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key'
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
})

afterEach(() => {
  process.env = { ...SAVED_ENV }
  vi.unstubAllGlobals()
})

describe('analyze-food handler', () => {
  it('rejects non-POST methods with 405', async () => {
    const { res, state } = makeRes()
    await handler(makeReq({ method: 'GET' }), res)
    expect(state.code).toBe(405)
  })

  it('returns 500 when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY
    const { res, state } = makeRes()
    await handler(makeReq({ body: { image: 'data:image/jpeg;base64,aaa' } }), res)
    expect(state.code).toBe(500)
  })

  it('returns 400 when the image field is missing', async () => {
    const { res, state } = makeRes()
    await handler(makeReq({ body: {} }), res)
    expect(state.code).toBe(400)
  })

  it('returns 413 when the image is too large', async () => {
    const { res, state } = makeRes()
    await handler(makeReq({ body: { image: 'x'.repeat(6_000_001) } }), res)
    expect(state.code).toBe(413)
  })

  it('returns validated foods on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => geminiOk()))
    const { res, state } = makeRes()
    await handler(makeReq({ body: { image: 'data:image/jpeg;base64,aaa' } }), res)
    expect(state.code).toBe(200)
    const foods = (state.body as { foods: typeof ITEM[] }).foods
    expect(foods).toHaveLength(1)
    expect(foods[0].food_name).toBe('Test Bowl')
    expect(foods[0].confidence).toBeLessThanOrEqual(1)
  })

  it('returns 502 when Gemini responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, text: async () => 'boom' } as unknown as Response)))
    const { res, state } = makeRes()
    await handler(makeReq({ body: { image: 'data:image/jpeg;base64,aaa' } }), res)
    expect(state.code).toBe(502)
  })

  it('returns 502 when the model output is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'not json at all' }] } }] }),
      } as unknown as Response)),
    )
    const { res, state } = makeRes()
    await handler(makeReq({ body: { image: 'data:image/jpeg;base64,aaa' } }), res)
    expect(state.code).toBe(502)
  })

  it('rate-limits to 20 requests per minute per IP', async () => {
    const fetchMock = vi.fn(async () => geminiOk())
    vi.stubGlobal('fetch', fetchMock)
    const ip = uniqueIp()
    let lastCode = 0
    for (let i = 0; i < 21; i++) {
      const { res, state } = makeRes()
      await handler(makeReq({ ip, body: { image: 'data:image/jpeg;base64,aaa' } }), res)
      lastCode = state.code
    }
    expect(lastCode).toBe(429)
    expect(fetchMock).toHaveBeenCalledTimes(20)
  })
})
