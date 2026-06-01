# Certificates section — horizontal scroll

A 3×viewport-tall HTML/CSS-only section between Knowledge and Experience. The 3D canvas is silent here.

## Shape

```
<section style="height: 300vh">           ← SECTION_VH
  <div class="certificates-stage"         ← position: sticky; top: 0; height: 100vh
       style="overflow: hidden">
    <div class="certificates-strip"       ← display: flex; width: max-content
         style="transform: translateX(...)">
      <div class="certificates-header">…</div>   ← left-most: "ich habe N Zertifikate"
      <CertificateCard index={0} … />     ← rotation: -8deg
      <CertificateCard index={1} … />     ← rotation: +8deg
      … 5 cards total, alternating ±8°
    </div>
  </div>
</section>
```

Outer section is `SECTION_VH = 300vh` so CSS sticky engages from the moment its top reaches the viewport top and releases when its bottom reaches the viewport bottom — i.e. for the first 200vh of scroll inside the section.

## One ramp, one progress field

A single section-local ScrollTrigger (`start: 'top top', end: 'bottom bottom'`) writes `useScrollStore.certificatesProgress` 0..1 across the sticky-engaged window. The trigger range is `SECTION_VH − STAGE_VH = 200vh` and CSS sticky stays engaged for the entire range — `progress = 1` coincides with the sticky-release boundary (section.bottom = viewport.bottom).

The strip's transform is a single ramp across that range:

```
x = lerp(0, X_visible, p)
X_visible = max(0, lastCardRight + sidePad − viewportW)
```

So at `p = 1` the last card's right edge sits `sidePad` in from the viewport right edge (fully visible, symmetric with the left padding) **and** sticky releases — the section then scrolls up naturally for the remaining `STAGE_VH = 100vh` of the section's height with no further horizontal motion. Experience enters from below at the same time.

No GSAP `pin: true` needed — CSS sticky expresses the timing for free. The ramp fills the full sticky-engaged window so there is no frozen-strip dead zone where the user scrolls but nothing on screen moves.

## Rules

- Card width, height, gap, header width, and side padding are computed at runtime via `computeCertificatesLayout(viewportW)` in [`certificates.constants.ts`](certificates.constants.ts). The strip writes them as CSS custom properties on the stage (`--cert-card-w`, `--cert-card-h`, `--cert-gap`, `--cert-header-w`, `--cert-pad`); `.certificate-card`, `.certificates-strip`, `.certificates-header` in [`src/index.css`](../../index.css) read those vars. Geometry constraint: exactly `VISIBLE_CARDS` (=3) cards + `VISIBLE_CARDS−1` gaps fill `VIEWPORT_FILL` (=86%) of the usable viewport, clamped to [`CARD_MIN_WIDTH_PX`, `CARD_MAX_WIDTH_PX`]. Recompute on `ResizeObserver` and `window.resize`.
- Width measurement (`X_visible`) is derived from those same runtime layout values (header + 5 cards + gaps + side pads).
- Don't trigger React re-renders for the strip's transform — subscribe to the store with `useScrollStore.subscribe` and write `element.style.transform` directly inside the subscriber. **No `requestAnimationFrame` wrapper** — ScrollTrigger's `onUpdate` already runs in the GSAP ticker (rAF-synced), so wrapping the DOM write in another rAF schedules it for the next frame and shows up as 1-frame input lag.
- No global progress reads. The strip uses `certificatesProgress` only; other sections don't read `certificatesProgress`.
- The card visual is pure CSS (`.certificate-card`, `.certificate-card__*` in [`src/index.css`](../../index.css)) — no SVG, no images, no extra fonts. Faux foil seal is a `radial-gradient` + `repeating-conic-gradient`. Keep it that way.
- Rotation comes from `rotationForIndex(i)` in [`certificates.constants.ts`](certificates.constants.ts) (`±8°`). If a future redesign needs a different distribution, change it there, not in JSX.
- Below `STACK_BREAKPOINT_PX` (768 px) **or** under `prefers-reduced-motion`, render a flat fallback: vertical column of un-rotated cards with no pin, no horizontal scroll, no ScrollTrigger. Mirror Experience's mobile fallback.

## Data

[`certificates.data.ts`](certificates.data.ts) — typed array of `{ id, name, issuer, date }`. Source of truth is the "Certifications" table in [`docs/content.md`](../../../docs/content.md). Keep ordered newest-first to match the reverse-chronological convention used elsewhere.

## Constants

[`certificates.constants.ts`](certificates.constants.ts) owns:

- `SECTION_VH`, `STAGE_VH`, `PHASE_A_FRACTION` — scroll budget.
- `VISIBLE_CARDS`, `CARD_MIN_WIDTH_PX`, `CARD_MAX_WIDTH_PX`, `CARD_ASPECT`, `CARD_MAX_HEIGHT_PX`, `GAP_RATIO`, `HEADER_MIN_WIDTH_PX`, `HEADER_MAX_WIDTH_PX`, `VIEWPORT_FILL`, `SIDE_PAD_*` — responsive geometry inputs consumed by `computeCertificatesLayout(viewportW)`.
- `CERTIFICATES_TOP_PROGRESS` / `_PIN_END_PROGRESS` / `_BOTTOM_PROGRESS` — derived global progress markers for anyone who needs to know where Certificates sits in the global timeline (e.g. future scene work). Recompute against the page's scroll range (currently ≈32.77vh) if section heights change. (These markers are currently unused in code — Certificates runs off section-local `certificatesProgress`.)
