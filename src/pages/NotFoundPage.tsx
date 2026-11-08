import { Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SitePage } from '../app/SitePage.js';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <SitePage>
      <Container maxWidth='md' sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant='h1'
          sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1 }}
        >
          {t('notFound.title')}
        </Typography>
        <Typography color='textSecondary' sx={{ mt: 2 }}>
          {t('notFound.body')}
        </Typography>
        <Button href='/' variant='contained' sx={{ mt: 4 }}>
          {t('notFound.home')}
        </Button>
      </Container>
    </SitePage>
  );
};
