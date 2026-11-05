import { Vector3 } from 'three'
import type { Region } from '../data/wishlist'
import J from '../data/joints.json'

type V3 = [number, number, number]
export const joints = J as unknown as Record<string, V3>

/** Body-local anchor of each region (meters, body faces +z, feet at y=0; +x = viewer's right). */
export const REGION_POS: Record<Region, Vector3> = {
  head: new Vector3(-0.078, 1.55, -0.07), // ear on the viewer's left
  eyes: new Vector3(0, 1.545, 0.0),
  brain: new Vector3(0, 1.6, -0.065),
  hands: new Vector3(...joints['r-hand-2']),
  lymph: new Vector3(0.115, 1.27, -0.09), // left axillary node
  heart: new Vector3(0.035, 1.24, -0.03),
  stomach: new Vector3(0.045, 1.1, -0.02),
  wrist: new Vector3(0.418, 1.078, 0.035),
}

/** Body group offset so the figure sits a bit above screen center (room for the name below). */
export const BODY_Y = -0.74

/** Camera focus distance per region. */
export const FOCUS_DIST: Record<Region, number> = {
  head: 1.0, eyes: 0.85, brain: 1.0, hands: 1.05, lymph: 1.45, heart: 1.2, stomach: 1.2, wrist: 1.0,
}

/** Screen-space positions of the anchors, written every frame by the scene, read by the SVG link lines. */
export const anchorScreen: Partial<Record<Region, { x: number; y: number }>> = {}
