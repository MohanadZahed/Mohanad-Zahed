import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '../i18n/useT';
import { getLenis } from '../hooks/useLenis';
import { useScrollStore } from '../store/useScrollStore';
import { BACKDROP_RADIUS } from './hero.constants';

const NAV_ITEMS = [
  { id: 'About' },
  { id: 'Manifesto' },
  { id: 'Skills' },
  { id: 'Knowledge' },
  { id: 'Certificates' },
  { id: 'Experience' },
  { id: 'Contact' },
] as const;

// Sections whose nav link should land at a driving ScrollTrigger's END (the
// fully-composed frame) rather than the section's top. Value = the trigger id.
const NAV_END_TRIGGER: Record<string, string> = {
  Skills: 'skills-intro',
  Knowledge: 'knowledge',
};

// Mobile fullscreen-grow tuning.
const FULL_GROW_DUR = 0.45;
const FULL_SHRINK_DUR = 0.4;
const FULL_LINK_STAGGER = 0.06;

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

export type MozNavHandle = { close(): void; toggle(): void };

type Props = {
  backdropRef: RefObject<HTMLDivElement | null>;
  leftCircRef: RefObject<HTMLDivElement | null>;
  rightCircRef: RefObject<HTMLDivElement | null>;
  // Grows/shrinks the parked MOZ mark while the dropdown opens/closes (fine
  // pointers). Returns the tween so the dropdown can sequence off its completion,
  // or null on coarse pointers (which use the fullscreen menu instead).
  onMenuScale: (open: boolean) => gsap.core.Tween | null;
};

export const MozNav = forwardRef<MozNavHandle, Props>(function MozNav(
  { backdropRef, leftCircRef, rightCircRef, onMenuScale },
  ref,
) {
  const { t } = useT();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const menuEverOpenedRef = useRef(false);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const menuGrowTweenRef = useRef<gsap.core.Tween | null>(null);

  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLeftLineRef = useRef<HTMLDivElement>(null);
  const menuRightLineRef = useRef<HTMLDivElement>(null);
  const menuBottomLineRef = useRef<HTMLDivElement>(null);
  const menuBotLeftDotRef = useRef<HTMLDivElement>(null);
  const menuBotRightDotRef = useRef<HTMLDivElement>(null);
  const menuNavRef = useRef<HTMLElement | null>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  // Backdrop rect captured at open time so the fullscreen menu shrinks back to it.
  const openRectRef = useRef<DOMRect | null>(null);

  useImperativeHandle(ref, () => ({
    close: () => setMenuOpen(false),
    toggle: () => setMenuOpen((o) => !o),
  }));

  // Keep menuOpenRef in sync so imperative callbacks can read it without a stale
  // closure, and publish open-state to the store so the scroll-direction
  // hide/show of the parked mark + LanguageSwitcher freezes while the menu is up.
  useEffect(() => {
    menuOpenRef.current = menuOpen;
    useScrollStore.getState().setNavMenuOpen(menuOpen);
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
  }, [menuOpen, backdropRef]);

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
    const isCoarse = matchMedia('(pointer: coarse)').matches;
    const closeBtn = menuCloseRef.current;

    // --- Mobile (coarse pointer): the backdrop grows to fill the screen. ---
    if (isCoarse && closeBtn) {
      const linkEls = Array.from(nav.children);
      // Reset every property the fullscreen branch mutates back to the JSX defaults
      // so the overlay is invisible + inert again once closed.
      const restoreStatic = () => {
        // Reveal the language switcher again now the fullscreen overlay is gone.
        document.documentElement.classList.remove('moz-menu-open');
        overlay.classList.remove('moz-menu-overlay--full');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.border =
          '1px solid color-mix(in srgb, var(--color-quaternary) 28%, transparent)';
        overlay.style.borderTop = 'none';
        overlay.style.overflow = '';
        overlay.style.borderRadius = `0 0 ${BACKDROP_RADIUS}px ${BACKDROP_RADIUS}px`;
      };

      if (menuOpen) {
        menuEverOpenedRef.current = true;
        const r = backdrop.getBoundingClientRect();
        openRectRef.current = r;
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;

        // Hide the dropdown circuit border; centring + sizing come from CSS.
        gsap.set([leftLine, rightLine, bottomLine, botLeftDot, botRightDot], { autoAlpha: 0 });
        nav.style.padding = '';

        overlay.classList.add('moz-menu-overlay--full');
        Object.assign(overlay.style, {
          left: `${r.left}px`,
          top: `${r.top}px`,
          width: `${r.width}px`,
          height: `${r.height}px`,
          border: 'none',
          borderRadius: `${BACKDROP_RADIUS}px`,
          overflow: 'hidden',
          opacity: '1',
          pointerEvents: 'auto',
        });
        gsap.set(linkEls, { x: 0, y: 12, opacity: 0 });
        gsap.set(closeBtn, { opacity: 0 });

        // Lock page scroll while the menu covers the viewport, and hide the
        // language switcher so it doesn't sit on top of the close (X) button —
        // the switcher is a z-50 sibling outside this overlay's stacking context.
        getLenis()?.stop();
        document.documentElement.classList.add('moz-menu-open');

        if (reduced) {
          Object.assign(overlay.style, {
            left: '0px',
            top: '0px',
            width: `${vw}px`,
            height: `${vh}px`,
            borderRadius: '0px',
          });
          gsap.set(linkEls, { y: 0, opacity: 1 });
          gsap.set(closeBtn, { opacity: 1 });
          return;
        }

        const tl = gsap.timeline();
        menuTlRef.current = tl;
        tl.to(overlay, {
          left: 0,
          top: 0,
          width: vw,
          height: vh,
          borderRadius: 0,
          duration: FULL_GROW_DUR,
          ease: 'power3.inOut',
        })
          .to(closeBtn, { opacity: 1, duration: 0.2 }, '<+=0.15')
          .to(
            linkEls,
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 0.3,
              stagger: FULL_LINK_STAGGER,
              ease: 'power2.out',
            },
            '<',
          );
      } else {
        if (!menuEverOpenedRef.current) return; // nothing to close on initial mount
        const r = openRectRef.current ?? backdrop.getBoundingClientRect();

        if (reduced) {
          restoreStatic();
          getLenis()?.start();
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            restoreStatic();
            getLenis()?.start();
          },
        });
        menuTlRef.current = tl;
        tl.to(linkEls, { y: 12, opacity: 0, duration: 0.2, stagger: 0.03, ease: 'power2.in' })
          .to(closeBtn, { opacity: 0, duration: 0.15 }, '<')
          .to(
            overlay,
            {
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
              borderRadius: BACKDROP_RADIUS,
              duration: FULL_SHRINK_DUR,
              ease: 'power3.inOut',
            },
            '<+=0.05',
          );
      }
      return;
    }

    if (menuOpen) {
      menuEverOpenedRef.current = true;

      // Build the dropdown sized to the (possibly grown) mark. Deferred until the
      // grow tween finishes so the live rect measurements reflect the bigger mark.
      const openDropdown = () => {
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
        // Doubles as the menu's overall extra height and the bottom line/dots' lift off
        // the overlay's bottom edge (the side lines also terminate at this offset).
        const BOTTOM_EXTRA = 22;
        const overlayH = nav.scrollHeight + BOTTOM_EXTRA;

        // Remove bottom corner radius so the menu connects flush to the backdrop.
        backdrop.style.borderBottomLeftRadius = '0';
        backdrop.style.borderBottomRightRadius = '0';

        // Position the overlay below the backdrop; overlap by 18px to hide the seam.
        // Width matches the backdrop exactly (the mark is at scale 1 while open, so
        // the backdrop border is already a true 1px — no sub-pixel widen needed).
        Object.assign(overlay.style, {
          left: `${overlayLeft}px`,
          top: `${overlayTop - 18}px`,
          width: `${overlayWidth}px`,
          height: `${overlayH}px`,
          pointerEvents: 'auto',
        });

        // Nudge the circuit border (lines + bottom dots) 3px left of the underline
        // end-dots; the nav text padding still keys off the un-shifted positions.
        const LINE_SHIFT = 3;
        const lineLeftPx = leftLinePx - LINE_SHIFT;
        const lineRightPx = rightLinePx - LINE_SHIFT;

        // Layout circuit lines (3 px — thicker now the mark is full-size while open).
        Object.assign(leftLine.style, {
          left: `${lineLeftPx}px`,
          top: '0',
          width: '3px',
          bottom: `${BOTTOM_EXTRA}px`,
          height: '',
        });
        Object.assign(rightLine.style, {
          left: `${lineRightPx}px`,
          top: '0',
          width: '3px',
          bottom: `${BOTTOM_EXTRA}px`,
          height: '',
        });
        Object.assign(bottomLine.style, {
          left: `${lineLeftPx}px`,
          bottom: `${BOTTOM_EXTRA}px`,
          top: '',
          width: `${rightLinePx - leftLinePx + 1}px`,
          height: '3px',
        });

        // Initial GSAP state for transform properties.
        gsap.set([leftLine, rightLine], { scaleY: 0, transformOrigin: 'top center' });
        gsap.set(bottomLine, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(botLeftDot, {
          left: 31,
          bottom: 24,
          xPercent: -50,
          yPercent: 50,
          scale: 0,
        });
        gsap.set(botRightDot, {
          left: lineRightPx,
          bottom: 24,
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
      };

      // Grow the mark first (fine pointers), then build the dropdown on completion so
      // it's sized to the bigger mark. Coarse pointers never reach here (handled above).
      const grow = onMenuScale(true);
      menuGrowTweenRef.current = grow;
      if (grow) grow.eventCallback('onComplete', openDropdown);
      else openDropdown();
    } else {
      if (!menuEverOpenedRef.current) return; // nothing to close on initial mount

      // Cancel an in-flight grow so a fast open→close doesn't leave it mid-scale.
      menuGrowTweenRef.current?.kill();

      if (reduced) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        backdrop.style.borderBottomLeftRadius = `${BACKDROP_RADIUS}px`;
        backdrop.style.borderBottomRightRadius = `${BACKDROP_RADIUS}px`;
        onMenuScale(false); // shrink the mark back
        return;
      }

      const linkEls = Array.from(nav.children);
      const tl = gsap.timeline({
        onComplete: () => {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          backdrop.style.borderBottomLeftRadius = `${BACKDROP_RADIUS}px`;
          backdrop.style.borderBottomRightRadius = `${BACKDROP_RADIUS}px`;
          onMenuScale(false); // dropdown gone → shrink the mark back
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
  }, [menuOpen, backdropRef, leftCircRef, rightCircRef, onMenuScale]);

  const handleNavClick = (sectionId: string) => {
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (!el) return;
    const lenis = getLenis();
    // Some sections compose across a long scroll and shouldn't land on their top:
    //  - Skills emerges from the manifesto laptop; its section box starts at a
    //    large negative margin (skillsIntro=0), so the top is inside the laptop.
    //  - Knowledge's labels/bubbles only finish rendering near the section end.
    // For these, target the driving ScrollTrigger's END scroll (progress=1, fully
    // composed and still on screen) instead of the element top.
    const endTrigger = NAV_END_TRIGGER[sectionId]
      ? ScrollTrigger.getById(NAV_END_TRIGGER[sectionId])
      : null;
    if (lenis) {
      lenis.start(); // the fullscreen mobile menu pauses Lenis while open
      if (endTrigger) lenis.scrollTo(endTrigger.end, { offset: 0 });
      else lenis.scrollTo(el, { offset: 0 });
    } else if (endTrigger) {
      window.scrollTo({ top: endTrigger.end, behavior: 'smooth' });
    } else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
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
      <button
        ref={menuCloseRef}
        type='button'
        className='moz-menu-close'
        aria-label={t('nav.close')}
        onClick={() => setMenuOpen(false)}
      />
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
  );
});
