export const waveformWidth = 1000;

const waveformSegments = 960;

export const waveformPath = (
  peaks: Float32Array,
  scale: number,
  height: number,
): string => {
  const pairs = peaks.length / 2;
  const step = waveformWidth / waveformSegments;
  const middle = height / 2;
  const level = (value: number): number =>
    scale > 0 ? Math.max(-1, Math.min(1, value / scale)) : 0;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let segment = 0; segment < waveformSegments; segment += 1) {
    const first = Math.floor((segment * pairs) / waveformSegments);
    const last = Math.max(
      first + 1,
      Math.floor(((segment + 1) * pairs) / waveformSegments),
    );
    let low = 0;
    let high = 0;
    for (let pair = first; pair < last && pair < pairs; pair += 1) {
      low = Math.min(low, level(peaks[pair * 2]));
      high = Math.max(high, level(peaks[pair * 2 + 1]));
    }
    const x = (segment * step + step / 2).toFixed(1);
    top.push(
      `${x},${Math.min(middle - 0.5, middle - high * middle).toFixed(1)}`,
    );
    bottom.push(
      `${x},${Math.max(middle + 0.5, middle - low * middle).toFixed(1)}`,
    );
  }
  return `M${top.join(' L')} L${bottom.toReversed().join(' L')} Z`;
};
