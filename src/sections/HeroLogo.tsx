import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';
import { useFontStore } from '../store/useFontStore';
import { useT } from '../i18n/useT';
import {
  HERO_LINES_DELAY,
  HERO_LINES_DUR,
  HERO_O_FLICKER_DELAY,
  HERO_O_FLICKER_DUR,
  HERO_O_TRAVEL_DELAY,
  HERO_O_TRAVEL_DUR,
  HERO_LINES_FADE_DELAY,
  HERO_LINES_FADE_DUR,
  HERO_BUILD_DELAY,
  HERO_BUILD_DUR,
  HERO_TITLE_DELAY,
  HERO_TITLE_DUR,
  HERO_TAGLINE_DELAY,
  HERO_TAGLINE_DUR,
  HERO_COLLAPSE_DISTANCE_FRAC,
  HERO_COLLAPSE_FORM_END,
  HERO_PARK_UP_START,
  HERO_PARK_UP_END,
  HERO_PARK_LEFT_START,
  HERO_PARK_LEFT_END,
} from './hero.constants';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Geometry constants (px, design space — scale with the rest at corner-park).
const SQUARE_HALF = 55; // → 110px construction square at viewport centre
const GAP = 30; // vertical-connector length (O bottom → underline node)
const O_BASE_RATIO = 0.78; // fraction of the O box height where the cap glyph bottom sits
const CORNER_X = 28; // parked-mark left inset
const CORNER_Y = 22; // parked-mark top inset
const CORNER_LOGO_H = 46; // parked-mark target glyph height
const CORNER_LOGO_H_MOBILE = 26; // smaller parked mark on phones
const CORNER_INSET_MOBILE = 14; // tighter corner inset on phones
const LINE_W = 2; // construction crosshair thickness
const UNDERLINE_W = 4; // circuit underline thickness (vertical connector + segments)
const NODE_D = 11;
const CIRC_D = 13;
const O_IDX = 1; // the "O" in "Mohanad" — gold, and the underline's anchor
// Dark backdrop behind the parked mark (so it stays legible over light sections).
const PAD_X = 26; // local px breathing room left/right of the mark
const PAD_Y = 18; // local px breathing room top/bottom of the mark
const BACKDROP_RADIUS = 22;

type Props = {
  triggerRef: RefObject<HTMLElement | null>;
};

export function HeroLogo({ triggerRef }: Props) {
  const { t } = useT();
  const NAME = t('hero.name'); // locale-neutral proper noun ("Mohanad Zahed")
  const TITLE = t('hero.title');
  const TAGLINE = t('hero.tagline');
  const chars = [...NAME];
  const spaceIdx = NAME.indexOf(' ');
  const zIdx = spaceIdx + 1; // first letter of the surname → the "Z" kept in MOZ
  const KEEP = new Set([0, O_IDX, zIdx]);
  const maxDist = Math.max(O_IDX, chars.length - 1 - O_IDX);

  // Re-run the measure/compose when the site font changes (letter widths shift).
  const font = useFontStore((s) => s.font);

  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introORef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const nameWrapRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);
  const darkScreenRef = useRef<HTMLDivElement>(null);
  const introPlayedRef = useRef(false);

  // Underline sub-elements
  const vLineRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const leftSegRef = useRef<HTMLDivElement>(null);
  const rightSegRef = useRef<HTMLDivElement>(null);
  const leftCircRef = useRef<HTMLDivElement>(null);
  const rightCircRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const column = columnRef.current;
    const nameWrap = nameWrapRef.current;
    const name = nameRef.current;
    const title = titleRef.current;
    const tagline = taglineRef.current;
    const introO = introORef.current;
    const darkScreen = darkScreenRef.current;
    if (!overlay || !column || !nameWrap || !name || !title || !tagline || !introO || !darkScreen) {
      return;
    }
    const lines = lineRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const hLines = lines.filter((el) => el.dataset.axis === 'h');
    const vLines = lines.filter((el) => el.dataset.axis === 'v');

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const composedFinal = reduced || introPlayedRef.current;

    const S = { build: 0, titleIn: 0, taglineIn: 0, collapse: 0 };
    const baseW: number[] = [];

    // ----- measure (collapse 0) + place column -----
    const layout = () => {
      for (let i = 0; i < chars.length; i++) {
        const el = charRefs.current[i];
        if (el) el.style.width = '';
      }
      nameWrap.style.transform = 'none';
      const vh = document.documentElement.clientHeight;
      column.style.top = `${vh * 0.18}px`;
      for (let i = 0; i < chars.length; i++) {
        const r = charRefs.current[i]?.getBoundingClientRect();
        baseW[i] = r ? r.width : 0;
      }
    };

    const render = () => {
      const { build, titleIn, taglineIn, collapse } = S;
      const form = smoothstep(0, HERO_COLLAPSE_FORM_END, collapse);
      const copyFade = smoothstep(0, 0.4, collapse);
      // Two-stage park: rise + shrink to the top, then slide left into the corner.
      const parkUp = smoothstep(HERO_PARK_UP_START, HERO_PARK_UP_END, collapse);
      const parkLeft = smoothstep(HERO_PARK_LEFT_START, HERO_PARK_LEFT_END, collapse);

      // 1) letters (set width/opacity first so the live measure below is accurate)
      for (let i = 0; i < chars.length; i++) {
        const el = charRefs.current[i];
        if (!el) continue;
        const dist = Math.abs(i - O_IDX);
        const rs = (dist / maxDist) * 0.6;
        const reveal = i === O_IDX ? (build > 0 ? 1 : 0) : smoothstep(rs, rs + 0.28, build);
        el.style.transform = `translateY(${(1 - reveal) * 8}px)`;
        if (KEEP.has(i)) {
          el.style.opacity = String(reveal);
        } else {
          el.style.opacity = String(reveal * (1 - form));
          el.style.width = form > 0 ? `${(baseW[i] ?? 0) * (1 - form)}px` : '';
        }
      }

      // 2) underline geometry — measured in nameWrap-LOCAL space via offset* (which
      //    ignore the park transform), so the underline lives in the same space as
      //    the letters and parks as one unit. Tracks the O through reveal, font
      //    changes, and the collapse (Z gathering toward "MOZ").
      const oEl = charRefs.current[O_IDX];
      const mEl = charRefs.current[0];
      const lastEl = charRefs.current[chars.length - 1];
      if (oEl && mEl && lastEl) {
        const oX = oEl.offsetLeft + oEl.offsetWidth / 2;
        const oBottom = oEl.offsetTop + oEl.offsetHeight * O_BASE_RATIO;
        const lX = mEl.offsetLeft;
        const rX = lastEl.offsetLeft + lastEl.offsetWidth;
        const nodeY = oBottom + GAP;
        const vLine = vLineRef.current;
        const node = nodeRef.current;
        const leftSeg = leftSegRef.current;
        const rightSeg = rightSegRef.current;
        const leftCirc = leftCircRef.current;
        const rightCirc = rightCircRef.current;
        if (vLine) {
          vLine.style.left = `${oX}px`;
          vLine.style.top = `${oBottom}px`;
          vLine.style.transform = `translateX(-50%) scaleY(${smoothstep(0, 0.28, build)})`;
        }
        if (node) {
          node.style.left = `${oX}px`;
          node.style.top = `${nodeY}px`;
          node.style.transform = `translate(-50%, -50%) scale(${smoothstep(0.22, 0.4, build)})`;
        }
        if (leftSeg) {
          leftSeg.style.left = `${lX}px`;
          leftSeg.style.top = `${nodeY}px`;
          leftSeg.style.width = `${Math.max(0, oX - lX)}px`;
          leftSeg.style.transform = `translateY(-50%) scaleX(${smoothstep(0.32, 0.7, build)})`;
        }
        if (rightSeg) {
          rightSeg.style.left = `${oX}px`;
          rightSeg.style.top = `${nodeY}px`;
          rightSeg.style.width = `${Math.max(0, rX - oX)}px`;
          rightSeg.style.transform = `translateY(-50%) scaleX(${smoothstep(0.32, 0.9, build)})`;
        }
        if (leftCirc) {
          leftCirc.style.left = `${lX}px`;
          leftCirc.style.top = `${nodeY}px`;
          leftCirc.style.transform = `translate(-50%, -50%) scale(${smoothstep(0.62, 0.78, build)})`;
        }
        if (rightCirc) {
          rightCirc.style.left = `${rX}px`;
          rightCirc.style.top = `${nodeY}px`;
          rightCirc.style.transform = `translate(-50%, -50%) scale(${smoothstep(0.82, 1, build)})`;
        }
        // Dark backdrop hugging the mark — fades in as it parks so the cream
        // letters stay legible over light sections. Sized in local space, it
        // scales/moves with the mark (parented to nameWrap).
        const backdrop = backdropRef.current;
        if (backdrop) {
          const bTop = -PAD_Y;
          const bBottom = nodeY + CIRC_D / 2 + PAD_Y;
          backdrop.style.left = `${lX - PAD_X}px`;
          backdrop.style.width = `${rX - lX + PAD_X * 2}px`;
          backdrop.style.top = `${bTop}px`;
          backdrop.style.height = `${bBottom - bTop}px`;
          backdrop.style.opacity = String(smoothstep(0.15, 0.5, collapse));
        }
      }

      // 3) supporting copy
      title.style.opacity = String(titleIn * (1 - copyFade));
      title.style.transform = `translateY(${(1 - titleIn) * 20}px)`;
      tagline.style.opacity = String(taglineIn * (1 - copyFade));
      tagline.style.transform = `translateY(${(1 - taglineIn) * 16}px)`;

      // 4) corner park — only the name+underline mark flies to the corner; the
      //    title/tagline just fade in place. tx/ty/ts read transform-independent
      //    offsets so they track the gathering "MOZ" centre as it collapses.
      //    Smaller parked mark + tighter inset on phones.
      const mobile = document.documentElement.clientWidth < 640;
      const cornerH = mobile ? CORNER_LOGO_H_MOBILE : CORNER_LOGO_H;
      const cornerX = mobile ? CORNER_INSET_MOBILE : CORNER_X;
      const cornerY = mobile ? CORNER_INSET_MOBILE : CORNER_Y;
      const ts = cornerH / (name.offsetHeight || 1);
      const tx = cornerX - (column.offsetLeft + nameWrap.offsetLeft);
      const ty = cornerY - (column.offsetTop + nameWrap.offsetTop);
      nameWrap.style.transformOrigin = '0 0';
      nameWrap.style.transform = `translate(${tx * parkLeft}px, ${ty * parkUp}px) scale(${1 - (1 - ts) * parkUp})`;
    };

    // ----- initial hidden state (before paint, no flash) -----
    layout();
    gsap.set(hLines, { scaleX: 0, scaleY: 1, opacity: 1, x: 0, y: 0 });
    gsap.set(vLines, { scaleX: 1, scaleY: 0, opacity: 1, x: 0, y: 0 });
    gsap.set(introO, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      opacity: 0,
    });
    gsap.set(darkScreen, { opacity: 1 }); // dark veil over the construction phase
    render();

    if (composedFinal) {
      S.build = 1;
      S.titleIn = 1;
      S.taglineIn = 1;
      gsap.set([...lines, introO], { display: 'none' });
      gsap.set(darkScreen, { opacity: 0 });
      render();
    }

    // ----- timed intro (gated on the shared scene-ready clock) -----
    let tl: gsap.core.Timeline | null = null;
    const start = () => {
      if (tl || composedFinal) return;
      introPlayedRef.current = true;
      // Travel vector: viewport centre → the name's O slot (measured fresh).
      const oR = charRefs.current[O_IDX]?.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const dx = oR ? oR.left + oR.width / 2 - vw / 2 : 0;
      const dy = oR ? oR.top + oR.height / 2 - vh / 2 : 0;

      tl = gsap.timeline();
      // 1 — crosshair lines draw out from centre
      tl.to(hLines, { scaleX: 1, duration: HERO_LINES_DUR, ease: 'power3.out' }, HERO_LINES_DELAY);
      tl.to(vLines, { scaleY: 1, duration: HERO_LINES_DUR, ease: 'power3.out' }, HERO_LINES_DELAY);
      // 2 — gold O flickers in inside the square
      tl.to(
        introO,
        {
          duration: HERO_O_FLICKER_DUR,
          ease: 'none',
          keyframes: { opacity: [0, 1, 0.2, 0.9, 0.45, 1] },
        },
        HERO_O_FLICKER_DELAY,
      );
      // 3 — lines + O travel to the O slot; the lines stay full-viewport (each axis
      //     translates only on its cross-axis, so they stretch across as they move).
      tl.to(
        hLines,
        { y: dy, duration: HERO_O_TRAVEL_DUR, ease: 'power3.inOut' },
        HERO_O_TRAVEL_DELAY,
      );
      tl.to(
        vLines,
        { x: dx, duration: HERO_O_TRAVEL_DUR, ease: 'power3.inOut' },
        HERO_O_TRAVEL_DELAY,
      );
      tl.to(
        introO,
        { x: dx, y: dy, duration: HERO_O_TRAVEL_DUR, ease: 'power3.inOut' },
        HERO_O_TRAVEL_DELAY,
      );
      // hand off the construction O to the real name O (both gold, same metrics)
      tl.to(
        introO,
        { opacity: 0, duration: 0.25, ease: 'power1.out' },
        HERO_O_TRAVEL_DELAY + HERO_O_TRAVEL_DUR - 0.05,
      );
      // 4 — crosshair lines fade out + the dark veil lifts once the O has landed
      tl.to(
        lines,
        { opacity: 0, duration: HERO_LINES_FADE_DUR, ease: 'power2.out' },
        HERO_LINES_FADE_DELAY,
      );
      tl.to(
        darkScreen,
        { opacity: 0, duration: 0.7, ease: 'power2.out' },
        HERO_O_TRAVEL_DELAY + HERO_O_TRAVEL_DUR,
      );
      // 5 — circuit underline draws while the rest of the name appears
      tl.to(
        S,
        { build: 1, duration: HERO_BUILD_DUR, ease: 'power2.out', onUpdate: render },
        HERO_BUILD_DELAY,
      );
      // 6 — supporting copy
      tl.to(
        S,
        { titleIn: 1, duration: HERO_TITLE_DUR, ease: 'power3.out', onUpdate: render },
        HERO_TITLE_DELAY,
      );
      tl.to(
        S,
        { taglineIn: 1, duration: HERO_TAGLINE_DUR, ease: 'power2.out', onUpdate: render },
        HERO_TAGLINE_DELAY,
      );
    };

    let unsubStart = () => {};
    if (!composedFinal) {
      if (useScrollStore.getState().heroStartedAt != null) start();
      else unsubStart = useScrollStore.subscribe((s) => s.heroStartedAt != null && start());
    }

    // ----- scroll-scrubbed collapse → corner logo -----
    // Driven off the global progress store (updates every scroll frame) + the
    // section's live rect, so it never depends on a private ScrollTrigger firing.
    let lastCollapse = -1;
    const applyCollapse = () => {
      const sec = triggerRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const h = (rect.height || 1) * HERO_COLLAPSE_DISTANCE_FRAC;
      const next = clamp01(-rect.top / h);
      if (next === lastCollapse) return; // parked / at rest — nothing to redraw
      lastCollapse = next;
      S.collapse = next;
      render();
    };
    applyCollapse();
    const unsubScroll = useScrollStore.subscribe(applyCollapse);

    // Re-measure on resize / font reflow — only while fully expanded so the live
    // collapse animation never feeds its own shrinking width back in.
    const ro = new ResizeObserver(() => {
      if (S.collapse < 0.001) {
        layout();
        render();
      }
    });
    ro.observe(name);

    return () => {
      unsubStart();
      unsubScroll();
      tl?.kill();
      ro.disconnect();
    };
    // Font change re-runs the whole effect so geometry + timeline re-derive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font]);

  // Static styling only (NO opacity/transform/width — those are mutated
  // imperatively and must survive React re-renders).
  const lineBase: CSSProperties = {
    backgroundColor: 'var(--color-quaternary)',
    transformOrigin: 'center',
  };
  const circBase: CSSProperties = { backgroundColor: 'var(--color-quaternary)' };

  return (
    <div id='HeroLogo' ref={overlayRef} aria-hidden='true' className='pointer-events-none fixed inset-0 z-40'>
      {/* dark veil over the construction phase — opaque while the lines + O build,
          lifts once the O reaches its slot to reveal the composing hero */}
      <div
        ref={darkScreenRef}
        className='absolute inset-0'
        style={{ backgroundColor: '#06080d' }}
      />

      {/* construction crosshair (4 viewport-spanning lines) + the gold intro O */}
      <div
        ref={(el) => {
          lineRefs.current[0] = el;
        }}
        data-axis='h'
        className='absolute left-0 right-0'
        style={{ top: `calc(50% - ${SQUARE_HALF}px)`, height: LINE_W, ...lineBase }}
      />
      <div
        ref={(el) => {
          lineRefs.current[1] = el;
        }}
        data-axis='h'
        className='absolute left-0 right-0'
        style={{ top: `calc(50% + ${SQUARE_HALF}px)`, height: LINE_W, ...lineBase }}
      />
      <div
        ref={(el) => {
          lineRefs.current[2] = el;
        }}
        data-axis='v'
        className='absolute top-0 bottom-0'
        style={{ left: `calc(50% - ${SQUARE_HALF}px)`, width: LINE_W, ...lineBase }}
      />
      <div
        ref={(el) => {
          lineRefs.current[3] = el;
        }}
        data-axis='v'
        className='absolute top-0 bottom-0'
        style={{ left: `calc(50% + ${SQUARE_HALF}px)`, width: LINE_W, ...lineBase }}
      />
      <div
        ref={introORef}
        className='absolute font-bold uppercase leading-none'
        style={{
          color: 'var(--color-quaternary)',
          fontSize: 'clamp(2rem, min(11vw, 11svh), 12rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {chars[O_IDX]}
      </div>

      {/* the hero text composition (centered) — the name+underline mark collapses
          into the parked corner logo; title + tagline fade in place. */}
      <div ref={columnRef} className='absolute left-0 right-0 px-4 text-center'>
        <div
          ref={titleRef}
          aria-label={TITLE}
          className='text-quaternary font-bold uppercase hero-subtitle'
          style={{
            fontSize: 'clamp(1.5rem, min(6vw, 6svh), 7rem)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            marginBottom: '0.1em',
            whiteSpace: 'nowrap',
          }}
        >
          {TITLE}
        </div>

        <div
          ref={nameWrapRef}
          className='relative inline-block will-change-transform'
          style={{ whiteSpace: 'nowrap' }}
        >
          {/* dark backdrop (behind letters + underline) — fades in as the mark parks */}
          <div
            ref={backdropRef}
            className='absolute'
            style={{
              zIndex: -1,
              borderRadius: BACKDROP_RADIUS,
              backgroundColor: 'rgba(13, 17, 23, 0.95)',
              border: '1px solid color-mix(in srgb, var(--color-quaternary) 28%, transparent)',
              opacity: 0,
            }}
          />
          <h1
            id='hero-h1'
            ref={nameRef}
            aria-label={NAME}
            className='m-0 inline-block font-bold uppercase'
            style={{
              fontSize: 'clamp(2rem, min(11vw, 11svh), 12rem)',
              lineHeight: 1,
              letterSpacing: '-0.025em',
              whiteSpace: 'nowrap',
            }}
          >
            {chars.map((ch, i) => (
              <span
                key={i}
                aria-hidden='true'
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                style={{
                  display: 'inline-block',
                  verticalAlign: 'top',
                  overflow: KEEP.has(i) ? 'visible' : 'hidden',
                  willChange: 'opacity, transform',
                  color: i === O_IDX ? 'var(--color-quaternary)' : 'var(--color-secondary)',
                }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>

          {/* circuit underline (vertical connector + node + two segments + end circles) */}
          <div className='absolute inset-0' style={{ overflow: 'visible' }}>
            <div
              ref={vLineRef}
              className='absolute'
              style={{
                width: UNDERLINE_W,
                height: GAP,
                transformOrigin: 'top center',
                ...lineBase,
              }}
            />
            <div
              ref={leftSegRef}
              className='absolute'
              style={{ height: UNDERLINE_W, transformOrigin: 'right center', ...lineBase }}
            />
            <div
              ref={rightSegRef}
              className='absolute'
              style={{ height: UNDERLINE_W, transformOrigin: 'left center', ...lineBase }}
            />
            <div
              ref={nodeRef}
              className='absolute rounded-full'
              style={{ width: NODE_D, height: NODE_D, ...circBase }}
            />
            <div
              ref={leftCircRef}
              className='absolute rounded-full'
              style={{ width: CIRC_D, height: CIRC_D, ...circBase }}
            />
            <div
              ref={rightCircRef}
              className='absolute rounded-full'
              style={{ width: CIRC_D, height: CIRC_D, ...circBase }}
            />
          </div>
        </div>

        <p
          ref={taglineRef}
          className='mx-auto mt-[5svh] max-w-xl text-base leading-relaxed sm:text-lg'
          style={{ color: 'color-mix(in srgb, var(--color-tertiary) 80%, transparent)' }}
        >
          {TAGLINE}
        </p>
      </div>
    </div>
  );
}
