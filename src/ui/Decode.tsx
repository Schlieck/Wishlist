import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/motion'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Cycles through `words`, each one "decoding" from random glyphs into the final text. */
export function Decode({ words, hold = 2600, className }: { words: string[]; hold?: number; className?: string }) {
  const [text, setText] = useState(words[0])
  const idx = useRef(0)

  useEffect(() => {
    let raf = 0
    let timer = 0
    const run = (target: string) => {
      if (reducedMotion) { setText(target); return }
      const start = performance.now()
      const dur = 900
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / dur)
        let s = ''
        for (let i = 0; i < target.length; i++) {
          const lock = i / target.length < p * 1.15 - 0.15
          s += lock || target[i] === ' ' ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        setText(s)
        if (p < 1) raf = requestAnimationFrame(step)
      }
      step()
    }
    run(words[0])
    timer = window.setInterval(() => {
      idx.current = (idx.current + 1) % words.length
      run(words[idx.current])
    }, hold)
    return () => { cancelAnimationFrame(raf); clearInterval(timer) }
  }, [words, hold])

  return <span className={className} aria-label={words.join(', ')}>{text}</span>
}
