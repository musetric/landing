# Musetric Landing

Static landing for [musetric.com](https://musetric.com), served via Cloudflare Pages.

This is a standalone npm project extracted from the [Musetric monorepo](https://github.com/musetric/musetric).

## Requirements

- Node.js `26.2.0` (pinned via `.nvmrc`)

## Local development

```sh
npm install
npm run dev
```

Open `http://localhost:3003`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 3003 |
| `npm run build:project` | Production build into `dist/` |
| `npm run check:ts` | TypeScript checks |
| `npm run check:lint` | ESLint |
| `npm run fix:lint` | ESLint with autofix |
| `npm run check:translations` | Verify translation keys are extracted |
| `npm run fix:translations` | Extract translation keys |

## Build output

Static assets are produced in `dist/`. The Cloudflare Pages project is configured via `wrangler.jsonc` to deploy this directory.

## Deploy

Manual deploy via the Cloudflare dashboard or:

```sh
npx wrangler pages deploy ./dist --project-name=musetric-landing
```

## License

Source code is [MIT licensed](license.md). The Musetric name and logo are trademarks and are not covered by the MIT license — see [trademark.md](trademark.md). Third-party notices are in [thirdPartyNotices.md](thirdPartyNotices.md).

## Related

- [Musetric monorepo](https://github.com/musetric/musetric) — full source and development
- [musetric.com](https://musetric.com) — live site