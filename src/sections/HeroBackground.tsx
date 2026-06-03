import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/useScrollStore';
import { HERO_SVG_DELAY, HERO_SVG_DUR, HERO_SVG_STAGGER } from './hero.constants';

type Props = {
  triggerRef: RefObject<HTMLElement | null>;
};

type IconSpec = {
  src: string;
  className: string;
  restOpacity: number;
  style?: CSSProperties;
};

const ICONS: IconSpec[] = [
  // — corner circuits (filename = position)
  {
    src: 'circuit-left-top.svg',
    className: 'absolute top-[15svh] left-0 w-[34vw] max-w-[520px] aspect-[565/425]',
    restOpacity: 0.3,
  },

  // — top-left cluster
  {
    src: 'javascript.svg',
    className: 'absolute top-[9svh] left-[5vw] w-8 md:w-12 lg:w-16 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[4svh] left-[3vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[11svh] left-[2vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'code_tag_icon.svg',
    className: 'absolute top-[3svh] left-[8vw] w-10 md:w-24 lg:w-50 aspect-[680/400]',
    restOpacity: 0.25,
  },
  {
    src: 'brackets-curly-svgrepo-com.svg',
    className: 'absolute top-[15svh] left-[15vw] w-7 md:w-10 lg:w-14 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'binary_two_rows_mono.svg',
    className: 'absolute top-[2svh] left-[17vw] w-16 md:w-24 lg:w-40 aspect-[680/400]',
    restOpacity: 0.25,
  },
  {
    src: 'cloud-upload-svgrepo-com.svg',
    className: 'absolute top-[3svh] left-[26vw] w-7 md:w-10 lg:w-14 aspect-square',
    restOpacity: 0.3,
  },

  // — top-right cluster
  {
    src: 'circuit-right-top.svg',
    className: 'absolute top-0 right-[3vw] w-[34vw] max-w-[520px] aspect-[565/425]',
    restOpacity: 0.3,
  },
  {
    src: 'git.svg',
    className: 'absolute top-[3svh] right-[1vw] w-7 md:w-12 lg:w-20 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'brackets-curly-svgrepo-com.svg',
    className: 'absolute top-[12svh] right-[8vw] w-7 md:w-10 lg:w-14 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'terminal_prompt_boxed.svg',
    className: 'absolute top-[14svh] right-[0vw] w-12 md:w-24 lg:w-45 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[10svh] right-[19vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[15svh] right-[1vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[2svh] right-[0.5vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[28svh] right-[6vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'plus.svg',
    className: 'absolute top-[24svh] right-[0.5vw] w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'plus.svg',
    className: 'absolute top-[2svh] right-[23vw] w-4 md:w-5 lg:w-6 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'cloud-upload-svgrepo-com.svg',
    className: 'absolute top-[30svh] right-[1vw] w-7 md:w-12 lg:w-17 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'semicolon_icon.svg',
    className: 'absolute top-[34svh] right-[-0.5vw] w-4 md:w-16 lg:w-30 aspect-square',
    restOpacity: 0.45,
  },
  {
    src: 'code-code-tags-html-inline-editor-svgrepo-com.svg',
    className: 'absolute top-[42svh] right-[2vw] w-8 md:w-12 lg:w-16 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'hash.svg',
    className: 'absolute top-[48svh] right-[2vw] w-7 md:w-10 lg:w-14 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[52svh] right-[1vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[53svh] right-[6vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.5,
  },

  // — middle edges
  {
    src: 'globe-1-svgrepo-com.svg',
    className: 'absolute top-[25svh] left-[2vw] w-7 md:w-12 lg:w-19 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'plus.svg',
    className: 'absolute top-[25svh] left-[8vw] w-4 md:w-6 lg:w-8 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'terminal_prompt_icon.svg',
    className: 'absolute top-[38svh] left-[-1vw] w-7 md:w-24 lg:w-42 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'semicolon_icon.svg',
    className: 'absolute top-[32svh] left-[1vw] w-4 md:w-16 lg:w-30 aspect-square',
    restOpacity: 0.45,
  },
  {
    src: 'circle.svg',
    className: 'absolute top-[51svh] left-[1vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },

  // — bottom-left cluster (React atom, code tag, binary, big circle)
  {
    src: 'git.svg',
    className: 'absolute bottom-[40svh] left-[2vw] w-7 md:w-12 lg:w-18 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'circle.svg',
    className: 'absolute bottom-[41svh] left-[7.5vw] w-2.5 md:w-4 lg:w-5 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circuit-left-bottom.svg',
    className: 'absolute bottom-43 left-0 w-[30vw] max-w-[350px] aspect-[565/425]',
    restOpacity: 0.3,
  },
  {
    src: 'circuit-left-bottom2.svg',
    className: 'absolute bottom-[5svh] left-0 w-[26vw] max-w-[400px] aspect-[565/425]',
    restOpacity: 0.25,
  },
  {
    src: 'react_dark.svg',
    className: 'absolute bottom-[15svh] left-[3vw] w-10 md:w-20 lg:w-35 aspect-square',
    restOpacity: 0.35,
  },
  {
    src: 'code_tag_icon.svg',
    className: 'absolute bottom-[17svh] left-[15vw] w-8 md:w-20 lg:w-40 aspect-[680/400]',
    restOpacity: 0.25,
  },
  {
    src: 'binary_two_rows_mono.svg',
    className: 'absolute bottom-[7svh] left-[20vw] w-16 md:w-24 lg:w-35 aspect-[680/400]',
    restOpacity: 0.25,
  },
  {
    src: 'plus.svg',
    className: 'absolute bottom-[26svh] left-[2vw] w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circle.svg',
    className: 'absolute bottom-[22svh] left-[1vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circle.svg',
    className: 'absolute bottom-[15svh] left-[2vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },

  // — bottom-right cluster (globe, hash, Angular, git diamond)

  {
    src: 'angular.svg',
    className: 'absolute bottom-[30svh] right-[3vw] w-8 md:w-14 lg:w-24 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circle.svg',
    className: 'absolute bottom-[28svh] right-[1vw] w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'plus.svg',
    className: 'absolute bottom-[36svh] right-[1vw]  w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circuit-right-bottom.svg',
    className: 'absolute bottom-0 right-[-1vw] w-[34vw] max-w-[520px] aspect-[565/425]',
    restOpacity: 0.3,
  },
  {
    src: 'code_tag_icon.svg',
    className: 'absolute bottom-[5svh] right-[13vw] w-10 md:w-24 lg:w-50 aspect-[680/400]',
    restOpacity: 0.25,
  },
  {
    src: 'plus.svg',
    className: 'absolute bottom-[5svh] right-[13vw]  w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'plus.svg',
    className: 'absolute bottom-[3svh] right-[20vw]  w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'plus.svg',
    className: 'absolute bottom-[14svh] right-[21vw]  w-4 md:w-6 lg:w-7 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'circle.svg',
    className: 'absolute bottom-[15svh] right-[15vw]  w-2 md:w-3 lg:w-4 aspect-square',
    restOpacity: 0.4,
  },
  {
    src: 'globe-1-svgrepo-com.svg',
    className: 'absolute bottom-[6svh] right-[23vw] w-7 md:w-12 lg:w-20 aspect-square',
    restOpacity: 0.3,
  },
  {
    src: 'binary_two_rows_mono.svg',
    className: 'absolute bottom-[4svh] right-[27vw] w-16 md:w-24 lg:w-40 aspect-[680/400]',
    restOpacity: 0.25,
  },
  // — scattered dots
  {
    src: 'circle-svgrepo-com.svg',
    className: 'absolute top-[20svh] left-[36vw] w-1.5 md:w-2 aspect-square',
    restOpacity: 0.5,
  },
  {
    src: 'circle-svgrepo-com.svg',
    className: 'absolute top-[12svh] right-[36vw] w-1.5 md:w-2 aspect-square',
    restOpacity: 0.5,
  },
];

// Extra distance past the screen edge so fly-in start points sit fully off-screen.
const ENTRY_BUFFER_PX = 80;

const PROX_NEAR_PX = 60;
const PROX_FAR_PX = 280;
const DAMP = 0.15;
// BASE = cream --color-secondary #F3EED6 (243,238,214), GLOW = sky cyan #38bdf8 (56,189,248)
const BASE_R = 243;
const BASE_G = 238;
const BASE_B = 214;
const GLOW_R = 56;
const GLOW_G = 189;
const GLOW_B = 248;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function HeroBackground({ triggerRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Entry fly-in — non-circuit SVGs collapse radially inward from off-screen,
  // circuit SVGs slide in horizontally per side. The off-screen start transforms
  // are applied on mount (useLayoutEffect, before paint — no flash at rest and
  // icons stay hidden through the pre-intro hold); the fly-in itself starts when
  // the shared intro clock begins (scene ready), so the WebGL init hitch can't
  // freeze it mid-flight.
  useLayoutEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = iconRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (els.length === 0) return;

    const docEl = document.documentElement;
    const vw = docEl.clientWidth;
    const vh = docEl.clientHeight;
    const cxView = vw / 2;
    const cyView = vh / 2;
    const ringRadius = 0.5 * Math.hypot(vw, vh) + ENTRY_BUFFER_PX;

    // Place every icon at its off-screen start before paint.
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      const isCircuit = el.dataset.heroCircuit === '1';
      const side = el.dataset.heroSide;

      if (isCircuit) {
        const startX =
          side === 'right' ? vw - rect.left + ENTRY_BUFFER_PX : -(rect.right + ENTRY_BUFFER_PX);
        gsap.set(el, { x: startX, y: 0 });
      } else {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - cxView;
        const dy = cy - cyView;
        const len = Math.hypot(dx, dy) || 1;
        const r = ringRadius + Math.max(rect.width, rect.height);
        const startX = cxView + (dx / len) * r - cx;
        const startY = cyView + (dy / len) * r - cy;
        gsap.set(el, { x: startX, y: startY });
      }
    }

    let tween: gsap.core.Tween | null = null;
    const start = () => {
      if (tween) return;
      tween = gsap.to(els, {
        x: 0,
        y: 0,
        duration: HERO_SVG_DUR,
        ease: 'power3.out',
        stagger: HERO_SVG_STAGGER,
        delay: HERO_SVG_DELAY,
        // Icons started off-screen, so the proximity effect cached stale centres.
        // Re-measure once they've settled (the effect listens for 'resize').
        onComplete: () => window.dispatchEvent(new Event('resize')),
      });
    };

    if (useScrollStore.getState().heroStartedAt != null) start();
    const unsub = useScrollStore.subscribe((s) => {
      if (s.heroStartedAt != null) start();
    });

    return () => {
      unsub();
      tween?.kill();
      gsap.set(els, { clearProps: 'transform' });
    };
  }, []);

  // Parallax — unchanged behaviour from previous implementation
  useEffect(() => {
    const el = wrapperRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        el.style.transform = `translate3d(0, ${self.progress * 8}%, 0)`;
      },
    });

    return () => st.kill();
  }, [triggerRef]);

  // Cursor-proximity tinting (MathBackdrop parity, HTML side)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(pointer: coarse)').matches) return;

    const total = ICONS.length;
    // Cached rect centres (recomputed on resize/scroll, not every frame)
    const centres = new Float32Array(total * 2);
    // Current displayed proximity per icon (damped toward target each frame)
    const current = new Float32Array(total);

    const measure = () => {
      for (let i = 0; i < total; i++) {
        const el = iconRefs.current[i];
        if (!el) {
          centres[i * 2] = -9999;
          centres[i * 2 + 1] = -9999;
          continue;
        }
        const r = el.getBoundingClientRect();
        centres[i * 2] = r.left + r.width / 2;
        centres[i * 2 + 1] = r.top + r.height / 2;
      }
    };

    let pointerX = -9999;
    let pointerY = -9999;
    let isInside = false;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      isInside = true;
      requestTick();
    };
    const onPointerLeave = () => {
      isInside = false;
      requestTick(); // wake the loop so icons damp back to rest
    };

    // Below this, all icons are visually at rest; no point spending frames on it.
    const SETTLED_EPS = 0.0008;

    let rafId = 0;
    const tick = () => {
      rafId = 0;
      // Pause work when the hero isn't on screen (progress > ~0.05). Hero range
      // ends at ~0.032 global progress, so < 0.06 means it's still visible.
      const p = useScrollStore.getState().progress;
      const heroVisible = p < 0.06;

      let maxCur = 0;
      for (let i = 0; i < total; i++) {
        const el = iconRefs.current[i];
        if (!el) continue;

        let target = 0;
        if (heroVisible && isInside) {
          const dx = pointerX - centres[i * 2];
          const dy = pointerY - centres[i * 2 + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          target = 1 - smoothstep(PROX_NEAR_PX, PROX_FAR_PX, dist);
        }

        // Damp current toward target
        const cur = current[i] + (target - current[i]) * DAMP;
        current[i] = cur;
        if (cur > maxCur) maxCur = cur;

        const rest = ICONS[i].restOpacity;
        const opacity = rest + (1 - rest) * cur;
        // RGB lerp cream → cyan
        const r = Math.round(BASE_R + (GLOW_R - BASE_R) * cur);
        const g = Math.round(BASE_G + (GLOW_G - BASE_G) * cur);
        const b = Math.round(BASE_B + (GLOW_B - BASE_B) * cur);

        el.style.opacity = opacity.toFixed(3);
        el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      }

      // Keep looping while the hero is on-screen (proximity can change any frame)
      // or while icons are still damping back to rest. Once off-screen AND
      // settled, stop — the values won't change until the hero re-enters or the
      // pointer moves, both of which call requestTick() to re-arm.
      if (heroVisible || maxCur > SETTLED_EPS) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      if (rafId === 0) rafId = requestAnimationFrame(tick);
    };

    // Coalesce rect re-measurement to one rAF — scroll fires far more often than
    // we need to re-read ~40 element rects, and bursts of resize events otherwise
    // each trigger a full layout read.
    let measureQueued = false;
    const queueMeasure = () => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(() => {
        measureQueued = false;
        measure();
      });
    };
    const onScroll = () => {
      queueMeasure();
      requestTick(); // re-arm the loop when scrolling back into the hero range
    };

    measure();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', queueMeasure);
    window.addEventListener('scroll', onScroll, { passive: true });
    requestTick();

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', queueMeasure);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden='true'
      className='absolute inset-0 -z-20 bg-primary overflow-hidden pointer-events-none will-change-transform'
    >
      {ICONS.map((icon, i) => {
        const url = `/textures/hero-svgs/${encodeURI(icon.src)}`;
        const maskStyle: CSSProperties = {
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          opacity: icon.restOpacity,
          backgroundColor: 'var(--color-secondary)',
          ...icon.style,
        };
        // Classification for the entry fly-in: circuit pieces slide horizontally,
        // everything else collapses radially inward; side picks the start edge.
        const isCircuit = icon.src.startsWith('circuit');
        const side = icon.className.includes('right-') ? 'right' : 'left';
        return (
          <div
            key={i}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            data-hero-circuit={isCircuit ? '1' : '0'}
            data-hero-side={side}
            className={`hero-bg-icon ${icon.className}`}
            style={maskStyle}
          />
        );
      })}
    </div>
  );
}
