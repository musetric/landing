import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { displayFont } from '../../app/theme.js';
import { PitchLines } from './PitchLines.js';
import {
  backingWave,
  instrumentalWave,
  leadWave,
  waveBox,
} from './voiceLines.js';

const raisedSx = { borderRadius: 3.5, bgcolor: 'action.hover' };

export const SongVisual = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box
        sx={{ ...raisedSx, display: 'flex', flexDirection: 'column', p: 1.75 }}
      >
        <Box component='span' sx={{ fontWeight: 600 }}>
          {t('landing.visual.song.phone')}
        </Box>
        <Box component='span' sx={{ fontSize: 14, color: 'text.secondary' }}>
          {t('landing.visual.song.formats')}
        </Box>
      </Box>
      <Box
        sx={{
          p: 1.75,
          borderRadius: 3.5,
          border: '1px dashed',
          borderColor: 'divider',
          color: 'text.secondary',
        }}
      >
        {t('landing.visual.song.computer')}
      </Box>
    </Box>
  );
};

export const StemsVisual = () => {
  const { t } = useTranslation();
  const stems = [
    { name: t('landing.stems.lead'), path: leadWave, color: '#d6b85a' },
    { name: t('landing.stems.backing'), path: backingWave, color: '#96bee6' },
    {
      name: t('landing.stems.instrumental'),
      path: instrumentalWave,
      color: '#7d766b',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 1.25,
        fontSize: 14,
        color: 'text.secondary',
      }}
    >
      {stems.map((stem) => (
        <Box key={stem.name} sx={{ display: 'contents' }}>
          <span>{stem.name}</span>
          <Box
            component='svg'
            viewBox={waveBox}
            preserveAspectRatio='none'
            aria-hidden='true'
            sx={{ display: 'block', width: '100%', height: 40 }}
          >
            <path d={stem.path} fill={stem.color} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const FitVisual = () => {
  const { t } = useTranslation();
  const controls = [
    { name: t('landing.visual.fit.key'), value: '−2' },
    { name: t('landing.visual.fit.tempo'), value: '80%' },
    { name: t('landing.visual.fit.octave'), value: '−1' },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 1.25,
        textAlign: 'center',
      }}
    >
      {controls.map((control) => (
        <Box key={control.name} sx={{ ...raisedSx, py: 2, px: 1 }}>
          <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
            {control.name}
          </Box>
          <Box sx={{ fontFamily: displayFont, fontSize: 30 }}>
            {control.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const LineVisual = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography sx={{ color: 'text.disabled' }}>
        {t('landing.visual.line.previous')}
      </Typography>
      <Typography sx={{ ...raisedSx, px: 1.5, py: 1.25 }}>
        {t('landing.visual.line.current')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, fontSize: 14 }}>
        <Box component='span' sx={{ ...raisedSx, px: 1.25, py: 0.5 }}>
          {t('landing.visual.line.try1')}
        </Box>
        <Box component='span' sx={{ ...raisedSx, px: 1.25, py: 0.5 }}>
          {t('landing.visual.line.try2')}
        </Box>
        <Box
          component='span'
          sx={{
            ...raisedSx,
            px: 1.25,
            py: 0.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {t('landing.visual.line.try3')}
        </Box>
      </Box>
    </Box>
  );
};

export const CompareVisual = () => <PitchLines height={150} />;
