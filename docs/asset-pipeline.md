# Asset pipeline

How 3D assets enter the project, what formats they live in, and how they're optimized before commit.

## Folder layout

```
public/
├── models/           # final .glb files (avatar, accessories)
└── textures/
    └── logos/        # one file per tech logo

assets/source/        # originals (svg, raw glb) — keep for re-export
                      # consider gitignoring large originals
```

## Logos

- Source: [simpleicons.org](https://simpleicons.org) or [vectorlogo.zone](https://vectorlogo.zone). Both expose clean SVGs.
- Pipeline: SVG → 1024×1024 transparent PNG → `.webp` (lossy q=85) or `.ktx2` (basisu) for production.
- Naming: `{tech-name}.{ext}` lowercase kebab-case. Examples: `angular.ktx2`, `nx.ktx2`, `react.ktx2`, `sap-composable-storefront.ktx2`.
- Required priority list: see `docs/content.md` → "Tech stack — orbit logos".

## Avatar

- Source: [Ready Player Me](https://readyplayer.me) (free for personal portfolios — read TOS) or hand-modelled in Blender.
- Pipeline: export `.glb` → `gltf-transform optimize avatar.glb avatar.opt.glb` (applies draco + meshopt + texture resize). Target ≤2 MB.
- Place at `public/models/avatar.glb`.
- Preload at module level with `useGLTF.preload('/models/avatar.glb')`.

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

This gives a dark, glowing tech-portfolio aesthetic — avatar lit with colored point lights, orbiting logos catching the colors as they pass through. No file to load, no `<Environment>`, no Polyhaven dependency.

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
