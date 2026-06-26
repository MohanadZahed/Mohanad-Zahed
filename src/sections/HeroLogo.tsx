import {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';
import { useFontStore } from '../store/useFontStore';
import { useT } from '../i18n/useT';
import { getLenis } from '../hooks/useLenis';
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
const CORNER_LOGO_H = 60; // parked-mark target glyph height
const CORNER_LOGO_H_MOBILE = 32; // smaller parked mark on phones
const CORNER_INSET_MOBILE = 14; // tighter top inset on phones
const CORNER_X_MOBILE = 24; // left inset on phones — keep the mark off the screen edge
const LINE_W = 2; // construction crosshair thickness
const UNDERLINE_W = 4; // circuit underline thickness (vertical connector + segments)
const NODE_D = 11;
const CIRC_D = 13;
const O_IDX = 1; // the "O" in "Mohanad" — gold, and the underline's anchor
// Dark backdrop behind the parked mark (so it stays legible over light sections).
const PAD_X = 32; // local px breathing room left/right of the mark
const PAD_Y = 18; // local px breathing room top/bottom of the mark
const BACKDROP_RADIUS = 22;

const NAV_ITEMS = [
  { id: 'About' },
  { id: 'Manifesto' },
  { id: 'Skills' },
  { id: 'Knowledge' },
  { id: 'Certificates' },
  { id: 'Experience' },
  { id: 'Contact' },
] as const;

function NavFlipLink({
  sectionId,
  label,
  onClick,
}: {
  sectionId: string;
  label: string;
  onClick: (id: string) => void;
}) {
  const chars = [...label];
  return (
    <a
      href={`#${sectionId}`}
      className='nav-flip-link'
      onClick={(e) => {
        e.preventDefault();
        onClick(sectionId);
      }}
    >
      <span className='flip-link__inner' aria-hidden='true'>
        {chars.map((ch, i) => (
          <span key={i} className='flip-link__clip' style={{ '--i': i } as CSSProperties}>
            <span className='flip-link__slide'>
              {ch}
              <span className='flip-link__ghost'>{ch}</span>
            </span>
          </span>
        ))}
      </span>
      <span className='sr-only'>{label}</span>
    </a>
  );
}

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

  // Nav menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false); // readable inside imperative scroll callbacks
  const menuEverOpenedRef = useRef(false); // skip close animation on initial mount
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

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

  // Menu overlay elements
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLeftLineRef = useRef<HTMLDivElement>(null);
  const menuRightLineRef = useRef<HTMLDivElement>(null);
  const menuBottomLineRef = useRef<HTMLDivElement>(null);
  const menuBotLeftDotRef = useRef<HTMLDivElement>(null);
  const menuBotRightDotRef = useRef<HTMLDivElement>(null);
  const menuNavRef = useRef<HTMLElement>(null);

  // Keep menuOpenRef in sync so imperative applyCollapse can read it without a stale closure.
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Close on outside pointer-down when menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuOverlayRef.current?.contains(target) && !backdropRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  // Menu open / close animation.
  useEffect(() => {
    const overlay = menuOverlayRef.current;
    const leftLine = menuLeftLineRef.current;
    const rightLine = menuRightLineRef.current;
    const bottomLine = menuBottomLineRef.current;
    const botLeftDot = menuBotLeftDotRef.current;
    const botRightDot = menuBotRightDotRef.current;
    const nav = menuNavRef.current;
    const backdrop = backdropRef.current;
    const leftCirc = leftCircRef.current;
    const rightCirc = rightCircRef.current;

    if (
      !overlay ||
      !leftLine ||
      !rightLine ||
      !bottomLine ||
      !botLeftDot ||
      !botRightDot ||
      !nav ||
      !backdrop ||
      !leftCirc ||
      !rightCirc
    )
      return;

    menuTlRef.current?.kill();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (menuOpen) {
      menuEverOpenedRef.current = true;

      // Measure real-screen positions of the backdrop and the two underline end-dots.
      const backdropRect = backdrop.getBoundingClientRect();
      const lDotRect = leftCirc.getBoundingClientRect();
      const rDotRect = rightCirc.getBoundingClientRect();
      const lX = lDotRect.left + lDotRect.width / 2; // screen-X of left dot centre
      const rX = rDotRect.left + rDotRect.width / 2; // screen-X of right dot centre
      const overlayLeft = backdropRect.left;
      const overlayWidth = backdropRect.width;
      const overlayTop = backdropRect.bottom;

      // Derive line positions relative to the overlay's left edge.
      const leftLinePx = Math.max(0, lX - overlayLeft);
      const rightLinePx = Math.min(overlayWidth, rX - overlayLeft);

      // Apply nav indent so links don't collide with the left circuit line.
      nav.style.paddingTop = '10px';
      nav.style.paddingBottom = '10px';
      nav.style.paddingLeft = `${leftLinePx + 10}px`;
      nav.style.paddingRight = `${overlayWidth - rightLinePx + 6}px`;

      // Extra space at the bottom so the closing dots + bottom line stay inside the overlay.
      const BOTTOM_EXTRA = 10;
      const overlayH = nav.scrollHeight + BOTTOM_EXTRA;

      // Remove bottom corner radius so the menu connects flush to the backdrop.
      backdrop.style.borderBottomLeftRadius = '0';
      backdrop.style.borderBottomRightRadius = '0';

      // Position the overlay below the backdrop; overlap by 8px to hide the seam,
      // and widen by 1px so the side borders align flush with the backdrop's border.
      Object.assign(overlay.style, {
        left: `${overlayLeft}px`,
        top: `${overlayTop - 8}px`,
        width: `${overlayWidth + 1}px`,
        height: `${overlayH}px`,
        pointerEvents: 'auto',
      });

      // Layout circuit lines (1 px — matches the visual weight of the underline at park scale).
      Object.assign(leftLine.style, {
        left: `${leftLinePx}px`,
        top: '0',
        width: '1px',
        bottom: `${BOTTOM_EXTRA}px`,
        height: '',
      });
      Object.assign(rightLine.style, {
        left: `${rightLinePx}px`,
        top: '0',
        width: '1px',
        bottom: `${BOTTOM_EXTRA}px`,
        height: '',
      });
      Object.assign(bottomLine.style, {
        left: `${leftLinePx}px`,
        bottom: `${BOTTOM_EXTRA}px`,
        top: '',
        width: `${rightLinePx - leftLinePx + 1}px`,
        height: '1px',
      });

      // Initial GSAP state for transform properties.
      gsap.set([leftLine, rightLine], { scaleY: 0, transformOrigin: 'top center' });
      gsap.set(bottomLine, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(botLeftDot, {
        left: leftLinePx,
        bottom: BOTTOM_EXTRA,
        xPercent: -50,
        yPercent: 50,
        scale: 0,
      });
      gsap.set(botRightDot, {
        left: rightLinePx,
        bottom: BOTTOM_EXTRA,
        xPercent: -50,
        yPercent: 50,
        scale: 0,
      });

      if (reduced) {
        overlay.style.opacity = '1';
        gsap.set([leftLine, rightLine], { scaleY: 1 });
        gsap.set(bottomLine, { scaleX: 1 });
        gsap.set([botLeftDot, botRightDot], { scale: 1 });
        gsap.set(Array.from(nav.children), { x: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline();
      menuTlRef.current = tl;

      tl.to(overlay, { opacity: 1, duration: 0 })
        .fromTo(
          [leftLine, rightLine],
          { scaleY: 0 },
          { scaleY: 1, duration: 0.28, ease: 'power2.inOut', transformOrigin: 'top center' },
        )
        .fromTo(
          bottomLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.26, ease: 'power2.inOut', transformOrigin: 'left center' },
        )
        .fromTo(
          [botLeftDot, botRightDot],
          { scale: 0 },
          { scale: 1, duration: 0.18, ease: 'back.out(2.5)' },
          '<+=0.10',
        )
        .fromTo(
          Array.from(nav.children),
          { x: -16, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.22, stagger: 0.07, ease: 'power2.out' },
          '<+=0.08',
        );
    } else {
      if (!menuEverOpenedRef.current) return; // nothing to close on initial mount

      if (reduced) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        backdrop.style.borderBottomLeftRadius = `${BACKDROP_RADIUS}px`;
        backdrop.style.borderBottomRightRadius = `${BACKDROP_RADIUS}px`;
        return;
      }

      const linkEls = Array.from(nav.children);
      const tl = gsap.timeline({
        onComplete: () => {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          backdrop.style.borderBottomLeftRadius = `${BACKDROP_RADIUS}px`;
          backdrop.style.borderBottomRightRadius = `${BACKDROP_RADIUS}px`;
        },
      });
      menuTlRef.current = tl;

      tl.to(linkEls, { x: -16, opacity: 0, duration: 0.15, stagger: 0.04, ease: 'power2.in' })
        .to([botLeftDot, botRightDot], { scale: 0, duration: 0.15 }, '<+=0.05')
        .to(bottomLine, {
          scaleX: 0,
          duration: 0.2,
          ease: 'power2.in',
          transformOrigin: 'right center',
        })
        .to(
          [leftLine, rightLine],
          { scaleY: 0, duration: 0.22, ease: 'power2.in', transformOrigin: 'bottom center' },
          '<+=0.05',
        );
    }
  }, [menuOpen]);

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
      // On phones the avatar drops to ~52svh, so the text column drops with it
      // to keep the whole hero composition vertically centred (matches the
      // mobile avatar-anchor `top` in Hero.tsx). Desktop keeps the high anchor.
      const mobile = document.documentElement.clientWidth < 640;
      column.style.top = `${vh * (mobile ? 0.24 : 0.18)}px`;
      for (let i = 0; i < chars.length; i++) {
        const r = charRefs.current[i]?.getBoundingClientRect();
        baseW[i] = r ? r.width : 0;
      }
      // Size the construction square to the gold O's actual rendered height
      // (line-height:1 → box height ≈ font-size), so it fits the O at every
      // width — desktop ~55, shrinking with the viewport-scaled O on phones.
      const squareHalf = introO.getBoundingClientRect().height / 2;
      const top = lineRefs.current[0];
      const bottom = lineRefs.current[1];
      const left = lineRefs.current[2];
      const right = lineRefs.current[3];
      if (top) top.style.top = `calc(50% - ${squareHalf}px)`;
      if (bottom) bottom.style.top = `calc(50% + ${squareHalf}px)`;
      if (left) left.style.left = `calc(50% - ${squareHalf}px)`;
      if (right) right.style.left = `calc(50% + ${squareHalf}px)`;
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
          // Become clickable only once the mark is fully parked top-left,
          // and only on non-touch devices.
          const isCoarse = matchMedia('(pointer: coarse)').matches;
          const isParked = collapse >= 0.95 && !isCoarse;
          backdrop.style.pointerEvents = isParked ? 'auto' : 'none';
          backdrop.style.cursor = isParked ? 'pointer' : 'default';
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
      const cornerX = mobile ? CORNER_X_MOBILE : CORNER_X;
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
      // Auto-close nav menu when user scrolls back up and the mark un-parks.
      if (next < 0.9 && menuOpenRef.current) setMenuOpen(false);
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

  const handleNavClick = (sectionId: string) => {
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  // Static styling only (NO opacity/transform/width — those are mutated
  // imperatively and must survive React re-renders).
  const lineBase: CSSProperties = {
    backgroundColor: 'var(--color-quaternary)',
    transformOrigin: 'center',
  };
  const circBase: CSSProperties = { backgroundColor: 'var(--color-quaternary)' };

  return (
    <div
      id='HeroLogo'
      ref={overlayRef}
      aria-hidden='true'
      className='pointer-events-none fixed inset-0 z-40'
    >
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
          {/* dark backdrop (behind letters + underline) — fades in as the mark parks;
              becomes clickable when fully parked to open the nav menu */}
          <div
            id='hero-backdrop'
            ref={backdropRef}
            className='absolute'
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              zIndex: -1,
              borderRadius: BACKDROP_RADIUS,
              backgroundColor: 'rgba(13, 17, 23, 0.95)',
              border: '1px solid color-mix(in srgb, var(--color-quaternary) 28%, transparent)',
              opacity: 0,
              pointerEvents: 'none', // enabled imperatively in render() once parked
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
                {ch === ' ' ? ' ' : ch}
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

      {/* MOZ nav menu overlay — lives outside nameWrap to avoid scale inheritance.
          Positioned in fixed-overlay space using getBoundingClientRect() on open. */}
      <div
        ref={menuOverlayRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0,
          backgroundColor: 'rgba(13, 17, 23, 0.95)',
          border: '1px solid color-mix(in srgb, var(--color-quaternary) 28%, transparent)',
          borderTop: 'none',
          borderRadius: `0 0 ${BACKDROP_RADIUS}px ${BACKDROP_RADIUS}px`,
        }}
      >
        <div ref={menuLeftLineRef} className='moz-menu-line' />
        <div ref={menuRightLineRef} className='moz-menu-line' />
        <div ref={menuBottomLineRef} className='moz-menu-line' />
        <div ref={menuBotLeftDotRef} className='moz-menu-dot' />
        <div ref={menuBotRightDotRef} className='moz-menu-dot' />
        <nav ref={menuNavRef as RefObject<HTMLElement>} aria-label={t('nav.ariaLabel')}>
          {NAV_ITEMS.map((item) => (
            <NavFlipLink
              key={item.id}
              sectionId={item.id}
              label={t(`nav.${item.id}`)}
              onClick={handleNavClick}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
