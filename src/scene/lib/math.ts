export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * easeOutBack — overshoots past 1 then settles, giving a "pop" / spring feel.
 * Pure function of `t` (0..1) so it scrubs cleanly in both scroll directions.
 * Larger `s` = more overshoot (default 1.70158 ≈ ~10% past target).
 */
export const backOut = (t: number, s = 1.70158) => {
  const c3 = s + 1;
  const u = t - 1;
  return 1 + c3 * u * u * u + s * u * u;
};
