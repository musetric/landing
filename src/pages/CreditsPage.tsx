import { Link, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { LegalPage, LegalSection } from './LegalPage.js';

export const CreditsPage = () => {
  const { t } = useTranslation();

  return (
    <LegalPage
      eyebrow={t('credits.eyebrow')}
      title={t('credits.title')}
      updated={t('credits.updated')}
    >
      <LegalSection title={t('credits.intro.title')}>
        <Typography color='textSecondary'>{t('credits.intro.body')}</Typography>
      </LegalSection>
      <LegalSection title={t('credits.separation.title')}>
        <Typography color='textSecondary'>
          <Trans
            i18nKey='credits.separation.model'
            components={{
              model: (
                <Link href='https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student' />
              ),
            }}
          />
        </Typography>
        <Typography color='textSecondary'>
          <Trans
            i18nKey='credits.separation.teachers'
            components={{
              duality: (
                <Link href='https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality' />
              ),
              uvr: (
                <Link href='https://github.com/Anjok07/ultimatevocalremovergui' />
              ),
            }}
          />
        </Typography>
      </LegalSection>
      <LegalSection title={t('credits.browser.title')}>
        <Typography color='textSecondary'>
          <Trans
            i18nKey='credits.browser.body'
            components={{
              runtime: <Link href='https://github.com/microsoft/onnxruntime' />,
            }}
          />
        </Typography>
      </LegalSection>
      <LegalSection title={t('credits.fonts.title')}>
        <Typography color='textSecondary'>{t('credits.fonts.body')}</Typography>
      </LegalSection>
      <LegalSection title={t('credits.more.title')}>
        <Typography color='textSecondary'>
          <Trans
            i18nKey='credits.more.body'
            components={{
              notices: (
                <Link href='https://github.com/musetric/musetric/blob/main/thirdPartyNotices.md' />
              ),
            }}
          />
        </Typography>
      </LegalSection>
    </LegalPage>
  );
};
