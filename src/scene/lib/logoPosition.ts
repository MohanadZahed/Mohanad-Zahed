import { lerp, smoothstep } from './math';

export function logoPosition(
  index: number,
  total: number,
  progress: number,
  time: number,
): [number, number, number] {
  const radius = lerp(4, 1.5, smoothstep(0.41 / 28.25, 0.82 / 28.25, progress));
  const idleSpin = time * 0.08;
  const scrollSpin = progress * 2;
  const angle = (index / total) * Math.PI * 2 + idleSpin + scrollSpin;
  const tilt = Math.sin(progress * Math.PI * 2 + index) * 0.5;
  return [Math.cos(angle) * radius, tilt, Math.sin(angle) * radius];
}
