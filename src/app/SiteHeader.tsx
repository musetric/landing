import { Box, Button, Container, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logo from '../favicon.svg';
import { displayFont } from './theme.js';

export const SiteHeader = () => {
  const { t } = useTranslation();

  return (
    <Container
      component='header'
      maxWidth='lg'
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2.5,
      }}
    >
      <Link
        href='/'
        underline='none'
        color='textPrimary'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          fontFamily: displayFont,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        <Box
          component='img'
          src={logo}
          alt=''
          sx={{ width: 32, height: 32, borderRadius: 1.5 }}
        />
        Musetric
      </Link>
      <Box
        component='nav'
        aria-label={t('site.nav.label')}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 3,
          fontSize: 15,
        }}
      >
        <Link
          href='/#how'
          underline='hover'
          color='textSecondary'
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {t('site.nav.how')}
        </Link>
        <Link
          href='/#teachers'
          underline='hover'
          color='textSecondary'
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {t('site.nav.teachers')}
        </Link>
        <Link
          href='/#faq'
          underline='hover'
          color='textSecondary'
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {t('site.nav.faq')}
        </Link>
        <Button
          href='/#join'
          variant='outlined'
          sx={{ borderRadius: 999, minHeight: 44, px: 2.25 }}
        >
          {t('download.soon.short')}
        </Button>
      </Box>
    </Container>
  );
};
