import { Box } from '@mui/material';
import { type ReactNode } from 'react';
import { SiteFooter } from './SiteFooter.js';
import { SiteHeader } from './SiteHeader.js';

type SitePageProps = {
  children: ReactNode;
};

export const SitePage = (props: SitePageProps) => {
  const { children } = props;

  return (
    <>
      <SiteHeader />
      <Box component='main'>{children}</Box>
      <SiteFooter />
    </>
  );
};
