import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { sfx, unlock } from '../lib/audio'
import { reducedMotion } from '../lib/motion'

const LINES = [
  'B.OS NEURO-BIOS v4.13 // (c) ninguém',
  'checando memória cortical ........ OK',
  'montando /dev/implantes ........... 8/8',
  'calibrando sistema óptico ......... OK',
  'carregando wishlist.dat ........... OK',
  'firewall esciurídeo ............... ATIVO',
  'malha corporal holográfica ........ ',
]

/** Boot screen: fast terminal text + load progress + click-to-connect (unlocks audio). */
export function Boot({ onConnect }: { onConnect: () => void }) {
  const [shown, setShown] = useState(reducedMotion ? LINES.length : 0)
  const [leaving, setLeaving] = useState(false)
  const { progress, active } = useProgress()
  const loaded = !active && progress >= 100

  useEffect(() => {
    if (shown >= LINES.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 140 + Math.random() * 120)
    return () => clearTimeout(t)
  }, [shown])

  const ready = loaded && shown >= LINES.length
  const connect = () => {
    if (!ready || leaving) return
    unlock()
    sfx.boot()
    setLeaving(true)
    setTimeout(onConnect, reducedMotion ? 50 : 650)
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') connect() }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  })

  return (
    <div className={`boot ${leaving ? 'is-leaving' : ''}`} onClick={connect}>
      <div className="boot__term">
        {LINES.slice(0, shown).map((l, i) => (
          <div key={i} className="boot__line">
            <span className="boot__prompt">&gt;</span> {l}
            {i === LINES.length - 1 && <b>{loaded ? 'OK' : `${Math.round(progress)}%`}</b>}
          </div>
        ))}
        {!ready && <span className="boot__cursor">▮</span>}
      </div>
      <button className="boot__connect" disabled={!ready} onClick={(e) => { e.stopPropagation(); connect() }}>
        {ready ? '[ CLIQUE PARA CONECTAR ]' : '[ SINCRONIZANDO… ]'}
      </button>
      <p className="boot__hint">{ready ? 'áudio será ativado ao conectar' : 'aguarde'}</p>
    </div>
  )
}
