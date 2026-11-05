import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Scanline, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import gsap from 'gsap'
import { MathUtils, Vector2, type PerspectiveCamera } from 'three'
import type { Region } from '../data/wishlist'
import { Body } from './Body'
import { BODY_Y, FOCUS_DIST, REGION_POS } from './regions'
import { reducedMotion } from '../lib/motion'

type Props = { booted: boolean; active: Region | null; hover: Region | null }

const FOV = 30
const HOME = { px: 0, py: 0.0, pz: 4.75, tx: 0, ty: 0.0, tz: 0 }

/** Flies the camera between the home shot and a region close-up (GSAP drives a plain object, useFrame applies it). */
function Rig({ active }: { active: Region | null }) {
  const { camera, size } = useThree()
  const [s] = useState(() => ({ ...HOME }))

  useEffect(() => {
    let to = HOME
    if (active) {
      const p = REGION_POS[active].clone()
      p.y += BODY_Y
      const d = FOCUS_DIST[active]
      // shift the part toward the left third: the panel covers the right side
      const visibleW = 2 * d * Math.tan(MathUtils.degToRad(FOV / 2)) * (size.width / size.height)
      const dx = visibleW * 0.24
      to = { px: p.x + dx, py: p.y, pz: p.z + d, tx: p.x + dx, ty: p.y, tz: p.z }
    }
    const tw = gsap.to(s, { ...to, duration: reducedMotion ? 0.3 : 1.5, ease: 'power3.inOut' })
    return () => void tw.kill()
  }, [active, s, size.width, size.height])

  useFrame(({ pointer }) => {
    const par = active || reducedMotion ? 0 : 1
    camera.position.set(s.px + pointer.x * 0.12 * par, s.py + pointer.y * 0.06 * par, s.pz)
    camera.lookAt(s.tx, s.ty, s.tz)
  })
  return null
}

export function Scene(props: Props) {
  const ca = useMemo(() => new Vector2(0.0011, 0.0007), [])
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: FOV, near: 0.02, far: 40, position: [HOME.px, HOME.py, HOME.pz] }}
      onCreated={({ camera }) => (camera as PerspectiveCamera).lookAt(0, HOME.ty, 0)}
    >
      <color attach="background" args={['#07070a']} />
      <Suspense fallback={null}>
        <Body {...props} />
      </Suspense>
      <Rig active={props.active} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.12} luminanceSmoothing={0.35} />
        <ChromaticAberration offset={ca} radialModulation={false} modulationOffset={0} />
        <Scanline density={1.35} opacity={0.07} blendFunction={BlendFunction.OVERLAY} />
        <Noise opacity={0.08} premultiply blendFunction={BlendFunction.SCREEN} />
        <Vignette darkness={0.72} offset={0.28} />
      </EffectComposer>
    </Canvas>
  )
}
