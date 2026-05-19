import { useEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { clamp, lerp, smoothstep } from '../../scene/lib/math';
import { PHASE } from './knowledge.constants';

const INK_START = { r: 0, g: 65, b: 109, a: 1 };
const INK_END = { r: 245, g: 241, b: 218, a: 0.95 };

const INK_SHIFT_START = 0.45;
const INK_SHIFT_END = 0.6;
const FADE_IN_END = 0.13;

// Initial bright cream "moon" diameter while falling.
const DISC_BOX_PX = 80;
const DISC_FALL_FROM_VH = -120;

export function KnowledgeBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const disc = discRef.current;
    if (!wrapper || !disc) return;

    const root = document.documentElement;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      wrapper.style.backgroundColor = 'transparent';
      disc.style.opacity = '0';
      return;
    }

    const apply = (p: number, approach: number) => {
      const fall = smoothstep(PHASE.AVATAR_SPIN_START, PHASE.AVATAR_SPIN_END, p);
      const expand = smoothstep(PHASE.BUBBLES_START, PHASE.BUBBLES_HOLD, p);
      const fadeIn = smoothstep(PHASE.AVATAR_SPIN_START, FADE_IN_END, p);
      // Beige wrapper bg fades in as the Knowledge section approaches from
      // below the viewport and is fully painted by the time it pins. Driven
      // by a section-local trigger so it works regardless of total page
      // height (mobile sections stack much taller than desktop).
      const beigeAlpha = smoothstep(0, 1, approach);

      const vh = window.innerHeight;
      const ty = lerp((DISC_FALL_FROM_VH * vh) / 100, 0, fall);

      const vw = window.innerWidth;
      const vmin = Math.min(vw, vh);
      const diagonal = Math.sqrt(vw * vw + vh * vh);
      const size = lerp(DISC_BOX_PX, diagonal, expand);
      // The border-radius starts collapsing the moment the disc's diameter
      // reaches the SHORT viewport axis (so on portrait phones it starts
      // morphing as soon as the circle touches left/right edges). Beyond that
      // point the shape grows toward the screen diagonal as a progressively
      // squared rectangle — corners fill in without the circle bulging
      // off-screen and reading as an ellipse.
      const circleEnd = clamp((vmin - DISC_BOX_PX) / (diagonal - DISC_BOX_PX), 0, 1);
      const radiusPct = lerp(50, 0, smoothstep(circleEnd, 1.0, expand));

      wrapper.style.backgroundColor = `color-mix(in srgb, var(--color-quaternary) ${beigeAlpha * 100}%, transparent)`;
      disc.style.width = `${size}px`;
      disc.style.height = `${size}px`;
      disc.style.transform = `translate3d(0, ${ty}px, 0)`;
      disc.style.borderRadius = `${radiusPct}%`;
      // No exit fade: once expanded, the disc stays opaque so the black
      // backdrop persists into Certificates. Scrolling back up shrinks it
      // out via `fadeIn` and the size lerp naturally.
      disc.style.opacity = String(fadeIn);

      const inkProgress = smoothstep(INK_SHIFT_START, INK_SHIFT_END, p);
      const r = Math.round(lerp(INK_START.r, INK_END.r, inkProgress));
      const g = Math.round(lerp(INK_START.g, INK_END.g, inkProgress));
      const b = Math.round(lerp(INK_START.b, INK_END.b, inkProgress));
      const a = lerp(INK_START.a, INK_END.a, inkProgress);
      root.style.setProperty('--knowledge-ink', `rgba(${r}, ${g}, ${b}, ${a})`);
    };

    const initial = useScrollStore.getState();
    apply(initial.knowledgeProgress, initial.knowledgeApproach);

    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (
        state.knowledgeProgress === prev.knowledgeProgress &&
        state.knowledgeApproach === prev.knowledgeApproach
      ) {
        return;
      }
      apply(state.knowledgeProgress, state.knowledgeApproach);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className='fixed inset-0 -z-20 pointer-events-none my-circle-mask'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        willChange: 'background-color',
      }}
    >
      <div
        ref={discRef}
        style={{
          width: DISC_BOX_PX,
          height: DISC_BOX_PX,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgb(20, 20, 20) 7%, rgb(0, 0, 0) 22%, rgb(0, 0, 0) 80%, rgb(0, 0, 0) 100%)',
          opacity: 0,
          willChange: 'width, height, transform, opacity',
        }}
      />
    </div>
  );
}
