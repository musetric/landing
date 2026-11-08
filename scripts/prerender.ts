import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const clientDir = 'dist';
const serverDir = 'dist-ssr';
const headSlot = '<title>Musetric</title>';
const bodySlot = '<div id="root"></div>';

type StaticPage = {
  file: string;
  head: string;
  body: string;
};

const toStaticPage = (rawPage: unknown): StaticPage => {
  if (
    rawPage instanceof Object &&
    'file' in rawPage &&
    typeof rawPage.file === 'string' &&
    'head' in rawPage &&
    typeof rawPage.head === 'string' &&
    'body' in rawPage &&
    typeof rawPage.body === 'string'
  ) {
    return { file: rawPage.file, head: rawPage.head, body: rawPage.body };
  }
  throw new Error('A page of the server build has no file, head or body');
};

type ServerModule = {
  staticPages: StaticPage[];
  sitemap: string;
};

const loadServer = async (): Promise<ServerModule> => {
  const rawModule: unknown = await import(
    pathToFileURL(join(serverDir, 'staticPage.js')).href
  );
  const rawServer = { ...(rawModule ?? {}) };
  if (
    'staticPages' in rawServer &&
    Array.isArray(rawServer.staticPages) &&
    'sitemap' in rawServer &&
    typeof rawServer.sitemap === 'string'
  ) {
    return {
      staticPages: rawServer.staticPages.map(toStaticPage),
      sitemap: rawServer.sitemap,
    };
  }
  throw new Error('The server build exports no staticPages or sitemap');
};

const fillTemplate = (template: string, page: StaticPage): string => {
  if (!template.includes(headSlot) || !template.includes(bodySlot)) {
    throw new Error('index.html has lost its head or body slot');
  }
  return template
    .replace(headSlot, page.head)
    .replace(bodySlot, `<div id="root">${page.body}</div>`);
};

const server = await loadServer();
const template = await readFile(join(clientDir, 'index.html'), 'utf8');
const writes = server.staticPages.map(async (page) => {
  await writeFile(join(clientDir, page.file), fillTemplate(template, page));
});
await Promise.all([
  ...writes,
  writeFile(join(clientDir, 'sitemap.xml'), server.sitemap),
]);
await rm(serverDir, { recursive: true });
