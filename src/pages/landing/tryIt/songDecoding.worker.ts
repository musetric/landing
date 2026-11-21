import init, { Decoder, WavePeaks } from '@musetric/dsp/songs';
import { type SongFiles } from './songFiles.worker.js';
import { separationLimitSeconds, type SongInfo } from './tryIt.cross.js';

const stereo = 2;
const peaksInterval = 250;

const extensionOf = (name: string): string | undefined => {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? undefined : name.slice(dot + 1).toLowerCase();
};

const openDecoder = (
  bytes: Uint8Array,
  extension: string | undefined,
  sampleRate: number,
): Decoder => {
  try {
    return new Decoder(bytes, extension, sampleRate, false);
  } catch {
    throw new Error('This file has no audio that the demo can decode');
  }
};

const countFrames = (
  bytes: Uint8Array,
  extension: string | undefined,
  sampleRate: number,
): number => {
  const decoder = openDecoder(bytes, extension, sampleRate);
  try {
    let samples = 0;
    for (let chunk = decoder.read(); chunk; chunk = decoder.read()) {
      samples += chunk.length;
    }
    return samples / stereo;
  } finally {
    decoder.free();
  }
};

const yieldToMessages = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

export type DecodingOptions = {
  file: File;
  sampleRate: number;
  files: SongFiles;
  probed: (song: SongInfo) => void;
  peaks: (original: Float32Array) => void;
};

export type Decoding = {
  mixture: Promise<number>;
  finished: Promise<void>;
};

export const decodeSong = async (
  options: DecodingOptions,
): Promise<Decoding> => {
  const { file, sampleRate, files } = options;
  await init();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = extensionOf(file.name);
  const decoder = openDecoder(bytes, extension, sampleRate);
  const songFrames =
    decoder.frameCount ?? countFrames(bytes, extension, sampleRate);
  const duration = songFrames / sampleRate;
  const frames = Math.min(
    songFrames,
    Math.round(separationLimitSeconds * sampleRate),
  );
  options.probed({ name: file.name, duration, sampleRate, frames });

  const trace = new WavePeaks(songFrames);
  const mixture = Promise.withResolvers<number>();
  let written = 0;
  let mixturePeak = 0;
  let mixtureOpen = true;
  const writeMixture = (samples: Float32Array): void => {
    const taken = Math.min(frames - written, samples.length / stereo);
    if (taken <= 0) {
      return;
    }
    const kept = samples.subarray(0, taken * stereo);
    for (const sample of kept) {
      mixturePeak = Math.max(mixturePeak, Math.abs(sample));
    }
    files.write('mixture', written, kept);
    written += taken;
  };
  const closeMixture = (): void => {
    mixtureOpen = false;
    const rest = Math.max(0, frames - written);
    files.write('mixture', written, new Float32Array(rest * stereo));
    files.flush();
    mixture.resolve(mixturePeak);
  };

  const decodeAll = async (): Promise<void> => {
    let reportedAt = performance.now();
    try {
      for (let chunk = decoder.read(); chunk; chunk = decoder.read()) {
        trace.push(chunk);
        if (mixtureOpen) {
          writeMixture(chunk);
        }
        if (mixtureOpen && written >= frames) {
          closeMixture();
        }
        if (performance.now() - reportedAt > peaksInterval) {
          options.peaks(trace.peaks());
          await yieldToMessages();
          reportedAt = performance.now();
        }
      }
      if (mixtureOpen) {
        closeMixture();
      }
      options.peaks(trace.peaks());
    } catch (error) {
      mixture.reject(error);
      throw error;
    } finally {
      decoder.free();
      trace.free();
    }
  };

  const finished = decodeAll();
  finished.catch(() => undefined);
  return { mixture: mixture.promise, finished };
};
