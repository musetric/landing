import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SiteFooter = () => {
  const { t } = useTranslation();

  return (
    <Box
      component='footer'
      sx={{ borderTop: 1, borderColor: 'divider', fontSize: 14 }}
    >
      <Container
        maxWidth='lg'
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 2.5,
          pt: 4.5,
          pb: 7,
        }}
      >
        <Typography color='textSecondary' sx={{ fontSize: 'inherit' }}>
          {t('site.footer.about')}
        </Typography>
        <Box
          component='nav'
          aria-label={t('site.footer.label')}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}
        >
          <Link
            href='https://github.com/musetric/musetric'
            color='textSecondary'
            underline='hover'
          >
            GitHub
          </Link>
          <Link href='/privacy' color='textSecondary' underline='hover'>
            {t('site.footer.privacy')}
          </Link>
          <Link href='/credits' color='textSecondary' underline='hover'>
            {t('site.footer.credits')}
          </Link>
          <Link href='/support' color='textSecondary' underline='hover'>
            {t('site.footer.support')}
          </Link>
          <Link
            href='mailto:musetric@gmail.com'
            color='textSecondary'
            underline='hover'
          >
            musetric@gmail.com
          </Link>
        </Box>
      </Container>
    </Box>
  );
};
