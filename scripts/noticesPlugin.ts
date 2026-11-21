import { readdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { type Plugin } from 'vite';

const allowedLicenses = new Set([
  'MIT',
  'Apache-2.0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'Zlib',
  'MPL-2.0',
  'CC0-1.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'OFL-1.1',
]);

const isAllowed = (expression: string): boolean =>
  expression
    .replace(/[()]/g, '')
    .split(' OR ')
    .some((term) =>
      term.split(' AND ').every((id) => allowedLicenses.has(id.trim())),
    );

const modulesDir = '/node_modules/';

const packageRoot = (id: string): string | undefined => {
  const [path = ''] = id.replaceAll('\\', '/').split('?');
  const at = path.lastIndexOf(modulesDir);
  if (at < 0) {
    return undefined;
  }
  const parts = path.slice(at + modulesDir.length).split('/');
  const size = parts[0]?.startsWith('@') ? 2 : 1;
  return [
    path.slice(0, at + modulesDir.length - 1),
    ...parts.slice(0, size),
  ].join('/');
};

const readText = (url: URL): string =>
  readFileSync(url, 'utf8').replace(/\r\n?/g, '\n').trim();

const manifestField = (manifest: unknown, key: string): unknown => {
  if (typeof manifest !== 'object' || !manifest) {
    return undefined;
  }
  return Object.entries(manifest).find((entry) => entry[0] === key)?.[1];
};

const manifestText = (manifest: unknown, key: string): string => {
  const value = manifestField(manifest, key);
  if (typeof value === 'string') {
    return value;
  }
  const url = manifestField(value, 'url');
  return typeof url === 'string' ? url : 'not given';
};

type Notice = {
  name: string;
  version: string;
  license: string;
  source: string;
  texts: string[];
};

const readNotice = (root: string): Notice => {
  const rootUrl = pathToFileURL(`${root}/`);
  const manifest: unknown = JSON.parse(
    readText(new URL('package.json', rootUrl)),
  );
  const files = readdirSync(rootUrl, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && /^(licen[cs]e|notice)/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .toSorted((left, right) => left.localeCompare(right, 'en'));
  const notice = {
    name: manifestText(manifest, 'name'),
    version: manifestText(manifest, 'version'),
    license: manifestText(manifest, 'license'),
    source: manifestText(manifest, 'repository'),
    texts: files.map((file) => readText(new URL(file, rootUrl))),
  };
  if (!isAllowed(notice.license)) {
    throw new Error(
      `${notice.name} ${notice.version} is under ${notice.license}, which is not among the licenses the site accepts`,
    );
  }
  return notice;
};

const fence = (text: string): string => ['````text', text, '````'].join('\n');

const renderNotice = (notice: Notice): string =>
  [
    `## ${notice.name} ${notice.version}`,
    [`- License: ${notice.license}`, `- Source: ${notice.source}`].join('\n'),
    ...(notice.texts.length > 0
      ? notice.texts.map(fence)
      : [fence('The package ships no license file.')]),
  ].join('\n\n');

const renderPackages = (notices: Notice[]): string =>
  [
    '# Notices of packages',
    'The npm packages whose code, styles or fonts the build bundles into the pages and the workers of the site, each under the license given for it.',
    ...notices
      .toSorted((left, right) =>
        `${left.name}@${left.version}`.localeCompare(
          `${right.name}@${right.version}`,
          'en',
        ),
      )
      .map(renderNotice),
  ].join('\n\n');

type NoticesOptions = {
  fileName: string;
  head: URL;
  tails: URL[];
};

export const notices = (options: NoticesOptions) => {
  const roots = new Set<string>();
  const collect = (): Plugin => {
    const build = { root: process.cwd() };
    return {
      name: 'musetric-notices-packages',
      apply: 'build',
      configResolved: (config) => {
        build.root = config.root;
      },
      generateBundle: (_outputOptions, bundle) => {
        const ids = Object.values(bundle).flatMap((output) =>
          output.type === 'chunk'
            ? Object.entries(output.modules)
                .filter((entry) => entry[1].renderedLength > 0)
                .map((entry) => entry[0])
            : output.originalFileNames,
        );
        for (const id of ids) {
          const root = packageRoot(resolve(build.root, id.replace(/^\0/, '')));
          if (root) {
            roots.add(root);
          }
        }
      },
    };
  };
  const emit = (): Plugin => ({
    name: 'musetric-notices',
    apply: (_config, env) => env.command === 'build' && !env.isSsrBuild,
    writeBundle: async (bundleOptions) => {
      const parts = [
        readText(options.head),
        renderPackages([...roots].map(readNotice)),
        ...options.tails.map(readText),
      ];
      await writeFile(
        join(bundleOptions.dir ?? 'dist', options.fileName),
        `${parts.join('\n\n')}\n`,
      );
    },
  });
  return { collect, emit };
};
