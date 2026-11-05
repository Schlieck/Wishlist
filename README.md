# BRUNO // WISHLIST

Wishlist pessoal em forma de tela de inventário de implantes: corpo holográfico 3D, 8 categorias ligadas a partes do corpo, sons sintetizados e um bacteriófago fofo flutuando por aí. Feito para desktop.

**Stack:** Vite + React + TypeScript, three.js (`@react-three/fiber`, `drei`, `postprocessing`), GSAP e Web Audio API.

## Rodar local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o dist/
```

## Editar a lista

Todo o conteúdo fica em [`src/data/wishlist.ts`](src/data/wishlist.ts): categorias, itens, textos, gêneros e notas.

Cada item pode ter um `source`, que diz de onde vem a capa:

| source | exemplo |
|---|---|
| `{ itunes: <collectionId>, track: '<faixa da prévia>' }` | álbuns (capa + prévia de 30s) |
| `{ steam: <appid> }` | jogos na Steam |
| `{ wiki: '<título da página na Wikipedia em inglês>' }` | filmes, livros, jogos de console |
| `{ openlibrary: '<título exato na Open Library>' }` | livros/mangás sem página na Wikipedia |

Depois de adicionar ou trocar um item, baixe as capas:

```bash
npm run fetch-assets           # baixa só o que falta
npm run fetch-assets -- --force   # baixa tudo de novo
```

O script confere se o resultado bate com o item (nome do álbum e artista no iTunes, título exato na Wikipedia e na Open Library). Se não achar com confiança, o item aparece com um card de placeholder ("SINAL PERDIDO"), e o script lista no final quais faltaram. As capas ficam em `public/covers/`, e os links das prévias e os anos ficam em `src/data/assets.json`. Os dois são gerados pelo script e commitados no repositório.

O `collectionId` de um álbum aparece na URL da Apple Music (`.../album/nome/1497364061`) ou em `https://itunes.apple.com/search?term=ARTISTA&entity=album`.

## Modelo 3D

O corpo é a malha base da MakeHuman (CC0). O script `npm run build-body` baixa a malha, converte para `public/models/body.glb` (comprimido com meshopt, ~170 KB) e extrai as posições das articulações para `src/data/joints.json`. O material holográfico é um shader próprio, em [`src/scene/holoMaterial.ts`](src/scene/holoMaterial.ts).

## Créditos e licenças

Veja [CREDITS.md](CREDITS.md).
