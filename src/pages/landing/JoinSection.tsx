import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DownloadButton } from '../../app/DownloadButton.js';

export const JoinSection = () => {
  const { t } = useTranslation();

  return (
    <Container
      id='join'
      component='section'
      maxWidth='lg'
      sx={{ pb: { xs: 9, md: 12 } }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
          px: { xs: 2, sm: 4 },
          py: 7,
          borderRadius: 7,
          border: 1,
          borderColor: 'divider',
          textAlign: 'center',
          background:
            'radial-gradient(ellipse 70% 90% at 50% 100%, rgba(214, 184, 90, 0.18), rgba(12, 11, 10, 0) 70%), #141210',
        }}
      >
        <Typography
          variant='h2'
          sx={{ fontSize: 'clamp(2.25rem, 4.6vw, 3.75rem)' }}
        >
          {t('landing.join.title')}
        </Typography>
        <Typography color='textSecondary' sx={{ maxWidth: 620, fontSize: 19 }}>
          {t('landing.join.lead')}
        </Typography>
        <DownloadButton />
      </Box>
    </Container>
  );
};
