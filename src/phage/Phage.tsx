import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { CylinderGeometry, Group, IcosahedronGeometry, EdgesGeometry } from 'three'
import { sfx } from '../lib/audio'
import { damp, reducedMotion } from '../lib/motion'

const C = { cyan: '#5ef6ff', yellow: '#f3e600', red: '#ff3b3b', dark: '#0b2a33' }
const mouse = { x: 0, y: 0 }
const look = { x: 0, y: 0 } // pupil direction, -1..1
if (typeof window !== 'undefined') addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY })

function Leg({ angle, i }: { angle: number; i: number }) {
  const upper = useRef<Group>(null)
  const lower = useRef<Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 2.4 + i * 1.1
    upper.current!.rotation.z = 0.9 + Math.sin(t) * 0.18
    lower.current!.rotation.z = -1.7 + Math.sin(t + 0.8) * 0.25
  })
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={upper}>
        <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.022, 0.022, 0.44, 5]} /><meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={0.5} /></mesh>
        <group ref={lower} position={[0, -0.44, 0]}>
          <mesh><sphereGeometry args={[0.035, 8, 6]} /><meshBasicMaterial color={C.yellow} /></mesh>
          <mesh position={[0, -0.24, 0]}><cylinderGeometry args={[0.018, 0.012, 0.48, 5]} /><meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={0.5} /></mesh>
        </group>
      </group>
    </group>
  )
}

function Eye({ x, blink, happy }: { x: number; blink: React.RefObject<number>; happy: React.RefObject<number> }) {
  const g = useRef<Group>(null)
  const pupil = useRef<Group>(null)
  useFrame(() => {
    pupil.current!.position.x = look.x * 0.06
    pupil.current!.position.y = look.y * 0.06
    g.current!.scale.y = Math.max(0.08, blink.current! * (1 - happy.current! * 0.65))
  })
  return (
    <group ref={g} position={[x, 0.05, 0.4]}>
      <mesh scale={[1, 1.15, 0.5]}><sphereGeometry args={[0.16, 20, 16]} /><meshBasicMaterial color="#e9fdff" /></mesh>
      <group ref={pupil} position={[0, 0, 0.07]}>
        <mesh scale={[1, 1.15, 0.5]}><sphereGeometry args={[0.105, 18, 14]} /><meshBasicMaterial color="#05080c" /></mesh>
        <mesh position={[0.04, 0.05, 0.05]}><sphereGeometry args={[0.035, 10, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[-0.035, -0.04, 0.05]}><sphereGeometry args={[0.016, 8, 6]} /><meshBasicMaterial color={C.cyan} /></mesh>
      </group>
    </group>
  )
}

function Bacteriophage({ spinning }: { spinning: boolean }) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const blink = useRef(1)
  const happy = useRef(0)
  const nextBlink = useRef(2)
  const head = useMemo(() => new IcosahedronGeometry(0.62, 0), [])
  const edges = useMemo(() => new EdgesGeometry(head), [head])
  const sheath = useMemo(() => new CylinderGeometry(0.11, 0.11, 0.62, 10), [])
  const legs = useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2 + Math.PI / 6), [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    // blink every few seconds
    if (t > nextBlink.current) { nextBlink.current = t + 2 + Math.random() * 3; gsap.fromTo(blink, { current: 0.08 }, { current: 1, duration: 0.18 }) }
    root.current!.position.y = Math.sin(t * 1.3) * 0.08 + 0.15
    const b = body.current!
    if (spinning) b.rotation.y += dt * 0.9
    else b.rotation.y = damp(b.rotation.y, Math.round(b.rotation.y / (Math.PI * 2)) * Math.PI * 2 + Math.sin(t * 0.7) * 0.25, 3, dt)
    b.rotation.z = Math.sin(t * 0.9) * 0.08
  })

  const hover = () => {
    if (happy.current > 0.5) return
    sfx.cute()
    gsap.timeline()
      .to(happy, { current: 1, duration: 0.1 })
      .to(root.current!.position, { y: '+=0.5', duration: 0.22, ease: 'power2.out' }, 0)
      .to(root.current!.position, { y: '-=0.5', duration: 0.35, ease: 'bounce.out' })
      .to(happy, { current: 0, duration: 0.3 }, '+=0.8')
  }

  return (
    <group ref={root} onPointerOver={hover} scale={0.82}>
      <group ref={body}>
        {/* head */}
        <mesh geometry={head} position={[0, 0.55, 0]}><meshStandardMaterial color={C.dark} emissive={C.cyan} emissiveIntensity={0.25} flatShading transparent opacity={0.92} /></mesh>
        <lineSegments geometry={edges} position={[0, 0.55, 0]}><lineBasicMaterial color={C.cyan} /></lineSegments>
        <group position={[0, 0.55, 0]}>
          <Eye x={-0.2} blink={blink} happy={happy} />
          <Eye x={0.2} blink={blink} happy={happy} />
          {/* blush */}
          {[-0.36, 0.36].map((x) => <mesh key={x} position={[x, -0.16, 0.42]}><circleGeometry args={[0.06, 12]} /><meshBasicMaterial color={C.red} transparent opacity={0.6} /></mesh>)}
        </group>
        {/* collar */}
        <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.2, 0.16, 0.08, 10]} /><meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={0.6} /></mesh>
        {/* tail sheath with rings */}
        <mesh geometry={sheath} position={[0, -0.42, 0]}><meshStandardMaterial color={C.dark} emissive={C.cyan} emissiveIntensity={0.35} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0, -0.18 - i * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.018, 4, 14]} /><meshBasicMaterial color={C.yellow} /></mesh>)}
        {/* base plate + legs */}
        <group position={[0, -0.76, 0]}>
          <mesh><cylinderGeometry args={[0.2, 0.2, 0.06, 6]} /><meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={0.5} /></mesh>
          {legs.map((a, i) => <Leg key={i} angle={a} i={i} />)}
        </group>
      </group>
    </group>
  )
}

/** Floating mascot in a corner; flies next to the panel text when the BACTERIÓFAGOS category is open. */
export function Phage({ inPanel, parked, visible }: { inPanel: boolean; parked: boolean; visible: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)

  // eyes follow the cursor (relative to the mascot's own box)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const r = wrap.current?.getBoundingClientRect()
      if (r) {
        const dx = (mouse.x - (r.left + r.width / 2)) / (innerWidth / 2)
        const dy = -(mouse.y - (r.top + r.height * 0.35)) / (innerHeight / 2)
        look.x = Math.max(-1, Math.min(1, dx * 1.5))
        look.y = Math.max(-1, Math.min(1, dy * 1.5))
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  // fly to the slot inside the panel (or back to the corner)
  useEffect(() => {
    const el = wrap.current!
    let raf = 0
    let tw: gsap.core.Tween | undefined
    // bottom strip between the left button column and the name; far corner while a category is open
    const home = () => {
      const col = document.querySelector('.menu__col--left')?.getBoundingClientRect()
      return { left: parked ? 24 : (col?.right ?? 300) + 12, top: innerHeight - 40 - 175, width: 150, height: 170 }
    }
    const go = (to: { left: number; top: number; width: number; height: number }) => {
      tw?.kill()
      tw = gsap.to(el, { ...to, duration: reducedMotion ? 0.2 : 1.1, ease: 'power3.inOut' })
    }
    if (inPanel) {
      const t0 = performance.now()
      const wait = () => {
        const slot = document.querySelector('.phage-slot')
        if (slot) {
          const r = slot.getBoundingClientRect()
          go({ left: r.left, top: r.top, width: r.width, height: r.height })
        } else if (performance.now() - t0 < 3000) raf = requestAnimationFrame(wait)
      }
      wait()
    } else go(home())
    const onResize = () => { if (!inPanel) gsap.set(el, home()) }
    addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); tw?.kill(); removeEventListener('resize', onResize) }
  }, [inPanel, parked])

  return (
    <div ref={wrap} className={`phage ${visible ? 'is-visible' : ''} ${inPanel ? 'in-panel' : ''}`} style={{ left: 330, top: innerHeight - 215, width: 150, height: 170 }} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.4], fov: 32 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 3, 3]} intensity={30} color={C.cyan} />
        <pointLight position={[-3, -1, 2]} intensity={14} color={C.red} />
        <Bacteriophage spinning={inPanel} />
      </Canvas>
      {!inPanel && <span className="phage-tag">AMOSTRA_07 // T4</span>}
    </div>
  )
}
