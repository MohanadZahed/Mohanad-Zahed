/**
 * Regenerates the favicon set in public/ from the MOZ brand mark, reduced to
 * "MO" — cream M + gold O + gold circuit underline on black, matching
 * src/sections/HeroLogo.tsx.
 *
 * The glyphs are converted to outline paths from Archivo Bold, so the shipped
 * SVG has NO webfont dependency (a favicon can't load a webfont — browsers
 * rasterize it outside the page's font context).
 *
 * Deps are intentionally NOT in package.json — this runs by hand, rarely:
 *
 *   npm i --no-save opentype.js sharp png-to-ico
 *   node scripts/generate-favicon.mjs
 *
 * Outputs: favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180),
 * icon-192.png, icon-512.png, icon-maskable-512.png.
 */
import opentype from 'opentype.js';
import sharp from 'sharp';
import pngToIcoModule from 'png-to-ico';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pngToIco = typeof pngToIcoModule === 'function' ? pngToIcoModule : pngToIcoModule.default;

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const TMP = mkdtempSync(join(tmpdir(), 'moz-favicon-'));

// Archivo Bold — the hero mark's family (index.html loads it from Google Fonts).
// Fetched via the CSS API with a legacy UA so it hands back TTF, not woff2.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@700';

const CREAM = '#f3eed6'; // --color-secondary
const GOLD = '#e8c999'; // --color-quaternary
const BLACK = '#000000'; // --color-primary

// Mark geometry as fractions of the font size — mirrors HeroLogo.tsx
// (UNDERLINE_W 4, NODE_D 11, CIRC_D 13 at CORNER_LOGO_H 60).
// The circuit parts are drawn ~30% heavier than the hero's ratios: at 16px the
// literal 4/60 stroke antialiases into a grey smear instead of a gold line.
const STROKE_MUL = 1.3;
const STROKE_F = (4 / 60) * STROKE_MUL;
const NODE_D_F = (11 / 60) * STROKE_MUL;
const CIRC_D_F = 13 / 60;
const GAP_F = 0.24; // glyph bottom → underline node centre
const TRACKING_EM = -0.025; // letterSpacing: '-0.025em'

// Tight padding is what makes the mark survive 16px — every point of margin is
// a point the glyphs don't get. Verified at 16/32px before landing on 0.08.
const PAD_FRAC = 0.08;

const r = (n) => Math.round(n * 100) / 100;

async function loadFont() {
  const css = await fetch(FONT_CSS, { headers: { 'User-Agent': 'Mozilla/4.0' } }).then((res) =>
    res.text(),
  );
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error('Could not find a TTF url in the Google Fonts CSS response');
  const buf = Buffer.from(await fetch(url).then((res) => res.arrayBuffer()));
  const file = join(TMP, 'archivo-bold.ttf');
  writeFileSync(file, buf);
  return opentype.parse(readFileSync(file).buffer);
}

/** Lay out "MO" as outline paths at font size F, baseline-left at (0,0). */
function layoutMO(font, F) {
  const scale = F / font.unitsPerEm;
  const tracking = TRACKING_EM * F;
  let x = 0;
  const glyphs = [];
  for (const ch of 'MO') {
    const glyph = font.charToGlyph(ch);
    const path = glyph.getPath(x, 0, F);
    glyphs.push({ ch, d: path.toPathData(3), bbox: path.getBoundingBox() });
    x += glyph.advanceWidth * scale + tracking;
  }
  const minX = Math.min(...glyphs.map((g) => g.bbox.x1));
  const maxX = Math.max(...glyphs.map((g) => g.bbox.x2));
  const minY = Math.min(...glyphs.map((g) => g.bbox.y1));
  const maxY = Math.max(...glyphs.map((g) => g.bbox.y2));
  return { glyphs, minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

/**
 * @param padFrac    side padding as a fraction of the canvas
 * @param radiusFrac corner radius as a fraction of the canvas (0 = full bleed)
 * @param simplify   drop the node + end circles and thicken the bar — at 16px
 *                   those details collapse into mud and close up the O's counter
 */
function buildSvg(font, { size = 512, padFrac = PAD_FRAC, radiusFrac = 0.2, simplify = false } = {}) {
  const inner = size * (1 - padFrac * 2);
  const gapF = simplify ? 0.18 : GAP_F;

  // Solve the font size so letters + underline fit the inner box on both axes.
  const probe = layoutMO(font, 100);
  const strokePerF = simplify ? STROKE_F * 1.25 : STROKE_F;
  const markHPerF = probe.h / 100 + gapF + (simplify ? strokePerF / 2 : CIRC_D_F / 2);
  const F = Math.min(inner / (probe.w / 100), inner / markHPerF);

  const L = layoutMO(font, F);
  const stroke = F * strokePerF;
  const nodeR = (F * NODE_D_F) / 2;
  const circR = (F * CIRC_D_F) / 2;
  const markH = L.h + F * gapF + (simplify ? stroke / 2 : circR);

  const left = (size - L.w) / 2;
  const baselineY = (size - markH) / 2 + L.h; // M/O have no descender
  const tx = left - L.minX;
  const nodeY = baselineY + F * gapF;
  const oBox = L.glyphs[1].bbox;
  const oCx = tx + (oBox.x1 + oBox.x2) / 2; // the stem anchors under the O
  const lineX1 = left;
  const lineX2 = left + L.w;

  const radius = r(size * radiusFrac);
  const letters = L.glyphs
    .map((g, i) => `<path fill="${i === 1 ? GOLD : CREAM}" d="${g.d}"/>`)
    .join('\n    ');
  const circuit = simplify
    ? ''
    : `
    <line x1="${r(oCx)}" y1="${r(baselineY)}" x2="${r(oCx)}" y2="${r(nodeY)}"/>
    <circle cx="${r(oCx)}" cy="${r(nodeY)}" r="${r(nodeR)}" stroke="none"/>
    <circle cx="${r(lineX1)}" cy="${r(nodeY)}" r="${r(circR)}" stroke="none"/>
    <circle cx="${r(lineX2)}" cy="${r(nodeY)}" r="${r(circR)}" stroke="none"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BLACK}"/>
  <g transform="translate(${r(tx)} ${r(baselineY)})">
    ${letters}
  </g>
  <g fill="${GOLD}" stroke="${GOLD}" stroke-width="${r(stroke)}" stroke-linecap="butt">
    <line x1="${r(lineX1)}" y1="${r(nodeY)}" x2="${r(lineX2)}" y2="${r(nodeY)}"/>${circuit}
  </g>
</svg>
`;
}

const raster = (src, size, out) =>
  sharp(src, { density: 1200 }).resize(size, size).png({ compressionLevel: 9 }).toFile(out);

const font = await loadFont();

// Shipped SVG + the 32/48px .ico members. Modern browsers prefer favicon.svg
// over the .ico even in a 16px tab, so this variant has to hold up at 16 too.
const main = buildSvg(font, { radiusFrac: 0.2 });
// iOS masks the corners itself, so the touch icon ships full-bleed with room
// to spare for the mask.
const bleed = buildSvg(font, { padFrac: 0.14, radiusFrac: 0 });
// 16px .ico member — the node + end circles are below a pixel there.
const tiny = buildSvg(font, { padFrac: 0.06, radiusFrac: 0.12, simplify: true });

for (const [name, svg] of Object.entries({ main, bleed, tiny })) {
  writeFileSync(join(TMP, `${name}.svg`), svg);
}
const tmpSvg = (name) => join(TMP, `${name}.svg`);
const out = (name) => join(PUBLIC_DIR, name);

writeFileSync(out('favicon.svg'), main);

await raster(tmpSvg('tiny'), 16, join(TMP, 'ico-16.png'));
await raster(tmpSvg('main'), 32, join(TMP, 'ico-32.png'));
await raster(tmpSvg('main'), 48, join(TMP, 'ico-48.png'));
writeFileSync(
  out('favicon.ico'),
  await pngToIco([join(TMP, 'ico-16.png'), join(TMP, 'ico-32.png'), join(TMP, 'ico-48.png')]),
);

await raster(tmpSvg('bleed'), 180, out('apple-touch-icon.png'));
await raster(tmpSvg('main'), 192, out('icon-192.png'));
await raster(tmpSvg('main'), 512, out('icon-512.png'));
await raster(tmpSvg('bleed'), 512, out('icon-maskable-512.png'));

console.log('Favicon set written to public/');
