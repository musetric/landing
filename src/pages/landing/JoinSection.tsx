import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { platforms, useDevice } from '../../app/device.js';
import { useInstalls } from '../../app/install.js';
import { InstallButton } from '../../app/InstallButton.js';

export const JoinSection = () => {
  const { t } = useTranslation();
  const device = useDevice();
  const installs = useInstalls();

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
          px: 4,
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
        <InstallButton install={installs[device]} />
        <Box component='details' sx={{ color: 'text.secondary' }}>
          <Box component='summary' sx={{ cursor: 'pointer', fontSize: 15 }}>
            {t('landing.otherDevices')}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.25,
              mt: 2,
            }}
          >
            {platforms.map((platform) => (
              <Button
                key={platform}
                href={installs[platform].href}
                variant='outlined'
                color='inherit'
                sx={{
                  flexDirection: 'column',
                  borderRadius: 4,
                  borderColor: 'divider',
                }}
              >
                <span>{installs[platform].label}</span>
                <Box component='span' sx={{ fontSize: 12, fontWeight: 400 }}>
                  {installs[platform].note}
                </Box>
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
