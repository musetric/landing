const lineWidth = 1000;
const waveHeight = 64;
const melody = [95, 95, 70, 70, 82, 58, 58, 80];

const pitchLine = (shift: number[], lag: number): string => {
  const noteWidth = lineWidth / melody.length;
  const points: string[] = [];
  for (let x = 0; x <= lineWidth; x += 4) {
    const position = x - lag;
    const index = Math.min(
      melody.length - 1,
      Math.max(0, Math.floor(position / noteWidth)),
    );
    const previous = melody[Math.max(0, index - 1)];
    const local = (position - index * noteWidth) / noteWidth;
    const glide = Math.min(1, Math.max(0, local * 5));
    const vibrato = local > 0.55 ? Math.sin(x * 0.16) * 3 : 0;
    const y =
      previous + (melody[index] - previous) * glide + shift[index] + vibrato;
    points.push(`${x},${y.toFixed(1)}`);
  }
  return points.join(' ');
};

const waveform = (seed: number, loudness: (time: number) => number) => {
  const count = 150;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let index = 0; index < count; index++) {
    const time = index / (count - 1);
    const grain =
      0.35 +
      0.65 *
        Math.abs(
          Math.sin(index * 0.53 + seed) * Math.cos(index * 0.17 + seed * 1.7),
        );
    const level = Math.max(0.04, loudness(time) * grain);
    const x = (time * lineWidth).toFixed(1);
    top.push(`${x},${((waveHeight / 2) * (1 - level)).toFixed(1)}`);
    bottom.push(`${x},${((waveHeight / 2) * (1 + level)).toFixed(1)}`);
  }
  return `M${[...top, ...bottom.toReversed()].join(' L')} Z`;
};

const inVerse = (time: number, from: number): boolean =>
  (time > from && time < 0.44) || (time > from + 0.44 && time < 0.92);

export const singerPitch = pitchLine([0, 0, 0, 0, 0, 0, 0, 0], 0);

export const takePitch = pitchLine([0, 0, 0, 0, 12, 0, -6, 0], 24);

export const leadWave = waveform(1.3, (time) =>
  inVerse(time, 0.12) ? 0.9 : 0.06,
);

export const backingWave = waveform(4.1, (time) =>
  inVerse(time, 0.28) ? 0.55 : 0.05,
);

export const instrumentalWave = waveform(
  2.2,
  (time) => 0.55 + 0.25 * Math.sin(time * 9),
);

export const waveBox = `0 0 ${lineWidth} ${waveHeight}`;

export const pitchBox = `0 0 ${lineWidth} 150`;
