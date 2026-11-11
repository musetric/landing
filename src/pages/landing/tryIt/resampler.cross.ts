const halfTaps = 12;
const phases = 512;
const passband = 0.95;

const sinc = (x: number): number =>
  x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);

const blackman = (x: number): number => {
  const t = (x + halfTaps) / (2 * halfTaps);
  return (
    0.42 - 0.5 * Math.cos(2 * Math.PI * t) + 0.08 * Math.cos(4 * Math.PI * t)
  );
};

type Kernel = {
  taps: Float32Array;
  span: number;
};

const createKernel = (cutoff: number): Kernel => {
  const span = 2 * halfTaps;
  const taps = new Float32Array((phases + 1) * span);
  for (let phase = 0; phase <= phases; phase += 1) {
    const fraction = phase / phases;
    let sum = 0;
    for (let tap = 0; tap < span; tap += 1) {
      const x = tap - halfTaps + 1 - fraction;
      const value = cutoff * sinc(cutoff * x) * blackman(x);
      taps[phase * span + tap] = value;
      sum += value;
    }
    for (let tap = 0; tap < span; tap += 1) {
      taps[phase * span + tap] /= sum;
    }
  }
  return { taps, span };
};

export type ResamplerOptions = {
  sourceRate: number;
  targetRate: number;
  channels: number;
  emit: (interleaved: Float32Array<ArrayBuffer>) => void;
};

export type Resampler = {
  push: (planar: Float32Array[]) => void;
  finish: () => void;
};

export const createResampler = (options: ResamplerOptions): Resampler => {
  const { sourceRate, targetRate, channels, emit } = options;
  if (sourceRate === targetRate) {
    return {
      push: (planar) => {
        const frames = planar[0].length;
        const interleaved = new Float32Array(frames * channels);
        for (let channel = 0; channel < channels; channel += 1) {
          const samples = planar[channel];
          for (let frame = 0; frame < frames; frame += 1) {
            interleaved[frame * channels + channel] = samples[frame];
          }
        }
        emit(interleaved);
      },
      finish: () => undefined,
    };
  }
  const step = sourceRate / targetRate;
  const kernel = createKernel(Math.min(1, targetRate / sourceRate) * passband);
  const history = Array.from(
    { length: channels },
    () => new Float32Array(halfTaps * 2),
  );
  let length = halfTaps - 1;
  let base = -(halfTaps - 1);
  let next = 0;

  const produce = (): void => {
    const available = base + length;
    const outputs: number[] = [];
    for (;;) {
      const position = next * step;
      const index = Math.floor(position);
      if (index + halfTaps >= available) {
        break;
      }
      outputs.push(position);
      next += 1;
    }
    if (outputs.length === 0) {
      return;
    }
    const interleaved = new Float32Array(outputs.length * channels);
    for (const [at, position] of outputs.entries()) {
      const index = Math.floor(position);
      const phase = Math.round((position - index) * phases);
      const offset = index - halfTaps + 1 - base;
      const taps = phase * kernel.span;
      for (let channel = 0; channel < channels; channel += 1) {
        const samples = history[channel];
        let value = 0;
        for (let tap = 0; tap < kernel.span; tap += 1) {
          value += samples[offset + tap] * kernel.taps[taps + tap];
        }
        interleaved[at * channels + channel] = value;
      }
    }
    emit(interleaved);
    const keep = Math.floor(next * step) - halfTaps + 1;
    const drop = Math.max(0, keep - base);
    if (drop > 0) {
      for (const samples of history) {
        samples.copyWithin(0, drop, length);
      }
      length -= drop;
      base += drop;
    }
  };

  const append = (planar: Float32Array[]): void => {
    const frames = planar[0].length;
    if (length + frames > history[0].length) {
      const capacity = Math.max(history[0].length * 2, length + frames);
      for (let channel = 0; channel < channels; channel += 1) {
        const grown = new Float32Array(capacity);
        grown.set(history[channel].subarray(0, length));
        history[channel] = grown;
      }
    }
    for (let channel = 0; channel < channels; channel += 1) {
      history[channel].set(planar[channel], length);
    }
    length += frames;
  };

  return {
    push: (planar) => {
      append(planar);
      produce();
    },
    finish: () => {
      append(
        Array.from({ length: channels }, () => new Float32Array(halfTaps * 2)),
      );
      produce();
    },
  };
};
