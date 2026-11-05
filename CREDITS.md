# Créditos e licenças

## Modelo 3D do corpo

- **MakeHuman base mesh** (`makehuman/data/3dobjs/base.obj`), do projeto [MakeHuman](https://github.com/makehumancommunity/makehuman).
- **Licença: CC0 1.0 Universal.** O [LICENSE.md](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md) do projeto diz que *"the base mesh and proxies"* fazem parte dos assets lançados sob CC0 (texto completo em [LICENSE.ASSETS.md](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md)).
- Alterações: só o grupo `body` foi mantido, a malha foi convertida para GLB e comprimida com meshopt, e as posições das articulações foram extraídas dos grupos `joint-*` (ver `scripts/build-body.ts`). CC0 não exige atribuição. O rodapé da página dá o crédito mesmo assim.

## Capas e prévias

Capas de álbuns, jogos, filmes e livros pertencem aos respectivos artistas, gravadoras, estúdios e editoras. Elas são usadas aqui só para identificar os itens desta wishlist pessoal, sem fins comerciais. Fontes:

- **Álbuns:** [iTunes Search API](https://performance-partners.apple.com/search-api) (Apple). As prévias de 30s tocam direto do CDN da Apple, e nenhum áudio fica salvo no repositório.
- **Jogos:** CDN pública da Steam (Valve), arte de biblioteca de cada appid. *Demon's Souls* e *Bloodborne* vêm da Wikipedia.
- **Filmes e livros:** imagem principal das páginas da [Wikipedia](https://en.wikipedia.org) em inglês (arquivos de uso justo hospedados na Wikipedia).
- **Mangá de Elden Ring (vol. 3):** [Open Library Covers](https://openlibrary.org/dev/docs/api/covers).

## Fontes tipográficas

- [Rajdhani](https://fonts.google.com/specimen/Rajdhani), Indian Type Foundry, SIL Open Font License 1.1.
- [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono), Carrois Apostrophe, SIL Open Font License 1.1.

## Código e bibliotecas

three.js, React Three Fiber, drei, postprocessing (MIT) e GSAP (licença padrão "no charge" da GreenSock/Webflow). Os sons são sintetizados no navegador com a Web Audio API. Os ícones, o bacteriófago e todo o visual são originais deste projeto.
