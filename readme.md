# Musetric Landing

The website of Musetric, [musetric.com](https://musetric.com): a React site that Vite builds and prerenders into one static HTML file per page of `src/app/routes.tsx`, served by Cloudflare Pages. The product itself is [musetric/musetric](https://github.com/musetric/musetric).

## Development

Node.js at the version in `.node-version`, and `jscpd` and `editorconfig-checker` on `PATH` at the versions `.github/actions/baseQuality` installs.

```sh
npm ci
npm run dev
```

The site runs at `http://localhost:3003`. `npm run build:project` builds it into `dist/`; the `check:*` scripts of `package.json` are the checks CI runs.

- Install with `npm ci`, as CI does, also after an update: `npm install` can keep a lockfile that `npm ci` refuses.
- ESLint and its plugins stay at the versions `@musetric/eslint-config` takes; they move when the monorepo publishes a new one.
- The demo of the home page (`src/pages/landing/tryIt`) runs `@musetric/ai` in a worker; the model comes from Hugging Face and the WebAssembly of `onnxruntime-web` from jsDelivr, at the version the lockfile pins. The `onnxruntime-web-use-extern-wasm` condition of `vite.config.ts` keeps that 26 MB module out of `dist/`, since Cloudflare serves no file above 25 MiB.

## Deploy

musetric.com is the Worker `musetric-landing` of `wrangler.jsonc`, which serves `dist/` as static assets. It is deployed by hand, with the Cloudflare account of `npx wrangler login`:

```sh
npm run deploy
```

## License

Source code is [MIT licensed](license.md). The Musetric name and logo are trademarks and are not covered by the MIT license — see [trademark.md](https://github.com/musetric/musetric/blob/main/trademark.md). Third-party notices are in [thirdPartyNotices.md](thirdPartyNotices.md).
