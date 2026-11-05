import { useEffect, useRef } from 'react'
import { ALIASES, CATEGORIES, OWNER } from '../data/wishlist'
import { anchorScreen } from '../scene/regions'
import { sfx } from '../lib/audio'
import { Icon } from './Icons'
import { Decode } from './Decode'

type Props = {
  booted: boolean
  hidden: boolean
  hover: string | null
  setHover: (id: string | null) => void
  onOpen: (id: string) => void
}

export function BodyMenu({ booted, hidden, hover, setHover, onOpen }: Props) {
  const btns = useRef<Record<string, HTMLButtonElement | null>>({})
  const paths = useRef<Record<string, SVGPathElement | null>>({})
  const pulses = useRef<Record<string, SVGPathElement | null>>({})
  const dots = useRef<Record<string, SVGCircleElement | null>>({})

  // Link lines follow the rotating body every frame (DOM writes, no React re-render).
  useEffect(() => {
    let raf = 0
    const loop = () => {
      for (const c of CATEGORIES) {
        const b = btns.current[c.id], a = anchorScreen[c.region]
        if (!b || !a) continue
        const r = b.getBoundingClientRect()
        const left = c.side === 'left'
        const x0 = left ? r.right : r.left
        const y0 = r.top + r.height / 2
        const x1 = x0 + (left ? 28 : -28)
        const d = `M${x0},${y0} H${x1} L${a.x},${a.y}`
        paths.current[c.id]?.setAttribute('d', d)
        pulses.current[c.id]?.setAttribute('d', d)
        dots.current[c.id]?.setAttribute('cx', String(a.x))
        dots.current[c.id]?.setAttribute('cy', String(a.y))
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  const cls = `menu ${booted ? 'is-in' : ''} ${hidden ? 'is-hidden' : ''}`
  return (
    <div className={cls}>
      <svg className="links" aria-hidden="true">
        {CATEGORIES.map((c) => (
          <g key={c.id} className={`link ${hover === c.id ? 'is-hot' : ''}`}>
            <path ref={(el) => { paths.current[c.id] = el }} className="link__base" />
            <path ref={(el) => { pulses.current[c.id] = el }} className="link__pulse" />
            <circle ref={(el) => { dots.current[c.id] = el }} r="3.5" className="link__dot" />
          </g>
        ))}
      </svg>

      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={`menu__col menu__col--${side}`}>
          {CATEGORIES.filter((c) => c.side === side).map((c, i) => (
            <button
              key={c.id}
              ref={(el) => { btns.current[c.id] = el }}
              className={`slot ${hover === c.id ? 'is-hot' : ''}`}
              style={{ '--i': i + (side === 'right' ? 4 : 0) } as React.CSSProperties}
              onMouseEnter={() => { setHover(c.id); sfx.beep() }}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(c.id)}
              onBlur={() => setHover(null)}
              onClick={() => onOpen(c.id)}
              tabIndex={hidden ? -1 : 0}
            >
              <span className="slot__label">{c.label}</span>
              <span className="slot__body">
                <span className="slot__icon"><Icon id={c.id} /></span>
                <span className="slot__text">
                  <span className="slot__title">{c.button}</span>
                  <span className="slot__status"><i />{c.status}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}

      <div className="nameplate">
        <h1 className="name" data-text={OWNER}>{OWNER}</h1>
        <div className="alias">
          <span className="alias__k">ALIAS ::</span> <Decode words={ALIASES} className="alias__v" />
        </div>
      </div>
    </div>
  )
}
