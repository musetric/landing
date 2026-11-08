import { type TFunction } from 'i18next';
import { type ComponentType } from 'react';
import { LandingPage } from '../pages/landing/LandingPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { PrivacyPage } from '../pages/PrivacyPage.js';
import { SupportPage } from '../pages/SupportPage.js';

export type RouteHead = {
  title: string;
  description: string;
};

export type SiteRoute = {
  path: string;
  file: string;
  page: ComponentType;
  head: (t: TFunction) => RouteHead;
};

export const siteRoutes: SiteRoute[] = [
  {
    path: '/',
    file: 'index.html',
    page: LandingPage,
    head: (t) => ({
      title: t('meta.landing.title'),
      description: t('meta.landing.description'),
    }),
  },
  {
    path: '/privacy',
    file: 'privacy.html',
    page: PrivacyPage,
    head: (t) => ({
      title: t('meta.privacy.title'),
      description: t('meta.privacy.description'),
    }),
  },
  {
    path: '/support',
    file: 'support.html',
    page: SupportPage,
    head: (t) => ({
      title: t('meta.support.title'),
      description: t('meta.support.description'),
    }),
  },
];

export const notFoundRoute: SiteRoute = {
  path: '/404',
  file: '404.html',
  page: NotFoundPage,
  head: (t) => ({
    title: t('meta.notFound.title'),
    description: t('meta.notFound.description'),
  }),
};

export const findRoute = (pathname: string): SiteRoute =>
  siteRoutes.find((route) => route.path === pathname) ?? notFoundRoute;
