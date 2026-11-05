import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CATEGORIES, MUSIC_FIREWALL, type Category, type Item } from '../data/wishlist'
import ASSETS from '../data/assets.json'
import { playPreview, sfx, stopPreview } from '../lib/audio'
import { reducedMotion } from '../lib/motion'
import { Icon } from './Icons'

const assets = ASSETS as Record<string, { cover?: string; preview?: string; year?: string }>
const src = (p: string) => `${import.meta.env.BASE_URL}${p}`

function Cover({ item, ratio }: { item: Item; ratio: 'square' | 'poster' }) {
  const a = assets[item.id]
  return (
    <div className={`cover cover--${ratio}`}>
      {a?.cover ? (
        <img src={src(a.cover)} alt={item.title} loading="lazy" decoding="async" />
      ) : (
        <div className="cover__missing"><span>SINAL PERDIDO</span><small>{item.title}</small></div>
      )}
    </div>
  )
}

function Visualizer({ analyser }: { analyser: AnalyserNode }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const draw = () => {
      analyser.getByteFrequencyData(data)
      g.clearRect(0, 0, c.width, c.height)
      const n = 16, w = c.width / n
      for (let i = 0; i < n; i++) {
        const v = data[i + 1] / 255
        const h = Math.max(2, v * c.height)
        g.fillStyle = i % 4 === 0 ? '#ff3b3b' : '#f3e600'
        g.fillRect(i * w + 1, c.height - h, w - 2, h)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [analyser])
  return <canvas ref={ref} className="viz" width={160} height={40} />
}

function AlbumCard({ item, i }: { item: Item; i: number }) {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const preview = assets[item.id]?.preview
  const enter = () => { if (preview) setAnalyser(playPreview(preview)) }
  const leave = () => { if (analyser) { stopPreview(); setAnalyser(null) } }
  useEffect(() => () => stopPreview(), [])
  return (
    <article className={`card card--album ${analyser ? 'is-playing' : ''}`} style={{ '--i': i } as React.CSSProperties}>
      <div className="card__media" onMouseEnter={enter} onMouseLeave={leave}>
        <Cover item={item} ratio="square" />
        {preview && <span className="card__play">{analyser ? '◉ PRÉVIA 30s' : '▶ PASSE O MOUSE'}</span>}
        {analyser && <Visualizer analyser={analyser} />}
      </div>
      <div className="card__meta">
        <h3>{item.title}</h3>
        <p>{item.subtitle}{assets[item.id]?.year && <span className="dim"> · {assets[item.id].year}</span>}</p>
        {item.tag && <span className="tag">{item.tag}</span>}
      </div>
    </article>
  )
}

function PosterCard({ item, i }: { item: Item; i: number }) {
  return (
    <article className="card card--poster" style={{ '--i': i } as React.CSSProperties}>
      <div className="card__media"><Cover item={item} ratio="poster" /></div>
      <div className="card__meta">
        <h3>{item.title}</h3>
        {(item.subtitle || item.year) && <p>{[item.subtitle, item.year].filter(Boolean).join(' · ')}</p>}
        {item.tag && <span className="tag">{item.tag}</span>}
        {item.note && <span className="note">{item.note}</span>}
      </div>
    </article>
  )
}

function Content({ cat }: { cat: Category }) {
  switch (cat.layout) {
    case 'album':
      return (
        <>
          <p className="intro">{cat.intro}</p>
          <div className="grid grid--albums">{cat.items.map((it, i) => <AlbumCard key={it.id} item={it} i={i} />)}</div>
          <div className="firewall" style={{ '--i': cat.items.length } as React.CSSProperties}>
            <span className="firewall__head">⚠ FIREWALL ATIVO — acesso negado:</span>{' '}
            {MUSIC_FIREWALL.map((n, i) => <span key={n}>{i > 0 && ' · '}<s>{n}</s></span>)}{' '}
            <span className="dim">(motivos esciurídeos 🐿️)</span>
          </div>
        </>
      )
    case 'poster':
      return <div className="grid grid--posters">{cat.items.map((it, i) => <PosterCard key={it.id} item={it} i={i} />)}</div>
    case 'phage':
      return (
        <div className="phage-panel">
          <div className="phage-slot" />
          <div className="phage-panel__text">
            <p className="intro intro--big">{cat.intro}</p>
            <ul className="chips">{cat.items.map((it, i) => <li key={it.id} className="chip" style={{ '--i': i } as React.CSSProperties}><Icon id="fagos" size={16} />{it.title}</li>)}</ul>
            <p className="dim small">ESPÉCIME DE REFERÊNCIA: fago T4 // cabeça icosaédrica, cauda contrátil, 6 fibras. Fofo: confirmado.</p>
          </div>
        </div>
      )
    case 'room':
      return (
        <>
          <p className="intro">{cat.intro}</p>
          <div className="grid grid--rooms">
            {cat.items.map((it, i) => (
              <article key={it.id} className={`card room room--${it.id}`} style={{ '--i': i } as React.CSSProperties}>
                <div className="room__art" aria-hidden="true"><span>{it.title}</span></div>
                <div className="card__meta"><h3>{it.title}</h3><p>{it.note}</p></div>
              </article>
            ))}
          </div>
        </>
      )
    case 'food':
      return (
        <div className="food">
          <div className="food__scan card" style={{ '--i': 0 } as React.CSSProperties}>
            <svg viewBox="0 0 200 160" className="food__stomach" aria-hidden="true">
              <path d="M70 10 C70 40 60 50 50 70 C35 100 50 145 100 148 C150 150 175 120 165 90 C158 70 130 72 120 85 C110 95 95 90 92 70 C90 50 95 30 95 10" />
            </svg>
            <div className="food__beam" />
          </div>
          <div className="food__read">
            <p className="intro intro--big" style={{ '--i': 1 } as React.CSSProperties}>{cat.intro}</p>
            <div className="readout card" style={{ '--i': 2 } as React.CSSProperties}>
              <div className="readout__row"><span>COMPATIBILIDADE</span><b>100%</b></div>
              <div className="bar"><i /></div>
              {['DOCE', 'SALGADO', 'APIMENTADO', 'ESTRANHO', 'RESTO DE ONTEM'].map((k) => (
                <div key={k} className="readout__row small"><span>{k}</span><b className="ok">ACEITO</b></div>
              ))}
              <div className="readout__row small"><span>RESTRIÇÕES</span><b className="dim">NENHUMA DETECTADA</b></div>
            </div>
          </div>
        </div>
      )
    case 'credits':
      return (
        <>
        {cat.intro && <p className="intro">{cat.intro}</p>}
        <div className="grid grid--credits">
          {cat.items.map((it, i) => (
            <article key={it.id} className={`credit credit--${it.id}`} style={{ '--i': i } as React.CSSProperties}>
              <div className="credit__top"><span className="credit__chip" /><span className="credit__brand">CRED//{it.title.toUpperCase()}</span></div>
              <h3>{it.title}</h3>
              <div className="credit__num">•••• •••• •••• {String(i + 1).padStart(4, '0')}</div>
              <div className="credit__bottom"><div><small>TITULAR</small>BRUNO</div><div><small>VALOR</small>QUALQUER</div><div><small>TIPO</small>{it.note}</div></div>
            </article>
          ))}
        </div>
        </>
      )
  }
}

/** Big right-side panel: slides in, "scans", then staggers its cards in. */
export function Panel({ active, onClose, onNav }: { active: string | null; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const el = useRef<HTMLElement>(null)
  const [cat, setCat] = useState<Category | null>(null)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    if (!active) return
    setCat(CATEGORIES.find((c) => c.id === active)!)
    setScanning(true)
    const t = setTimeout(() => { setScanning(false); sfx.tick() }, reducedMotion ? 50 : 750)
    return () => clearTimeout(t)
  }, [active])

  useLayoutEffect(() => { gsap.set(el.current, { xPercent: 110, autoAlpha: 0 }) }, [])

  useLayoutEffect(() => {
    const tw = gsap.to(el.current, active
      ? { xPercent: 0, autoAlpha: 1, duration: reducedMotion ? 0.2 : 0.8, delay: reducedMotion ? 0 : 0.35, ease: 'power3.out' }
      : { xPercent: 110, autoAlpha: 0, duration: reducedMotion ? 0.2 : 0.5, ease: 'power3.in' })
    return () => void tw.kill()
  }, [active])

  useEffect(() => { if (!active) stopPreview() }, [active])

  const total = cat?.items.length ?? 0
  return (
    <aside ref={el} className="panel" style={{ visibility: 'hidden' }} aria-hidden={!active} aria-label={cat?.title}>
      {cat && (
        <>
          <header className="panel__head">
            <div>
              <span className="panel__label">{cat.label}</span>
              <h2 className="panel__title" data-text={cat.title}><Icon id={cat.id} size={30} />{cat.title}</h2>
            </div>
            <div className="panel__meta">
              <span>ITENS: {total ? String(total).padStart(2, '0') : '∞'}</span>
              <span>REG: {cat.region.toUpperCase()}</span>
            </div>
          </header>
          <div className="panel__body" key={cat.id}>
            {scanning ? (
              <div className="scanning">
                <span>ESCANEANDO {cat.label.replace(/\/\//g, '').trim()}…</span>
                <div className="bar bar--scan"><i /></div>
              </div>
            ) : (
              <Content cat={cat} />
            )}
          </div>
          <footer className="panel__foot">
            <button className="btn-back" onClick={onClose} tabIndex={active ? 0 : -1}>◀ VOLTAR AO CORPO <kbd>ESC</kbd></button>
            <span className="panel__nav">
              <button onClick={() => onNav(-1)} tabIndex={active ? 0 : -1} aria-label="Categoria anterior">←</button>
              NAVEGAR
              <button onClick={() => onNav(1)} tabIndex={active ? 0 : -1} aria-label="Próxima categoria">→</button>
            </span>
          </footer>
        </>
      )}
    </aside>
  )
}
