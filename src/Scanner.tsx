import { useState, useRef, useEffect } from 'react'
import type { FoodEntry, ScannedFood, FoodScanResponse } from './types'
import { generateId } from './utils'
type ScanState = 'idle' | 'loading' | 'result' | 'error'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface ScanItem {
  food: ScannedFood
  name: string
  added: boolean
}

const loadingMessages = [
  'Analyzing your meal...',
  'Identifying ingredients...',
  'Estimating portion size...',
  'Calculating nutrition...',
  'Almost there...',
]

const MAX_IMAGE_DIM = 1024
const MAX_BASE64_CHARS = 5_000_000

const RETRYABLE_STATUS = new Set([429, 502, 503, 504])
const RETRY_DELAYS_MS = [0, 2000, 6000]

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const t = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/** POST with retries on transient failures (rate limits, overloaded model). */
async function postScan(base64: string, signal: AbortSignal): Promise<FoodScanResponse> {
  let lastError = 'Scan failed'
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await abortableDelay(RETRY_DELAYS_MS[attempt], signal)
    let res: Response
    try {
      res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
        signal,
      })
    } catch (err) {
      if (signal.aborted) throw err
      lastError = 'Network error. Please check your connection.'
      continue
    }
    if (res.ok) return (await res.json()) as FoodScanResponse
    const err = await res.json().catch(() => ({ error: 'Scan failed' }))
    lastError = err.error || 'Scan failed'
    if (!RETRYABLE_STATUS.has(res.status)) break
  }
  throw new Error(lastError)
}

function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        URL.revokeObjectURL(objUrl)
        const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Image processing not supported'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Image processing failed'))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objUrl)
      reject(new Error('Could not read image file'))
    }
    img.src = objUrl
  })
}

function CornerFrame() {
  const base: React.CSSProperties = { position: 'absolute', width: 34, height: 34, borderColor: '#fff', borderStyle: 'solid', borderWidth: 0 }
  return (
    <>
      <div style={{ ...base, top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 }} />
      <div style={{ ...base, top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 }} />
      <div style={{ ...base, bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 }} />
      <div style={{ ...base, bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 }} />
    </>
  )
}

export default function Scanner({ onAddEntry, onBack, onViewDiary }: {  onAddEntry: (e: FoodEntry) => void
  onBack: () => void
  onViewDiary?: () => void
}) {
  const [state, setState] = useState<ScanState>('idle')
  const [items, setItems] = useState<ScanItem[]>([])
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [meal, setMeal] = useState<MealType>('lunch')
  const [error, setError] = useState<string | null>(null)
  const [camStatus, setCamStatus] = useState<'starting' | 'live' | 'denied' | 'unsupported'>('starting')
  const [camError, setCamError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const camAttempt = useRef(0)
  const msgInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const previewRef = useRef<string | null>(null)

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  async function startCamera() {
    const attempt = ++camAttempt.current
    stopCamera()
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamStatus('unsupported')
      return
    }
    setCamStatus('starting')
    setCamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      if (attempt !== camAttempt.current) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      streamRef.current = stream
      setCamStatus('live')
      // Attach on next paint so the <video> element exists
      requestAnimationFrame(() => {
        if (attempt === camAttempt.current && videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch (err) {
      if (attempt !== camAttempt.current) return
      stopCamera()
      setCamStatus('denied')
      setCamError(
        err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError')
          ? 'No camera found on this device.'
          : 'Camera access was blocked. Allow camera access or upload a photo instead.',
      )
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('Camera is not ready yet. Please try again.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) {
        setError('Could not capture photo. Please try again.')
        setState('error')
        return
      }
      stopCamera()
      startScan(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  function setPreview(url: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = url
    setPreviewUrl(url)
  }

  useEffect(() => {
    if (state === 'idle') void startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // Re-attach the stream whenever the full-screen video element (re)mounts
  useEffect(() => {
    if (camStatus === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [camStatus, state])

  const isInsecureContext = typeof window !== 'undefined' && window.isSecureContext === false
  const addedCount = items.filter(i => i.added).length
  const bestConfidence = items.length > 0 ? Math.max(...items.map(i => i.food.confidence || 0)) : 0

  useEffect(() => {
    return () => {
      if (msgInterval.current) clearInterval(msgInterval.current)
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
      abortRef.current?.abort()
      stopCamera()
    }
  }, [])

  async function startScan(file: File) {
    stopCamera()
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      setState('error')
      return
    }    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 60000)

    const url = URL.createObjectURL(file)
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = url
    setPreviewUrl(url)
    setState('loading')
    setItems([])
    setError(null)

    let i = 0
    setLoadingMsg(0)
    if (msgInterval.current) clearInterval(msgInterval.current)
    msgInterval.current = setInterval(() => {
      i = (i + 1) % loadingMessages.length
      setLoadingMsg(i)
    }, 900)

    try {
      // Downscale/compress to stay under serverless body limits
      const base64 = await downscaleImage(file)
      if (base64.length > MAX_BASE64_CHARS) {
        throw new Error('Image is too large. Please use a smaller photo.')
      }

      const scan: FoodScanResponse = await postScan(base64, controller.signal)
      if (!scan.foods || scan.foods.length === 0) {
        throw new Error('No food detected. Try a clearer photo.')
      }
      setItems(scan.foods.map(f => ({ food: f, name: f.food_name, added: false })))
      setState('result')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Scan timed out. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setState('error')
    } finally {
      clearTimeout(timeout)
      if (msgInterval.current) clearInterval(msgInterval.current)
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) startScan(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) startScan(f)
  }

  function renameItem(index: number, name: string) {
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, name } : it)))
  }

  function handleAddItem(index: number) {
    const item = items[index]
    if (!item || item.added) return
    const f = item.food
    const entry: FoodEntry = {
      id: generateId(),
      name: item.name.trim() || f.food_name,
      meal,
      calories: Math.max(0, Math.round(f.calories)),
      protein: Math.max(0, Math.round(f.protein_g)),
      carbs: Math.max(0, Math.round(f.carbs_g)),
      fat: Math.max(0, Math.round(f.fat_g)),
      fiber: Math.max(0, Math.round(f.fiber_g)),
      servingSize: Math.max(1, Math.round(f.serving_size_g) || 100),
      servingUnit: 'g',
      timestamp: new Date().toISOString(),
    }
    onAddEntry(entry)
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, added: true } : it)))
  }

  function reset() {
    abortRef.current?.abort()
    setPreview(null)
    setState('idle')
    setItems([])
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Full-screen live viewfinder (covers the bottom nav while active)
  if (state === 'idle' && camStatus === 'live') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#000' }} className="animate-fade-in">
        <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: '100%', margin: '0 auto', overflow: 'hidden' }}>
          <video ref={videoRef} muted playsInline autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', pointerEvents: 'none' }} />

          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'max(20px, env(safe-area-inset-top)) 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={onBack} aria-label="Back" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            <div style={{ padding: '7px 13px', borderRadius: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
              AI
            </div>
          </div>

          {/* Scan frame */}
          <div style={{ position: 'absolute', top: '20%', left: '11%', right: '11%', aspectRatio: '1/1', pointerEvents: 'none' }}>
            <CornerFrame />
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '0 1px 8px rgba(0,0,0,0.6)', pointerEvents: 'none', padding: '0 32px' }}>
            Point at your meal and tap to scan
          </div>

          {/* Controls */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 'max(32px, env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Upload photo instead"
              style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.7)', color: '#fff', fontSize: 21, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
            >
              🖼️
            </button>
            <button
              onClick={capturePhoto}
              aria-label="Capture photo"
              style={{ width: 78, height: 78, borderRadius: '50%', background: 'transparent', border: '4px solid #fff', cursor: 'pointer', padding: 5, boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#AACB73' }} />
            </button>
            <div style={{ width: 50 }} />
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0FDF8' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>NutriScan</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#94A3B8' }}>Photo-based nutrition analysis</p>
        </div>
      </div>

      <div style={{ padding: '0 16px 100px' }}>
        {state === 'idle' && (
          <div className="animate-slide-up">
            {/* Fallback: uploading (camera starting / blocked / unavailable) */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #AACB73', borderRadius: 24, padding: '40px 24px', textAlign: 'center', background: '#fff', cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: 16 }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>📷</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Scan Your Food</h2>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
                {camStatus === 'starting'
                  ? 'Starting camera…'
                  : camError || 'Snap a photo of your meal and discover its nutrition.'}
              </p>
              {isInsecureContext && camStatus !== 'starting' && (
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>
                  Camera needs HTTPS or localhost — please use upload on this connection.
                </p>
              )}
              {camStatus === 'denied' && (
                <button
                  onClick={e => { e.stopPropagation(); void startCamera() }}
                  style={{ margin: '8px 0 12px', padding: '12px 22px', background: '#AACB73', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(170,203,115,0.3)' }}
                >
                  📷 Enable Camera
                </button>
              )}
              <div>
                <span style={{ display: 'inline-block', padding: '12px 22px', background: '#fff', color: '#AACB73', border: '1.5px solid #AACB73', borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  🖼️ Upload Image
                </span>
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

            <div style={{ background: '#F5EBDA', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#854D0E', lineHeight: 1.6 }}>
              ⚠️ Nutrition values are estimates and may vary depending on ingredients, preparation method, and portion size.
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', paddingTop: 40 }}>
            {previewUrl && (
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 32, aspectRatio: '4/3' }}>
                <img src={previewUrl} alt="Scanning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)',borderTopColor: '#AACB73', animation: 'spin-slow 1s linear infinite', marginBottom: 20 }} className="animate-spin-slow" />
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{loadingMessages[loadingMsg]}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%',background: '#AACB73' }} className={`animate-pulse-dot-${i + 1}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <p style={{ color: '#94A3B8', fontSize: 13 }}>Analyzing your meal..</p>
          </div>
        )}

        {state === 'error' && (
          <div className="animate-slide-up" style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>😅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Couldn't Analyze</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>{error || 'Something went wrong.'}</p>
            <button onClick={reset} style={{ padding: '14px 28px', background: '#AACB73', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Try Again
            </button>
          </div>
        )}

        {state === 'result' && items.length > 0 && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Preview */}
            {previewUrl && (
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '16/9' }}>
                <img src={previewUrl} alt="Scanned food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '8px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center', lineHeight: 1.3, backdropFilter: 'blur(6px)' }}>
                  {items.length} item{items.length > 1 ? 's' : ''}<br />
                  <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>{Math.round(bestConfidence * 100)}% accuracy</span>
                </div>
              </div>
            )}

            {/* Detected items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ background: '#fff', borderRadius: 18, padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <input
                    value={item.name}
                    onChange={e => renameItem(idx, e.target.value)}
                    aria-label={`Food ${idx + 1} name`}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#0F172A', background: '#F8FAFC', outline: 'none', marginBottom: 8 }}
                    onFocus={e => { e.target.style.borderColor = '#AACB73'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC' }}
                  />
                  <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 4, lineHeight: 1.5 }}>
                    {Math.round(item.food.serving_size_g)}g · {Math.round(item.food.calories)} kcal · P {Math.round(item.food.protein_g)}g · C {Math.round(item.food.carbs_g)}g · F {Math.round(item.food.fat_g)}g
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 10, lineHeight: 1.5 }}>
                    Fiber {Math.round(item.food.fiber_g)}g · Sugar {Math.round(item.food.sugar_g)}g · Sodium {Math.round(item.food.sodium_mg)}mg
                  </div>
                  {item.added ? (
                    <div style={{ padding: '10px', background: '#F0F7DF', border: '1.5px solid #AACB73', borderRadius: 12, textAlign: 'center', color: '#365314', fontSize: 13, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      ✓ Added
                    </div>
                  ) : (
                    <button onClick={() => handleAddItem(idx)} style={{ width: '100%', padding: '11px', background: '#AACB73', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      + Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Meal selector */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10 }}>Add to Meal</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                  <button key={m} onClick={() => setMeal(m)} style={{ padding: '8px 16px',border: `1.5px solid ${meal === m ? '#AACB73' : '#E2E8F0'}`, borderRadius: 99, background: meal === m ? '#F0F7DF' : '#fff', fontSize: 13, fontWeight: 600, color: meal === m ? '#AACB73' : '#64748B', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#F5EBDA', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#854D0E', lineHeight: 1.5 }}>
              ⚠️ Nutrition information is an estimate. Actual values can vary based on ingredients, cooking methods, brands, and portion sizes.
            </div>

            {addedCount > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="animate-fade-in" style={{ padding: '16px',  background: '#F0F7DF',border: '1.5px solid #AACB73', borderRadius: 16, textAlign: 'center', color: '#365314', fontSize: 15, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  ✓ Added {addedCount} item{addedCount > 1 ? 's' : ''} to your {meal} diary!
                </div>
                {onViewDiary && (
                  <button onClick={onViewDiary} style={{ padding: '16px', background: '#365314', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    View Diary →
                  </button>
                )}
              </div>
            )}

            <button onClick={reset} style={{ padding: '14px', background: '#fff', color: '#64748B', fontSize: 15, fontWeight: 600, border: '1.5px solid #E2E8F0', borderRadius: 16, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              🔄 Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
