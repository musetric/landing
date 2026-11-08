import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const TeachersSection = () => {
  const { t } = useTranslation();
  const points = [
    {
      title: t('landing.teachers.key.title'),
      text: t('landing.teachers.key.text'),
    },
    {
      title: t('landing.teachers.line.title'),
      text: t('landing.teachers.line.text'),
    },
    {
      title: t('landing.teachers.home.title'),
      text: t('landing.teachers.home.text'),
    },
    {
      title: t('landing.teachers.class.title'),
      text: t('landing.teachers.class.text'),
    },
  ];

  return (
    <Box
      id='teachers'
      component='section'
      sx={{
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container
        maxWidth='lg'
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          alignItems: 'start',
          gap: 6,
          py: { xs: 9, md: 12 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: 'primary.main', fontSize: 15 }}>
            {t('landing.teachers.eyebrow')}
          </Typography>
          <Typography
            variant='h2'
            sx={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)' }}
          >
            {t('landing.teachers.title')}
          </Typography>
          <Typography color='textSecondary' sx={{ fontSize: 19 }}>
            {t('landing.teachers.lead')}
          </Typography>
          <Button
            href='mailto:musetric@gmail.com'
            variant='outlined'
            color='inherit'
            sx={{
              alignSelf: 'flex-start',
              minHeight: 48,
              px: 2.75,
              borderRadius: 999,
              borderColor: 'divider',
            }}
          >
            {t('landing.teachers.write')}
          </Button>
        </Box>
        <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {points.map((point) => (
            <Box
              component='li'
              key={point.title}
              sx={{ py: 2.25, borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 19 }}>
                {point.title}
              </Typography>
              <Typography color='textSecondary'>{point.text}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
