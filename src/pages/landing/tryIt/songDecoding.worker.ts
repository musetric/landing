import {
  ALL_FORMATS,
  type AudioSample,
  AudioSampleSink,
  BlobSource,
  Input,
} from 'mediabunny';
import { createResampler } from './resampler.cross.js';
import { type SongFiles } from './songFiles.worker.js';
import {
  separationLimitSeconds,
  type SongInfo,
  waveformBins,
} from './tryIt.cross.js';

const stereo = 2;
const peaksInterval = 250;

const stereoOf = (sample: AudioSample): Float32Array[] => {
  const frames = sample.numberOfFrames;
  const planes = Array.from(
    { length: Math.min(sample.numberOfChannels, stereo) },
    (_, plane) => {
      const samples = new Float32Array(frames);
      sample.copyTo(samples, { planeIndex: plane, format: 'f32-planar' });
      return samples;
    },
  );
  return planes.length === 1 ? [planes[0], planes[0]] : planes;
};

type PeakTrace = {
  peaks: Float32Array;
  duration: number;
  sourceRate: number;
};

const tracePeaks = (
  trace: PeakTrace,
  channels: Float32Array[],
  first: number,
): void => {
  const [left, right] = channels;
  const binsPerFrame = waveformBins / (trace.duration * trace.sourceRate);
  for (const [frame, sample] of left.entries()) {
    const bin = Math.min(
      waveformBins - 1,
      Math.floor((first + frame) * binsPerFrame),
    );
    const level = Math.max(Math.abs(sample), Math.abs(right[frame]));
    if (level > trace.peaks[bin]) {
      trace.peaks[bin] = level;
    }
  }
};

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
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
  const track = await input.getPrimaryAudioTrack();
  if (!track || !(await track.canDecode())) {
    throw new Error('This file has no audio that the browser can decode');
  }
  const duration = await input.computeDuration();
  const sourceRate = await track.getSampleRate();
  const frames = Math.round(
    Math.min(duration, separationLimitSeconds) * sampleRate,
  );
  options.probed({ name: file.name, duration, sampleRate, frames });

  const trace: PeakTrace = {
    peaks: new Float32Array(waveformBins),
    duration,
    sourceRate,
  };
  const mixture = Promise.withResolvers<number>();
  let written = 0;
  let mixturePeak = 0;
  let mixtureOpen = true;
  const resampler = createResampler({
    sourceRate,
    targetRate: sampleRate,
    channels: stereo,
    emit: (interleaved) => {
      const taken = Math.min(frames - written, interleaved.length / stereo);
      if (taken <= 0) {
        return;
      }
      const samples = interleaved.subarray(0, taken * stereo);
      for (const sample of samples) {
        mixturePeak = Math.max(mixturePeak, Math.abs(sample));
      }
      files.write('mixture', written, samples);
      written += taken;
    },
  });
  const closeMixture = (): void => {
    mixtureOpen = false;
    if (written < frames) {
      resampler.finish();
    }
    const rest = Math.max(0, frames - written);
    files.write('mixture', written, new Float32Array(rest * stereo));
    files.flush();
    mixture.resolve(mixturePeak);
  };

  const decodeAll = async (): Promise<void> => {
    const sink = new AudioSampleSink(track);
    let decoded = 0;
    let reportedAt = performance.now();
    try {
      for await (const sample of sink.samples()) {
        const channels = stereoOf(sample);
        sample.close();
        tracePeaks(trace, channels, decoded);
        decoded += channels[0].length;
        if (mixtureOpen) {
          resampler.push(channels);
        }
        if (mixtureOpen && written >= frames) {
          closeMixture();
        }
        if (performance.now() - reportedAt > peaksInterval) {
          reportedAt = performance.now();
          options.peaks(trace.peaks.slice());
        }
      }
      if (mixtureOpen) {
        closeMixture();
      }
      options.peaks(trace.peaks.slice());
    } catch (error) {
      mixture.reject(error);
      throw error;
    } finally {
      input.dispose();
    }
  };

  const finished = decodeAll();
  finished.catch(() => undefined);
  return { mixture: mixture.promise, finished };
};
