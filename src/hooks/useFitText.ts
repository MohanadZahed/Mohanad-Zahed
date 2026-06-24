import { useCallback, useEffect, useRef } from 'react';
import { rafThrottle } from '../lib/rafThrottle';
import { clamp } from '../scene/lib/math';

// Shrink to slightly under the measured budget so sub-pixel rounding between our
// off-DOM measurement and the live render can't tip the last word onto line 2.
const FIT_SAFETY = 0.99;

export interface FitTextOptions {
  /** The FULL string to fit. Measured as-is (never a typed substring), so the
   *  size stays stable while a Typewriter types the visible text in. */
  text: string;
  /** Smallest font size (px) before we give up on one line and allow a wrap. */
  minFontPx?: number;
  /** Where to read the available width. `'self'` (default) uses the heading's
   *  own content box — correct for normal block headings that fill their
   *  container. `'parent'` uses the parent's content box — required for
   *  centered / shrink-to-content / absolutely-positioned headings whose own
   *  width equals the text width (and so changes as a Typewriter types in). */
  widthFrom?: 'self' | 'parent';
  /** Multiplier applied to the measured available width (safety margin / to
   *  match a CSS max-width). Default 1. */
  maxWidthFraction?: number;
  /** Extra width (in `ch`) to reserve when measuring — set to the width of a
   *  Typewriter cursor (`0.6`), which occupies layout space even while hidden,
   *  so the fit accounts for it instead of overflowing by a cursor's width. */
  reserveCh?: number;
  /** Resolve the target by id instead of the returned ref (used when the
   *  heading element is owned by another component, e.g. `<Typewriter as='h2'>`). */
  elementId?: string;
  /** Default true. */
  enabled?: boolean;
}

/**
 * Shrinks a heading's font size so its full text fits on ONE line. Only scales
 * DOWN from the element's computed base size (a `clamp()` or breakpoint value),
 * so the heading returns to its base when the viewport widens. Below `minFontPx`
 * it stops shrinking and allows a wrap as a last resort.
 *
 * The base font size must NOT live in React's inline `style` for elements that
 * re-render (React would re-apply it and clobber the imperative override every
 * frame) — put the base in a CSS rule and let this hook own the live size.
 * Class/CSS-based sizes are fine: an inline override wins over them and survives
 * re-renders.
 *
 * Returns a stable callback ref to attach to the heading (omit when using
 * `elementId`).
 */
export function useFitText<T extends HTMLElement>({
  text,
  minFontPx = 22,
  widthFrom = 'self',
  maxWidthFraction = 1,
  reserveCh = 0,
  elementId,
  enabled = true,
}: FitTextOptions): (node: T | null) => void {
  const elRef = useRef<T | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  const measure = useCallback(() => {
    const el =
      elRef.current ?? (elementId ? (document.getElementById(elementId) as T | null) : null);
    if (!el || !enabled || !text) return;

    // Clear any prior override so getComputedStyle reports the true base size
    // (lets the heading grow back up when there's room again).
    el.style.fontSize = '';
    el.style.whiteSpace = '';

    const cs = getComputedStyle(el);
    const baseFontPx = parseFloat(cs.fontSize);
    if (!baseFontPx) return;

    // Read the budget from a STABLE box. For centered / shrink-to-content
    // headings the element's own width tracks the (possibly partially-typed)
    // text, so we measure the parent's content box instead — constant while a
    // Typewriter types in, so the fitted size never drifts.
    const measureEl = widthFrom === 'parent' ? (el.parentElement ?? el) : el;
    const ms = measureEl === el ? cs : getComputedStyle(measureEl);
    const padX = parseFloat(ms.paddingLeft) + parseFloat(ms.paddingRight);
    const availPx = (measureEl.clientWidth - padX) * maxWidthFraction;
    if (availPx <= 0) return;

    let span = spanRef.current;
    if (!span) {
      span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.style.cssText =
        'position:absolute;visibility:hidden;white-space:nowrap;top:-9999px;left:-9999px;pointer-events:none;margin:0;padding:0;';
      document.body.appendChild(span);
      spanRef.current = span;
    }
    // Mirror the metrics that affect text width (uppercase + letter-spacing matter).
    span.style.fontFamily = cs.fontFamily;
    span.style.fontWeight = cs.fontWeight;
    span.style.fontStyle = cs.fontStyle;
    span.style.letterSpacing = cs.letterSpacing;
    span.style.textTransform = cs.textTransform;
    span.style.fontSize = `${baseFontPx}px`;
    // Text plus a cursor-width reserve (a Typewriter cursor occupies layout
    // width even when hidden). `textContent` clears any prior reserve child.
    span.textContent = text;
    if (reserveCh > 0) {
      const reserve = document.createElement('span');
      reserve.style.display = 'inline-block';
      reserve.style.width = `${reserveCh}ch`;
      span.appendChild(reserve);
    }

    const budget = availPx * FIT_SAFETY;
    const naturalPx = span.getBoundingClientRect().width;
    if (naturalPx <= budget) {
      // Already fits — keep base, but pin to one line so a hair-width overflow
      // can't trigger a wrap.
      el.style.whiteSpace = 'nowrap';
      return;
    }

    // Width scales ~linearly with font size; one refinement pass corrects the
    // constant letter-spacing offset.
    let targetPx = baseFontPx * (budget / naturalPx);
    span.style.fontSize = `${targetPx}px`;
    const refinedPx = span.getBoundingClientRect().width;
    if (refinedPx > 0) targetPx *= budget / refinedPx;

    if (targetPx < minFontPx) {
      el.style.fontSize = `${minFontPx}px`;
      el.style.whiteSpace = 'normal'; // last resort: let it wrap
    } else {
      el.style.fontSize = `${clamp(targetPx, minFontPx, baseFontPx)}px`;
      el.style.whiteSpace = 'nowrap';
    }
  }, [text, minFontPx, widthFrom, maxWidthFraction, reserveCh, elementId, enabled]);

  // Callback ref: store the node and do an immediate fit when it attaches.
  const setRef = useCallback(
    (node: T | null) => {
      elRef.current = node;
      if (node) measure();
    },
    [measure],
  );

  // Re-measure on resize (element + viewport — viewport catches clamp()-base
  // changes when the element width is fixed), web-font load, and whenever
  // text/options (locale) change. The throttle is created here, never during
  // render. Re-runs on `measure` identity change (its deps include `text`).
  useEffect(() => {
    const throttled = rafThrottle(() => measure());
    const target =
      elRef.current ?? (elementId ? document.getElementById(elementId) : null);

    const ro = new ResizeObserver(throttled);
    if (target) ro.observe(target);
    window.addEventListener('resize', throttled, { passive: true });
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => throttled()).catch(() => {});
    }
    throttled();

    return () => {
      throttled.cancel();
      ro.disconnect();
      window.removeEventListener('resize', throttled);
    };
  }, [measure, elementId]);

  // Drop the hidden measuring span on unmount.
  useEffect(
    () => () => {
      spanRef.current?.remove();
      spanRef.current = null;
    },
    [],
  );

  return setRef;
}
