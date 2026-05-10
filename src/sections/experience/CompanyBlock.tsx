import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ExperienceCompany } from '../../data/experience';
import { ProjectCard } from './ProjectCard';
import {
  CARD_MAX_W_PX,
  COMPANY_HEADER_HEIGHT_PX,
  deriveTagLayout,
  tagPositionForIndex,
  tagRegionHeight,
} from './experience.constants';

interface Props {
  company: ExperienceCompany;
}

export function CompanyBlock({ company }: Props) {
  const total = company.projects.length;
  const stackRef = useRef<HTMLDivElement | null>(null);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [stackWidth, setStackWidth] = useState(0);
  const [minContentHeight, setMinContentHeight] = useState(0);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    setStackWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setStackWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stable per-index callback refs so React doesn't detach/re-attach each render.
  const setContentRef = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => (el: HTMLDivElement | null) => {
        contentRefs.current[i] = el;
      }),
    [total],
  );

  // Equalise card body heights to the tallest card in the company so every
  // sticky article has the same height — making them release together when the
  // wrapper bottom approaches.
  useLayoutEffect(() => {
    const measure = () => {
      const els = contentRefs.current.filter(
        (el): el is HTMLDivElement => Boolean(el),
      );
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

    measure();
    window.addEventListener('resize', measure);
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', measure);
  }, [total, stackWidth]);

  const layout = deriveTagLayout(total, stackWidth);
  const tagRegionHeightPx = tagRegionHeight(layout.rowsUsed);

  return (
    <section
      aria-labelledby={`company-${company.id}`}
      className='experience-company relative mx-auto w-full px-4 md:px-6'
      style={{ maxWidth: `${CARD_MAX_W_PX + 96}px` }}
    >
      <div className='relative rounded-xl border-x border-b border-tertiary/40 bg-black/20 backdrop-blur-sm'>
        <div
          className='experience-company__header sticky top-2 z-30 -mx-px rounded-t-xl border-t border-tertiary/40 bg-canvas-from px-6 md:px-10'
          style={{ minHeight: `${COMPANY_HEADER_HEIGHT_PX}px` }}
        >
          <h3
            id={`company-${company.id}`}
            className='absolute -top-3 left-6 bg-canvas-from px-3 font-mono text-sm uppercase tracking-[0.22em] text-secondary md:left-10 md:text-base'
          >
            {company.name}
          </h3>

          <div className='flex h-full flex-col justify-center gap-2 py-4 font-mono text-tertiary md:flex-row md:items-baseline md:justify-between md:gap-6'>
            <p className='text-base text-tertiary md:text-lg'>{company.role}</p>
            <p className='text-sm text-tertiary/70'>
              {company.city} · {company.timeline}
            </p>
          </div>
        </div>

        <div
          ref={stackRef}
          className='experience-stack flex flex-col gap-y-[4vh] px-6 pb-6 pt-6 md:gap-y-0 md:px-10 md:pb-10'
        >
          {company.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={total}
              tagPosition={tagPositionForIndex(index, layout)}
              tagRegionHeightPx={tagRegionHeightPx}
              contentRef={setContentRef[index]}
              minContentHeight={minContentHeight}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
