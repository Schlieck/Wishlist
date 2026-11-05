// ============================================================
//  WISHLIST — edite aqui.
//  Depois de adicionar/alterar um item com `source`, rode:
//    npm run fetch-assets
//  para baixar a capa em public/covers/ (e a prévia, nos álbuns).
// ============================================================

/** De onde o script `scripts/fetch-assets.ts` busca a capa. */
export type Source =
  | { itunes: number; track: string } // collectionId do álbum + nome da faixa da prévia
  | { steam: number } // appid da Steam
  | { wiki: string } // título exato da página na Wikipedia (inglês)
  | { openlibrary: string } // título exato na Open Library

export type Item = {
  id: string
  title: string
  subtitle?: string // artista / autor
  tag?: string // gênero (tag vermelha)
  year?: string
  note?: string
  source?: Source
}

export type Region = 'head' | 'eyes' | 'brain' | 'hands' | 'lymph' | 'heart' | 'stomach' | 'wrist'

export type Category = {
  id: string
  button: string
  title: string
  label: string // // CÓRTEX AUDITIVO
  side: 'left' | 'right'
  region: Region
  status: string
  layout: 'album' | 'poster' | 'phage' | 'room' | 'food' | 'credits'
  intro?: string
  items: Item[]
}

export const OWNER = 'BRUNO'
export const ALIASES = ['LORPA PRIME', 'SHYVANA DA SILVA', 'SCHLIECKING']

export const MUSIC_FIREWALL = ['Jorge Ben Jor', 'Troye Sivan', 'Björk']

export const CATEGORIES: Category[] = [
  {
    id: 'musica',
    button: 'MÚSICA',
    title: 'MÚSICA',
    label: '// CÓRTEX AUDITIVO',
    side: 'left',
    region: 'head',
    status: '06 faixas carregadas',
    layout: 'album',
    intro: 'Tudo que envolver esses artistas me interessa.',
    items: [
      { id: 'ninajirachi-ilmc', title: 'I Love My Computer', subtitle: 'Ninajirachi', tag: 'Electroclash / EDM', source: { itunes: 1824602984, track: 'iPod Touch' } },
      { id: '100gecs-1000gecs', title: '1000 gecs', subtitle: '100 gecs', tag: 'Hyperpop', source: { itunes: 1497364061, track: 'money machine' } },
      { id: 'magdalenabay-imaginaldisk', title: 'Imaginal Disk', subtitle: 'Magdalena Bay', tag: 'Synth-pop', source: { itunes: 1751414757, track: 'Image' } },
      { id: 'fkatwigs-afterglow', title: 'EUSEXUA Afterglow', subtitle: 'FKA twigs', tag: 'Art pop / Eletrônica', source: { itunes: 1842161727, track: 'Wild And Alone (feat. PinkPantheress)' } },
      { id: 'fontainesdc-dopamine', title: 'Dopamine Chamber', subtitle: 'Fontaines D.C.', tag: 'Post-punk', source: { itunes: 6792085051, track: 'Marianne' } },
      { id: 'candelabro-deseo', title: 'Deseo, Carne y Voluntad', subtitle: 'Candelabro', tag: 'Post-punk / Art rock', source: { itunes: 1842902072, track: 'Deseo, Carne y Voluntad' } },
    ],
  },
  {
    id: 'filmes',
    button: 'FILMES',
    title: 'FILMES',
    label: '// SISTEMA ÓPTICO',
    side: 'left',
    region: 'eyes',
    status: '03 feeds em buffer',
    layout: 'poster',
    items: [
      { id: 'eeaao', title: 'Tudo em Todo o Lugar ao Mesmo Tempo', year: '2022', tag: 'Ficção científica / Absurdo', source: { wiki: 'Everything Everywhere All at Once' } },
      { id: 'vampire-hunter-d', title: 'Vampire Hunter D', year: '1985', tag: 'Anime / Horror gótico', source: { wiki: 'Vampire Hunter D (1985 film)' } },
      { id: 'kill-bill', title: 'Kill Bill', year: '2003', tag: 'Ação / Artes marciais', note: 'Vol. 1 & 2', source: { wiki: 'Kill Bill: Volume 1' } },
    ],
  },
  {
    id: 'livros',
    button: 'LIVROS & MANGÁS',
    title: 'LIVROS & MANGÁS',
    label: '// MEMÓRIA',
    side: 'left',
    region: 'brain',
    status: '07 volumes indexados',
    layout: 'poster',
    items: [
      { id: 'hikaru', title: 'O Verão em que Hikaru Morreu', subtitle: 'Mokumokuren', tag: 'Mangá / Horror', source: { wiki: 'The Summer Hikaru Died' } },
      { id: 'jjk', title: 'Jujutsu Kaisen', subtitle: 'Gege Akutami', tag: 'Mangá / Shōnen', note: 'A partir do volume 2', source: { wiki: 'Jujutsu Kaisen' } },
      { id: 'elden-ring-manga', title: 'Elden Ring: O Caminho para a Árvore Áurea', subtitle: 'Nikiichi Tobita', tag: 'Mangá / Comédia', note: 'Qualquer volume, menos o 2', source: { openlibrary: 'Elden Ring The Road to the Erdtree, Vol. 3' } },
      { id: 'silmarillion', title: 'O Silmarillion', subtitle: 'J.R.R. Tolkien', tag: 'Fantasia', source: { wiki: 'The Silmarillion' } },
      { id: 'gondolin', title: 'A Queda de Gondolin', subtitle: 'J.R.R. Tolkien', tag: 'Fantasia', source: { wiki: 'The Fall of Gondolin' } },
      { id: 'beren', title: 'Beren e Lúthien', subtitle: 'J.R.R. Tolkien', tag: 'Fantasia', source: { wiki: 'Beren and Lúthien' } },
      { id: 'numenor', title: 'A Queda de Númenor', subtitle: 'J.R.R. Tolkien', tag: 'Fantasia', source: { wiki: 'The Fall of Númenor' } },
    ],
  },
  {
    id: 'jogos',
    button: 'JOGOS',
    title: 'JOGOS',
    label: '// SISTEMA NERVOSO',
    side: 'left',
    region: 'hands',
    status: 'soulslike detectado',
    layout: 'poster',
    items: [
      { id: 'disco-elysium', title: 'Disco Elysium', tag: 'RPG / Detetive', source: { steam: 632470 } },
      { id: 'death-stranding', title: 'Death Stranding', tag: 'Ação / Exploração', source: { steam: 1850570 } },
      { id: 'journey', title: 'Journey', tag: 'Aventura', source: { steam: 638230 } },
      { id: 'katana-zero', title: 'Katana Zero', tag: 'Ação / Neo-noir', source: { steam: 460950 } },
      { id: 'demons-souls', title: "Demon's Souls", tag: 'Soulslike', source: { wiki: "Demon's Souls" } },
      { id: 'dark-souls-1', title: 'Dark Souls', tag: 'Soulslike', source: { steam: 570940 } },
      { id: 'dark-souls-2', title: 'Dark Souls II', tag: 'Soulslike', source: { steam: 335300 } },
      { id: 'dark-souls-3', title: 'Dark Souls III', tag: 'Soulslike', source: { steam: 374320 } },
      { id: 'bloodborne', title: 'Bloodborne', tag: 'Soulslike', source: { wiki: 'Bloodborne' } },
      { id: 'sekiro', title: 'Sekiro: Shadows Die Twice', tag: 'Soulslike', source: { steam: 814380 } },
      { id: 'elden-ring', title: 'Elden Ring', tag: 'Soulslike', source: { steam: 1245620 } },
      { id: 'nightreign', title: 'Elden Ring Nightreign', tag: 'Soulslike / Co-op', source: { steam: 2622380 } },
    ],
  },
  {
    id: 'fagos',
    button: 'BACTERIÓFAGOS',
    title: 'BACTERIÓFAGOS',
    label: 'SISTEMA IMUNE //',
    side: 'right',
    region: 'lymph',
    status: 'infecção desejada',
    layout: 'phage',
    intro: 'Quero qualquer coisa de bacteriófago: pelúcia, estampa, chaveiro, o que for.',
    items: [
      { id: 'pelucia', title: 'Pelúcia' },
      { id: 'estampa', title: 'Estampa' },
      { id: 'chaveiro', title: 'Chaveiro' },
      { id: 'qualquer', title: 'O que for' },
    ],
  },
  {
    id: 'quarto',
    button: 'QUARTO',
    title: 'QUARTO',
    label: 'ONDE EU MORO //',
    side: 'right',
    region: 'heart',
    status: '04 estilos compatíveis',
    layout: 'room',
    intro: 'Decoração pro meu quarto.',
    items: [
      { id: 'medieval', title: 'Medieval', note: 'Velas, ferro, brasões, tapeçaria.' },
      { id: 'cyberpunk', title: 'Cyberpunk', note: 'Neon, LED, placas, cabos à mostra.' },
      { id: 'exagerado', title: 'Exagerado', note: 'Quanto mais, melhor.' },
      { id: 'maximalista', title: 'Maximalista', note: 'Cor, padrão e textura em tudo.' },
    ],
  },
  {
    id: 'comida',
    button: 'COMIDA',
    title: 'COMIDA',
    label: 'SISTEMA DIGESTIVO //',
    side: 'right',
    region: 'stomach',
    status: 'aceita qualquer input',
    layout: 'food',
    intro: 'Como qualquer coisa!',
    items: [],
  },
  {
    id: 'vale',
    button: 'VALE-PRESENTE',
    title: 'VALE-PRESENTE',
    label: 'CHIP DE CRÉDITOS //',
    side: 'right',
    region: 'wrist',
    status: '03 chips aceitos',
    layout: 'credits',
    items: [
      { id: 'livraria', title: 'Livraria', note: 'Créditos de leitura' },
      { id: 'steam', title: 'Steam', note: 'Créditos de jogo' },
      { id: 'tattoo', title: 'Tattoo', note: 'Créditos de tinta' },
    ],
  },
]
