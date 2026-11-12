import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  SvgIcon,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SongLanes } from './SongLanes.js';
import { type SongInfo } from './tryIt.cross.js';
import { type TryIt, type TryItState } from './tryItClient.js';

const timeOf = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes)}:${String(rest).padStart(2, '0')}`;
};

const progressOf = (
  state: TryItState,
  limit: number,
  readySeconds: number,
): number | undefined => {
  if (state.screen === 'loading') {
    return state.total > 0 ? (state.loaded / state.total) * 100 : 0;
  }
  if (state.screen === 'separating') {
    return Math.min(100, (readySeconds / limit) * 100);
  }
  return undefined;
};

type SongWorkProps = {
  song: SongInfo;
  state: TryItState;
  tryIt: TryIt | undefined;
  anotherSong: ReactNode;
};

export const SongWork = (props: SongWorkProps) => {
  const { song, state, tryIt, anotherSong } = props;
  const { t } = useTranslation();
  const limit = song.frames / song.sampleRate;
  const readySeconds = state.ready / song.sampleRate;
  const done = state.screen === 'done';
  const progress = progressOf(state, limit, readySeconds);
  const statusOf: Record<TryItState['screen'], string> = {
    checking: t('landing.try.status.preparing'),
    unsupported: t('landing.try.status.preparing'),
    choose: t('landing.try.status.preparing'),
    waiting: t('landing.try.status.preparing'),
    failed: t('landing.try.status.preparing'),
    preparing: t('landing.try.status.preparing'),
    loading: t('landing.try.status.loading'),
    building: t('landing.try.status.building'),
    separating: t('landing.try.status.separating', {
      ready: timeOf(readySeconds),
      limit: timeOf(limit),
    }),
    done:
      song.duration > limit
        ? t('landing.try.status.donePart', { limit: timeOf(limit) })
        : t('landing.try.status.done'),
  };
  const zoneOf = (): string => {
    if (state.position < readySeconds) {
      return t('landing.try.zone.mixer');
    }
    if (state.position < limit) {
      return t('landing.try.zone.waiting');
    }
    return t('landing.try.zone.beyond', { limit: timeOf(limit) });
  };
  const playLabel = state.playing
    ? t('landing.try.pause')
    : t('landing.try.play');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.25,
          '@container (max-width: 599px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 18,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {song.name}
          </Typography>
          <Typography color='textSecondary' sx={{ fontSize: 14 }}>
            {timeOf(song.duration)}
          </Typography>
        </Box>
        <Typography
          color='textSecondary'
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.75,
            py: 0.75,
            borderRadius: 999,
            bgcolor: 'action.hover',
            fontSize: 14,
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {done ? (
            <Box
              component='span'
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
              }}
            />
          ) : (
            <CircularProgress size={12} thickness={6} aria-hidden />
          )}
          {statusOf[state.screen]}
        </Typography>
      </Box>
      <LinearProgress
        variant={progress === undefined ? 'indeterminate' : 'determinate'}
        value={progress}
        aria-label={statusOf[state.screen]}
        aria-hidden={done}
        sx={{ visibility: done ? 'hidden' : 'visible' }}
      />
      <SongLanes
        song={song}
        peaks={state.peaks}
        ready={state.ready}
        position={state.position}
        working={!done}
        mutes={state.mutes}
        volumes={state.volumes}
        onSeek={(seconds) => {
          tryIt?.seek(seconds);
        }}
        onVolume={(key, volume) => {
          tryIt?.setVolume(key, volume);
        }}
        onMute={(key) => {
          tryIt?.toggleMute(key);
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          rowGap: 1.5,
        }}
      >
        <IconButton
          onClick={() => {
            tryIt?.togglePlay();
          }}
          aria-label={playLabel}
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'text.primary',
            color: 'background.default',
            '&:hover': { bgcolor: 'text.secondary' },
          }}
        >
          <SvgIcon>
            <path
              d={state.playing ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M8 5v14l11-7z'}
            />
          </SvgIcon>
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 200px',
            minWidth: 0,
          }}
        >
          <Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {timeOf(state.position)} / {timeOf(song.duration)}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color:
                state.position < readySeconds
                  ? 'text.secondary'
                  : 'primary.main',
            }}
          >
            {zoneOf()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          <Button
            variant='contained'
            disabled={!done}
            onClick={() => {
              tryIt?.download();
            }}
            startIcon={
              <SvgIcon>
                <path
                  d='M12 4v11M7 10l5 5 5-5M5 20h14'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </SvgIcon>
            }
            sx={{ minHeight: 44, px: 2.25, borderRadius: 999 }}
          >
            {t('landing.try.download')}
          </Button>
          {anotherSong}
          {done && (
            <Button
              color='inherit'
              onClick={() => {
                tryIt?.remove();
              }}
              sx={{ minHeight: 44, px: 2, borderRadius: 999 }}
            >
              {t('landing.try.remove')}
            </Button>
          )}
        </Box>
      </Box>
      <Typography
        color='textSecondary'
        sx={{
          px: 2,
          py: 1.75,
          borderRadius: '16px',
          border: 1,
          borderColor:
            state.position >= limit && song.duration > limit
              ? 'primary.main'
              : 'divider',
          bgcolor: 'rgba(245, 239, 230, 0.03)',
          fontSize: 15,
        }}
      >
        {t('landing.try.app')}
      </Typography>
    </Box>
  );
};
