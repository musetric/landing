import { Box, Button, Container, Typography } from '@mui/material';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { displayFont } from '../../../app/theme.js';
import { ChooseSong } from './ChooseSong.js';
import { SongWork } from './SongWork.js';
import {
  createTryIt,
  initialTryItState,
  type TryIt,
  type TryItState,
} from './tryItClient.js';

const visibleMargin = '600px';

type NoticeScreen = 'unsupported' | 'waiting' | 'failed';

const isNotice = (screen: TryItState['screen']): screen is NoticeScreen =>
  screen === 'unsupported' || screen === 'waiting' || screen === 'failed';

const workScreens = new Set<TryItState['screen']>([
  'preparing',
  'loading',
  'building',
  'separating',
  'done',
]);

const subscribeNothing = (): (() => void) => () => undefined;
const readInitial = (): TryItState => initialTryItState;

export const TrySection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [tryIt, setTryIt] = useState<TryIt>();

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) {
      return undefined;
    }
    let created: TryIt | undefined = undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          created = createTryIt();
          setTryIt(created);
        }
      },
      { rootMargin: visibleMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      created?.dispose();
    };
  }, []);

  const state = useSyncExternalStore(
    tryIt?.subscribe ?? subscribeNothing,
    tryIt?.read ?? readInitial,
    readInitial,
  );
  const { screen, song } = state;
  const notice = {
    unsupported: {
      title: t('landing.try.unsupported.title'),
      body: t('landing.try.unsupported.body'),
    },
    waiting: {
      title: t('landing.try.waiting.title'),
      body: t('landing.try.waiting.body'),
    },
    failed: { title: t('landing.try.failed'), body: state.message },
  };
  const anotherSong = (
    <Button
      component='label'
      variant='outlined'
      color='inherit'
      sx={{ minHeight: 44, px: 2, borderRadius: 999, borderColor: 'divider' }}
    >
      {t('landing.try.another')}
      <Box
        component='input'
        type='file'
        accept='audio/*'
        onChange={(event) => {
          const file = event.target.files?.item(0);
          event.target.value = '';
          if (file) {
            tryIt?.start(file);
          }
        }}
        sx={{ display: 'none' }}
      />
    </Button>
  );

  return (
    <Container
      ref={sectionRef}
      id='try'
      component='section'
      maxWidth='lg'
      aria-labelledby='tryTitle'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.75,
        pt: 2,
        pb: { xs: 9, md: 12 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: 'primary.main', fontSize: 15 }}>
          {t('landing.try.eyebrow')}
        </Typography>
        <Typography
          id='tryTitle'
          variant='h2'
          sx={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)' }}
        >
          {t('landing.try.title')}
        </Typography>
        <Typography color='textSecondary' sx={{ maxWidth: 640 }}>
          {t('landing.try.lead')}
        </Typography>
      </Box>
      <Box sx={{ containerType: 'inline-size' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            p: 'clamp(14px, 3cqi, 28px)',
            borderRadius: '24px',
            border: 1,
            borderColor: 'divider',
            background:
              'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(214, 184, 90, 0.10), rgba(12, 11, 10, 0) 70%), #141210',
          }}
        >
          {(screen === 'checking' || screen === 'choose') && (
            <ChooseSong
              disabled={screen === 'checking'}
              onChoose={(file) => {
                tryIt?.start(file);
              }}
            />
          )}
          {isNotice(screen) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                px: 1,
                py: 6,
                textAlign: 'center',
              }}
            >
              <Typography
                component='h3'
                sx={{ fontFamily: displayFont, fontSize: 30, lineHeight: 1.15 }}
              >
                {notice[screen].title}
              </Typography>
              <Typography color='textSecondary' sx={{ maxWidth: 560 }}>
                {notice[screen].body}
              </Typography>
              {screen === 'failed' && anotherSong}
            </Box>
          )}
          {song && workScreens.has(screen) && (
            <SongWork
              song={song}
              state={state}
              tryIt={tryIt}
              anotherSong={anotherSong}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};
