import { t } from 'i18next';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './app/App.js';
import { notFoundRoute, type SiteRoute, siteRoutes } from './app/routes.js';
import { initI18next } from './translations/index.js';

const siteOrigin = 'https://musetric.com';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', name: 'Musetric', url: `${siteOrigin}/` },
    {
      '@type': 'Organization',
      name: 'Musetric',
      url: `${siteOrigin}/`,
      logo: `${siteOrigin}/web-app-manifest-512x512.png`,
      email: 'musetric@gmail.com',
      sameAs: [
        'https://github.com/musetric',
        'https://huggingface.co/musetric',
      ],
    },
  ],
};

const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const renderHead = (route: SiteRoute, indexed: boolean): string => {
  const { title, description } = route.head(t);
  const url = `${siteOrigin}${route.path}`;
  const shared = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Musetric" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${siteOrigin}/socialPreview.png" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeHtml(t('meta.image.alt'))}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ];
  const location = indexed
    ? [
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:url" content="${url}" />`,
      ]
    : ['<meta name="robots" content="noindex" />'];
  const data =
    route.path === '/'
      ? [
          `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
        ]
      : [];
  return [...shared, ...location, ...data].join('\n    ');
};

export type StaticPage = {
  file: string;
  head: string;
  body: string;
};

const renderPage = (route: SiteRoute, indexed: boolean): StaticPage => ({
  file: route.file,
  head: renderHead(route, indexed),
  body: renderToString(
    <StrictMode>
      <App pathname={route.path} />
    </StrictMode>,
  ),
});

await initI18next();

export const staticPages: StaticPage[] = [
  ...siteRoutes.map((route) => renderPage(route, true)),
  renderPage(notFoundRoute, false),
];

export const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...siteRoutes.map(
    (route) => `  <url>\n    <loc>${siteOrigin}${route.path}</loc>\n  </url>`,
  ),
  '</urlset>',
  '',
].join('\n');
