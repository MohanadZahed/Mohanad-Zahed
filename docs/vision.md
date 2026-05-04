# Vision — "The Orbit"

## Metaphor

You are the gravitational center. The tech stack orbits you like planets. Scrolling pulls the orbit through phases — chaos to order to dispersal — telling the story "I work with this whole ecosystem; here's how each piece fits."

It must feel calm and hypnotic, never aggressive. Soft rim lighting on the avatar, slight depth-of-field blur on the furthest logos, neutral palette with a vignette and subtle grain.

## Scroll timeline (0.00 → 1.00, normalised)

Section progress map (5 sections, each `min-h-screen`): Hero top = 0.00, About top = 0.25, Projects top = 0.50, Experience top = 0.75, Contact top = 1.00. About is **vertically centered** in the viewport at progress = 0.25.

| Range | Section | Orbit radius | Spin | Avatar | Camera |
|---|---|---|---|---|---|
| 0.00–0.10 | Hero | 4.0 | idle drift (autonomous, no scroll needed) | centered, idle breathing, full opacity | static, slight DoF on far logos |
| 0.10–0.25 | Hero → About | lerp 4.0 → 1.5 | scroll layers velocity onto idle drift | drifts left to x ≈ −2.6, yaws 0 → ~36°; settled by progress 0.25 | small dolly-in |
| 0.25 | About center | 1.5 | normal | **pinned to the vertical centre of the About section** in document space — the anchor's world-Y now tracks scroll so the avatar appears glued to that document position | static |
| 0.25–0.50 | About → Projects | 1.5 | normal | anchor translates up in world-Y at the same rate as page scroll, so the avatar scrolls off-screen above with the About section | static |
| 0.50–0.75 | Projects → Experience | logos detach, fly to card corners | per-logo spin | off-screen above; **the pin keeps the avatar attached to About — it does not return** | follows scrolled cards |
| 0.75–1.00 | Experience → Contact | 6.0, slow drift | idle | off-screen above (pinned to About) | pulls back |

Implementation note: the leftward translate + yaw are driven by `smoothstep(0.10, 0.25, progress)` (clamped at 1.0). The vertical pin is `anchor.position.y = max(0, progress − 0.25) × totalScrollPx / windowHeight × viewportWorldHeight` — i.e. the anchor matches scroll velocity in world units once About is centered, so the avatar appears stationary in document space. Together these signals leave the avatar settled at the left side of the About section, and it leaves the viewport upward as the user scrolls into Projects.

Use `smoothstep(start, end, progress)` for transitions between bands so you don't get linear-ramp artifacts.

## Reference position function

```ts
function logoPosition(
  index: number,
  total: number,
  progress: number,
  time: number,
): [number, number, number] {
  const radius = lerp(4, 1.5, smoothstep(0.20, 0.35, progress));
  const idleSpin = time * 0.08;     // autonomous slow drift, rad/s
  const scrollSpin = progress * 2;  // scroll layers velocity on top
  const angle = (index / total) * Math.PI * 2 + idleSpin + scrollSpin;
  const tilt = Math.sin(progress * Math.PI * 2 + index) * 0.5;
  return [Math.cos(angle) * radius, tilt, Math.sin(angle) * radius];
}
```

In the component:

```tsx
useFrame(({ clock }) => {
  const p = useScrollStore.getState().progress;
  const [x, y, z] = logoPosition(index, total, p, clock.elapsedTime);
  meshRef.current.position.lerp(new Vector3(x, y, z), 0.1);
});
```

The `0.1` lerp factor is responsible for ~40% of how good the motion feels. Keep it.

## Section storyboards

**Hero (0.00–0.20)** — Soft neutral background, vignette, grain. Avatar centered. 10 logos orbit at r=4 with an autonomous slow drift (a full revolution every ~80s) so the scene feels alive even before the visitor scrolls. Each logo carries a small point light tinted to its brand color, so as it passes near the avatar it casts a colored glow on the nearest side. Headline overlay top-left: name + role.

**About (0.10–0.25, then pinned)** — Avatar + orbit fly to the left of the viewport (x ≈ −2.6) and the avatar yaws ~36° into a 3/4 view facing the right side, where About copy reveals. The leftward motion completes by progress 0.25, the moment About is vertically centred in the viewport. From that point the anchor is **pinned to the About section** in document space: as the user scrolls further into Projects/Experience/Contact, the avatar scrolls off-screen upward with About instead of staying in the viewport. It belongs to About; subsequent sections own their own visual treatment.

**Projects (0.50–0.70)** — Logos break out of the grid one at a time and fly to the corners of project cards. Each card has 3–5 stack-badge logos in its corner. Cards reveal on scroll-into-view.

**Experience (0.70–0.85)** — Avatar dims, logos retreat to ambient orbit at r=6. Vertical timeline of roles + key projects.

**Contact (0.85–1.00)** — Camera pulls back; full scene visible, gently drifting. CTA + email + LinkedIn link. Footer fades in.
