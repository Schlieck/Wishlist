import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, EllipseCurve, Group, Mesh, MeshBasicMaterial, Vector3,
} from 'three'
import type { Region } from '../data/wishlist'
import { makeHoloMaterial } from './holoMaterial'
import { anchorScreen, BODY_Y, joints, REGION_POS } from './regions'
import { damp, reducedMotion } from '../lib/motion'

const URL = `${import.meta.env.BASE_URL}models/body.glb`
useGLTF.preload(URL)

const CYAN = new Color('#5ef6ff')
const RED = new Color('#ff3b3b')
const YELLOW = new Color('#f3e600')
const TAU = Math.PI * 2

type Props = { booted: boolean; active: Region | null; hover: Region | null }

/** The GLB is meshopt-quantized (int16 + node transform); bake it back to float body-local coordinates. */
function dequantize(scene: Group) {
  let src: Mesh | undefined
  scene.updateMatrixWorld(true)
  scene.traverse((o) => { if ((o as Mesh).isMesh) src = o as Mesh })
  if (!src) throw new Error('body.glb has no mesh')
  const g = src.geometry
  const p = g.attributes.position, n = g.attributes.normal
  const pos = new Float32Array(p.count * 3), nrm = new Float32Array(p.count * 3)
  const v = new Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(src.matrixWorld).toArray(pos, i * 3)
    v.fromBufferAttribute(n, i).normalize().toArray(nrm, i * 3)
  }
  const out = new BufferGeometry()
  out.setAttribute('position', new BufferAttribute(pos, 3))
  out.setAttribute('normal', new BufferAttribute(nrm, 3))
  out.setIndex(g.index)
  return out
}

/** A hint of skeleton: spine, limbs, a few ribs. Deliberately sparse. */
function useSkeleton() {
  return useMemo(() => {
    const chains = [
      ['pelvis', 'spine-4', 'spine-3', 'spine-2', 'spine-1', 'neck', 'head', 'head-2'],
      ...['l', 'r'].flatMap((s) => [
        ['neck', `${s}-clavicle`, `${s}-shoulder`, `${s}-elbow`, `${s}-hand`, `${s}-finger-3-4`],
        ['pelvis', `${s}-upper-leg`, `${s}-knee`, `${s}-ankle`, `${s}-foot-2`],
      ]),
    ]
    const pts: number[] = []
    for (const c of chains) for (let i = 0; i < c.length - 1; i++) pts.push(...joints[c[i]], ...joints[c[i + 1]])
    // ribs + pelvis ring: front arcs around the spine
    const ribs: [number, number, number, number][] = [[1.31, 0.11, 0.1, 0.9], [1.25, 0.125, 0.11, 0.95], [1.19, 0.13, 0.11, 1], [1.13, 0.125, 0.105, 0.95], [0.92, 0.13, 0.09, 1.3]]
    for (const [y, rx, rz, open] of ribs) {
      const c = new EllipseCurve(0, -0.07, rx, rz, Math.PI / 2 - open * 1.5, Math.PI / 2 + open * 1.5).getPoints(14)
      for (let i = 0; i < c.length - 1; i++) pts.push(c[i].x, y, c[i].y, c[i + 1].x, y - 0.012, c[i + 1].y)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [])
}

const NODES = ['neck', 'l-shoulder', 'r-shoulder', 'l-elbow', 'r-elbow', 'pelvis', 'l-knee', 'r-knee', 'l-ankle', 'r-ankle', 'spine-2']

/** Implant geometry per region (small, glowing, few). */
function Implant({ region, hot }: { region: Region; hot: React.RefObject<Region | null> }) {
  const ref = useRef<Group>(null)
  const mat = useMemo(() => new MeshBasicMaterial({ color: RED.clone(), wireframe: true, transparent: true, blending: AdditiveBlending, toneMapped: false, depthWrite: false }), [])
  const solid = useMemo(() => new MeshBasicMaterial({ color: RED.clone(), transparent: true, opacity: 0.55, blending: AdditiveBlending, toneMapped: false, depthWrite: false }), [])
  useFrame(({ clock }, dt) => {
    const on = hot.current === region
    const t = clock.elapsedTime
    mat.color.lerp(on ? YELLOW : RED, 1 - Math.exp(-10 * dt))
    solid.color.copy(mat.color)
    const beat = region === 'heart' ? 1 + Math.pow(Math.max(0, Math.sin(t * 7)), 8) * 0.25 : 1
    // lymph nodes are spread around the anchor, so scaling the group would move them
    const s = region === 'lymph' ? 1 : damp(ref.current!.scale.x, (on ? 1.35 : 1) * beat, 12, dt)
    ref.current!.scale.setScalar(s)
    if (region !== 'eyes' && region !== 'lymph') ref.current!.rotation.y = t * (on ? 1.6 : 0.4)
  })
  const p = REGION_POS[region]
  const body = (() => {
    switch (region) {
      case 'head': return <mesh material={mat} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.022, 0.004, 6, 18]} /></mesh>
      case 'eyes': return <>{[-0.0308, 0.0308].map((x) => <mesh key={x} position={[x, 0, 0]} material={solid}><sphereGeometry args={[0.011, 10, 8]} /></mesh>)}</>
      case 'brain': return <mesh material={mat} scale={[1, 0.72, 1.1]}><icosahedronGeometry args={[0.052, 1]} /></mesh>
      case 'hands': return <mesh material={mat}><octahedronGeometry args={[0.035, 0]} /></mesh>
      case 'lymph': return <>{([[0, 0, 0], [-0.23, 0, 0], [-0.075, 0.155, 0.02], [-0.155, 0.155, 0.02], [-0.03, -0.38, 0.07], [-0.2, -0.38, 0.07]] as const).map((o, i) => <mesh key={i} position={o} material={solid}><sphereGeometry args={[0.011, 8, 6]} /></mesh>)}</>
      case 'heart': return <mesh material={mat}><icosahedronGeometry args={[0.045, 0]} /></mesh>
      case 'stomach': return <mesh material={mat} scale={[1.3, 0.8, 0.8]} rotation={[0, 0, -0.5]}><sphereGeometry args={[0.05, 10, 6]} /></mesh>
      case 'wrist': return <><mesh material={mat} rotation={[Math.PI / 2, 0, 0.6]}><torusGeometry args={[0.032, 0.005, 4, 16]} /></mesh><mesh material={solid}><boxGeometry args={[0.022, 0.006, 0.022]} /></mesh></>
    }
  })()
  // lymph group is anchored at the left axilla; offsets reach the other axilla, neck and groin
  return <group ref={ref} position={p}>{body}</group>
}

export function Body({ booted, active, hover }: Props) {
  const { scene } = useGLTF(URL)
  const geo = useMemo(() => dequantize(scene as unknown as Group), [scene])
  const mat = useMemo(() => makeHoloMaterial(), [])
  const skeleton = useSkeleton()
  const group = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const hot = useRef<Region | null>(null)
  useEffect(() => { hot.current = active ?? hover }, [active, hover])
  const { size, camera } = useThree()
  const tmp = useMemo(() => new Vector3(), [])

  useEffect(() => {
    if (!booted) return
    gsap.to(mat.uniforms.uReveal, { value: 1.9, duration: reducedMotion ? 0.2 : 1.8, ease: 'power2.inOut' })
    gsap.fromTo(inner.current!.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.6, delay: reducedMotion ? 0 : 1.4, ease: 'back.out(2)' })
  }, [booted, mat])

  useFrame(({ clock }, dt) => {
    const g = group.current!
    if (!hot.current) g.rotation.y += dt * (reducedMotion ? 0.08 : 0.22)
    else g.rotation.y = damp(g.rotation.y, Math.round(g.rotation.y / TAU) * TAU, 5, dt)
    g.updateMatrixWorld()
    const u = mat.uniforms
    u.uTime.value = clock.elapsedTime
    if (hot.current) u.uHotPos.value.copy(REGION_POS[hot.current]).applyMatrix4(g.matrixWorld)
    u.uHot.value = damp(u.uHot.value, hot.current ? 1 : 0, 8, dt)
    if (active) u.uFocusPos.value.copy(REGION_POS[active]).applyMatrix4(g.matrixWorld)
    u.uFocus.value = damp(u.uFocus.value, active ? 1 : 0, 3, dt)
    for (const r of Object.keys(REGION_POS) as Region[]) {
      tmp.copy(REGION_POS[r]).applyMatrix4(g.matrixWorld).project(camera)
      anchorScreen[r] = { x: ((tmp.x + 1) / 2) * size.width, y: ((1 - tmp.y) / 2) * size.height }
    }
  })

  return (
    <group ref={group} position={[0, BODY_Y, 0]}>
      <mesh geometry={geo} material={mat} />
      <group ref={inner} scale={0}>
        <lineSegments geometry={skeleton}>
          <lineBasicMaterial color={CYAN} transparent opacity={0.28} blending={AdditiveBlending} depthWrite={false} />
        </lineSegments>
        {NODES.map((j) => (
          <mesh key={j} position={joints[j]}>
            <sphereGeometry args={[0.007, 6, 4]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        ))}
        {(Object.keys(REGION_POS) as Region[]).map((r) => <Implant key={r} region={r} hot={hot} />)}
      </group>
    </group>
  )
}
