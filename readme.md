# Musetric Landing

The website of Musetric, [musetric.com](https://musetric.com): a static React site built with Vite and served by Cloudflare Pages. The product itself is [musetric/musetric](https://github.com/musetric/musetric).

## Development

Node.js at the version in `.node-version`, and `jscpd` and `editorconfig-checker` on `PATH` at the versions `.github/actions/baseQuality` installs.

```sh
npm install
npm run dev
```

The site runs at `http://localhost:3003`. `npm run build:project` builds it into `dist/`; the `check:*` scripts of `package.json` are the checks CI runs.

## Deploy

`dist/` is deployed by hand to the Cloudflare Pages project of `wrangler.jsonc`, from the dashboard or with:

```sh
npx wrangler pages deploy ./dist --project-name=musetric-landing
```

## License

Source code is [MIT licensed](license.md). The Musetric name and logo are trademarks and are not covered by the MIT license — see [trademark.md](trademark.md). Third-party notices are in [thirdPartyNotices.md](thirdPartyNotices.md).
