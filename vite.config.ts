import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';
import { favicons } from './scripts/faviconsPlugin.ts';
import { notices } from './scripts/noticesPlugin.ts';

const dspPackage = import.meta.resolve('@musetric/dsp/package.json');

const siteNotices = notices({
  fileName: 'notices.txt',
  head: new URL('./thirdPartyNotices.md', import.meta.url),
  tails: [
    new URL('thirdPartyNotices.md', dspPackage),
    new URL('notices/crates.md', dspPackage),
  ],
});

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    favicons({
      svgPath: fileURLToPath(new URL('./src/favicon.svg', import.meta.url)),
      socialPreviewPath: fileURLToPath(
        new URL('./src/socialPreview.svg', import.meta.url),
      ),
      name: 'Musetric',
    }),
    siteNotices.collect(),
    siteNotices.emit(),
  ],
  worker: {
    plugins: () => [siteNotices.collect()],
  },
  resolve: {
    conditions: [...defaultClientConditions, 'onnxruntime-web-use-extern-wasm'],
  },
  build: {
    target: 'es2022',
    assetsDir: '',
    rollupOptions: {
      input: {
        index: 'index.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3003,
    strictPort: true,
  },
});
