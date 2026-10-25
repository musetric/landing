import { Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LegalPage, LegalSection } from './LegalPage.js';

export const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <LegalPage
      eyebrow={t('privacy.eyebrow')}
      title={t('privacy.title')}
      updated={t('privacy.updated')}
    >
      <LegalSection title={t('privacy.overview.title')}>
        <Typography color='textSecondary'>
          {t('privacy.overview.body')}
        </Typography>
      </LegalSection>
      <LegalSection title={t('privacy.data.title')}>
        <Typography color='textSecondary'>{t('privacy.data.audio')}</Typography>
        <Typography color='textSecondary'>
          {t('privacy.data.project')}
        </Typography>
        <Typography color='textSecondary'>
          {t('privacy.data.contact')}
        </Typography>
        <Typography color='textSecondary'>
          {t('privacy.data.technical')}
        </Typography>
      </LegalSection>
      <LegalSection title={t('privacy.use.title')}>
        <Typography color='textSecondary'>{t('privacy.use.body')}</Typography>
      </LegalSection>
      <LegalSection title={t('privacy.sharing.title')}>
        <Typography color='textSecondary'>
          {t('privacy.sharing.body')}
        </Typography>
      </LegalSection>
      <LegalSection title={t('privacy.security.title')}>
        <Typography color='textSecondary'>
          {t('privacy.security.body')}
        </Typography>
      </LegalSection>
      <LegalSection title={t('privacy.contact.title')}>
        <Typography color='textSecondary'>
          {t('privacy.contact.body')}{' '}
          <Link href='mailto:musetric@gmail.com'>musetric@gmail.com</Link>.
        </Typography>
      </LegalSection>
    </LegalPage>
  );
};
