import type { CSSProperties } from 'react';
import type { ExperienceProject } from '../../data/experience';
import type { TagPosition } from './experience.constants';
import { useT } from '../../i18n/useT';

interface Props {
  project: ExperienceProject;
  index: number;
  total: number;
  tagPosition: TagPosition;
  tagRegionHeightPx: number;
  cardRef?: (el: HTMLElement | null) => void;
  contentRef?: (el: HTMLDivElement | null) => void;
  minContentHeight?: number;
  pinned: boolean;
}

export function ProjectCard({
  project,
  index,
  total,
  tagPosition,
  tagRegionHeightPx,
  cardRef,
  contentRef,
  minContentHeight,
  pinned,
}: Props) {
  const { t, tArray } = useT();
  const projectKey = `experience.projects.${project.id}`;
  const role = t(`${projectKey}.role`);
  const name = t(`${projectKey}.name`);
  const industry = t(`${projectKey}.industry`);
  const description = t(`${projectKey}.description`);
  const tasks = tArray(`${projectKey}.tasks`);
  const number = String(index + 1).padStart(2, '0');
  const isCompactRow = pinned && tagPosition.rowIndex >= 1;

  const articleStyle: CSSProperties = pinned
    ? ({
        position: 'absolute',
        inset: 0,
        zIndex: index + 1,
        transform: 'translate3d(0, calc((1 - var(--card-progress, 0)) * 100%), 0)',
        willChange: 'transform',
        '--card-progress': index === 0 ? '1' : '0',
      } as CSSProperties)
    : { zIndex: index + 1 };

  const tagRegionStyle: CSSProperties = pinned
    ? { height: `${tagRegionHeightPx}px` }
    : { height: '32px' };

  const tagStyle: CSSProperties = pinned
    ? {
        top: `${tagPosition.topPx}px`,
        left: `${tagPosition.leftPx}px`,
        width: `${tagPosition.widthPx}px`,
        height: `${tagRegionHeightPx - tagPosition.topPx}px`,
        fontSize: isCompactRow ? '10px' : '11px',
        maxWidth: '150px',
      }
    : {
        top: 0,
        left: 0,
        height: '32px',
        fontSize: '11px',
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
      };

  return (
    <article ref={cardRef} className='experience-card relative flex flex-col' style={articleStyle}>
      <div className='relative w-full shrink-0' style={tagRegionStyle}>
        <div
          className='experience-card__tag absolute flex items-center overflow-hidden whitespace-nowrap rounded-t-md bg-white px-3 pt-1.5 font-mono uppercase tracking-wider text-zinc-900 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]'
          style={tagStyle}
        >
          {project.dateLabel}
        </div>
      </div>

      <div
        className={`rounded-b-md rounded-tr-md bg-white text-zinc-900 shadow-[0_-2px_20px_rgba(0,0,0,0.08)] ${
          pinned ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : ''
        }`}
      >
        <div
          ref={contentRef}
          className={`grid gap-6 px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 md:gap-8 lg:grid-cols-[1fr_480px] ${
            pinned ? 'min-h-0 flex-1 overflow-y-auto' : ''
          }`}
          style={
            !pinned && minContentHeight && minContentHeight > 0
              ? { minHeight: `${minContentHeight}px` }
              : undefined
          }
        >
          <div className='min-w-0'>
            <p className='font-mono text-xs uppercase tracking-[0.18em] text-zinc-500'>{role}</p>
            <h3 className='mt-2 font-mono text-2xl font-semibold leading-tight text-zinc-900 md:text-3xl'>
              {name}
            </h3>

            <dl className='mt-6 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 font-mono text-sm'>
              <dt className='text-zinc-500'>{t('experience.labels.customer')}</dt>
              <dd className='text-zinc-900'>{project.customer}</dd>
              <dt className='text-zinc-500'>{t('experience.labels.industry')}</dt>
              <dd className='text-zinc-900'>{industry}</dd>
              <dt className='text-zinc-500'>{t('experience.labels.teamSize')}</dt>
              <dd className='text-zinc-900'>{project.teamSize}</dd>
            </dl>

            <div className='mt-6'>
              <p className='font-mono text-xs uppercase tracking-[0.18em] text-zinc-500'>
                {t('experience.labels.stack')}
              </p>
              <ul className='mt-2 flex flex-wrap gap-1.5'>
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className='rounded-sm bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-700'
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className='mt-6 space-y-3 font-mono text-sm leading-relaxed text-zinc-700'>
              {description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {project.link && (
              <a
                href={project.link}
                target='_blank'
                rel='noopener noreferrer'
                className='experience-card__cta mt-6 inline-flex items-center gap-2 rounded-sm border border-zinc-900 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white'
              >
                {t('experience.labels.visitLink')}
                <span aria-hidden>→</span>
              </a>
            )}
          </div>

          <div className='min-w-0 lg:border-l lg:border-zinc-200 lg:pl-8'>
            <p className='font-mono text-xs uppercase tracking-[0.18em] text-zinc-500'>
              {t('experience.labels.tasks')}
            </p>
            <ul className='mt-3 space-y-2 font-mono text-sm leading-relaxed text-zinc-800'>
              {tasks.map((task, i) => (
                <li key={i} className='flex gap-2'>
                  <span
                    aria-hidden
                    className='mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-zinc-900'
                  />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='shrink-0 border-t border-zinc-200 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 sm:px-8 md:px-12'>
          {t('experience.labels.projectCounter', { number, total: String(total).padStart(2, '0') })}
        </div>
      </div>
    </article>
  );
}
