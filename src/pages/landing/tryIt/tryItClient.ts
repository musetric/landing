import { createSongPlayback } from './songPlayback.js';
import {
  type DemoCommand,
  type DemoEvent,
  type SongInfo,
  type SongPeaks,
  type StemGains,
  type StemKey,
} from './tryIt.cross.js';
import workerUrl from './tryIt.worker.ts?worker&url';

export type TryItScreen =
  | 'checking'
  | 'unsupported'
  | 'choose'
  | 'waiting'
  | 'preparing'
  | 'loading'
  | 'building'
  | 'separating'
  | 'done'
  | 'failed';

export type TryItState = {
  screen: TryItScreen;
  song: SongInfo | undefined;
  peaks: SongPeaks | undefined;
  ready: number;
  loaded: number;
  total: number;
  position: number;
  playing: boolean;
  mutes: Record<StemKey, boolean>;
  volumes: Record<StemKey, number>;
  message: string;
};

export const initialTryItState: TryItState = {
  screen: 'checking',
  song: undefined,
  peaks: undefined,
  ready: 0,
  loaded: 0,
  total: 0,
  position: 0,
  playing: false,
  mutes: { lead: false, backing: false, instrumental: false },
  volumes: { lead: 85, backing: 85, instrumental: 85 },
  message: '',
};

const working: TryItScreen[] = [
  'waiting',
  'preparing',
  'loading',
  'building',
  'separating',
];

const mixName = (song: SongInfo): string =>
  `${song.name.replace(/\.[^.]+$/, '')} - Musetric mix.wav`;

type DemoHandlers = {
  [Type in DemoEvent['type']]: (
    event: Extract<DemoEvent, { type: Type }>,
  ) => void;
};

export type TryIt = {
  subscribe: (listener: () => void) => () => void;
  read: () => TryItState;
  start: (file: File) => void;
  remove: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (key: StemKey, volume: number) => void;
  toggleMute: (key: StemKey) => void;
  download: () => void;
  dispose: () => void;
};

export const createTryIt = (): TryIt => {
  let state = initialTryItState;
  const listeners = new Set<() => void>();
  let worker: Worker | undefined = undefined;

  const update = (patch: Partial<TryItState>): void => {
    state = { ...state, ...patch };
    for (const listener of listeners) {
      listener();
    }
  };

  const command = (message: DemoCommand, transfer: Transferable[] = []) => {
    worker?.postMessage(message, transfer);
  };

  const songOf = (): SongInfo => {
    if (!state.song) {
      throw new Error('There is no song');
    }
    return state.song;
  };

  const gains = (): StemGains => ({
    lead: state.mutes.lead ? 0 : state.volumes.lead / 100,
    backing: state.mutes.backing ? 0 : state.volumes.backing / 100,
    instrumental: state.mutes.instrumental
      ? 0
      : state.volumes.instrumental / 100,
  });

  const playback = createSongPlayback({
    connectFeed: (port) => {
      command({ type: 'feed', port }, [port]);
    },
    moved: (seconds) => {
      update({ position: seconds });
    },
    stopped: () => {
      update({ playing: false });
    },
  });

  const play = (seconds: number): void => {
    update({ playing: true, position: seconds });
    playback.play(songOf(), seconds, gains()).catch(() => {
      update({ playing: false });
    });
  };

  const resetSong = (): void => {
    playback.pause().catch(() => undefined);
    update({
      song: undefined,
      peaks: undefined,
      ready: 0,
      position: 0,
      playing: false,
    });
  };

  const saveMix = (wav: Blob): void => {
    const url = URL.createObjectURL(wav);
    const link = document.createElement('a');
    link.href = url;
    link.download = mixName(songOf());
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60_000);
  };

  const handlers: DemoHandlers = {
    support: (event) => {
      if (state.screen !== 'checking') {
        return;
      }
      if (event.supported) {
        command({ type: 'restore' });
      } else {
        update({ screen: 'unsupported' });
      }
    },
    restored: (event) => {
      playback.open(event.file);
      update({
        screen: 'done',
        song: event.song,
        peaks: event.peaks,
        ready: event.song.frames,
        position: 0,
      });
    },
    empty: () => {
      resetSong();
      update({ screen: 'choose' });
    },
    waiting: () => {
      update({ screen: 'waiting' });
    },
    preparing: (event) => {
      playback.open(event.file);
      update({ screen: 'preparing', song: event.song, ready: 0, position: 0 });
    },
    loading: (event) => {
      update({ screen: 'loading', loaded: event.loaded, total: event.total });
    },
    building: () => {
      update({ screen: 'building' });
    },
    separating: (event) => {
      update({ screen: 'separating', ready: event.ready });
    },
    peaks: (event) => {
      update({ peaks: event.peaks });
    },
    done: () => {
      update({ screen: 'done', ready: songOf().frames });
    },
    mixed: (event) => {
      saveMix(event.wav);
    },
    failed: (event) => {
      update({ screen: 'failed', message: event.message });
    },
  };

  const onEvent = <Type extends DemoEvent['type']>(
    event: Extract<DemoEvent, { type: Type }>,
  ): void => {
    const handler: (typed: Extract<DemoEvent, { type: Type }>) => void =
      handlers[event.type];
    handler(event);
  };

  const spawn = (): Worker => {
    const created = new Worker(workerUrl, { type: 'module' });
    created.onmessage = (event: MessageEvent<DemoEvent>) => {
      onEvent(event.data);
    };
    created.onerror = (event) => {
      update({ screen: 'failed', message: event.message });
    };
    return created;
  };

  const restartIfWorking = (): void => {
    if (!working.includes(state.screen)) {
      return;
    }
    playback.detach();
    worker?.terminate();
    worker = spawn();
  };

  worker = spawn();

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    read: () => state,
    start: (file) => {
      restartIfWorking();
      resetSong();
      update({ screen: 'preparing' });
      command({ type: 'start', file });
    },
    remove: () => {
      restartIfWorking();
      resetSong();
      command({ type: 'remove' });
    },
    togglePlay: () => {
      if (state.playing) {
        update({ playing: false });
        playback.pause().catch(() => undefined);
        return;
      }
      play(state.position);
    },
    seek: (seconds) => {
      if (state.playing) {
        play(seconds);
      } else {
        update({ position: seconds });
      }
    },
    setVolume: (key, volume) => {
      update({
        volumes: { ...state.volumes, [key]: volume },
        mutes: { ...state.mutes, [key]: false },
      });
      playback.setGains(gains()).catch(() => undefined);
    },
    toggleMute: (key) => {
      update({ mutes: { ...state.mutes, [key]: !state.mutes[key] } });
      playback.setGains(gains()).catch(() => undefined);
    },
    download: () => {
      command({ type: 'mix', gains: gains() });
    },
    dispose: () => {
      worker?.terminate();
      playback.close();
      listeners.clear();
    },
  };
};
