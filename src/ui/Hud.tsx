import { useEffect, useState } from 'react'
import { isMuted, onMuteChange, setMuted, sfx } from '../lib/audio'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now.toLocaleTimeString('pt-BR', { hour12: false })
}

function useLink() {
  const [v, setV] = useState(87)
  useEffect(() => {
    const t = setInterval(() => setV(78 + Math.round(Math.random() * 21)), 1700)
    return () => clearInterval(t)
  }, [])
  return v
}

export function Hud({ active, onHome }: { active: string | null; onHome: () => void }) {
  const [muted, setM] = useState(isMuted)
  useEffect(() => onMuteChange(setM), [])
  const link = useLink()
  const clock = useClock()
  const bars = Math.round(link / 20)
  const tabs = [
    { id: 'corpo', label: 'CORPO', on: !active },
    { id: 'inv', label: 'INVENTÁRIO', on: false },
    { id: 'wish', label: 'WISHLIST', on: !!active },
  ]

  return (
    <header className="hud">
      <div className="hud__brand"><span className="hud__mark" />B.OS<small>v4.13</small></div>
      <nav className="hud__tabs">
        {tabs.map((t, i) => (
          <span key={t.id} className="hud__tabwrap">
            {i > 0 && <span className="hud__dot">·</span>}
            <button className={`hud__tab ${t.on ? 'is-on' : ''}`} onClick={() => t.id === 'corpo' && active && onHome()} tabIndex={t.id === 'corpo' ? 0 : -1}>
              {t.label}
            </button>
          </span>
        ))}
      </nav>
      <div className="hud__right">
        <span className="hud__link">
          SYS.LINK <b>{'▮'.repeat(bars)}<i>{'▯'.repeat(5 - bars)}</i></b> {link}%
        </span>
        <span className="hud__clock">{clock}</span>
        <button
          className={`hud__mute ${muted ? 'is-muted' : ''}`}
          onClick={() => { setMuted(!muted); if (muted) sfx.beep() }}
          aria-label={muted ? 'Ativar som' : 'Desativar som'}
          title={muted ? 'Ativar som' : 'Desativar som'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13" />}
          </svg>
          {muted ? 'MUDO' : 'SOM'}
        </button>
      </div>
    </header>
  )
}

/** Animated gauge columns on the screen edges. */
export function SideMeters() {
  return (
    <>
      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={`meter meter--${side}`} aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => <span key={i} style={{ animationDelay: `${-(i * 0.37) % 3}s` }} />)}
          <em>{side === 'left' ? 'BIO-MON' : 'NEURO-SYNC'}</em>
        </div>
      ))}
    </>
  )
}
