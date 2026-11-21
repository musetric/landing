# Musetric Landing

The website of Musetric, musetric.com: a React site that Vite builds and prerenders into one static HTML file per route, served as the static assets of a Cloudflare Worker. The rules of the organization are in [headquarters](https://github.com/musetric/headquarters/blob/main/AGENTS.md#map) and are not repeated here; [readme.md](readme.md) says how to run and deploy the site.

## Map

- `src/app`: the shell of every page: `routes.tsx`, the header, the footer and the theme.
- `src/pages`: one component per route; `src/pages/landing` holds the sections of the home page.
- `src/pages/landing/tryIt`: the demo, which decodes the visitor's song with `@musetric/dsp` and takes it apart with `@musetric/ai`, in a worker.
- `src/translations`: the texts of the site, which `npm run fix:translations` extracts from the code.
- `scripts`: the prerender, and the favicons and notices plugins of Vite.
- `public`: the files served as they are; `wrangler.jsonc`: the Worker.
- `tsconfig.*.json`: the runtime boundaries, chosen by the suffix of a file: `.cross.ts`, `.worker.ts`, `.worklet.ts`, and none for the page.

## Rules

- Install with `npm ci`, as CI does.
- Musetric's packages come from npm at the versions `package.json` pins: what the site needs of one changes in `musetric/musetric` and is published there first.

## Before finishing

Run `npm run fix:format`, `npm run fix:lint` and `npm run fix:translations`, then the checks CI runs: `check:deps:security`, `check:unused`, `check:ts`, `check:english`, `check:notices`, `check:links`, `check:comments`, `check:deps` and `build:project`, and `check:dupe` and `check:editorconfig` through the global `jscpd` and `editorconfig-checker`.
