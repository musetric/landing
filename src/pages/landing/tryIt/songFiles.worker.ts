import {
  type SongInfo,
  type SongPeaks,
  type StemKey,
  stemKeys,
} from './tryIt.cross.js';

const folderName = 'tryIt';
const songName = 'song';
const recordName = 'song.json';
const frameBytes = 2 * Float32Array.BYTES_PER_ELEMENT;

export type TrackName = 'mixture' | StemKey;

const trackNames: TrackName[] = ['mixture', ...stemKeys];

const openFolder = async (): Promise<FileSystemDirectoryHandle> => {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(folderName, { create: true });
};

export const removeSong = async (): Promise<void> => {
  const root = await navigator.storage.getDirectory();
  try {
    await root.removeEntry(folderName, { recursive: true });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'NotFoundError')) {
      throw error;
    }
  }
};

export const storeOriginal = async (file: File): Promise<File> => {
  const folder = await openFolder();
  const handle = await folder.getFileHandle(songName, { create: true });
  const access = await handle.createSyncAccessHandle();
  try {
    access.truncate(0);
    const reader = file.stream().getReader();
    let offset = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      offset += access.write(value, { at: offset });
    }
    access.flush();
  } finally {
    access.close();
  }
  const stored = await handle.getFile();
  return new File([stored], file.name, { type: file.type });
};

export const readOriginal = async (name: string): Promise<File> => {
  const folder = await openFolder();
  const handle = await folder.getFileHandle(songName);
  const stored = await handle.getFile();
  return new File([stored], name, { type: stored.type });
};

export type SongFiles = {
  write: (track: TrackName, frame: number, samples: Float32Array) => void;
  read: (track: TrackName, frame: number, samples: Float32Array) => void;
  flush: () => void;
  close: () => void;
};

export const openSongFiles = async (): Promise<SongFiles> => {
  const folder = await openFolder();
  const handles = new Map<TrackName, FileSystemSyncAccessHandle>();
  for (const track of trackNames) {
    const handle = await folder.getFileHandle(`${track}.f32`, {
      create: true,
    });
    handles.set(track, await handle.createSyncAccessHandle());
  }
  const handleOf = (track: TrackName): FileSystemSyncAccessHandle => {
    const handle = handles.get(track);
    if (!handle) {
      throw new Error(`The ${track} track is not open`);
    }
    return handle;
  };
  return {
    write: (track, frame, samples) => {
      handleOf(track).write(samples, { at: frame * frameBytes });
    },
    read: (track, frame, samples) => {
      const read = handleOf(track).read(samples, { at: frame * frameBytes });
      samples.fill(0, read / Float32Array.BYTES_PER_ELEMENT);
    },
    flush: () => {
      for (const handle of handles.values()) {
        handle.flush();
      }
    },
    close: () => {
      for (const handle of handles.values()) {
        handle.close();
      }
      handles.clear();
    },
  };
};

export type SongRecord = {
  song: SongInfo;
  mixturePeak: number;
  done: boolean;
  peaks: {
    original: number[];
    stems: Record<StemKey, number[]>;
  };
};

export const writeRecord = async (record: SongRecord): Promise<void> => {
  const folder = await openFolder();
  const handle = await folder.getFileHandle(recordName, { create: true });
  const access = await handle.createSyncAccessHandle();
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(record));
    access.truncate(0);
    access.write(bytes, { at: 0 });
    access.flush();
  } finally {
    access.close();
  }
};

export const readRecord = async (): Promise<SongRecord | undefined> => {
  const folder = await openFolder();
  try {
    const handle = await folder.getFileHandle(recordName);
    const file = await handle.getFile();
    const record: SongRecord = JSON.parse(await file.text());
    return record;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return undefined;
    }
    throw error;
  }
};

export const peaksOfRecord = (record: SongRecord): SongPeaks => ({
  original: Float32Array.from(record.peaks.original),
  stems: {
    lead: Float32Array.from(record.peaks.stems.lead),
    backing: Float32Array.from(record.peaks.stems.backing),
    instrumental: Float32Array.from(record.peaks.stems.instrumental),
  },
});
