import { Box, Container, Typography } from '@mui/material';
import { type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { displayFont } from '../../app/theme.js';
import {
  CompareVisual,
  FitVisual,
  LineVisual,
  SongVisual,
  StemsVisual,
} from './StepVisuals.js';

type Step = {
  number: string;
  title: string;
  text: string;
  visual: ComponentType;
};

export const StepsSection = () => {
  const { t } = useTranslation();
  const steps: Step[] = [
    {
      number: t('landing.steps.song.number'),
      title: t('landing.steps.song.title'),
      text: t('landing.steps.song.text'),
      visual: SongVisual,
    },
    {
      number: t('landing.steps.stems.number'),
      title: t('landing.steps.stems.title'),
      text: t('landing.steps.stems.text'),
      visual: StemsVisual,
    },
    {
      number: t('landing.steps.fit.number'),
      title: t('landing.steps.fit.title'),
      text: t('landing.steps.fit.text'),
      visual: FitVisual,
    },
    {
      number: t('landing.steps.line.number'),
      title: t('landing.steps.line.title'),
      text: t('landing.steps.line.text'),
      visual: LineVisual,
    },
    {
      number: t('landing.steps.compare.number'),
      title: t('landing.steps.compare.title'),
      text: t('landing.steps.compare.text'),
      visual: CompareVisual,
    },
  ];

  return (
    <Container
      id='how'
      component='section'
      maxWidth='lg'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 7, md: 9 },
        pb: { xs: 9, md: 12 },
      }}
    >
      <Typography
        variant='h2'
        sx={{ fontSize: 'clamp(2.25rem, 4.6vw, 3.75rem)', textAlign: 'center' }}
      >
        {t('landing.steps.title')}
      </Typography>
      {steps.map((step) => (
        <Box
          key={step.title}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box
              component='span'
              sx={{
                fontFamily: displayFont,
                fontStyle: 'italic',
                fontSize: 22,
                color: 'primary.main',
              }}
            >
              {step.number}
            </Box>
            <Typography variant='h3' sx={{ fontSize: 36 }}>
              {step.title}
            </Typography>
            <Typography color='textSecondary' sx={{ fontSize: 19 }}>
              {step.text}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 180,
              p: 3,
              borderRadius: 5.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <step.visual />
          </Box>
        </Box>
      ))}
    </Container>
  );
};
