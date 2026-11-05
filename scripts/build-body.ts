// Converts the MakeHuman CC0 base mesh into a meshopt-compressed GLB + joint anchors.
// Usage: npx tsx scripts/build-body.ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { Document, NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { reorder, quantize, weld } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'

const SRC = 'https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj'

const obj = await (await fetch(SRC)).text()
const verts: number[][] = []
const groups = new Map<string, number[][]>() // group -> faces (vertex index lists)
let group = ''
for (const line of obj.split('\n')) {
  const p = line.trim().split(/\s+/)
  if (p[0] === 'v') verts.push([+p[1], +p[2], +p[3]])
  else if (p[0] === 'g') group = p[1]
  else if (p[0] === 'f') {
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(p.slice(1).map((s) => parseInt(s.split('/')[0], 10) - 1))
  }
}

const body = groups.get('body')
if (!body) throw new Error('body group not found in base.obj')

// Ground at y=0, centered on x/z, decimeters -> meters.
const used = [...new Set(body.flat())]
let minY = Infinity, cx = 0, cz = 0
for (const i of used) { minY = Math.min(minY, verts[i][1]); cx += verts[i][0]; cz += verts[i][2] }
cx /= used.length; cz /= used.length
const tf = (v: number[]) => [(v[0] - cx) / 10, (v[1] - minY) / 10, (v[2] - cz) / 10]

const remap = new Map<number, number>()
used.forEach((v, i) => remap.set(v, i))
const pos = new Float32Array(used.length * 3)
used.forEach((v, i) => pos.set(tf(verts[v]), i * 3))
const idx: number[] = []
for (const f of body) for (let k = 1; k < f.length - 1; k++) idx.push(remap.get(f[0])!, remap.get(f[k])!, remap.get(f[k + 1])!)

// Area-weighted vertex normals.
const nrm = new Float32Array(pos.length)
for (let t = 0; t < idx.length; t += 3) {
  const [a, b, c] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3]
  const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]]
  const e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]]
  const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
  for (const v of [a, b, c]) for (let k = 0; k < 3; k++) nrm[v + k] += n[k]
}
for (let i = 0; i < nrm.length; i += 3) {
  const l = Math.hypot(nrm[i], nrm[i + 1], nrm[i + 2]) || 1
  nrm[i] /= l; nrm[i + 1] /= l; nrm[i + 2] /= l
}

const doc = new Document()
const buf = doc.createBuffer()
const prim = doc.createPrimitive()
  .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buf))
  .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nrm).setBuffer(buf))
  .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buf))
doc.createScene().addChild(doc.createNode('body').setMesh(doc.createMesh('body').addPrimitive(prim)))

await MeshoptEncoder.ready
await doc.transform(weld(), reorder({ encoder: MeshoptEncoder }), quantize())
doc.createExtension(KHRMeshQuantization).setRequired(true)
doc.createExtension(EXTMeshoptCompression).setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })

mkdirSync('public/models', { recursive: true })
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
await io.write('public/models/body.glb', doc)

// Joint centroids (MakeHuman marks each joint with a tiny helper cube).
const anchors: Record<string, [number, number, number]> = {}
for (const [name, faces] of groups) {
  if (!name.startsWith('joint-')) continue
  const vs = [...new Set(faces.flat())].map((i) => tf(verts[i]))
  anchors[name.slice(6)] = [0, 1, 2].map((k) => +(vs.reduce((s, v) => s + v[k], 0) / vs.length).toFixed(4)) as [number, number, number]
}
writeFileSync('src/data/joints.json', JSON.stringify(anchors))

const ys = used.map((v) => tf(verts[v])[1])
console.log(`verts ${used.length}, tris ${idx.length / 3}, height ${Math.max(...ys).toFixed(3)}m, joints ${Object.keys(anchors).length}`)
