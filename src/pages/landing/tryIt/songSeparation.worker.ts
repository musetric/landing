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
  warmUpOrt,
} from '@musetric/ai/separation';
import init, { WavePeaks } from '@musetric/dsp/songs';
import { env } from 'onnxruntime-web/webgpu';
import { type SongFiles } from './songFiles.worker.js';
import { type StemKey, stemKeys } from './tryIt.cross.js';

const cacheName = 'musetric-separation';
const stereo = 2;

const runtimeVersion = env.versions.web;
if (!runtimeVersion) {
  throw new Error('onnxruntime-web does not report its version');
}
env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${runtimeVersion}/dist/`;
env.wasm.numThreads = 1;

const runsOnWebKit = (): boolean => {
  const agent = navigator.userAgent;
  return /AppleWebKit\//.test(agent) && !/(Chrome|Chromium|Edg)\//.test(agent);
};

export const warmUpSeparation = async (): Promise<void> => {
  if (runsOnWebKit()) {
    await warmUpOrt(0);
  }
};

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

const scaleStem = (samples: Float32Array, scale: number): void => {
  for (const [index, sample] of samples.entries()) {
    samples[index] = sample / scale;
  }
};

export type SeparationOptions = {
  files: SongFiles;
  frames: number;
  duration: number;
  mixture: Promise<number>;
  warmedUp: Promise<void>;
  progress: ModelProgress;
  separated: (ready: number, peaks: Record<StemKey, Float32Array>) => void;
};

export const separateSong = async (
  options: SeparationOptions,
): Promise<void> => {
  const { files, frames, duration, mixture } = options;
  await init();
  const songFrames = Math.round(duration * separationTrack.geometry.sampleRate);
  const traces: Record<StemKey, WavePeaks> = {
    lead: new WavePeaks(songFrames),
    backing: new WavePeaks(songFrames),
    instrumental: new WavePeaks(songFrames),
  };
  let ready = 0;
  const commit = async (separated: SeparationCommit): Promise<void> => {
    const scale = peakScale(await mixture);
    const { stems } = separated;
    for (const key of stemKeys) {
      scaleStem(stems[key], scale);
      traces[key].push(stems[key]);
      files.write(key, ready, stems[key]);
    }
    ready += stems.lead.length / stereo;
    options.separated(ready, {
      lead: traces.lead.peaks(),
      backing: traces.backing.peaks(),
      instrumental: traces.instrumental.peaks(),
    });
  };
  try {
    await separateTrack({
      ...separationTrack,
      source: createSource(files, frames, mixture),
      loadModel: async () => {
        const modelFiles = await fetchModelFiles(options.progress);
        await options.warmedUp;
        return await loadSeparationModel(modelFiles);
      },
      report: () => undefined,
      commit,
    });
  } finally {
    for (const key of stemKeys) {
      traces[key].free();
    }
  }
  files.flush();
  if (ready !== frames) {
    throw new Error(
      `Separation settled ${String(ready)} frames of ${String(frames)}`,
    );
  }
};
