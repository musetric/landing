import playerUrl from './songPlayer.worklet.ts?worker&url';
import {
  type PlayerCommand,
  type PlayerEvent,
  type SongInfo,
  type StemGains,
} from './tryIt.cross.js';

type Player = {
  context: AudioContext;
  node: AudioWorkletNode;
};

export type SongPlaybackOptions = {
  connectFeed: (port: MessagePort) => void;
  moved: (seconds: number) => void;
  stopped: () => void;
};

export type SongPlayback = {
  open: (file: File) => void;
  play: (song: SongInfo, seconds: number, gains: StemGains) => Promise<void>;
  pause: () => Promise<void>;
  setGains: (gains: StemGains) => Promise<void>;
  detach: () => void;
  close: () => void;
};

export const createSongPlayback = (
  options: SongPlaybackOptions,
): SongPlayback => {
  let player: Promise<Player> | undefined = undefined;
  let playing: SongInfo | undefined = undefined;
  const element = new Audio();
  let elementUrl: string | undefined = undefined;
  element.preload = 'auto';
  element.onended = () => {
    playing = undefined;
    options.stopped();
  };

  const follow = (): void => {
    if (element.paused) {
      return;
    }
    options.moved(element.currentTime);
    requestAnimationFrame(follow);
  };

  const playElement = async (seconds: number): Promise<void> => {
    element.currentTime = seconds;
    await element.play();
    requestAnimationFrame(follow);
  };

  const send = async (message: PlayerCommand): Promise<void> => {
    if (!player) {
      return;
    }
    const { node } = await player;
    node.port.postMessage(message);
  };

  const openPlayer = async (song: SongInfo): Promise<Player> => {
    const context = new AudioContext({ sampleRate: song.sampleRate });
    await context.audioWorklet.addModule(playerUrl);
    const node = new AudioWorkletNode(context, 'song-player', {
      numberOfInputs: 0,
      outputChannelCount: [2],
    });
    node.connect(context.destination);
    node.port.onmessage = (event: MessageEvent<PlayerEvent>) => {
      const message = event.data;
      options.moved(message.frame / song.sampleRate);
      if (message.type !== 'ended' || !playing) {
        return;
      }
      const limit = playing.frames / playing.sampleRate;
      if (playing.duration > limit) {
        playElement(limit).catch(() => {
          options.stopped();
        });
      } else {
        playing = undefined;
        options.stopped();
      }
    };
    const channel = new MessageChannel();
    options.connectFeed(channel.port1);
    const feed: PlayerCommand = { type: 'feed', port: channel.port2 };
    node.port.postMessage(feed, [channel.port2]);
    return { context, node };
  };

  return {
    open: (file) => {
      if (elementUrl) {
        URL.revokeObjectURL(elementUrl);
      }
      elementUrl = URL.createObjectURL(file);
      element.src = elementUrl;
    },
    play: async (song, seconds, gains) => {
      player ??= openPlayer(song);
      const { context } = await player;
      await context.resume();
      playing = song;
      await send({ type: 'gains', gains });
      if (seconds < song.frames / song.sampleRate) {
        element.pause();
        await send({
          type: 'play',
          frame: Math.round(seconds * song.sampleRate),
          frames: song.frames,
        });
      } else {
        await send({ type: 'pause' });
        await playElement(seconds);
      }
    },
    pause: async () => {
      playing = undefined;
      element.pause();
      await send({ type: 'pause' });
    },
    setGains: async (gains) => {
      await send({ type: 'gains', gains });
    },
    detach: () => {
      playing = undefined;
      element.pause();
      const closing = player;
      player = undefined;
      closing
        ?.then(async (opened) => opened.context.close())
        .catch(() => undefined);
    },
    close: () => {
      playing = undefined;
      element.pause();
      if (elementUrl) {
        URL.revokeObjectURL(elementUrl);
      }
      player
        ?.then(async (opened) => opened.context.close())
        .catch(() => undefined);
      player = undefined;
    },
  };
};
