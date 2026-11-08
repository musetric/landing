import { Box, Container, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { SitePage } from '../app/SitePage.js';

type LegalPageProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  updated: string;
};

export const LegalPage = (props: LegalPageProps) => {
  const { children, eyebrow, title, updated } = props;

  return (
    <SitePage>
      <Container maxWidth='md' sx={{ py: { xs: 5, md: 8 } }}>
        <Typography
          component='p'
          sx={{ mb: 2, color: 'primary.main', fontSize: 15 }}
        >
          {eyebrow}
        </Typography>
        <Typography
          variant='h1'
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>
        <Typography color='textSecondary' sx={{ mt: 2 }}>
          {updated}
        </Typography>
        <Stack sx={{ mt: 5, gap: 4 }}>{children}</Stack>
      </Container>
    </SitePage>
  );
};

type LegalSectionProps = {
  children: ReactNode;
  title: string;
};

export const LegalSection = (props: LegalSectionProps) => {
  const { children, title } = props;

  return (
    <Box>
      <Typography variant='h2' sx={{ mb: 1.5, fontSize: '1.45rem' }}>
        {title}
      </Typography>
      <Stack sx={{ gap: 1.5 }}>{children}</Stack>
    </Box>
  );
};
