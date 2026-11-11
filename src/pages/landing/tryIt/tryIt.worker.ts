import { separationSupported, separationTrack } from '@musetric/ai/separation';
import { decodeSong } from './songDecoding.worker.js';
import {
  openSongFiles,
  peaksOfRecord,
  readOriginal,
  readRecord,
  removeSong,
  type SongFiles,
  storeOriginal,
  writeRecord,
} from './songFiles.worker.js';
import { mixDown } from './songMixdown.worker.js';
import { separateSong } from './songSeparation.worker.js';
import {
  type DemoCommand,
  type DemoEvent,
  type FeedBlock,
  feedBlockFrames,
  type FeedRequest,
  type SongInfo,
  type SongPeaks,
  type StemKey,
  waveformBins,
} from './tryIt.cross.js';

const lockName = 'musetric-separation';
const stereo = 2;

const post = (event: DemoEvent, transfer: Transferable[] = []): void => {
  self.postMessage(event, transfer);
};

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const emptyStems = (): Record<StemKey, Float32Array> => ({
  lead: new Float32Array(waveformBins),
  backing: new Float32Array(waveformBins),
  instrumental: new Float32Array(waveformBins),
});

const copyPeaks = (
  original: Float32Array,
  stems: Record<StemKey, Float32Array>,
): SongPeaks => ({
  original: original.slice(),
  stems: {
    lead: stems.lead.slice(),
    backing: stems.backing.slice(),
    instrumental: stems.instrumental.slice(),
  },
});

type Session = {
  files: SongFiles;
  song: SongInfo;
  ready: number;
};

const readBlock = (
  session: Session | undefined,
  request: FeedRequest,
): FeedBlock => {
  const frames = session
    ? Math.max(
        0,
        Math.min(feedBlockFrames, session.song.frames - request.start),
      )
    : 0;
  const separated = session
    ? Math.max(0, Math.min(frames, session.ready - request.start))
    : 0;
  const block: FeedBlock = {
    type: 'block',
    serial: request.serial,
    start: request.start,
    frames,
    separated,
    lead: new Float32Array(separated * stereo),
    backing: new Float32Array(separated * stereo),
    instrumental: new Float32Array(separated * stereo),
    mixture: new Float32Array((frames - separated) * stereo),
  };
  if (session && separated > 0) {
    session.files.read('lead', request.start, block.lead);
    session.files.read('backing', request.start, block.backing);
    session.files.read('instrumental', request.start, block.instrumental);
  }
  if (session && frames > separated) {
    session.files.read('mixture', request.start + separated, block.mixture);
  }
  return block;
};

const startDemoWorker = (): void => {
  let session: Session | undefined = undefined;

  const closeSession = (): void => {
    session?.files.close();
    session = undefined;
  };

  const restore = async (): Promise<void> => {
    const record = await readRecord();
    if (!record?.done) {
      await removeSong();
      post({ type: 'empty' });
      return;
    }
    const files = await openSongFiles();
    session = { files, song: record.song, ready: record.song.frames };
    const file = await readOriginal(record.song.name);
    post({
      type: 'restored',
      song: record.song,
      file,
      peaks: peaksOfRecord(record),
    });
  };

  const separate = async (file: File): Promise<void> => {
    closeSession();
    await removeSong();
    const stored = await storeOriginal(file);
    const files = await openSongFiles();
    let original: Float32Array = new Float32Array(waveformBins);
    let stems = emptyStems();
    const probe: { session?: Session } = {};
    const decoding = await decodeSong({
      file: stored,
      sampleRate: separationTrack.geometry.sampleRate,
      files,
      probed: (song) => {
        probe.session = { files, song, ready: 0 };
        session = probe.session;
        post({ type: 'preparing', song, file: stored });
      },
      peaks: (peaks) => {
        original = peaks;
        post({ type: 'peaks', peaks: copyPeaks(original, stems) });
      },
    });
    const probed = probe.session;
    if (!probed) {
      throw new Error('The song was not probed');
    }
    await separateSong({
      files,
      frames: probed.song.frames,
      duration: probed.song.duration,
      mixture: decoding.mixture,
      progress: {
        loading: (loaded, total) => {
          post({ type: 'loading', loaded, total });
        },
        building: () => {
          post({ type: 'building' });
        },
      },
      separated: (ready, peaks) => {
        probed.ready = ready;
        stems = peaks;
        post({ type: 'separating', ready });
        post({ type: 'peaks', peaks: copyPeaks(original, stems) });
      },
    });
    const mixturePeak = await decoding.mixture;
    await decoding.finished;
    post({ type: 'peaks', peaks: copyPeaks(original, stems) });
    await writeRecord({
      song: probed.song,
      mixturePeak,
      done: true,
      peaks: {
        original: Array.from(original),
        stems: {
          lead: Array.from(stems.lead),
          backing: Array.from(stems.backing),
          instrumental: Array.from(stems.instrumental),
        },
      },
    });
    post({ type: 'done' });
  };

  const start = async (file: File): Promise<void> => {
    const run = async (): Promise<void> => {
      try {
        await separate(file);
      } catch (error) {
        post({ type: 'failed', message: describe(error) });
      }
    };
    const taken = await navigator.locks.request(
      lockName,
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          return false;
        }
        await run();
        return true;
      },
    );
    if (!taken) {
      post({ type: 'waiting' });
      await navigator.locks.request(lockName, run);
    }
  };

  const serveFeed = (port: MessagePort): void => {
    port.onmessage = (event: MessageEvent<FeedRequest>) => {
      const block = readBlock(session, event.data);
      port.postMessage(block, [
        block.lead.buffer,
        block.backing.buffer,
        block.instrumental.buffer,
        block.mixture.buffer,
      ]);
    };
  };

  const mix = (command: Extract<DemoCommand, { type: 'mix' }>): void => {
    if (!session) {
      throw new Error('There is no song to mix');
    }
    const wav = mixDown({
      files: session.files,
      frames: session.song.frames,
      sampleRate: session.song.sampleRate,
      gains: command.gains,
    });
    post({ type: 'mixed', wav });
  };

  const handle = async (command: DemoCommand): Promise<void> => {
    if (command.type === 'restore') {
      await restore();
    } else if (command.type === 'start') {
      await start(command.file);
    } else if (command.type === 'remove') {
      closeSession();
      await removeSong();
      post({ type: 'empty' });
    } else if (command.type === 'mix') {
      mix(command);
    } else {
      serveFeed(command.port);
    }
  };

  self.addEventListener('message', (event: MessageEvent<DemoCommand>) => {
    handle(event.data).catch((error: unknown) => {
      post({ type: 'failed', message: describe(error) });
    });
  });

  separationSupported()
    .then((supported) => {
      post({ type: 'support', supported });
    })
    .catch(() => {
      post({ type: 'support', supported: false });
    });
};

startDemoWorker();
