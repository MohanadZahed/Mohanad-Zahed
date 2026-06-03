/**
 * Coalesces bursty event handlers (resize, scroll) to at most one trailing
 * invocation per animation frame. Resize/orientation events can fire dozens of
 * times per second, and handlers that do layout reads + setState otherwise thrash
 * once per event; wrapping them runs the work at most once per frame with the
 * latest arguments.
 *
 * Call `.cancel()` in cleanup to drop a pending frame.
 */
export function rafThrottle<A extends unknown[]>(fn: (...args: A) => void) {
  let frame = 0;
  let lastArgs: A;
  const wrapped = (...args: A) => {
    lastArgs = args;
    if (frame !== 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      fn(...lastArgs);
    });
  };
  wrapped.cancel = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  return wrapped;
}
