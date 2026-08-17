# Asset pipeline

How 3D assets enter the project, what formats they live in, and how they're optimized before commit.

## Folder layout

```
public/
├── models/           # final .glb files (avatar, accessories)
├── textures/
│   └── logos/        # one file per tech logo
└── favicon.*         # generated icon set — see "Favicon / app icons" below.
    icon-*.png        # Do not hand-edit; regenerate via scripts/generate-favicon.mjs
    apple-touch-icon.png

assets/source/        # originals (svg, raw glb) — keep for re-export
                      # gitignored: too large for the repo, so back these up
                      # outside git (currently: avatar-yoga.glb, 18.5 MB)
```

## Logos

- Source: [simpleicons.org](https://simpleicons.org) or [vectorlogo.zone](https://vectorlogo.zone). Both expose clean SVGs.
- Pipeline: SVG → 1024×1024 transparent PNG → `.webp` (lossy q=85) or `.ktx2` (basisu) for production.
- Naming: `{tech-name}.{ext}` lowercase kebab-case. Examples: `angular.ktx2`, `nx.ktx2`, `react.ktx2`, `sap-composable-storefront.ktx2`.
- Required priority list: see `docs/content.md` → "Tech stack — ring logos".

## Favicon / app icons

The favicon is the **MOZ mark with the Z dropped** — cream `M` + gold `O` + gold circuit underline on black. Generated, not hand-drawn: [scripts/generate-favicon.mjs](../scripts/generate-favicon.mjs) emits all seven files into `public/`. **Never hand-edit the outputs** — they'll be overwritten on the next run.

```bash
npm i --no-save opentype.js sharp png-to-ico   # not project deps: this runs by hand, rarely
node scripts/generate-favicon.mjs
```

Outputs: `favicon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. `site.webmanifest` is hand-maintained and references the last three. All are wired up in `index.html`'s `<head>`.

### Why it's built this way

- **Text → outline paths, not `<text>`.** Browsers rasterize a favicon outside the page's font context, so `<text font-family="Archivo">` would render in whatever the OS happens to have. The script fetches Archivo Bold from the Google Fonts CSS API — with a **legacy `User-Agent`**, which is what makes the API hand back a `.ttf` instead of woff2 (`opentype.js` can't parse woff2) — and converts `M` + `O` to paths. The shipped SVG is therefore self-contained.
- **Geometry mirrors the hero mark.** `STROKE_F` / `NODE_D_F` / `CIRC_D_F` / `TRACKING_EM` are the `HeroLogo.tsx` constants (`UNDERLINE_W` 4, `NODE_D` 11, `CIRC_D` 13 at `CORNER_LOGO_H` 60, `letterSpacing: -0.025em`) expressed as fractions of the font size. The stem anchors under the O exactly as in the hero. Colours are `--color-secondary` / `--color-quaternary` / `--color-primary`.
- **The 16px tab is the real constraint.** Two design decisions exist only because of it: padding is `PAD_FRAC = 0.08` (every point of margin is a point the glyphs don't get) and the circuit strokes are `STROKE_MUL = 1.3`× the hero's ratios (at 4/60 the line antialiases into a grey smear rather than a gold stroke). At 13% padding and literal ratios the O's counter fills in and the M reads as mush. **Re-render at 16px and actually look at it before changing either constant.**
- **`favicon.svg` wins over `favicon.ico` in modern browsers**, including at 16px — so 16px legibility must be solved in the SVG. The `.ico`'s 16px member uses the generator's `simplify: true` variant (plain bar, node + end circles dropped — they're sub-pixel there), but that variant only ever reaches old Edge/Safari.
- **`favicon.ico` stays at the public root.** Google's crawler probes `/favicon.ico` directly for the search-result icon.
- `apple-touch-icon.png` and `icon-maskable-512.png` ship **full-bleed** (`radiusFrac: 0`, extra padding) because iOS and Android apply their own corner mask; the rounded-corner variant is only for `favicon.svg` / `icon-192` / `icon-512`.
- No external license — derived from the site's own brand mark. Archivo is SIL OFL.

## Math constellations (Knowledge backdrop)

- `public/textures/math1.svg` … `math7.svg` — seven procedural artworks (PCB-style traced paths, fill-only grayscale). Used by [src/scene/MathBackdrop.tsx](../src/scene/MathBackdrop.tsx) as cursor-reactive planes arranged in an upper-ellipse arc behind the yoga avatar in the Knowledge section.
- Load order is the filename order (math1 left-most, math7 right-most). To swap or add a constellation, edit the `SVG_ENTRIES` array at the top of `MathBackdrop.tsx`; per-SVG plane size is auto-derived from the entry's `w / h` (pixels) so any aspect ratio is fine.
- SVGs are loaded via `useTexture` (drei) — browsers rasterize SVG-as-`HTMLImageElement` and Three's `TextureLoader` consumes the result. No KTX2 / WebP conversion needed; the source SVGs ship as-is.
- Naming: `math{n}.svg` lowercase. No external license — generated artwork.

## Avatar

- Source: [Ready Player Me](https://readyplayer.me) (free for personal portfolios — read TOS) or hand-modelled in Blender.
- Pipeline: export `.glb` → `gltf-transform optimize` (see the command below). Target ≤2 MB.
- Place at `public/models/avatar.glb`.
- Preload at module level with `useGLTF.preload('/models/avatar.glb')`.
- Hero-only: `index.html` also carries a `<link rel="preload" as="fetch">` for `avatar.glb`, because it gates the intro veil and three's `FileLoader` can't request it until the bundle has parsed.

## Yoga avatar (Knowledge section)

- `public/models/avatar-yoga.glb` — the om-pose figure at world origin in Knowledge. **1.6 MB, 205k tris, meshopt + WebP.**
- **Never ship a raw exporter GLB here.** It arrived as an 18.5 MB `pygltflib` export with no compression (13.3 MB of raw geometry + 5.2 MB of JPEGs) and caused a 3–4 s "avatar pops in late" on every first visit. Un-optimized originals live in `assets/source/` and are the input for re-exports:

```bash
npx --yes @gltf-transform/cli@4 optimize \
  assets/source/avatar-yoga.glb public/models/avatar-yoga.glb \
  --compress meshopt --texture-compress webp --texture-size 1024
```

- **Leave `--simplify-error` at its default (`0.0001`)** — it yields 205k tris / 1.6 MB. Passing `0.001` looks tempting (571 KB) but collapses the mesh to 35k tris. `--simplify false` keeps all 424k tris at 2.7 MB if fidelity ever matters more than bytes.
- The CLI package is **`@gltf-transform/cli`**; a bare `npx gltf-transform` fails with `ENOVERSIONS`.
- Both avatars stay on **meshopt + WebP** (not Draco/KTX2) — drei's `useGLTF` handles that combination with no loader setup.
- **No module-level preload for this file.** It must stay out of `useProgress`, which gates the hero veil; `src/scene/Scene.tsx` mounts it in a post-intro warm-up window instead. See `src/scene/CLAUDE.md` → "Knowledge warm-up".

## Lighting

No HDRI. Use CSS gradient on the canvas parent and Three.js lights directly:

```css
/* canvas parent */
background: linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 100%);
```

```jsx
<ambientLight intensity={0.2} />
<directionalLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
<pointLight position={[-4, 2, -2]} intensity={2} color="#818cf8" /> {/* indigo rim */}
<pointLight position={[4, 0, 2]} intensity={1} color="#38bdf8" />   {/* sky blue fill */}
```

This gives a dark, glowing tech-portfolio aesthetic — avatar lit with colored point lights, circling logos catching the colors as they pass through. No file to load, no `<Environment>`, no Polyhaven dependency.

## Compression commands (reference)

```bash
# glTF: combined draco + meshopt + texture resize
npx gltf-transform optimize avatar.glb avatar.opt.glb

# PNG → KTX2 (basisu UASTC for normal-quality textures, ETC1S for color logos)
toktx --bcmp --t2 logo.ktx2 logo.png

# PNG → WebP (fallback path)
cwebp -q 85 logo.png -o logo.webp
```

## Verification

- Run Lighthouse on a deployed preview. Target: total transferred ≤30 MB on first load.
- DevTools → Performance → record a scroll cycle. Aim for steady 60fps on M1 Air.
- `r3f-perf` overlay (dev only) to confirm draw call count stays ≤120 in the hero scene.

## Licensing

- Logos from simpleicons.org are CC0 / SIL OFL — fine to use; check each on first inclusion.
- Ready Player Me avatars: free for personal portfolios, read current TOS before launch.
- Anything else (custom 3D, fonts) — record license in this file when adding.
