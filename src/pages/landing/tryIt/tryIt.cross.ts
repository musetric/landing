export const separationLimitSeconds = 300;
export const waveformBins = 960;
export const feedBlockFrames = 8192;

export type StemKey = 'lead' | 'backing' | 'instrumental';

export const stemKeys: StemKey[] = ['lead', 'backing', 'instrumental'];

export type StemGains = Record<StemKey, number>;

export type SongInfo = {
  name: string;
  duration: number;
  sampleRate: number;
  frames: number;
};

export type SongPeaks = {
  original: Float32Array;
  stems: Record<StemKey, Float32Array>;
};

export type DemoEvent =
  | { type: 'support'; supported: boolean }
  | { type: 'restored'; song: SongInfo; file: File; peaks: SongPeaks }
  | { type: 'empty' }
  | { type: 'waiting' }
  | { type: 'preparing'; song: SongInfo; file: File }
  | { type: 'loading'; loaded: number; total: number }
  | { type: 'building' }
  | { type: 'separating'; ready: number }
  | { type: 'peaks'; peaks: SongPeaks }
  | { type: 'done' }
  | { type: 'mixed'; wav: Blob }
  | { type: 'failed'; message: string };

export type DemoCommand =
  | { type: 'restore' }
  | { type: 'start'; file: File }
  | { type: 'remove' }
  | { type: 'mix'; gains: StemGains }
  | { type: 'feed'; port: MessagePort };

export type FeedRequest = { type: 'read'; start: number; serial: number };

export type FeedBlock = {
  type: 'block';
  serial: number;
  start: number;
  frames: number;
  separated: number;
  lead: Float32Array<ArrayBuffer>;
  backing: Float32Array<ArrayBuffer>;
  instrumental: Float32Array<ArrayBuffer>;
  mixture: Float32Array<ArrayBuffer>;
};

export type PlayerCommand =
  | { type: 'feed'; port: MessagePort }
  | { type: 'play'; frame: number; frames: number }
  | { type: 'pause' }
  | { type: 'gains'; gains: StemGains };

export type PlayerEvent =
  { type: 'position'; frame: number } | { type: 'ended'; frame: number };
