import {
  loadSeparationModel,
  peakScale,
  separateTrack,
  type SeparationCommit,
  type SeparationModelFile,
  type SeparationModelFiles,
  separationModelFiles,
  type SeparationSource,
  separationTrack,
} from '@musetric/ai/separation';
import { env } from 'onnxruntime-web/webgpu';
import { type SongFiles } from './songFiles.worker.js';
import { type StemKey, stemKeys, waveformBins } from './tryIt.cross.js';

const cacheName = 'musetric-separation';
const stereo = 2;

const runtimeVersion = env.versions.web;
if (!runtimeVersion) {
  throw new Error('onnxruntime-web does not report its version');
}
env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${runtimeVersion}/dist/`;
env.wasm.numThreads = 1;

const readBody = async (
  response: Response,
  file: SeparationModelFile,
  loaded: (bytes: number) => void,
): Promise<Uint8Array<ArrayBuffer>> => {
  if (!response.body) {
    throw new Error('A model file came without a body');
  }
  const bytes = new Uint8Array(file.bytes);
  const reader = response.body.getReader();
  let offset = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (offset + value.length > bytes.length) {
      throw new Error('A model file is larger than its pin');
    }
    bytes.set(value, offset);
    offset += value.length;
    loaded(value.length);
  }
  return bytes;
};

const fetchModelFile = async (
  cache: Cache,
  file: SeparationModelFile,
  loaded: (bytes: number) => void,
): Promise<Uint8Array<ArrayBuffer>> => {
  const cached = await cache.match(file.url);
  if (cached) {
    return readBody(cached, file, loaded);
  }
  const response = await fetch(file.url);
  if (!response.ok) {
    throw new Error(`The model answered ${String(response.status)}`);
  }
  const storing = cache.put(file.url, response.clone());
  const bytes = await readBody(response, file, loaded);
  await storing;
  return bytes;
};

export type ModelProgress = {
  loading: (loaded: number, total: number) => void;
  building: () => void;
};

const fetchModelFiles = async (
  progress: ModelProgress,
): Promise<SeparationModelFiles> => {
  const cache = await caches.open(cacheName);
  const total =
    separationModelFiles.model.bytes + separationModelFiles.modelData.bytes;
  let loaded = 0;
  const count = (bytes: number): void => {
    loaded += bytes;
    progress.loading(loaded, total);
  };
  progress.loading(0, total);
  const [model, modelData] = await Promise.all([
    fetchModelFile(cache, separationModelFiles.model, count),
    fetchModelFile(cache, separationModelFiles.modelData, count),
  ]);
  progress.building();
  return { model, modelData };
};

const createSource = (
  files: SongFiles,
  frames: number,
  mixture: Promise<number>,
): SeparationSource => {
  let buffer = new Float32Array(0);
  return {
    frames,
    peak: async () => await mixture,
    read: async (start, channels) => {
      await mixture;
      const count = channels[0].length;
      if (buffer.length !== count * stereo) {
        buffer = new Float32Array(count * stereo);
      }
      files.read('mixture', start, buffer);
      for (const [channel, samples] of channels.entries()) {
        for (let frame = 0; frame < count; frame += 1) {
          samples[frame] = buffer[frame * stereo + channel];
        }
      }
    },
  };
};

type StemTrace = {
  peaks: Record<StemKey, Float32Array>;
  binsPerFrame: number;
  scale: number;
};

const traceStem = (
  trace: StemTrace,
  key: StemKey,
  samples: Float32Array,
  first: number,
): void => {
  const { scale } = trace;
  const peaks = trace.peaks[key];
  for (let frame = 0; frame < samples.length / stereo; frame += 1) {
    const left = samples[frame * stereo] / scale;
    const right = samples[frame * stereo + 1] / scale;
    samples[frame * stereo] = left;
    samples[frame * stereo + 1] = right;
    const bin = Math.min(
      waveformBins - 1,
      Math.floor((first + frame) * trace.binsPerFrame),
    );
    const level = Math.max(Math.abs(left), Math.abs(right));
    if (level > peaks[bin]) {
      peaks[bin] = level;
    }
  }
};

export type SeparationOptions = {
  files: SongFiles;
  frames: number;
  duration: number;
  mixture: Promise<number>;
  progress: ModelProgress;
  separated: (ready: number, peaks: Record<StemKey, Float32Array>) => void;
};

export const separateSong = async (
  options: SeparationOptions,
): Promise<void> => {
  const { files, frames, duration, mixture } = options;
  const trace: StemTrace = {
    peaks: {
      lead: new Float32Array(waveformBins),
      backing: new Float32Array(waveformBins),
      instrumental: new Float32Array(waveformBins),
    },
    binsPerFrame:
      waveformBins / (duration * separationTrack.geometry.sampleRate),
    scale: 1,
  };
  let ready = 0;
  const commit = async (separated: SeparationCommit): Promise<void> => {
    trace.scale = peakScale(await mixture);
    const { stems } = separated;
    for (const key of stemKeys) {
      traceStem(trace, key, stems[key], ready);
      files.write(key, ready, stems[key]);
    }
    ready += stems.lead.length / stereo;
    options.separated(ready, trace.peaks);
  };
  await separateTrack({
    ...separationTrack,
    source: createSource(files, frames, mixture),
    loadModel: async () =>
      loadSeparationModel(await fetchModelFiles(options.progress)),
    report: () => undefined,
    commit,
  });
  files.flush();
  if (ready !== frames) {
    throw new Error(
      `Separation settled ${String(ready)} frames of ${String(frames)}`,
    );
  }
};
