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
import { useT } from '../i18n/useT';
import { getLenis } from '../hooks/useLenis';
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
};

export const MozNav = forwardRef<MozNavHandle, Props>(function MozNav(
  { backdropRef, leftCircRef, rightCircRef },
  ref,
) {
  const { t } = useT();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const menuEverOpenedRef = useRef(false);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLeftLineRef = useRef<HTMLDivElement>(null);
  const menuRightLineRef = useRef<HTMLDivElement>(null);
  const menuBottomLineRef = useRef<HTMLDivElement>(null);
  const menuBotLeftDotRef = useRef<HTMLDivElement>(null);
  const menuBotRightDotRef = useRef<HTMLDivElement>(null);
  const menuNavRef = useRef<HTMLElement | null>(null);

  useImperativeHandle(ref, () => ({
    close: () => setMenuOpen(false),
    toggle: () => setMenuOpen((o) => !o),
  }));

  // Keep menuOpenRef in sync so imperative callbacks can read it without a stale closure.
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
  }, [menuOpen, backdropRef, leftCircRef, rightCircRef]);

  const handleNavClick = (sectionId: string) => {
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: 'smooth' });
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
