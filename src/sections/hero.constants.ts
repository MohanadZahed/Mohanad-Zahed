// Hero intro schedule — absolute time positions (seconds from app mount).
// The three animated layers (Hero text timeline, HeroBackground SVG fly-in,
// Avatar fade) run on independent clocks that all start at mount, so ordering
// is expressed purely through these shared constants. Tune the whole intro here.

export const HERO_NAME_DELAY = 0.3; // name width-reveal start
export const HERO_NAME_DUR = 0.9; // → name done ~1.2
export const HERO_SVG_DELAY = 1.0; // SVG fly-in begins as the name lands
export const HERO_SVG_DUR = 0.7; // per-icon travel duration
export const HERO_SVG_STAGGER = 0.008; // ~52 icons → ~0.42s spread → SVGs done ~2.1
export const HERO_TITLE_DELAY = 1.9; // title slide-up overlaps the SVG tail
export const HERO_TAGLINE_DELAY = 2.4; // tagline fade
export const AVATAR_FADE_START = 2.9; // avatar fades in
export const AVATAR_FADE_END = 3.6;
export const LOGO_FADE_START = 3.5; // tech-stack ring expands in as the avatar settles
export const LOGO_FADE_END = 4.4;
