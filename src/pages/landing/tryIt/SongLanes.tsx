import { Box, IconButton, Slider, SvgIcon, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type SongInfo,
  type SongPeaks,
  type StemKey,
  stemKeys,
} from './tryIt.cross.js';
import { waveformPath, waveformWidth } from './waveform.js';

const stemColors: Record<StemKey, string> = {
  lead: '#d6b85a',
  backing: '#96bee6',
  instrumental: '#b3a999',
};

const tickSteps = [30, 60, 120, 300, 600, 900, 1800, 3600];
const maxTicks = 7;
const narrow = '@container (max-width: 759px)';
const tiny = '@container (max-width: 519px)';

const timeOf = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes)}:${String(rest).padStart(2, '0')}`;
};

const ticksOf = (duration: number): number[] => {
  const step =
    tickSteps.find((candidate) => duration / candidate <= maxTicks) ??
    tickSteps[tickSteps.length - 1];
  return Array.from(
    { length: Math.floor(duration / step) + 1 },
    (_, index) => index * step,
  );
};

const percentOf = (seconds: number, duration: number): string =>
  `${String(Math.min(100, (seconds / duration) * 100))}%`;

type SongLanesProps = {
  song: SongInfo;
  peaks: SongPeaks | undefined;
  ready: number;
  position: number;
  working: boolean;
  mutes: Record<StemKey, boolean>;
  volumes: Record<StemKey, number>;
  onSeek: (seconds: number) => void;
  onVolume: (key: StemKey, volume: number) => void;
  onMute: (key: StemKey) => void;
};

export const SongLanes = (props: SongLanesProps) => {
  const { song, peaks, ready, position, working, mutes, volumes } = props;
  const { t } = useTranslation();
  const { duration } = song;
  const limit = song.frames / song.sampleRate;
  const readySeconds = ready / song.sampleRate;
  const scale = peaks ? Math.max(...peaks.original) : 0;
  const paths = useMemo(
    () =>
      peaks && {
        original: waveformPath(peaks.original, scale, 40),
        lead: waveformPath(peaks.stems.lead, scale, 64),
        backing: waveformPath(peaks.stems.backing, scale, 64),
        instrumental: waveformPath(peaks.stems.instrumental, scale, 64),
      },
    [peaks, scale],
  );
  const names: Record<StemKey, string> = {
    lead: t('landing.stems.lead'),
    backing: t('landing.stems.backing'),
    instrumental: t('landing.stems.instrumental'),
  };
  const rowSx = {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr)',
    alignItems: 'center',
    columnGap: 2.5,
    rowGap: 1,
    [narrow]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  };
  const seekSlider = (focusable: boolean) => (
    <Slider
      value={position}
      min={0}
      max={duration}
      step={1}
      onChange={(_, value) => {
        props.onSeek(value);
      }}
      aria-label={t('landing.try.position')}
      slotProps={{
        input: focusable ? {} : { tabIndex: -1, 'aria-hidden': true },
      }}
      sx={{
        position: 'absolute',
        inset: 0,
        height: '100%',
        p: 0,
        color: 'transparent',
        borderRadius: 0,
        '& .MuiSlider-rail, & .MuiSlider-track, & .MuiSlider-thumb': {
          opacity: 0,
        },
      }}
    />
  );
  const overlays = (height: number) => (
    <>
      <Box
        aria-hidden='true'
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: percentOf(readySeconds, duration),
          width: percentOf(Math.max(0, limit - readySeconds), duration),
          borderLeft: working ? '2px solid' : 'none',
          borderColor: 'primary.main',
          background:
            'repeating-linear-gradient(135deg, rgba(245, 239, 230, 0.05) 0 6px, rgba(245, 239, 230, 0) 6px 14px)',
        }}
      />
      {duration > limit && (
        <Box
          aria-hidden='true'
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: percentOf(limit, duration),
            right: 0,
            bgcolor: 'rgba(12, 11, 10, 0.7)',
            borderLeft: '1px dashed rgba(214, 184, 90, 0.6)',
          }}
        />
      )}
      <Box
        aria-hidden='true'
        sx={{
          position: 'absolute',
          top: -height,
          bottom: -height,
          left: percentOf(position, duration),
          width: 2,
          bgcolor: 'text.primary',
        }}
      />
      {seekSlider(false)}
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ ...rowSx, pb: 1.25 }}>
        <Typography color='textSecondary' sx={{ fontSize: 13 }}>
          {t('landing.try.original')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box
            aria-hidden='true'
            sx={{
              position: 'relative',
              height: 18,
              fontSize: 12,
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {ticksOf(duration).map((tick, index) => (
              <Box
                component='span'
                key={tick}
                sx={{
                  position: 'absolute',
                  left: percentOf(tick, duration),
                  transform: tick === 0 ? 'none' : 'translateX(-50%)',
                  [tiny]: { display: index % 2 === 1 ? 'none' : 'inline' },
                }}
              >
                {timeOf(tick)}
              </Box>
            ))}
          </Box>
          <Box sx={{ position: 'relative', height: 40 }}>
            <Box
              component='svg'
              viewBox={`0 0 ${String(waveformWidth)} 40`}
              preserveAspectRatio='none'
              aria-hidden='true'
              sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }}
            >
              {paths && <path d={paths.original} fill='#4a443c' />}
            </Box>
            {duration > limit && (
              <Typography
                aria-hidden='true'
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: percentOf(limit, duration),
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: 11,
                  lineHeight: 1.15,
                  color: 'primary.main',
                  bgcolor: 'rgba(12, 11, 10, 0.7)',
                  borderLeft: '1px dashed rgba(214, 184, 90, 0.7)',
                  overflow: 'hidden',
                }}
              >
                {t('landing.try.inApp')}
              </Typography>
            )}
            <Box
              aria-hidden='true'
              sx={{
                position: 'absolute',
                top: -4,
                bottom: -4,
                left: percentOf(position, duration),
                width: 2,
                bgcolor: 'text.primary',
              }}
            />
            {seekSlider(true)}
          </Box>
        </Box>
      </Box>
      {stemKeys.map((key) => (
        <Box
          key={key}
          sx={{ ...rowSx, py: 1.25, borderTop: 1, borderColor: 'divider' }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '44px minmax(0, 1fr)',
              gridTemplateAreas: '"mute name" "volume volume"',
              alignItems: 'center',
              columnGap: 1.25,
              rowGap: 0.5,
              [narrow]: {
                gridTemplateColumns: '44px max-content minmax(72px, 1fr)',
                gridTemplateAreas: '"mute name volume"',
                columnGap: 1.5,
              },
            }}
          >
            <IconButton
              onClick={() => {
                props.onMute(key);
              }}
              aria-pressed={mutes[key]}
              aria-label={
                mutes[key]
                  ? t('landing.try.unmute', { stem: names[key] })
                  : t('landing.try.mute', { stem: names[key] })
              }
              sx={{
                gridArea: 'mute',
                width: 44,
                height: 44,
                borderRadius: '12px',
                border: 1,
                borderColor: 'divider',
                color: mutes[key] ? 'text.disabled' : stemColors[key],
                bgcolor: mutes[key] ? 'background.default' : 'action.hover',
              }}
            >
              <SvgIcon fontSize='small'>
                <path
                  d='M4 9v6h4l5 4V5L8 9z'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinejoin='round'
                />
                <path
                  d={
                    mutes[key]
                      ? 'M17 10l4 4M21 10l-4 4'
                      : 'M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11'
                  }
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </SvgIcon>
            </IconButton>
            <Box
              sx={{
                gridArea: 'name',
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.2,
              }}
            >
              <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {names[key]}
              </Typography>
              <Typography color='textSecondary' sx={{ fontSize: 12 }}>
                {mutes[key]
                  ? t('landing.try.muted')
                  : `${String(volumes[key])}%`}
              </Typography>
            </Box>
            <Slider
              size='small'
              value={volumes[key]}
              min={0}
              max={100}
              onChange={(_, value) => {
                props.onVolume(key, value);
              }}
              aria-label={t('landing.try.volume', { stem: names[key] })}
              sx={{ gridArea: 'volume', color: stemColors[key] }}
            />
          </Box>
          <Box
            sx={{
              position: 'relative',
              height: 60,
              [narrow]: { height: 52 },
              [tiny]: { height: 44 },
            }}
          >
            <Box
              component='svg'
              viewBox={`0 0 ${String(waveformWidth)} 64`}
              preserveAspectRatio='none'
              aria-hidden='true'
              sx={{
                position: 'absolute',
                inset: 0,
                width: 1,
                height: 1,
                opacity: mutes[key] ? 0.22 : 0.35 + (0.65 * volumes[key]) / 100,
              }}
            >
              {paths && <path d={paths[key]} fill={stemColors[key]} />}
            </Box>
            {overlays(10)}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
