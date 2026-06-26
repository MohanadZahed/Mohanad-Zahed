import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CSSProperties } from 'react';
import type { ExperienceCompany } from '../../data/experience';
import { ProjectCard } from './ProjectCard';
import { useT } from '../../i18n/useT';
import { rafThrottle } from '../../lib/rafThrottle';
import {
  CARD_MAX_W_PX,
  COMPANY_HEADER_HEIGHT_PX,
  PIN_TOP_PX,
  STACK_BREAKPOINT_PX,
  STAGE_BOTTOM_MARGIN_PX,
  STAGE_SCROLL_UNIT_VH,
  deriveTagLayout,
  tagPositionForIndex,
  tagRegionHeight,
} from './experience.constants';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  company: ExperienceCompany;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(`(min-width: ${STACK_BREAKPOINT_PX}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${STACK_BREAKPOINT_PX}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export function CompanyBlock({ company }: Props) {
  const { t } = useT();
  const companyName = t(`experience.companies.${company.id}.name`);
  const companyRole = t(`experience.companies.${company.id}.role`);
  const companyCity = t(`experience.companies.${company.id}.city`);
  const companyTimeline = t(`experience.companies.${company.id}.timeline`);
  const total = company.projects.length;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRegionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [regionWidth, setRegionWidth] = useState(0);
  const [minContentHeight, setMinContentHeight] = useState(0);
  const isDesktop = useIsDesktop();
  // Only pin/animate when there's more than one card to choreograph.
  const pinned = isDesktop && total > 1;

  useEffect(() => {
    const el = cardsRegionRef.current;
    if (!el) return;
    setRegionWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setRegionWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setCardRef = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => (el: HTMLElement | null) => {
        cardRefs.current[i] = el;
      }),
    [total],
  );
  const setContentRef = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => (el: HTMLDivElement | null) => {
        contentRefs.current[i] = el;
      }),
    [total],
  );

  useLayoutEffect(() => {
    if (!isDesktop) return;
    const measure = () => {
      const els = contentRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (els.length === 0) return;
      const previous = els.map((el) => el.style.minHeight);
      els.forEach((el) => {
        el.style.minHeight = '0px';
      });
      let max = 0;
      els.forEach((el) => {
        const h = el.getBoundingClientRect().height;
        if (h > max) max = h;
      });
      els.forEach((el, i) => {
        el.style.minHeight = previous[i];
      });
      setMinContentHeight((prev) => (Math.abs(prev - max) < 0.5 ? prev : max));
    };

    const onResize = rafThrottle(measure);
    measure();
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      window.removeEventListener('resize', onResize);
      onResize.cancel();
    };
  }, [total, regionWidth, isDesktop]);

  // Per-company ScrollTrigger: drives each card's translate via a CSS variable.
  // Zero React renders during scroll.
  useEffect(() => {
    if (!pinned) return;
    const el = sectionRef.current;
    if (!el) return;

    // Card 0 starts visible at rest; cards 1..N-1 share the scroll range and
    // each animate in over their slice. With one card, nothing animates.
    const applyProgress = (p: number) => {
      const divisor = Math.max(1, total - 1);
      cardRefs.current.forEach((cardEl, i) => {
        if (!cardEl) return;
        const slice =
          i === 0 || total <= 1 ? 1 : Math.max(0, Math.min(1, (p - (i - 1) / divisor) * divisor));
        cardEl.style.setProperty('--card-progress', slice.toString());
      });
    };

    applyProgress(0);

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: `top top+=${PIN_TOP_PX}`,
      end: 'bottom bottom',
      onUpdate: (self) => applyProgress(self.progress),
    });

    return () => {
      trigger.kill();
    };
  }, [pinned, total]);

  const layout = deriveTagLayout(total, regionWidth);
  const tagRegionHeightPx = tagRegionHeight(layout.rowsUsed);

  const sectionStyle: CSSProperties = {
    maxWidth: `${CARD_MAX_W_PX + 96}px`,
    ...(pinned ? { height: `${(total + 1) * STAGE_SCROLL_UNIT_VH}svh` } : null),
  };

  const stageStyle: CSSProperties | undefined = pinned
    ? {
        top: `${PIN_TOP_PX}px`,
        height: `calc(100svh - ${PIN_TOP_PX + STAGE_BOTTOM_MARGIN_PX}px)`,
      }
    : undefined;

  return (
    <section
      ref={sectionRef}
      id={`CompanyBlock-${company.id}`}
      aria-labelledby={`company-${company.id}`}
      className='experience-company relative mx-auto w-full px-3 sm:px-4 md:px-6'
      style={sectionStyle}
    >
      <div
        className={`experience-company__stage ${pinned ? 'sticky' : 'relative'}`}
        style={stageStyle}
      >
        <div className='relative flex h-full flex-col rounded-xl border border-tertiary/40 bg-black/20 backdrop-blur-sm' style={{ boxShadow: 'inset 0 0 0 calc(1px + 0px) hsla(0, 0%, 100%, .075), inset 0 0 5vw hsla(0, 0%, 100%, .1)' }}>
          <h3
            id={`company-${company.id}`}
            className='absolute -top-3 left-6 z-10 bg-canvas-from px-3 font-mono text-sm uppercase tracking-[0.22em] text-quaternary md:left-10 md:text-base'
          >
            {companyName}
          </h3>

          <div
            className='experience-company__header px-4 sm:px-6 md:px-10'
            style={{ minHeight: `${COMPANY_HEADER_HEIGHT_PX}px` }}
          >
            <div className='flex h-full flex-col justify-center gap-2 py-4 font-mono text-secondary md:flex-row md:items-baseline md:justify-between md:gap-6'>
              <p className='text-base text-secondary md:text-lg'>{companyRole}</p>
              <p className='text-sm text-secondary/70'>
                {companyCity} · {companyTimeline}
              </p>
            </div>
          </div>

          <div
            ref={cardsRegionRef}
            className={
              pinned
                ? 'experience-stack relative min-h-0 flex-1 overflow-hidden rounded-b-xl px-10 pb-10 pt-6'
                : 'experience-stack flex flex-col gap-y-[4vh] px-3 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6'
            }
          >
            {company.projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                total={total}
                tagPosition={tagPositionForIndex(index, layout)}
                tagRegionHeightPx={tagRegionHeightPx}
                cardRef={setCardRef[index]}
                contentRef={setContentRef[index]}
                minContentHeight={isDesktop ? minContentHeight : 0}
                pinned={pinned}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
