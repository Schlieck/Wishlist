// UI sounds synthesized with Web Audio (no audio files) + album preview player.
const KEY = 'wishlist.muted'
const VOL = 0.5

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null

let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
})()
const listeners = new Set<(m: boolean) => void>()

/** Must be called from a user gesture (autoplay policy). */
export function unlock() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : VOL
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  void ctx.resume()
}

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(KEY, m ? '1' : '0')
  } catch {
    /* storage blocked: keep in memory */
  }
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : VOL, ctx.currentTime, 0.03)
  listeners.forEach((f) => f(m))
}
export function onMuteChange(f: (m: boolean) => void) {
  listeners.add(f)
  return () => void listeners.delete(f)
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.06, to?: number, delay = 0) {
  if (!ctx || !master) return
  const t = ctx.currentTime + delay
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur: number, vol: number, filter: BiquadFilterType, f0: number, f1?: number, q = 1) {
  if (!ctx || !master || !noiseBuf) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const bq = ctx.createBiquadFilter()
  bq.type = filter
  bq.Q.value = q
  bq.frequency.setValueAtTime(f0, t)
  if (f1) bq.frequency.exponentialRampToValueAtTime(f1, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bq).connect(g).connect(master)
  src.start(t, Math.random())
  src.stop(t + dur + 0.05)
}

export const sfx = {
  beep: () => tone(1320, 0.045, 'square', 0.035),
  tick: () => tone(2400 + Math.random() * 600, 0.015, 'square', 0.015),
  click: () => tone(520, 0.09, 'square', 0.05, 1400),
  whoosh: () => noise(0.55, 0.22, 'bandpass', 250, 3200, 1.4),
  static: () => noise(0.28, 0.1, 'highpass', 3000),
  back: () => noise(0.45, 0.18, 'bandpass', 3000, 220, 1.4),
  cute: () => {
    tone(880, 0.09, 'sine', 0.09, 1320)
    tone(1320, 0.12, 'sine', 0.08, 1760, 0.1)
    tone(1760, 0.14, 'triangle', 0.05, 2200, 0.2)
  },
  boot: () => {
    tone(110, 0.6, 'sawtooth', 0.05, 440)
    tone(660, 0.08, 'square', 0.04, undefined, 0.45)
    tone(990, 0.12, 'square', 0.04, undefined, 0.55)
    noise(0.5, 0.08, 'highpass', 2000)
  },
}

// ---- album previews --------------------------------------------------------
let current: { el: HTMLAudioElement; gain: GainNode; analyser: AnalyserNode } | null = null

export function playPreview(url: string): AnalyserNode | null {
  stopPreview()
  if (!ctx || !master) return null
  const el = new Audio()
  el.crossOrigin = 'anonymous' // Apple's preview CDN sends CORS headers, so the analyser gets real data
  el.src = url
  const src = ctx.createMediaElementSource(el)
  const gain = ctx.createGain()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 64
  gain.gain.value = 0
  src.connect(gain).connect(analyser).connect(master)
  gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6)
  el.play().catch(() => {})
  current = { el, gain, analyser }
  return analyser
}

export function stopPreview() {
  if (!current || !ctx) return
  const { el, gain } = current
  current = null
  gain.gain.cancelScheduledValues(ctx.currentTime)
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35)
  setTimeout(() => {
    el.pause()
    el.removeAttribute('src')
    gain.disconnect()
  }, 400)
}
