import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const PromisesSection = () => {
  const { t } = useTranslation();

  return (
    <Container
      component='section'
      maxWidth='lg'
      aria-label={t('landing.promises.label')}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 5,
        py: { xs: 9, md: 12 },
      }}
    >
      <Box>
        <Typography variant='h3' sx={{ fontSize: 30, mb: 1 }}>
          {t('landing.promises.everything.title')}
        </Typography>
        <Typography color='textSecondary'>
          {t('landing.promises.everything.text')}
        </Typography>
      </Box>
      <Box>
        <Typography variant='h3' sx={{ fontSize: 30, mb: 1 }}>
          {t('landing.promises.voice.title')}
        </Typography>
        <Typography color='textSecondary'>
          {t('landing.promises.voice.text')}
        </Typography>
      </Box>
      <Box>
        <Typography variant='h3' sx={{ fontSize: 30, mb: 1 }}>
          {t('landing.promises.open.title')}
        </Typography>
        <Typography color='textSecondary'>
          {t('landing.promises.open.text')}{' '}
          <Link href='https://github.com/musetric/musetric' color='textPrimary'>
            {t('landing.promises.open.link')}
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
