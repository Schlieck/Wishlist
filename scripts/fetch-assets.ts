// Downloads covers into public/covers/ and writes src/data/assets.json.
// Usage: npm run fetch-assets   (add --force to re-download existing covers)
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { CATEGORIES, type Item } from '../src/data/wishlist.ts'

type Asset = { cover?: string; preview?: string; year?: string }
const OUT = 'src/data/assets.json'
const DIR = 'public/covers'
const UA = { 'User-Agent': 'WishlistAssetFetcher/1.0 (personal wishlist build script)' }
const force = process.argv.includes('--force')
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const get = async (url: string, init?: RequestInit) => {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: UA, ...init })
    if (r.ok) return r
    if (r.status !== 429 && r.status < 500) throw new Error(`HTTP ${r.status} ${url}`)
    await sleep(2000 * 2 ** i) // rate-limited (Wikimedia 429s quickly): back off
  }
  throw new Error(`HTTP fail ${url}`)
}
const getJson = async (url: string) => (await get(url)).json()

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '')

async function itunes(item: Item, id: number, track: string): Promise<Asset & { url?: string }> {
  const res = (await getJson(`https://itunes.apple.com/lookup?id=${id}&entity=song&limit=200`)).results
  const album = res.find((r: any) => r.wrapperType === 'collection')
  // Check that the album really is the one in the wishlist.
  if (!album || norm(album.collectionName) !== norm(item.title) || !norm(album.artistName).includes(norm(item.subtitle ?? '')))
    throw new Error(`iTunes mismatch: got "${album?.artistName} - ${album?.collectionName}"`)
  const songs = res.filter((r: any) => r.wrapperType === 'track' && r.previewUrl)
  const song = songs.find((s: any) => norm(s.trackName) === norm(track)) ?? songs[0]
  return {
    url: album.artworkUrl100.replace('100x100bb', '600x600bb'),
    preview: song?.previewUrl,
    year: album.releaseDate?.slice(0, 4),
  }
}

async function steam(id: number) {
  for (const f of ['library_600x900_2x.jpg', 'library_600x900.jpg', 'header.jpg']) {
    const url = `https://cdn.akamai.steamstatic.com/steam/apps/${id}/${f}`
    if ((await fetch(url, { method: 'HEAD' })).ok) return { url }
  }
  throw new Error(`no Steam image for ${id}`)
}

async function wiki(title: string) {
  const q = new URLSearchParams({ action: 'query', prop: 'pageimages', piprop: 'original', pilicense: 'any', format: 'json', redirects: '1', titles: title })
  const page: any = Object.values((await getJson(`https://en.wikipedia.org/w/api.php?${q}`)).query.pages)[0]
  // A redirect to another article (e.g. a manga redirecting to its game) means the item has no page of its own.
  if (page.missing !== undefined || norm(page.title) !== norm(title)) throw new Error(`Wikipedia page not found: ${title} (got ${page.title})`)
  if (!page.original?.source) throw new Error(`Wikipedia page has no image: ${title}`)
  return { url: page.original.source.split('?')[0] as string }
}

async function openlibrary(title: string) {
  const q = new URLSearchParams({ title, fields: 'title,cover_i', limit: '20' })
  const doc = (await getJson(`https://openlibrary.org/search.json?${q}`)).docs.find((d: any) => d.cover_i && norm(d.title) === norm(title))
  if (!doc) throw new Error(`Open Library: no exact match with cover for "${title}"`)
  return { url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` }
}

mkdirSync(DIR, { recursive: true })
const assets: Record<string, Asset> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const missing: string[] = []

for (const item of CATEGORIES.flatMap((c) => c.items)) {
  const s = item.source
  if (!s) continue
  try {
    const got = 'itunes' in s ? await itunes(item, s.itunes, s.track) : 'steam' in s ? await steam(s.steam) : 'openlibrary' in s ? await openlibrary(s.openlibrary) : await wiki(s.wiki)
    const ext = (got.url!.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] ?? 'jpg').toLowerCase()
    const file = `${item.id}.${ext}`
    if (force || !existsSync(`${DIR}/${file}`)) {
      const img = await get(got.url!)
      writeFileSync(`${DIR}/${file}`, Buffer.from(await img.arrayBuffer()))
    }
    if ('wiki' in s) await sleep(1500)
    const { url: _u, ...rest } = got
    assets[item.id] = { ...rest, cover: `covers/${file}` }
    console.log(`ok   ${item.id}`)
  } catch (e) {
    delete assets[item.id]
    missing.push(item.id)
    console.warn(`MISS ${item.id}: ${(e as Error).message}`)
  }
}

writeFileSync(OUT, JSON.stringify(assets, null, 2) + '\n')
console.log(missing.length ? `\nSem capa (placeholder): ${missing.join(', ')}` : '\nTodas as capas encontradas.')
