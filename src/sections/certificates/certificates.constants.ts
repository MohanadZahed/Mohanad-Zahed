// Vertical scroll budget for the section.
// Phase A (sticky stage pinned, strip translates 0 → last-cert-centred) consumes
// (SECTION_VH − STAGE_VH) of scroll = 200vh. Phase B (stage scrolls up naturally,
// strip continues translating to off-screen left) consumes STAGE_VH = 100vh.
export const SECTION_VH = 300;
export const STAGE_VH = 100;
export const PHASE_A_FRACTION = (SECTION_VH - STAGE_VH) / SECTION_VH; // 2/3 ≈ 0.667

// Card sizing is responsive: at runtime the strip computes a card width that
// makes exactly 3 cards + 2 gaps fit `VIEWPORT_FILL * usable` of the viewport,
// clamped to [MIN, MAX]. On a 1920px viewport that's ~420px cards with ~93px
// gaps; on 1440px it's ~316/70; on 1024px it's clamped at 280/62.
export const VISIBLE_CARDS = 3;
export const CARD_MIN_WIDTH_PX = 280;
export const CARD_MAX_WIDTH_PX = 440;
export const CARD_ASPECT = 1.35; // height / width
export const CARD_MAX_HEIGHT_PX = 600;
export const GAP_RATIO = 0.22; // gap = card_width × GAP_RATIO
export const HEADER_MIN_WIDTH_PX = 360;
export const HEADER_MAX_WIDTH_PX = 560;
export const VIEWPORT_FILL = 0.86;
export const SIDE_PAD_MIN_PX = 40;
export const SIDE_PAD_MAX_PX = 140;
export const SIDE_PAD_RATIO = 0.06;

// Below this width the section drops the horizontal-scroll choreography and
// renders as a vertical flex column. Mirrors Experience's STACK_BREAKPOINT_PX.
export const STACK_BREAKPOINT_PX = 768;

// Alternating tilt: −8°, +8°, −8°, +8°, −8°.
export function rotationForIndex(index: number): number {
  return index % 2 === 0 ? -8 : 8;
}

export interface CertificatesLayout {
  cardW: number;
  cardH: number;
  gap: number;
  headerW: number;
  sidePad: number;
}

export function computeCertificatesLayout(viewportW: number): CertificatesLayout {
  const sidePad = clamp(SIDE_PAD_MIN_PX, viewportW * SIDE_PAD_RATIO, SIDE_PAD_MAX_PX);
  const usableW = Math.max(0, viewportW - 2 * sidePad);
  const denom = VISIBLE_CARDS + (VISIBLE_CARDS - 1) * GAP_RATIO;
  let cardW = (VIEWPORT_FILL * usableW) / denom;
  cardW = clamp(CARD_MIN_WIDTH_PX, cardW, CARD_MAX_WIDTH_PX);
  const gap = cardW * GAP_RATIO;
  const cardH = Math.min(CARD_MAX_HEIGHT_PX, cardW * CARD_ASPECT);
  const headerW = clamp(HEADER_MIN_WIDTH_PX, viewportW * 0.4, HEADER_MAX_WIDTH_PX);
  return { cardW, cardH, gap, headerW, sidePad };
}

function clamp(min: number, v: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Global progress band where the Certificates section is on stage.
// Page composition: Hero(1) + About(1) + Manifesto(6.9) + Skills(2.2 box, −2.18 overlap)
// + Knowledge(3) + Certificates(3) + Experience(~16) + Contact(1) → scroll range ≈ 32.77vh.
// NOTE: these derived markers are nominal and currently unused in code (Certificates
// runs off section-local certificatesProgress). Kept directionally correct only.
const SCROLL_RANGE_VH = 32.77;
export const CERTIFICATES_TOP_PROGRESS = 13.77 / SCROLL_RANGE_VH;
export const CERTIFICATES_PIN_END_PROGRESS = 15.77 / SCROLL_RANGE_VH;
export const CERTIFICATES_BOTTOM_PROGRESS = 16.77 / SCROLL_RANGE_VH;
