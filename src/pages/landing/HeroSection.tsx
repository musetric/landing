import { Box, Button, Container, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDevice } from '../../app/device.js';
import { useInstalls } from '../../app/install.js';
import { InstallButton } from '../../app/InstallButton.js';

export const HeroSection = () => {
  const { t } = useTranslation();
  const device = useDevice();
  const installs = useInstalls();

  return (
    <Container
      component='section'
      maxWidth='lg'
      aria-labelledby='heroTitle'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        pt: { xs: 6, md: 8 },
        pb: 4,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ color: 'primary.main', fontSize: 15 }}>
        {t('landing.hero.eyebrow')}
      </Typography>
      <Typography
        id='heroTitle'
        variant='h1'
        sx={{
          maxWidth: 980,
          fontSize: 'clamp(2.9rem, 7vw, 6rem)',
          textWrap: 'balance',
        }}
      >
        {t('landing.hero.title')}{' '}
        <Box component='em' sx={{ color: 'primary.main' }}>
          {t('landing.hero.titleAccent')}
        </Box>
      </Typography>
      <Typography
        color='textSecondary'
        sx={{ maxWidth: 680, fontSize: { xs: 18, md: 20 }, textWrap: 'pretty' }}
      >
        {t('landing.hero.lead')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <InstallButton install={installs[device]} />
        <Button
          href='#how'
          variant='outlined'
          color='inherit'
          sx={{
            minHeight: 62,
            px: 3.5,
            borderRadius: 5,
            borderColor: 'divider',
          }}
        >
          {t('landing.hero.how')}
        </Button>
      </Box>
      <Typography color='textSecondary' sx={{ fontSize: 15 }}>
        {t('landing.hero.included')} ·{' '}
        <Link href='#join' color='textPrimary'>
          {t('landing.otherDevices')}
        </Link>
      </Typography>
    </Container>
  );
};
