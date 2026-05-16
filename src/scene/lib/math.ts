export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Piecewise linear interpolation across a table of [x, y] control points
// (x values must be in ascending order). Returns the endpoint y outside the
// table range.
export const lerpRamp = (x: number, points: ReadonlyArray<readonly [number, number]>) => {
  if (points.length === 0) return 0;
  if (x <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0));
  }
  return last[1];
};
