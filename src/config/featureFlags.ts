/**
 * Feature flags — flip these to toggle optional UI/behaviour.
 */

/**
 * Font switcher.
 * - `false` (default): the switcher UI is hidden AND the site is locked to the
 *   default font ({@link DEFAULT_FONT} in `useFontStore`). Any font previously
 *   saved to `localStorage` (from when the switcher was live) is ignored, so the
 *   font is deterministic for every visitor.
 * - `true`: the switcher renders and the user's choice is read from / persisted
 *   to `localStorage`.
 */
export const FONT_SWITCHER_ENABLED = false;
