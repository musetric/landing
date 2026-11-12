import { type SongFiles } from './songFiles.worker.js';
import { type StemGains, stemKeys } from './tryIt.cross.js';

const stereo = 2;
const bytesPerSample = 2;
const headerBytes = 44;
const blockFrames = 65536;

const wavHeader = (frames: number, sampleRate: number): ArrayBuffer => {
  const dataBytes = frames * stereo * bytesPerSample;
  const header = new DataView(new ArrayBuffer(headerBytes));
  const text = (offset: number, value: string): void => {
    for (const [index, letter] of Array.from(value).entries()) {
      header.setUint8(offset + index, letter.charCodeAt(0));
    }
  };
  text(0, 'RIFF');
  header.setUint32(4, headerBytes - 8 + dataBytes, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, stereo, true);
  header.setUint32(24, sampleRate, true);
  header.setUint32(28, sampleRate * stereo * bytesPerSample, true);
  header.setUint16(32, stereo * bytesPerSample, true);
  header.setUint16(34, bytesPerSample * 8, true);
  text(36, 'data');
  header.setUint32(40, dataBytes, true);
  return header.buffer;
};

export type MixdownOptions = {
  files: SongFiles;
  frames: number;
  sampleRate: number;
  gains: StemGains;
};

export const mixDown = (options: MixdownOptions): Blob => {
  const { files, frames, sampleRate, gains } = options;
  const parts: BlobPart[] = [wavHeader(frames, sampleRate)];
  const stem = new Float32Array(blockFrames * stereo);
  for (let start = 0; start < frames; start += blockFrames) {
    const count = Math.min(blockFrames, frames - start);
    const mix = new Float32Array(count * stereo);
    const view = stem.subarray(0, count * stereo);
    for (const key of stemKeys) {
      files.read(key, start, view);
      const gain = gains[key];
      for (const [index, sample] of view.entries()) {
        mix[index] += sample * gain;
      }
    }
    const pcm = new Int16Array(count * stereo);
    for (const [index, sample] of mix.entries()) {
      const clipped = Math.max(-1, Math.min(1, sample));
      pcm[index] = Math.round(clipped * 32767);
    }
    parts.push(pcm.buffer);
  }
  return new Blob(parts, { type: 'audio/wav' });
};
