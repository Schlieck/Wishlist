export const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Exponential smoothing that is frame-rate independent. */
export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt))
