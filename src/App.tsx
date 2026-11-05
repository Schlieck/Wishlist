import { useCallback, useEffect, useState } from 'react'
import { CATEGORIES } from './data/wishlist'
import { Scene } from './scene/Scene'
import { Phage } from './phage/Phage'
import { Boot } from './ui/Boot'
import { BodyMenu } from './ui/BodyMenu'
import { Hud, SideMeters } from './ui/Hud'
import { Panel } from './ui/Panel'
import { sfx } from './lib/audio'

const isMobile = () => window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches
const regionOf = (id: string | null) => CATEGORIES.find((c) => c.id === id)?.region ?? null

function MobileNotice() {
  return (
    <main className="mobile">
      <div className="mobile__box">
        <span className="panel__label">// ERRO 0x5E6</span>
        <h1 className="name" data-text="BRUNO">BRUNO</h1>
        <p>Interface incompatível com este dispositivo.</p>
        <p className="mobile__cta">conecte-se por um terminal desktop</p>
      </div>
    </main>
  )
}

export default function App() {
  const [mobile] = useState(isMobile)
  const [booted, setBooted] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [glitch, setGlitch] = useState(false)

  const flash = useCallback(() => {
    setGlitch(true)
    setTimeout(() => setGlitch(false), 380)
  }, [])

  const open = useCallback((id: string) => {
    sfx.whoosh()
    sfx.static()
    flash()
    setHover(null)
    setActive(id)
  }, [flash])

  const close = useCallback(() => {
    sfx.back()
    flash()
    setActive(null)
  }, [flash])

  const nav = useCallback((dir: 1 | -1) => {
    const i = CATEGORIES.findIndex((c) => c.id === active)
    open(CATEGORIES[(i + dir + CATEGORIES.length) % CATEGORIES.length].id)
  }, [active, open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active) return
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') nav(1)
      else if (e.key === 'ArrowLeft') nav(-1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [active, close, nav])

  if (mobile) return <MobileNotice />

  return (
    <div className={`app ${glitch ? 'is-glitching' : ''} ${booted ? 'is-booted' : ''}`}>
      <Scene booted={booted} active={regionOf(active)} hover={regionOf(hover)} />
      <div className="fx-grid" aria-hidden="true" />
      <SideMeters />
      <BodyMenu booted={booted} hidden={!!active} hover={hover} setHover={setHover} onOpen={open} />
      <Panel active={active} onClose={close} onNav={nav} />
      <Phage inPanel={active === 'fagos'} parked={!!active} visible={booted} />
      <Hud active={active} onHome={close} />
      <footer className="hud-foot" aria-hidden="true">
        <span>{active ? 'ESC voltar · ← → navegar' : 'passe o mouse num implante · clique para acessar'}</span>
        <span>malha: MakeHuman (CC0)</span>
      </footer>
      <div className="fx-scan" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />
      <div className="fx-glitch" aria-hidden="true"><i /><i /><i /></div>
      <div className="fx-crt" aria-hidden="true" />
      {!booted && <Boot onConnect={() => setBooted(true)} />}
    </div>
  )
}
