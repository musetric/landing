export const waveformWidth = 1000;

export const waveformPath = (
  peaks: Float32Array,
  scale: number,
  height: number,
): string => {
  const step = waveformWidth / peaks.length;
  const middle = height / 2;
  const top: string[] = [];
  const bottom: string[] = [];
  for (const [bin, peak] of peaks.entries()) {
    const level = scale > 0 ? Math.min(1, peak / scale) : 0;
    const half = Math.max(0.5, (level * height) / 2);
    const x = (bin * step + step / 2).toFixed(1);
    top.push(`${x},${(middle - half).toFixed(1)}`);
    bottom.push(`${x},${(middle + half).toFixed(1)}`);
  }
  return `M${top.join(' L')} L${bottom.toReversed().join(' L')} Z`;
};
