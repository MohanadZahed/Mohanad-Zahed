import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CircuitBackground, SPOTLIGHT_RADIUS } from './skills/CircuitBackground';
import { ChipScatter } from './skills/ChipScatter';
import { useScrollStore } from '../store/useScrollStore';
import { clamp, lerp, smoothstep } from '../scene/lib/math';
import { computeScreenRectPx } from './notebook/notebook.constants';
import {
  EMERGE_END,
  INTRO_SCROLL_VH,
  SKILLS_OVERLAP_VH,
  ZOOM_END,
  ZOOM_START,
} from './skills/skills.constants';
import { useT } from '../i18n/useT';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (n: number) => clamp(n, 0, 1);
// Fully-clipped initial state so the content is invisible until the intro drives it.
const HIDDEN_CLIP = 'inset(0 0 100% 0)';

export function Skills() {
  const { t } = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);
  // True once the intro reaches identity — re-enables the spotlight.
  const introDoneRef = useRef(false);

  // The "emerge from the laptop screen" choreography only runs on desktop with
  // motion enabled. Touch / narrow / reduced-motion get a plain static section.
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Run the emerge everywhere except when the user asked for reduced motion.
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Pinned emerge (slide up inside the screen) → zoom (screen rect → viewport) →
  // release to normal flow.
  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const pin = pinRef.current;
    const content = contentRef.current;
    if (!section || !pin || !content) return;

    const apply = (sp: number) => {
      // Past the end the content is at identity and flows normally — no clip.
      if (sp >= 0.999) {
        content.style.transform = 'none';
        content.style.clipPath = 'none';
        if (!introDoneRef.current) introDoneRef.current = true;
        return;
      }
      introDoneRef.current = false;

      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const { rectX, rectY, rectW, rectH } = computeScreenRectPx(vw, vh);

      const emergeT = clamp01(sp / EMERGE_END);
      const z = smoothstep(ZOOM_START, ZOOM_END, sp);

      const sEmerge = rectW / vw; // content (full width) fits the screen rect width
      const s = lerp(sEmerge, 1, z);

      // transform-origin is the content's TOP-CENTER (50% 0). During emerge the
      // top edge rises from the screen-rect bottom to its top (header scrolls up
      // inside the laptop screen); during zoom it travels to the viewport top.
      const baseTopY = lerp(rectY + rectH, rectY, emergeT);
      const tyTop = lerp(baseTopY, 0, z);

      // On-screen reveal window: screen rect → full viewport. Inverted through the
      // transform into the wrapper's local box (calc(100% - …) avoids needing the
      // content's measured height).
      const winX = lerp(rectX, 0, z);
      const winY = lerp(rectY, 0, z);
      const winW = lerp(rectW, vw, z);
      const winH = lerp(rectH, vh, z);
      const localL = (winX - vw / 2) / s + vw / 2;
      const localR = (winX + winW - vw / 2) / s + vw / 2;
      const localT = (winY - tyTop) / s;
      const localB = (winY + winH - tyTop) / s;

      content.style.transform = `translate(0px, ${tyTop}px) scale(${s})`;
      content.style.clipPath = `inset(${localT}px calc(100% - ${localR}px) calc(100% - ${localB}px) ${localL}px)`;

      if (circuitRef.current) {
        // Spotlight gradient lives in the scaled wrapper, so keep it off mid-intro.
        circuitRef.current.style.setProperty('--mx', '-9999px');
        circuitRef.current.style.setProperty('--my', '-9999px');
      }
    };

    apply(useScrollStore.getState().skillsIntro);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + (INTRO_SCROLL_VH / 100) * document.documentElement.clientHeight,
      pin,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        useScrollStore.getState().setSkillsIntro(self.progress);
        apply(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [enabled]);

  // Pointer spotlight (coords relative to the circuit element it lights).
  useEffect(() => {
    const section = sectionRef.current;
    const circuit = circuitRef.current;
    if (!section || !circuit) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) {
      circuit.style.setProperty('--mx', '-9999px');
      circuit.style.setProperty('--my', '-9999px');
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const rect = circuit.getBoundingClientRect();
      circuit.style.setProperty('--mx', `${rect.width / 2}px`);
      circuit.style.setProperty('--my', `${rect.height / 2}px`);
      return;
    }

    let raf = 0;
    let nextX = -9999;
    let nextY = -9999;
    let rectLeft = 0;
    let rectTop = 0;

    const refreshRect = () => {
      const r = circuit.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;
    };
    refreshRect();

    const flush = () => {
      raf = 0;
      circuit.style.setProperty('--mx', `${nextX}px`);
      circuit.style.setProperty('--my', `${nextY}px`);
    };

    const onMove = (e: PointerEvent) => {
      // Suppressed while the section is mid-emerge/zoom (transform in flight).
      if (enabled && !introDoneRef.current) return;
      nextX = e.clientX - rectLeft;
      nextY = e.clientY - rectTop;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      nextX = -9999;
      nextY = -9999;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', refreshRect, { passive: true });
    window.addEventListener('resize', refreshRect, { passive: true });
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', refreshRect);
      window.removeEventListener('resize', refreshRect);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  const inner: ReactNode = (
    <>
      <CircuitBackground ref={circuitRef} />
      <header className='relative z-20 px-5 sm:px-10 md:px-16 pt-12 pointer-events-none'>
        <h2
          id='skills-h2'
          className='text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-100 tracking-tight'
        >
          {t('skills.heading')}
        </h2>
        <p className='mt-2 text-sm text-zinc-400 max-w-md'>{t('skills.subhead')}</p>
      </header>
      <ChipScatter />
    </>
  );

  if (!enabled) {
    return (
      <section
        ref={sectionRef}
        id='skills'
        aria-labelledby='skills-h2'
        className='relative min-h-screen overflow-hidden bg-canvas-gradient'
        style={{ '--spot-r': `${SPOTLIGHT_RADIUS}px` } as CSSProperties}
      >
        {inner}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id='skills'
      aria-labelledby='skills-h2'
      className='relative'
      style={
        { '--spot-r': `${SPOTLIGHT_RADIUS}px`, marginTop: `-${SKILLS_OVERLAP_VH}svh`, borderBottom: '2px solid white' } as CSSProperties
      }
    >
      <div ref={pinRef}>
        <div
          ref={contentRef}
          className='relative min-h-screen overflow-hidden bg-canvas-gradient'
          style={{
            transformOrigin: '50% 0',
            clipPath: HIDDEN_CLIP,
            willChange: 'transform, clip-path',
          }}
        >
          {inner}
        </div>
      </div>
    </section>
  );
}
