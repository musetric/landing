import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { displayFont } from '../../app/theme.js';
import { PitchLines } from './PitchLines.js';

export const VoiceFigure = () => {
  const { t } = useTranslation();

  return (
    <Container
      component='figure'
      maxWidth='lg'
      sx={{ m: '0 auto', pt: 3, pb: { xs: 8, md: 12 } }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.75,
          px: { xs: 2.5, md: 4 },
          pt: 4.5,
          pb: 3.5,
          borderRadius: 7,
          border: 1,
          borderColor: 'divider',
          background:
            'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(214, 184, 90, 0.16), rgba(12, 11, 10, 0) 70%), #141210',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 1.5,
            fontSize: 14,
            color: 'text.secondary',
          }}
        >
          <span>{t('landing.figure.position')}</span>
          <Box component='span' sx={{ display: 'flex', gap: 2.25 }}>
            <Box component='span' sx={{ color: 'primary.main' }}>
              {t('landing.figure.singer')}
            </Box>
            <Box component='span' sx={{ color: 'secondary.main' }}>
              {t('landing.figure.you')}
            </Box>
          </Box>
        </Box>
        <PitchLines height={220} />
        <Typography
          component='p'
          sx={{
            fontFamily: displayFont,
            fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
            textAlign: 'center',
          }}
        >
          {t('landing.figure.lyricBefore')}{' '}
          <Box
            component='span'
            sx={{
              px: 1,
              borderRadius: 2,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
            }}
          >
            {t('landing.figure.lyricWord')}
          </Box>{' '}
          <Box component='span' sx={{ color: 'text.disabled' }}>
            {t('landing.figure.lyricAfter')}
          </Box>
        </Typography>
        <Typography
          component='figcaption'
          color='textSecondary'
          sx={{ fontSize: 15, textAlign: 'center' }}
        >
          {t('landing.figure.caption')}
        </Typography>
      </Box>
    </Container>
  );
};
